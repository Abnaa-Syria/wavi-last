"use client";
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion as m } from 'framer-motion';
import { Search, Filter, Eye, Calendar, User, Package, CreditCard, X, MapPin, CheckCircle, ShieldAlert } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'قيد الانتظار', class: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  { value: 'PROCESSING', label: 'قيد التجهيز', class: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  { value: 'FULFILLED', label: 'تم التسليم/التفعيل', class: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  { value: 'CANCELLED', label: 'ملغي', class: 'text-red-400 bg-red-400/10 border-red-400/20' },
  { value: 'REFUNDED', label: 'مسترجع', class: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  { value: 'FAILED', label: 'فشل التنفيذ', class: 'text-red-500 bg-red-500/10 border-red-500/20' },
  { value: 'WAITING_INFO', label: 'انتظار البيانات', class: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
];

export default function OrderManagement() {
  const router = useRouter();
  const { user } = useAuthStore();

  const hasAccess = user && (user.role === 'SUPER_ADMIN' || user.permissions?.includes('ORDER_VIEW'));

  useEffect(() => {
    if (user && !hasAccess) {
      toast.error('غير مصرح لك بدخول هذه الصفحة');
      router.replace('/admin');
    }
  }, [user, hasAccess, router]);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (user && hasAccess) {
      fetchOrders();
    }
  }, [user, hasAccess]);

  if (user && !hasAccess) {
    return null;
  }

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      setOrders(res.data?.data?.orders || []);
    } catch (err) {
      console.error(err);
      toast.error('فشل تحميل قائمة الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, {
        status: newStatus,
        note: 'تم التحديث من لوحة التحكم'
      });
      toast.success('تم تحديث حالة الطلب بنجاح 🚀');
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'فشل تحديث حالة الطلب');
    }
  };

  // Helper to parse Shipping Address from customerNotes
  const parseShippingAddress = (notes) => {
    if (!notes) return null;
    // Format: المدينة: الرياض | الحي/المنطقة: الياسمين | العنوان بالتفصيل: شارع العليا 12
    const regex = /المدينة:\s*([^\n|]+)\s*\|\s*الحي\/المنطقة:\s*([^\n|]+)\s*\|\s*العنوان بالتفصيل:\s*([^\n|]+)/;
    const match = notes.match(regex);
    if (match) {
      return {
        city: match[1].trim(),
        district: match[2].trim(),
        address: match[3].trim(),
      };
    }
    return null;
  };

  const getStatusItem = (status) => {
    return STATUS_OPTIONS.find(o => o.value === status) || { value: status, label: status, class: 'text-text/60 bg-white/5 border-white/10' };
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.orderNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (order.user?.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (order.user?.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (order.customerPhone || '').includes(searchTerm);

    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const role = user?.role || 'SUPPORT';
  const hideFinances = role === 'SUPPORT';

  return (
    <div className="space-y-8 relative pb-24 font-noto text-white">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white mb-2">إدارة الطلبات</h2>
          <p className="text-text/50 font-bold">متابعة وتحديث طلبات العملاء وتفعيل الاشتراكات يدوياً</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-text/40" size={18} />
            <input 
              type="text" 
              placeholder="البحث برقم الطلب، اسم العميل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-card/60 backdrop-blur-xl border border-white/10 rounded-2xl py-3 pr-10 pl-4 focus:outline-none focus:border-gold transition-all text-white text-sm font-bold w-full md:w-72"
            />
          </div>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-card/60 backdrop-blur-xl border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-gold text-sm font-bold text-white cursor-pointer"
          >
            <option value="ALL">جميع الحالات</option>
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Grid/Table */}
      {loading ? (
        <div className="space-y-4 py-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 text-center bg-[#111118]/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem]">
          <ShieldAlert size={48} className="text-gold/30 mx-auto mb-4" />
          <h3 className="text-lg font-black text-white">لا توجد طلبات مطابقة للفلاتر</h3>
          <p className="text-xs text-text/40 mt-1 font-bold">يرجى تغيير الكلمات الدلالية للبحث أو فلترة الحالات.</p>
        </div>
      ) : (
        <m.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111118]/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl"
        >
          <div className="overflow-x-auto min-h-[350px]">
            <table className="w-full text-right whitespace-nowrap">
              <thead className="bg-white/5 border-b border-white/5 text-text/40 font-bold text-xs">
                <tr>
                  <th className="p-5">رقم الطلب</th>
                  <th className="p-5">العميل</th>
                  <th className="p-5">المنتجات</th>
                  <th className="p-5 text-left">التاريخ</th>
                  {!hideFinances && <th className="p-5">المبلغ</th>}
                  <th className="p-5">حالة الطلب</th>
                  <th className="p-5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-bold">
                {filteredOrders.map((order, idx) => {
                  const statusInfo = getStatusItem(order.status);
                  const formattedDate = new Date(order.createdAt).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <m.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      key={order.id} 
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="p-5 text-gold font-black">#{order.orderNumber || order.id.slice(-6).toUpperCase()}</td>
                      
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold font-black text-xs shrink-0">
                            {order.user?.firstName?.[0] || 'ع'}
                          </div>
                          <div>
                            <p className="text-white font-black leading-none mb-1">{order.user?.firstName} {order.user?.lastName}</p>
                            <p className="text-[10px] text-text/40 leading-none">{order.customerPhone || order.user?.phone || ''}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-5 max-w-[200px] truncate">
                        <div className="flex items-center gap-2 text-white/80">
                          <Package size={14} className="text-gold" />
                          <span>
                            {order.items?.map(item => item.productNameAr).join(' + ') || 'منتج غير معروف'}
                          </span>
                        </div>
                      </td>

                      <td className="p-5 text-left text-text/40">
                        <div className="flex items-center justify-end gap-1.5">
                          <Calendar size={12} />
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      {!hideFinances && (
                        <td className="p-5">
                          <span className="font-black text-white text-sm">{Number(order.total || 0).toLocaleString('ar-EG')} ر.س</span>
                        </td>
                      )}

                      <td className="p-5">
                        <select 
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`text-[10px] font-bold px-3 py-2 rounded-xl border outline-none cursor-pointer appearance-none ${statusInfo.class}`}
                          style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value} className="bg-[#121218] text-white">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="p-5">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center text-gold hover:bg-gold/20 hover:shadow-lg hover:shadow-gold/5 transition-all"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </m.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </m.div>
      )}

      {/* Analytical Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-6 font-noto">
            <m.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#111118] border border-white/10 rounded-[2.5rem] w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl relative p-8 scrollbar-thin"
            >
              
              {/* Modal Close Button */}
              <button 
                onClick={() => setSelectedOrder(null)}
                className="absolute top-6 left-6 w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-text/80" />
              </button>

              <h3 className="text-2xl font-black text-white mb-1 flex items-center gap-2">
                تفاصيل الطلب <span className="text-gold">#{selectedOrder.orderNumber || selectedOrder.id.slice(-6).toUpperCase()}</span>
              </h3>
              <p className="text-xs text-text/50 font-bold mb-8">معالجة ومراجعة بيانات العميل وتغيير الحالات يدوياً</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* 1. Client and Payment Recaps */}
                <div className="md:col-span-1 space-y-6">
                  
                  {/* Customer Card */}
                  <div className="bg-white/[0.02] p-5 rounded-3xl border border-white/5 space-y-4">
                    <h4 className="text-sm font-black text-gold flex items-center gap-2 border-b border-white/5 pb-2">
                      <User size={16} /> بيانات العميل
                    </h4>
                    <div className="space-y-2 text-xs font-bold">
                      <p className="text-white">{selectedOrder.user?.firstName} {selectedOrder.user?.lastName}</p>
                      <p className="text-text/50">{selectedOrder.user?.email}</p>
                      <p className="text-text/50">الهاتف: {selectedOrder.customerPhone || selectedOrder.user?.phone || 'غير مسجل'}</p>
                    </div>
                  </div>

                  {/* Payment Card */}
                  <div className="bg-white/[0.02] p-5 rounded-3xl border border-white/5 space-y-4">
                    <h4 className="text-sm font-black text-gold flex items-center gap-2 border-b border-white/5 pb-2">
                      <CreditCard size={16} /> الدفع والخصومات
                    </h4>
                    <div className="space-y-3 text-xs font-bold">
                      <div className="flex justify-between">
                        <span className="text-text/40">طريقة الدفع:</span>
                        <span className="text-white">Apple Pay / مدى</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text/40">حالة السداد:</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          selectedOrder.paymentStatus === 'PAID' ? 'text-emerald-400 bg-emerald-400/10' : 'text-amber-500 bg-amber-500/10'
                        }`}>
                          {selectedOrder.paymentStatus === 'PAID' ? 'مدفوع بالكامل' : 'معلق'}
                        </span>
                      </div>
                      {selectedOrder.couponCode && (
                        <div className="flex justify-between">
                          <span className="text-text/40">كوبون الخصم:</span>
                          <span className="text-gold font-black">{selectedOrder.couponCode}</span>
                        </div>
                      )}
                      
                      {!hideFinances && (
                        <div className="border-t border-white/5 pt-3 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-text/40">المجموع الفرعي:</span>
                            <span className="text-white">{Number(selectedOrder.subtotal || 0).toLocaleString('ar-EG')} ر.س</span>
                          </div>
                          {Number(selectedOrder.discountAmount) > 0 && (
                            <div className="flex justify-between text-red-400">
                              <span>قيمة الخصم:</span>
                              <span>-{Number(selectedOrder.discountAmount || 0).toLocaleString('ar-EG')} ر.س</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm font-black pt-1 border-t border-white/5">
                            <span className="text-gold">الإجمالي النهائي:</span>
                            <span className="text-gold">{Number(selectedOrder.total || 0).toLocaleString('ar-EG')} ر.س</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Order Items and Credentials */}
                <div className="md:col-span-2 space-y-6">
                  
                  {/* Order items list */}
                  <div className="bg-white/[0.02] p-6 rounded-3xl border border-white/5 space-y-6">
                    <h4 className="text-sm font-black text-gold flex items-center gap-2 border-b border-white/5 pb-2">
                      <Package size={16} /> المنتجات المطلوبة وبيانات التوصيل
                    </h4>

                    <div className="space-y-4">
                      {selectedOrder.items?.map((item) => {
                        const isPhysical = item.productType === 'PHYSICAL';
                        const addressInfo = isPhysical ? parseShippingAddress(selectedOrder.customerNotes) : null;

                        return (
                          <div key={item.id} className="p-5 rounded-2xl bg-black/20 border border-white/5 space-y-4">
                            
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <h5 className="text-sm font-black text-white">{item.productNameAr}</h5>
                                {item.variantNameAr && (
                                  <p className="text-[10px] text-gold font-bold mt-1">الباقة: {item.variantNameAr}</p>
                                )}
                              </div>
                              <span className="text-xs font-bold text-text/40">الكمية: {item.quantity}</span>
                            </div>

                            {/* 1. Digital Product Panel */}
                            {!isPhysical && item.customerData && (
                              <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                                <h6 className="text-[10px] font-black text-gold flex items-center gap-1.5 uppercase">
                                  <CheckCircle size={12} /> بيانات تفعيل الحساب المطلوبة
                                </h6>
                                <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                                  {Object.entries(item.customerData).map(([key, val]) => (
                                    <div key={key} className="bg-black/20 p-2.5 rounded-lg border border-white/5">
                                      <span className="text-text/40 block text-[9px] uppercase mb-0.5">{key}</span>
                                      <span className="text-white break-all">{val || '-'}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 2. Physical Shipping Address Panel */}
                            {isPhysical && (
                              <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                                <h6 className="text-[10px] font-black text-gold flex items-center gap-1.5 uppercase">
                                  <MapPin size={12} /> عنوان التوصيل والشحن للأجهزة الفيزيائية
                                </h6>
                                
                                {addressInfo ? (
                                  <div className="grid grid-cols-3 gap-3 text-xs font-bold">
                                    <div className="bg-black/20 p-2.5 rounded-lg border border-white/5">
                                      <span className="text-text/40 block text-[9px] mb-0.5">المدينة</span>
                                      <span className="text-white">{addressInfo.city}</span>
                                    </div>
                                    <div className="bg-black/20 p-2.5 rounded-lg border border-white/5">
                                      <span className="text-text/40 block text-[9px] mb-0.5">المنطقة/الحي</span>
                                      <span className="text-white">{addressInfo.district}</span>
                                    </div>
                                    <div className="bg-black/20 p-2.5 rounded-lg border border-white/5 col-span-3 md:col-span-1">
                                      <span className="text-text/40 block text-[9px] mb-0.5">العنوان بالتفصيل</span>
                                      <span className="text-white truncate" title={addressInfo.address}>{addressInfo.address}</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-black/20 p-3 rounded-lg border border-white/5 text-xs font-bold text-white">
                                    <span className="text-text/40 block text-[9px] mb-1">ملاحظات العميل والعنوان</span>
                                    {selectedOrder.customerNotes || 'لا توجد ملاحظات أو عنوان مسجل'}
                                  </div>
                                )}
                              </div>
                            )}
                            
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions Dropdown inside Modal */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.01] border border-white/5 p-5 rounded-3xl">
                    <span className="text-xs font-black text-text/40">تعديل حالة الطلب الحالية:</span>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {STATUS_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => handleStatusChange(selectedOrder.id, opt.value)}
                          className={`flex-1 sm:flex-initial text-[10px] font-black px-4 py-2.5 rounded-xl border transition-all ${
                            selectedOrder.status === opt.value
                              ? 'bg-gold text-black border-gold shadow-md'
                              : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

            </m.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
