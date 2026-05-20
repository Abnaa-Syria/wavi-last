import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/error.util.js';
import { TicketStatus, TicketPriority, Role } from '@prisma/client';

export interface CreateTicketInput {
  subject: string;
  body: string;
  orderId?: string | null;
  priority?: TicketPriority;
}

export class SupportService {
  /**
   * Creates a new support ticket and initiates the conversation in a transaction
   */
  public static async createTicket(customerId: string, data: CreateTicketInput) {
    // Generate sequential ticket number (TICKET-00001, etc.)
    let ticketNo = '';
    let isUnique = false;

    while (!isUnique) {
      const count = await prisma.supportTicket.count();
      ticketNo = `TICKET-${String(count + 1).padStart(5, '0')}`;
      
      const existing = await prisma.supportTicket.findUnique({
        where: { ticketNo },
      });

      if (!existing) {
        isUnique = true;
      } else {
        // Safe retry fallback in case of collision
        const rand = Math.floor(1000 + Math.random() * 9000);
        ticketNo = `TICKET-${String(count + 1).padStart(5, '0')}-${rand}`;
      }
    }

    // Execute transaction to create ticket and the first message
    return await prisma.$transaction(async (tx) => {
      const ticket = await tx.supportTicket.create({
        data: {
          ticketNo,
          customerId,
          orderId: data.orderId || null,
          subject: data.subject,
          priority: data.priority || TicketPriority.MEDIUM,
          status: TicketStatus.OPEN,
          channel: 'web',
        },
      });

      await tx.ticketMessage.create({
        data: {
          ticketId: ticket.id,
          senderId: customerId,
          body: data.body,
          isInternal: false,
        },
      });

      return ticket;
    });
  }

  /**
   * Fetches the ticket history for the logged-in customer
   */
  public static async getCustomerTickets(customerId: string) {
    return await prisma.supportTicket.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Fetches ticket details along with full message history with strict leak protection
   */
  public static async getTicketById(
    ticketId: string,
    user: { id: string; role: Role | string }
  ) {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      throw new AppError('التذكرة المطلوبة غير موجودة', 404);
    }

    const isStaff = user.role !== Role.CUSTOMER && user.role !== 'CUSTOMER';

    // Strict Security & Privacy Checks
    if (!isStaff && ticket.customerId !== user.id) {
      throw new AppError('عذراً، ليس لديك الصلاحية لمشاهدة هذه التذكرة', 403);
    }

    // Strict leak protection: Filter out internal notes for customers
    if (!isStaff) {
      ticket.messages = ticket.messages.filter((msg) => !msg.isInternal);
    }

    return ticket;
  }

  /**
   * Fetches all support tickets for the staff queue (Staff Only)
   */
  public static async getStaffTickets(status?: TicketStatus) {
    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    return await prisma.supportTicket.findMany({
      where: filter,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Assigns a ticket to a staff member and shifts the status to IN_PROGRESS (Staff Only)
   */
  public static async assignTicket(ticketId: string, agentId: string) {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new AppError('التذكرة المطلوبة غير موجودة', 404);
    }

    // Verify target agent exists and is staff
    const agent = await prisma.user.findUnique({
      where: { id: agentId },
    });

    if (!agent || agent.role === Role.CUSTOMER) {
      throw new AppError('الموظف المحدد غير موجود أو ليس لديه الصلاحية كعميل دعم فني', 400);
    }

    return await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        agentId,
        status: TicketStatus.IN_PROGRESS,
      },
      include: {
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Universal message reply method for appending responses to a conversation
   */
  public static async addMessage(
    ticketId: string,
    senderId: string,
    userRole: Role | string,
    data: { body: string; isInternal?: boolean }
  ) {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new AppError('التذكرة المطلوبة غير موجودة', 404);
    }

    const isStaff = userRole !== Role.CUSTOMER && userRole !== 'CUSTOMER';

    // Validate ownership
    if (!isStaff && ticket.customerId !== senderId) {
      throw new AppError('عذراً، ليس لديك الصلاحية لإرسال رسائل في هذه التذكرة', 403);
    }

    // Force isInternal to false for customer submissions (Leak Protection)
    const isInternalFinal = isStaff ? (data.isInternal ?? false) : false;

    return await prisma.$transaction(async (tx) => {
      // Create message
      const message = await tx.ticketMessage.create({
        data: {
          ticketId,
          senderId,
          body: data.body,
          isInternal: isInternalFinal,
        },
      });

      // Reopen ticket if resolved/closed and a customer is replying
      if (!isStaff && (ticket.status === TicketStatus.RESOLVED || ticket.status === TicketStatus.CLOSED)) {
        await tx.supportTicket.update({
          where: { id: ticketId },
          data: {
            status: TicketStatus.OPEN,
          },
        });
      }

      return message;
    });
  }

  /**
   * Resolves or closes a ticket with status history timestamps (Staff Only)
   */
  public static async closeTicket(
    ticketId: string,
    status: 'RESOLVED' | 'CLOSED'
  ) {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new AppError('التذكرة المطلوبة غير موجودة', 404);
    }

    const updateData: any = { status };

    if (status === TicketStatus.RESOLVED) {
      updateData.resolvedAt = new Date();
    } else if (status === TicketStatus.CLOSED) {
      updateData.closedAt = new Date();
    }

    return await prisma.supportTicket.update({
      where: { id: ticketId },
      data: updateData,
    });
  }
}
export default SupportService;
