"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit, Gift, X, Ticket, HelpCircle, CheckCircle2, Calendar } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function CouponsManagement() {
  const router = useRouter();
  const { user } = useAuthStore();

  const hasAccess = user && (user.role === 'SUPER_ADMIN' || user.permissions?.includes('COUPON_CREATE'));

  useEffect(() => {
    if (user && !hasAccess) {
      toast.error('غير مصرح لك بدخول هذه الصفحة');
      router.replace('/admin');
    }
  }, [user, hasAccess, router]);

  if (user && !hasAccess) {
    return null;
  }

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    descriptionAr: '',
    type: 'PERCENTAGE',
    value: '',
    minOrderAmount: '',
    maxUses: '',
    maxUsesPerUser: '1',
    expiresAt: '',
    isActive: true,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get('/marketing/coupons');
      setCoupons(res.data?.data?.coupons || []);
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء تحميل الكوبونات');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTimeLocal = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    const pad = (num) => String(num).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleOpenAddModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      descriptionAr: '',
      type: 'PERCENTAGE',
      value: '',
      minOrderAmount: '',
      maxUses: '',
      maxUsesPerUser: '1',
      expiresAt: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || '',
      descriptionAr: coupon.descriptionAr || '',
      type: coupon.type || 'PERCENTAGE',
      value: String(coupon.value || ''),
      minOrderAmount: coupon.minOrderAmount ? String(coupon.minOrderAmount) : '',
      maxUses: coupon.maxUses ? String(coupon.maxUses) : '',
      maxUsesPerUser: coupon.maxUsesPerUser ? String(coupon.maxUsesPerUser) : '1',
      expiresAt: formatDateTimeLocal(coupon.expiresAt),
      isActive: coupon.isActive !== undefined ? coupon.isActive : true,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.value) {
      toast.error('كود الخصم وقيمة الخصم مطلوبان');
      return;
    }

    try {
      const payload = {
        code: formData.code.toUpperCase().trim(),
        descriptionAr: formData.descriptionAr || null,
        type: formData.type,
        value: Number(formData.value),
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : null,
        maxUses: formData.maxUses ? Number(formData.maxUses) : null,
        maxUsesPerUser: formData.maxUsesPerUser ? Number(formData.maxUsesPerUser) : 1,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
        isActive: formData.isActive,
      };

      if (editingCoupon) {
        // Edit flow: PATCH /marketing/coupons/:id
        const res = await api.patch(`/marketing/coupons/${editingCoupon.id}`, payload);
        toast.success('تم تحديث كوبون الخصم بنجاح 🚀');
        const updated = res.data?.data?.coupon || { ...editingCoupon, ...payload };
        setCoupons(coupons.map(c => c.id === editingCoupon.id ? updated : c));
      } else {
        // Create flow: POST /marketing/coupons
        const res = await api.post('/marketing/coupons', payload);
        toast.success('تم إضافة كوبون الخصم بنجاح 🎉');
        const created = res.data?.data?.coupon;
        if (created) {
          setCoupons([created, ...coupons]);
        } else {
          fetchCoupons();
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'فشل حفظ الكوبون');
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف كوبون الخصم هذا؟')) return;
    try {
      await api.delete(`/marketing/coupons/${id}`);
      toast.success('تم حذف الكوبون بنجاح 🗑️');
      setCoupons(coupons.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
      toast.error('فشل حذف كوبون الخصم');
    }
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'مفتوح';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8 relative pb-24 font-noto text-white">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111118]/60 backdrop-blur-2xl border border-white/5 p-8 rounded-[2rem] shadow-2xl">
        <div>
          <h2 className="text-3xl font-black text-white mb-2">إدارة كوبونات الخصم</h2>
          <p className="text-text/50 font-bold">إنشاء حملات التسويق وإدارة نسب الخصم وقيمة الخصومات للعملاء</p>
        </div>
        
        <button 
          onClick={handleOpenAddModal}
          className="btn-gold px-6 py-3.5 flex items-center justify-center gap-2 gold-glow"
        >
          <Plus size={20} /> إضافة كوبون جديد
        </button>
      </div>

      {/* Coupons Queue */}
      {loading ? (
        <div className="space-y-4 py-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="py-20 text-center bg-[#111118]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem]">
          <Gift size={48} className="text-gold/30 mx-auto mb-4" />
          <h3 className="text-lg font-black text-white">لا توجد كوبونات مسجلة حالياً</h3>
          <p className="text-xs text-text/40 mt-1 font-bold">ابدأ بإنشاء أول كوبون خصم تسويقي لمتجرك.</p>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111118]/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl"
        >
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-right whitespace-nowrap">
              <thead className="bg-white/5 border-b border-white/5 text-text/40 font-bold text-xs">
                <tr>
                  <th className="p-5">كود الخصم</th>
                  <th className="p-5">الوصف والفعالية</th>
                  <th className="p-5">نوع الخصم</th>
                  <th className="p-5">قيمة الخصم</th>
                  <th className="p-5">الحد الأدنى</th>
                  <th className="p-5">حد الاستخدام</th>
                  <th className="p-5">تاريخ الانتهاء</th>
                  <th className="p-5">الحالة</th>
                  <th className="p-5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-bold">
                {coupons.map((coupon, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    key={coupon.id} 
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="p-5 text-gold font-black font-mono">#{coupon.code}</td>
                    <td className="p-5 text-white/80">{coupon.descriptionAr || 'خصم ترويجي عام'}</td>
                    <td className="p-5">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        coupon.type === 'PERCENTAGE' ? 'text-blue-400 bg-blue-400/10' : 'text-emerald-400 bg-emerald-400/10'
                      }`}>
                        {coupon.type === 'PERCENTAGE' ? 'نسبة مئوية' : 'مبلغ ثابت'}
                      </span>
                    </td>
                    <td className="p-5 text-white">
                      {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `${coupon.value} ر.س`}
                    </td>
                    <td className="p-5 text-text/50">
                      {coupon.minOrderAmount ? `${coupon.minOrderAmount} ر.س` : 'لا يوجد'}
                    </td>
                    <td className="p-5">
                      <span className="text-white/80">
                        {coupon.usedCount || 0} / {coupon.maxUses || '∞'}
                      </span>
                    </td>
                    <td className="p-5 text-text/60">
                      {formatDateDisplay(coupon.expiresAt)}
                    </td>
                    <td className="p-5">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        coupon.isActive ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
                      }`}>
                        {coupon.isActive ? 'نشط' : 'معطل'}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleOpenEditModal(coupon)}
                          className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text/60 hover:text-gold hover:bg-gold/10 transition-all"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text/60 hover:text-red-500 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Add / Edit Coupon Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#111118] border border-white/10 p-8 rounded-[2.5rem] shadow-2xl"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 left-6 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text/60 hover:text-white"
              >
                <X size={18} />
              </button>

              <h3 className="text-xl font-black text-white mb-1">
                {editingCoupon ? 'تعديل كوبون الخصم' : 'إضافة كوبون خصم جديد'}
              </h3>
              <p className="text-xs text-text/50 font-bold mb-8">
                {editingCoupon ? 'تعديل وتحديث تفاصيل كود الخصم النشط' : 'إنشاء رموز وحوافز الشراء للعملاء'}
              </p>

              <form onSubmit={handleFormSubmit} className="space-y-5 text-xs font-bold text-white">
                
                <div className="space-y-2">
                  <label className="text-white block">كود الخصم (رمز الكوبون) *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase().trim()})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold font-mono transition-all"
                    placeholder="مثال: SAVE20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-white block">الوصف أو الشرح (بالعربية)</label>
                  <input 
                    type="text" 
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({...formData, descriptionAr: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold transition-all"
                    placeholder="خصم 20% بمناسبة إطلاق المنصة"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-white block">نوع الخصم *</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold cursor-pointer"
                    >
                      <option value="PERCENTAGE" className="bg-[#111118]">نسبة مئوية (%)</option>
                      <option value="FIXED_AMOUNT" className="bg-[#111118]">مبلغ ثابت (ر.س)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-white block">قيمة الخصم *</label>
                    <input 
                      type="number" 
                      required
                      value={formData.value}
                      onChange={(e) => setFormData({...formData, value: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold transition-all"
                      placeholder="مثال: 20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2 col-span-1">
                    <label className="text-white block">الحد الأدنى للطلب</label>
                    <input 
                      type="number" 
                      value={formData.minOrderAmount}
                      onChange={(e) => setFormData({...formData, minOrderAmount: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold transition-all"
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2 col-span-1">
                    <label className="text-white block">أقصى استخدام</label>
                    <input 
                      type="number" 
                      value={formData.maxUses}
                      onChange={(e) => setFormData({...formData, maxUses: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold transition-all"
                      placeholder="∞"
                    />
                  </div>

                  <div className="space-y-2 col-span-1">
                    <label className="text-white block">حد استخدام الفرد</label>
                    <input 
                      type="number" 
                      value={formData.maxUsesPerUser}
                      onChange={(e) => setFormData({...formData, maxUsesPerUser: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold transition-all"
                      placeholder="1"
                    />
                  </div>
                </div>

                {/* Expiry Date and Status Checkbox */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-white block">تاريخ انتهاء الصلاحية</label>
                    <input 
                      type="datetime-local" 
                      value={formData.expiresAt}
                      onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold transition-all font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-white block">حالة الكوبون</label>
                    <div className="flex items-center h-[52px]">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                        <span className="mr-3 text-sm font-bold text-white">
                          {formData.isActive ? 'نشط ومفعل' : 'معطل'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="submit"
                    className="flex-1 btn-gold py-4 font-black text-sm"
                  >
                    {editingCoupon ? 'حفظ التعديلات' : 'إضافة كوبون الخصم'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-4 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
