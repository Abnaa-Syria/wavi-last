"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Calendar, ChevronLeft, CreditCard, X, Download, Printer, Hash, CheckCircle2, Loader2, Info } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

const STATUS_MAP = {
  PENDING: { text: 'قيد الانتظار', color: 'text-gold bg-gold/10 border-gold/20' },
  PROCESSING: { text: 'قيد التنفيذ', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  FULFILLED: { text: 'مكتمل', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  COMPLETED: { text: 'مكتمل', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  CANCELLED: { text: 'ملغي', color: 'text-red-400 bg-red-400/10 border-red-400/20' }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/my-orders');
      setOrders(response.data.data.orders || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
      toast.error('فشل في تحميل سجل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInvoice = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('ar-EG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-gold" size={40} />
        <p className="text-text/40 font-bold text-sm">جاري تحميل سجل الطلبات...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 text-right"
      dir="rtl"
    >
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">سجل الطلبات</h1>
        <p className="text-text/50 font-medium">متابعة كافة طلباتك السابقة والحالية</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-card/40 border border-white/5 rounded-[2.5rem] p-12 text-center flex flex-col items-center justify-center opacity-50">
          <Package size={64} className="text-text/20 mb-4" />
          <p className="text-lg font-bold text-white">لا يوجد لديك أي طلبات سابقة بعد</p>
          <p className="text-xs text-text/40 mt-1">تسوّق الآن واستمتع بمنتجاتنا المميزة</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, idx) => {
            const statusConfig = STATUS_MAP[order.status] || { text: order.status, color: 'text-text bg-white/5 border-white/10' };
            const dateStr = formatDate(order.createdAt);
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={order.id} 
                className="bg-card/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 hover:border-gold/30 transition-all duration-300 group shadow-lg"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-gold/20 transition-colors">
                      <Package className="text-text/40 group-hover:text-gold transition-colors" size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-black text-white text-lg tracking-wide">{order.orderNumber}</h3>
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${statusConfig.color}`}>
                          {statusConfig.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-text/40 text-xs font-bold">
                        <Calendar size={14} />
                        {dateStr}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 px-0 md:px-6">
                    <p className="text-sm font-bold text-white/80 line-clamp-1">
                      {order.items.map(i => i.productNameAr).join(' + ')}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs font-bold text-text/40">
                      <CreditCard size={14} />
                      وسيلة الدفع: مدى / آبل باي
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:flex-col md:items-end gap-2 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                    <span className="font-black text-gold text-xl">{order.total} <span className="text-xs">ر.س</span></span>
                    <button 
                      onClick={() => handleOpenInvoice(order)}
                      className="text-xs font-bold text-white/60 hover:text-gold flex items-center gap-1 transition-colors px-3 py-1.5 hover:bg-gold/5 rounded-lg border border-transparent hover:border-gold/10"
                    >
                      عرض الفاتورة
                      <ChevronLeft size={14} />
                    </button>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Invoice Modal */}
      <AnimatePresence>
        {isModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md" dir="rtl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-[#0A0A0F]/95 backdrop-blur-2xl border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden relative text-right"
            >
              {/* Header Gradient */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gold-gradient" />
              
              {/* Close Button */}
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 left-6 w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-white"
              >
                <X size={20} />
              </button>

              <div className="p-10 space-y-8 max-h-[85vh] overflow-y-auto">
                {/* Invoice Header */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-gold/10 rounded-3xl flex items-center justify-center mb-4 border border-gold/20 shadow-[0_0_30px_rgba(245,197,24,0.1)]">
                    <CheckCircle2 className="text-gold" size={40} />
                  </div>
                  <h2 className="text-3xl font-black text-white">تفاصيل الفاتورة</h2>
                  <p className="text-text/40 font-bold mt-1">متجر وافي - WAVI STORE</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-6 bg-white/5 rounded-3xl p-8 border border-white/5">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-text/30 uppercase tracking-widest">رقم تتبع الطلب</p>
                    <div className="flex items-center gap-2 text-white font-black">
                      <Hash size={14} className="text-gold" />
                      {selectedOrder.orderNumber}
                    </div>
                  </div>
                  <div className="space-y-1 text-left">
                    <p className="text-[10px] font-black text-text/30 uppercase tracking-widest">تاريخ العملية</p>
                    <div className="flex items-center gap-2 text-white font-black justify-end">
                      {formatDate(selectedOrder.createdAt)}
                      <Calendar size={14} className="text-gold" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-text/30 uppercase tracking-widest">حالة الطلب</p>
                    <div className={`text-xs font-black inline-flex px-3 py-1 rounded-full border ${(STATUS_MAP[selectedOrder.status] || {}).color}`}>
                      {(STATUS_MAP[selectedOrder.status] || {}).text || selectedOrder.status}
                    </div>
                  </div>
                  <div className="space-y-1 text-left">
                    <p className="text-[10px] font-black text-text/30 uppercase tracking-widest">طريقة الدفع</p>
                    <div className="flex items-center gap-2 text-white font-black justify-end">
                      مدى / مدى البنكية
                      <CreditCard size={14} className="text-gold" />
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="space-y-4">
                  <p className="text-xs font-black text-text/40 mr-1 uppercase">المنتجات المشتراة</p>
                  <div className="bg-white/5 rounded-3xl overflow-hidden border border-white/5">
                    {selectedOrder.items.map((item, i) => {
                      const dataEntries = Object.entries(item.customerData || {});
                      return (
                        <div key={i} className="p-6 border-b border-white/5 last:border-0 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center border border-white/5">
                                <Package size={20} className="text-gold" />
                              </div>
                              <div>
                                <p className="text-sm font-black text-white">{item.productNameAr}</p>
                                {item.variantNameAr && (
                                  <p className="text-xs font-bold text-gold/60 mt-0.5">{item.variantNameAr}</p>
                                )}
                                <p className="text-[10px] font-bold text-text/40 mt-0.5">الكمية: {item.quantity}</p>
                              </div>
                            </div>
                            <div className="text-lg font-black text-white">
                              {item.totalPrice} <span className="text-[10px] text-text/40">ر.س</span>
                            </div>
                          </div>

                          {/* Dynamic Customer Data Requirements display */}
                          {dataEntries.length > 0 && (
                            <div className="bg-background/40 p-4 rounded-2xl border border-white/5 space-y-2">
                              <div className="flex items-center gap-1.5 text-[10px] font-black text-text/40">
                                <Info size={12} className="text-gold" /> بيانات التفعيل المرفقة:
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {dataEntries.map(([key, val]) => (
                                  <span key={key} className="text-[10px] bg-white/5 px-2.5 py-1 rounded-md text-text/60 font-bold border border-white/5">
                                    {key === 'playerName' && 'اللاعب'}
                                    {key === 'playerId' && 'معرف اللاعب'}
                                    {key === 'backupCodes' && 'أكواد الاحتياط'}
                                    {key === 'profileName' && 'الملف الشخصي'}
                                    {key === 'whatsappNumber' && 'رقم الجوال'}
                                    {key === 'email' && 'البريد الإلكتروني'}
                                    {!['playerName', 'playerId', 'backupCodes', 'profileName', 'whatsappNumber', 'email'].includes(key) && key}
                                    : <span className="text-white select-all">{val}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Coupon deductions details */}
                {selectedOrder.couponCode && (
                  <div className="flex items-center justify-between text-xs font-bold px-6 text-text/40">
                    <span>قيمة الخصم (كوبون: {selectedOrder.couponCode})</span>
                    <span className="text-red-400 font-bold">-{selectedOrder.discountAmount} ر.س</span>
                  </div>
                )}

                {/* Total Section */}
                <div className="flex items-center justify-between p-8 bg-gold/5 rounded-3xl border border-gold/10">
                  <span className="text-lg font-black text-white">الإجمالي النهائي</span>
                  <div className="flex flex-col items-end">
                    <span className="text-3xl font-black text-gold leading-none">{selectedOrder.total} ر.س</span>
                    <p className="text-[10px] font-bold text-gold/40 mt-1">شامل ضريبة القيمة المضافة</p>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center gap-4 pt-4">
                  <button 
                    onClick={() => {
                      toast.success('جاري تجهيز وتحميل الفاتورة بصيغة PDF... 📄');
                    }}
                    className="flex-1 btn-gold py-5 text-lg font-black flex items-center justify-center gap-3 gold-glow"
                  >
                    <Download size={20} />
                    تحميل الفاتورة PDF
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="w-16 h-[64px] bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all border border-white/10 text-white"
                  >
                    <Printer size={24} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
