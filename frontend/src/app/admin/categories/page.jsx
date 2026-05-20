"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, FolderPlus, X, HelpCircle, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function CategoriesManagement() {
  const router = useRouter();
  const { user } = useAuthStore();

  const hasAccess = user && (user.role === 'SUPER_ADMIN' || user.permissions?.includes('CATEGORY_CREATE'));

  useEffect(() => {
    if (user && !hasAccess) {
      toast.error('غير مصرح لك بدخول هذه الصفحة');
      router.replace('/admin');
    }
  }, [user, hasAccess, router]);

  if (user && !hasAccess) {
    return null;
  }

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    slug: '',
    descriptionAr: '',
    parentId: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      // Backend returns either an array directly or nested under { data: { categories } } or { data: [...] }
      const cats = res.data?.data?.categories || res.data?.data || [];
      setCategories(cats);
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء تحميل التصنيفات');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormData({
      nameAr: '',
      nameEn: '',
      slug: '',
      descriptionAr: '',
      parentId: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      nameAr: category.nameAr || '',
      nameEn: category.nameEn || '',
      slug: category.slug || '',
      descriptionAr: category.descriptionAr || '',
      parentId: category.parentId || '',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nameAr || !formData.slug) {
      toast.error('الاسم العربي والرابط الفريد مطلوبان');
      return;
    }

    try {
      // Clean parentId if empty or "null" string representation
      const payload = {
        ...formData,
        parentId: (formData.parentId === '' || formData.parentId === 'null' || formData.parentId === null) ? null : formData.parentId
      };

      if (editingCategory) {
        // Edit flow
        const res = await api.patch(`/categories/${editingCategory.id}`, payload);
        toast.success('تم تحديث التصنيف بنجاح 🚀');
        setCategories(categories.map(c => c.id === editingCategory.id ? res.data?.data?.category || { ...c, ...payload } : c));
      } else {
        // Create flow
        const res = await api.post('/categories', payload);
        toast.success('تم إضافة التصنيف بنجاح 🎉');
        const created = res.data?.data?.category;
        if (created) {
          setCategories([created, ...categories]);
        } else {
          fetchCategories();
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'فشل حفظ التصنيف');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا التصنيف؟ قد يؤثر ذلك على المنتجات المرتبطة به.')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('تم حذف التصنيف بنجاح 🗑️');
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
      toast.error('فشل حذف التصنيف. قد يكون مرتبطاً بمنتجات أو تصنيفات فرعية.');
    }
  };

  // Find parent category helper
  const getParentName = (parentId) => {
    if (!parentId) return 'تصنيف رئيسي';
    const parent = categories.find(c => c.id === parentId);
    return parent ? parent.nameAr : 'تصنيف رئيسي';
  };

  return (
    <div className="space-y-8 relative pb-24 font-noto text-white">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white mb-2">إدارة التصنيفات</h2>
          <p className="text-text/50 font-bold">إعداد هيكلة الأقسام للمتجر وتخصيص الروابط الفريدة (Slugs)</p>
        </div>
        
        <button 
          onClick={handleOpenAddModal}
          className="btn-gold px-6 py-3.5 flex items-center justify-center gap-2 gold-glow"
        >
          <Plus size={20} /> إضافة تصنيف جديد
        </button>
      </div>

      {/* Categories Queue */}
      {loading ? (
        <div className="space-y-4 py-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="py-20 text-center bg-[#111118]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem]">
          <FolderPlus size={48} className="text-gold/30 mx-auto mb-4" />
          <h3 className="text-lg font-black text-white">لا توجد تصنيفات معرّفة حالياً</h3>
          <p className="text-xs text-text/40 mt-1 font-bold">ابدأ بإنشاء هيكلية التصنيفات لمتجرك.</p>
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
                  <th className="p-5">الاسم العربي</th>
                  <th className="p-5">الاسم الإنجليزي</th>
                  <th className="p-5">الرابط الفريد (Slug)</th>
                  <th className="p-5">التصنيف الأب</th>
                  <th className="p-5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-bold">
                {categories.map((cat, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    key={cat.id} 
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="p-5 text-white font-black">{cat.nameAr}</td>
                    <td className="p-5 text-text/60">{cat.nameEn || '-'}</td>
                    <td className="p-5 text-gold font-mono">{cat.slug}</td>
                    <td className="p-5">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        cat.parentId ? 'text-blue-400 bg-blue-400/10' : 'text-emerald-400 bg-emerald-400/10'
                      }`}>
                        {getParentName(cat.parentId)}
                      </span>
                    </td>

                    <td className="p-5">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleOpenEditModal(cat)}
                          className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text/60 hover:text-gold hover:bg-gold/10 transition-all"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(cat.id)}
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

      {/* Add/Edit Category Modal */}
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
                {editingCategory ? 'تعديل بيانات القسم' : 'إضافة قسم جديد للمتجر'}
              </h3>
              <p className="text-xs text-text/50 font-bold mb-8">إعداد الأقسام الفرعية والرئيسية للمنتجات</p>

              <form onSubmit={handleFormSubmit} className="space-y-5 text-xs font-bold text-white">
                
                <div className="space-y-2">
                  <label className="text-white block">اسم القسم باللغة العربية *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.nameAr}
                    onChange={(e) => setFormData({...formData, nameAr: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold transition-all"
                    placeholder="مثال: اشتراكات IPTV"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-white block">اسم القسم باللغة الإنجليزية</label>
                  <input 
                    type="text" 
                    value={formData.nameEn}
                    onChange={(e) => setFormData({...formData, nameEn: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold transition-all"
                    placeholder="IPTV Subscriptions"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-white block">الرابط الفريد (Slug) *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold font-mono transition-all"
                      placeholder="iptv-subscriptions"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-white block">التصنيف الأب (اختياري)</label>
                    <select 
                      value={formData.parentId}
                      onChange={(e) => setFormData({...formData, parentId: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold cursor-pointer"
                    >
                      <option value="">-- تصنيف رئيسي --</option>
                      {categories
                        .filter(c => c.id !== editingCategory?.id) // Prevent self-nesting
                        .map(cat => (
                          <option key={cat.id} value={cat.id} className="bg-[#111118]">{cat.nameAr}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-white block">وصف أو شرح القسم</label>
                  <textarea 
                    rows={3}
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({...formData, descriptionAr: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold transition-all resize-none"
                    placeholder="شرح بسيط لمحتويات هذا القسم..."
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="submit"
                    className="flex-1 btn-gold py-4 font-black text-sm"
                  >
                    {editingCategory ? 'تحديث وحفظ' : 'إضافة القسم'}
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
