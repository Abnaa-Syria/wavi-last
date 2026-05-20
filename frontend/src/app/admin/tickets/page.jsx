"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Ticket, User, Clock, CheckCircle2, ShieldAlert, 
  Send, Lock, Unlock, Check, AlertCircle, PlusCircle 
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'منخفضة', class: 'text-text/40 bg-white/5 border-white/5' },
  { value: 'MEDIUM', label: 'متوسطة', class: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { value: 'HIGH', label: 'عالية', class: 'text-red-400 bg-red-500/10 border-red-500/20' },
  { value: 'URGENT', label: 'مستعجلة جداً', class: 'text-amber-500 bg-amber-500/10 border-amber-500/20 animate-pulse' },
];

const STATUS_LABELS = {
  'OPEN': { label: 'مفتوحة', class: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  'IN_PROGRESS': { label: 'قيد المعالجة', class: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  'RESOLVED': { label: 'تم الحل', class: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  'CLOSED': { label: 'مغلقة', class: 'text-text/40 bg-white/5 border-white/10' },
};

export default function AdminTickets() {
  const router = useRouter();
  const { user } = useAuthStore();

  const hasAccess = user && (user.role === 'SUPER_ADMIN' || user.permissions?.includes('SUPPORT_MANAGE'));

  useEffect(() => {
    if (user && !hasAccess) {
      toast.error('غير مصرح لك بدخول هذه الصفحة');
      router.replace('/admin');
    }
  }, [user, hasAccess, router]);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Reply states
  const [replyText, setReplyText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (user && hasAccess) {
      fetchTickets();
    }
  }, [user, hasAccess]);

  if (user && !hasAccess) {
    return null;
  }

  useEffect(() => {
    if (selectedTicket) {
      setTicketDetails(null); // Prevent rendering stale state when switching tickets
      fetchTicketDetails(selectedTicket.id);
    }
  }, [selectedTicket]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticketDetails?.messages, selectedTicket?.id]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/support');
      setTickets(res.data?.data?.tickets || []);
    } catch (err) {
      console.error(err);
      toast.error('فشل تحميل تذاكر الدعم الفني');
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (id, silent = false) => {
    try {
      if (!silent) setDetailsLoading(true);
      const res = await api.get(`/support/${id}`);
      // The API returns the ticket inside response.data.data.ticket
      setTicketDetails(res.data?.data?.ticket || null);
    } catch (err) {
      console.error(err);
      toast.error('فشل تحميل تفاصيل المحادثة');
    } finally {
      if (!silent) setDetailsLoading(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    setSending(true);
    try {
      const res = await api.post(`/support/${selectedTicket.id}/messages`, {
        body: replyText.trim(),
        isInternal: isInternal
      });

      // Clear input fields cleanly upon successful dispatch
      setReplyText('');
      setIsInternal(false);

      const newMsg = res.data?.data?.message;
      if (newMsg) {
        // Append the newly created message locally to update message feed instantly
        setTicketDetails((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [...(prev.messages || []), newMsg]
          };
        });
      }

      // Re-fetch ticket details silently to ensure database consistency
      await fetchTicketDetails(selectedTicket.id, true);

      // Refresh general list to show updated date/status
      const listRes = await api.get('/support');
      setTickets(listRes.data?.data?.tickets || []);
    } catch (err) {
      console.error(err);
      toast.error('فشل إرسال الرسالة');
    } finally {
      setSending(false);
    }
  };

  const handleAssignToMe = async () => {
    if (!selectedTicket || !user) return;
    try {
      await api.patch(`/support/${selectedTicket.id}/assign`, {
        agentId: user.id
      });
      toast.success('تم استلام وتعيين التذكرة لك بنجاح 🤝');
      fetchTicketDetails(selectedTicket.id, true);
      fetchTickets();
    } catch (err) {
      console.error(err);
      toast.error('فشل تعيين التذكرة');
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;
    try {
      await api.patch(`/support/${selectedTicket.id}/close`, { status: 'RESOLVED' });
      toast.success('تم حل وإغلاق تذكرة الدعم الفني 🎉');
      fetchTicketDetails(selectedTicket.id, true);
      fetchTickets();
    } catch (err) {
      console.error(err);
      toast.error('فشل إغلاق التذكرة');
    }
  };

  const getPriorityInfo = (priority) => {
    return PRIORITY_OPTIONS.find(p => p.value === priority) || { label: priority, class: 'text-white/60 bg-white/5 border-white/10' };
  };

  // Filters
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      (ticket.ticketNo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (ticket.subject?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (ticket.customer?.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (ticket.customer?.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 font-noto text-white min-h-[80vh] flex flex-col">
      
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-3xl font-black text-white mb-2">الدعم الفني والبطاقات</h2>
          <p className="text-text/50 font-bold">متابعة ومعالجة بطاقات الدعم وحل استفسارات العملاء تقنياً</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-text/40" size={18} />
            <input 
              type="text" 
              placeholder="البحث برقم التذكرة، العنوان..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-card/60 backdrop-blur-xl border border-white/10 rounded-2xl py-3 pr-10 pl-4 focus:outline-none focus:border-gold transition-all text-white text-sm font-bold w-full md:w-64"
            />
          </div>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-card/60 backdrop-blur-xl border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-gold text-sm font-bold text-white cursor-pointer"
          >
            <option value="ALL">جميع الحالات</option>
            <option value="OPEN">مفتوحة</option>
            <option value="IN_PROGRESS">قيد المعالجة</option>
            <option value="RESOLVED">تم الحل</option>
            <option value="CLOSED">مغلقة</option>
          </select>
        </div>
      </div>

      {/* Main Workspace: 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-stretch">
        
        {/* Right Column: Tickets List Queue */}
        <div className="lg:col-span-1 bg-[#111118]/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-6 flex flex-col max-h-[70vh] overflow-hidden">
          <h3 className="text-base font-black text-white mb-4 flex items-center gap-2 pb-3 border-b border-white/5">
            <Ticket size={18} className="text-gold" /> بطاقات الدعم الفني ({filteredTickets.length})
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />
              ))
            ) : filteredTickets.length === 0 ? (
              <div className="py-12 text-center text-text/40 font-bold flex flex-col items-center justify-center">
                <ShieldAlert size={36} className="text-gold/20 mb-2" />
                <p className="text-xs">لا توجد بطاقات مطابقة</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const isSelected = selectedTicket && selectedTicket.id === ticket.id;
                const priorityInfo = getPriorityInfo(ticket.priority);
                const statusLabel = STATUS_LABELS[ticket.status] || { label: ticket.status, class: 'bg-white/5' };

                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      isSelected 
                        ? 'border-gold/40 bg-gold/10' 
                        : 'border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-gold font-black">#{ticket.ticketNo}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${statusLabel.class}`}>
                        {statusLabel.label}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-white truncate leading-tight mb-2" title={ticket.subject}>
                      {ticket.subject}
                    </h4>
                    <div className="flex items-center justify-between text-[9px] text-text/40 font-bold border-t border-white/5 pt-2 mt-1">
                      <span>العميل: {ticket.customer?.firstName}</span>
                      <span className={`px-1.5 py-0.5 rounded border ${priorityInfo.class}`}>
                        {priorityInfo.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Left Column: Chat Conversation Column */}
        <div className="lg:col-span-2 bg-[#111118]/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] flex flex-col max-h-[70vh] overflow-hidden relative">
          
          {selectedTicket ? (
            <>
              {/* Active Conversation Header */}
              <div className="p-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between flex-wrap gap-4 shrink-0">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gold font-black">#{selectedTicket.ticketNo}</span>
                    <h4 className="text-sm font-black text-white leading-none">{selectedTicket.subject}</h4>
                  </div>
                  <p className="text-[10px] text-text/40 font-bold leading-none">
                    العميل: {selectedTicket.customer?.firstName} {selectedTicket.customer?.lastName} ({selectedTicket.customer?.email})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Assignment Controls */}
                  {ticketDetails && !ticketDetails.agent ? (
                    <button 
                      onClick={handleAssignToMe}
                      className="btn-gold px-3.5 py-2 rounded-xl text-[10px] font-black flex items-center gap-1.5"
                    >
                      <PlusCircle size={14} /> تعيين إليّ
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-text/40 bg-white/5 px-3 py-2 rounded-xl border border-white/10 flex items-center gap-1">
                      <User size={12} className="text-gold" />
                      مشرف: {ticketDetails?.agent?.firstName || 'معين'}
                    </span>
                  )}

                  {/* Closure Control */}
                  {selectedTicket.status !== 'RESOLVED' && selectedTicket.status !== 'CLOSED' && (
                    <button 
                      onClick={handleCloseTicket}
                      className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-black text-[10px] rounded-xl flex items-center gap-1 transition-all"
                    >
                      <Check size={14} /> إغلاق وحل
                    </button>
                  )}
                </div>
              </div>

              {/* Chat messages queue */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
                {detailsLoading ? (
                  <div className="flex flex-col items-center justify-center h-full text-text/40 font-bold gap-2 py-20">
                    <div className="w-8 h-8 border-3 border-gold border-t-transparent rounded-full animate-spin" />
                    <span>تحميل تفاصيل المحادثة...</span>
                  </div>
                ) : ticketDetails?.messages && ticketDetails.messages.length > 0 ? (
                  ticketDetails.messages.map((msg, idx) => {
                    const isStaffSender = msg.senderId !== selectedTicket.customerId;
                    const dateStr = new Date(msg.createdAt).toLocaleDateString('ar-EG', {
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div 
                        key={msg.id}
                        className={`flex gap-3 items-start p-4 rounded-2xl ${
                          msg.isInternal 
                            ? 'bg-gradient-to-r from-red-950/40 to-purple-950/40 border border-red-500/30 max-w-[85%] mx-auto shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                            : isStaffSender 
                              ? 'flex-row-reverse max-w-[75%] mr-auto bg-white/5 border border-white/5'
                              : 'max-w-[75%] ml-auto bg-white/[0.02] border border-white/5'
                        }`}
                      >
                        {/* Avatar or Lock Badge */}
                        {msg.isInternal ? (
                          <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
                            <Lock size={14} className="text-red-400" />
                          </div>
                        ) : (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                            isStaffSender ? 'bg-gold text-black' : 'bg-gold/10 border border-gold/20 text-gold'
                          }`}>
                            {isStaffSender ? 'دعم' : 'عميل'}
                          </div>
                        )}

                        {/* Bubble */}
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between gap-4">
                            <span className={`text-[10px] font-black uppercase flex items-center gap-1 ${
                              msg.isInternal ? 'text-red-400 font-bold' : 'text-text/40'
                            }`}>
                              {msg.isInternal ? (
                                <>
                                  <Lock size={10} />
                                  <span>ملاحظة داخلية (المشرفين فقط)</span>
                                </>
                              ) : isStaffSender ? 'فريق الدعم الفني' : 'العميل'}
                            </span>
                            <span className="text-[9px] text-text/40 font-bold">{dateStr}</span>
                          </div>
                          
                          <p className={`text-xs font-bold whitespace-pre-line leading-relaxed ${
                            msg.isInternal 
                              ? 'text-red-200' 
                              : isStaffSender 
                                ? 'text-white' 
                                : 'text-white/80'
                          }`}>
                            {msg.body}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-20 text-center text-text/40 font-bold">لا توجد رسائل مسجلة</div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Bar */}
              {selectedTicket.status !== 'RESOLVED' && selectedTicket.status !== 'CLOSED' ? (
                <form 
                  onSubmit={handleSendReply}
                  className="p-6 border-t border-white/5 bg-white/[0.01] shrink-0 space-y-4"
                >
                  
                  {/* Internal Note Checkbox */}
                  <div className="flex items-center gap-2">
                    <label className="relative flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                        className="w-4 h-4 bg-background border border-white/10 rounded focus:ring-0 text-gold accent-gold cursor-pointer"
                      />
                      <span className={`text-xs font-black flex items-center gap-1.5 transition-colors ${
                        isInternal ? 'text-red-400' : 'text-text/40'
                      }`}>
                        {isInternal ? <Lock size={12} /> : <Unlock size={12} />}
                        كتابة كملاحظة داخلية للموظفين (مخفية تماماً عن العميل)
                      </span>
                    </label>
                  </div>

                  {/* Message Input */}
                  <div className="flex items-center gap-3">
                    <input 
                      type="text"
                      placeholder={isInternal ? "اكتب ملاحظة فنية سرية للفريق فقط..." : "اكتب ردك أو حل المشكلة الفنية للعميل..."}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className={`flex-1 bg-background border rounded-2xl py-4 px-4 focus:outline-none transition-all text-xs font-bold text-white ${
                        isInternal ? 'border-red-500/30 focus:border-red-500' : 'border-white/10 focus:border-gold'
                      }`}
                    />
                    <button 
                      type="submit"
                      disabled={sending || !replyText.trim()}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shrink-0 hover:shadow-lg disabled:opacity-40 ${
                        isInternal 
                          ? 'bg-red-500 hover:bg-red-600 text-black' 
                          : 'bg-gold hover:bg-gold-light text-black'
                      }`}
                    >
                      <Send size={18} className="rotate-180" />
                    </button>
                  </div>

                </form>
              ) : (
                <div className="p-6 bg-white/5 border-t border-white/5 text-center text-xs font-bold text-emerald-400">
                  تم حل هذه التذكرة وإغلاقها. التذاكر المغلقة لا تقبل ردوداً إضافية.
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 py-24">
              <Ticket size={48} className="text-gold/20 mb-4 animate-bounce" />
              <h4 className="text-base font-black text-white">الرجاء اختيار بطاقة دعم فني للمتابعة</h4>
              <p className="text-xs text-text/40 mt-1 font-bold">انقر على أي تذكرة في القائمة الجانبية لعرض المحادثة والحلول.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
