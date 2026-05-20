"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, AlertCircle, Clock, CheckCircle2, ChevronDown, ChevronUp, Send } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedTicketId, setExpandedTicketId] = useState(null);

  // New ticket state
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ticket detail replies state
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/support/my-tickets');
      const fetched = res.data?.data?.tickets || [];
      // Sort tickets: newest first
      setTickets(fetched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء تحميل تذاكر الدعم الفني الخاصة بك');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || subject.trim().length < 3) {
      toast.error('الرجاء إدخال عنوان مناسب للتذكرة (3 أحرف على الأقل)');
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      toast.error('الرجاء كتابة وصف تفصيلي للمشكلة (5 أحرف على الأقل)');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/support', {
        subject: subject.trim(),
        body: description.trim(),
        priority
      });
      toast.success('تم فتح تذكرة الدعم الفني بنجاح! سيتم الرد عليك قريباً 🎉');
      setSubject('');
      setDescription('');
      setPriority('MEDIUM');
      setIsFormOpen(false);
      fetchTickets();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'حدث خطأ أثناء فتح التذكرة، يرجى المحاولة لاحقاً');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = async (ticketId) => {
    if (!replyText.trim()) return;
    setIsSendingReply(true);
    try {
      await api.post(`/support/${ticketId}/messages`, {
        body: replyText.trim()
      });
      toast.success('تم إرسال ردك بنجاح');
      setReplyText('');
      // Reload tickets to update message logs
      const res = await api.get('/support/my-tickets');
      const fetched = res.data?.data?.tickets || [];
      setTickets(fetched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error(err);
      toast.error('فشل إرسال الرد، يرجى المحاولة لاحقاً');
    } finally {
      setIsSendingReply(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = status?.toUpperCase();
    if (s === 'OPEN' || s === 'OPENED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <Clock size={12} /> مفتوحة
        </span>
      );
    }
    if (s === 'IN_PROGRESS') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-500/10 text-blue-500 border border-blue-500/20">
          <Clock size={12} /> قيد المعالجة
        </span>
      );
    }
    if (s === 'RESOLVED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <CheckCircle2 size={12} /> تم الحل
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white/10 text-text/60 border border-white/5">
         مغلقة
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const p = priority?.toUpperCase();
    if (p === 'LOW') {
      return <span className="text-[10px] font-bold text-text/40 bg-white/5 px-2 py-0.5 rounded-md">منخفضة</span>;
    }
    if (p === 'HIGH') {
      return <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md">عالية</span>;
    }
    if (p === 'URGENT') {
      return <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md animate-pulse">مستعجلة جداً</span>;
    }
    return <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">متوسطة</span>;
  };

  return (
    <div className="space-y-8 font-noto">
      
      {/* Header section with Open Ticket Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white">الدعم الفني والبطاقات</h2>
          <p className="text-text/50 font-bold mt-1 text-sm">استفسر عن اشتراكاتك أو احصل على الدعم المباشر</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="btn-gold px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-2 max-w-max self-end sm:self-auto gold-glow"
        >
          {isFormOpen ? 'إلغاء الطلب' : 'فتح تذكرة دعم جديدة'} <Plus size={18} className={isFormOpen ? 'rotate-45 transition-transform' : ''} />
        </button>
      </div>

      {/* New Ticket Form Collapse */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleCreateTicket} className="p-8 bg-card rounded-[2.5rem] border border-white/5 space-y-6 shadow-xl relative">
              <div className="absolute top-0 left-0 w-24 h-24 bg-gold/5 blur-2xl rounded-full" />
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <MessageSquare size={20} className="text-gold" /> تذكرة فنية جديدة
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-black text-text/40 mr-1 uppercase">عنوان التذكرة</label>
                  <input 
                    type="text"
                    placeholder="مثال: مشكلة في تفعيل باقة فالكون برو"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-background border border-white/10 rounded-2xl py-4 px-4 focus:outline-none focus:border-gold transition-all text-white font-bold"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-black text-text/40 mr-1 uppercase">الأولوية</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-background border border-white/10 rounded-2xl py-4 px-4 focus:outline-none focus:border-gold transition-all text-white font-bold"
                  >
                    <option value="LOW" className="bg-[#121212] text-white">منخفضة</option>
                    <option value="MEDIUM" className="bg-[#121212] text-white">متوسطة</option>
                    <option value="HIGH" className="bg-[#121212] text-white">عالية</option>
                    <option value="URGENT" className="bg-[#121212] text-white">مستعجلة جداً</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-text/40 mr-1 uppercase">شرح وتفاصيل المشكلة</label>
                <textarea 
                  rows="4"
                  placeholder="يرجى كتابة تفاصيل كاملة لتسهيل حل المشكلة بأسرع وقت ممكن..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-background border border-white/10 rounded-2xl py-4 px-4 focus:outline-none focus:border-gold transition-all text-white font-bold resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="btn-gold w-full py-5 rounded-2xl font-black flex items-center justify-center gap-2 gold-glow"
              >
                {isSubmitting ? 'جاري الإرسال والتسجيل...' : 'إرسال التذكرة الفنية'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tickets List */}
      <section className="bg-card rounded-[2.5rem] border border-white/5 shadow-xl overflow-hidden p-6 sm:p-8">
        {loading ? (
          <div className="space-y-4 py-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <AlertCircle size={48} className="text-gold/30 mb-4 animate-bounce" />
            <h3 className="text-lg font-black text-white">لا توجد أي تذاكر دعم فني مسجلة</h3>
            <p className="text-xs text-text/40 mt-1 font-bold">عند مواجهة أي استفسار أو مشكلة، تفضل بفتح تذكرة مباشرة.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const isExpanded = expandedTicketId === ticket.id;
              const formattedDate = new Date(ticket.createdAt).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div 
                  key={ticket.id}
                  className={`border rounded-3xl transition-all duration-300 overflow-hidden ${
                    isExpanded 
                      ? 'border-gold/30 bg-gold/5 shadow-md shadow-gold/5' 
                      : 'border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Collapsible Header */}
                  <div 
                    onClick={() => setExpandedTicketId(isExpanded ? null : ticket.id)}
                    className="p-6 flex items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-base font-black text-white leading-tight">{ticket.subject}</h4>
                        {getPriorityBadge(ticket.priority)}
                      </div>
                      <p className="text-[10px] text-text/40 font-bold">تم الإنشاء في {formattedDate} | رقم المعرف: #{ticket.id.slice(-6).toUpperCase()}</p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {getStatusBadge(ticket.status)}
                      {isExpanded ? <ChevronUp size={18} className="text-gold" /> : <ChevronDown size={18} className="text-text/40" />}
                    </div>
                  </div>

                  {/* Collapsible Body */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-white/5 bg-black/10"
                      >
                        <div className="p-6 space-y-6">
                          
                          {/* Messages Timeline */}
                          <div className="space-y-4">
                            
                            {/* Initial ticket message */}
                            <div className="flex gap-4 items-start bg-white/5 p-5 rounded-2xl border border-white/5">
                              <div className="w-10 h-10 bg-gold/10 border border-gold/20 rounded-full flex items-center justify-center text-gold font-black shrink-0">
                                أنا
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-text/30 font-bold">شرح ووصف المشكلة الأساسي</p>
                                <p className="text-sm text-white font-bold whitespace-pre-line leading-relaxed">{ticket.body}</p>
                              </div>
                            </div>

                            {/* Replies */}
                            {ticket.messages && ticket.messages.map((msg) => {
                              const msgDate = new Date(msg.createdAt).toLocaleDateString('ar-EG', {
                                hour: '2-digit',
                                minute: '2-digit'
                              });
                              const isStaffMessage = msg.sender?.role === 'ADMIN' || msg.sender?.role === 'STAFF';

                              return (
                                <div 
                                  key={msg.id}
                                  className={`flex gap-4 items-start p-5 rounded-2xl border ${
                                    isStaffMessage 
                                      ? 'bg-gold/10 border-gold/20 mr-12' 
                                      : 'bg-white/5 border-white/5 ml-12'
                                  }`}
                                >
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black shrink-0 ${
                                    isStaffMessage
                                      ? 'bg-gold text-black'
                                      : 'bg-gold/10 border border-gold/20 text-gold'
                                  }`}>
                                    {isStaffMessage ? 'وافي' : 'أنا'}
                                  </div>
                                  <div className="space-y-1 flex-1">
                                    <div className="flex items-center justify-between gap-4">
                                      <span className="text-xs text-text/30 font-bold">
                                        {isStaffMessage ? 'فريق الدعم الفني - متجر وافي' : 'رد العميل'}
                                      </span>
                                      <span className="text-[10px] text-text/30 font-bold">{msgDate}</span>
                                    </div>
                                    <p className="text-sm text-white font-bold whitespace-pre-line leading-relaxed">{msg.body}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Quick reply form */}
                          {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' ? (
                            <div className="pt-4 border-t border-white/5 flex items-center gap-3">
                              <input 
                                type="text"
                                placeholder="اكتب ردك أو استفسارك الإضافي هنا..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSendReply(ticket.id);
                                }}
                                className="flex-1 bg-background border border-white/10 rounded-2xl py-4 px-4 focus:outline-none focus:border-gold transition-all text-white font-bold"
                              />
                              <button 
                                onClick={() => handleSendReply(ticket.id)}
                                disabled={isSendingReply || !replyText.trim()}
                                className="w-14 h-14 bg-gold hover:bg-gold-light text-black rounded-2xl flex items-center justify-center transition-all shrink-0 hover:shadow-lg disabled:opacity-50 disabled:hover:shadow-none"
                              >
                                <Send size={20} className="rotate-180" />
                              </button>
                            </div>
                          ) : (
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs font-bold text-center">
                              تم حل هذه التذكرة وإغلاقها. إذا كنت بحاجة لمزيد من المساعدة، يرجى فتح تذكرة فنية جديدة.
                            </div>
                          )}

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
