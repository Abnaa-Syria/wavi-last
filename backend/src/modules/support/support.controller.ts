import { Request, Response } from 'express';
import { SupportService } from './support.service.js';
import { sendSuccess } from '../../utils/response.util.js';
import { asyncHandler } from '../../utils/asyncHandler.util.js';
import { AppError } from '../../utils/error.util.js';
import { TicketStatus } from '@prisma/client';

export class SupportController {
  /**
   * Controller handler for creating a customer support ticket (Customer Only)
   */
  public static createTicket = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const customerId = req.user!.id;
    const ticket = await SupportService.createTicket(customerId, req.body);
    sendSuccess(res, 'تم إنشاء تذكرة الدعم الفني بنجاح', { ticket }, 201);
  });

  /**
   * Controller handler for fetching a customer's own tickets (Customer Only)
   */
  public static getMyTickets = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const customerId = req.user!.id;
    const tickets = await SupportService.getCustomerTickets(customerId);
    sendSuccess(res, 'تم استرجاع تذاكر الدعم الفني الخاصة بك بنجاح', { tickets });
  });

  /**
   * Controller handler for fetching full ticket details and messages (Universal with strict leaks filters)
   */
  public static getTicketById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = {
      id: req.user!.id,
      role: req.user!.role,
    };

    const ticket = await SupportService.getTicketById(id!, user);
    sendSuccess(res, 'تم استرجاع تفاصيل التذكرة والمحادثة بنجاح', { ticket });
  });

  /**
   * Controller handler for listing all system support tickets (Staff Only)
   */
  public static getStaffTickets = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const status = req.query.status as TicketStatus | undefined;
    const tickets = await SupportService.getStaffTickets(status);
    sendSuccess(res, 'تم استرجاع قائمة تذاكر الدعم الفني بنجاح', { tickets });
  });

  /**
   * Controller handler for assigning an agent to a support ticket (Staff Only)
   */
  public static assignTicket = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { agentId } = req.body;

    const ticket = await SupportService.assignTicket(id!, agentId);
    sendSuccess(res, 'تم تعيين موظف الدعم الفني بنجاح وتحديث حالة التذكرة', { ticket });
  });

  /**
   * Controller handler for posting a reply message in the ticket (Universal Reply Route)
   */
  public static addMessage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const senderId = req.user!.id;
    const userRole = req.user!.role;

    const message = await SupportService.addMessage(id!, senderId, userRole, req.body);
    sendSuccess(res, 'تم إرسال الرد بنجاح', { message }, 201);
  });

  /**
   * Controller handler for resolving or closing a support ticket (Staff Only)
   */
  public static closeTicket = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const statusInput = req.body.status as string;

    if (statusInput !== TicketStatus.RESOLVED && statusInput !== TicketStatus.CLOSED) {
      throw new AppError('الحالة المحددة غير صالحة لإغلاق أو حل التذكرة. يجب استخدام RESOLVED أو CLOSED', 400);
    }

    const ticket = await SupportService.closeTicket(id!, statusInput as 'RESOLVED' | 'CLOSED');
    sendSuccess(res, 'تم تحديث حالة التذكرة وإغلاقها بنجاح', { ticket });
  });
}
export default SupportController;
