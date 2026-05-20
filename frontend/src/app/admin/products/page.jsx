"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, CheckCircle2, XCircle, X, Image as ImageIcon, PackageOpen, HelpCircle } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

const PRODUCT_TYPES = [
  { value: 'SUBSCRIPTION', label: 'اشتراك رقمي / IPTV' },
  { value: 'PHYSICAL', label: 'جهاز فيزيائي / أجهزة' },
  { value: 'GAME_CURRENCY', label: 'شحن ألعاب / كوينز' },
  { value: 'SOCIAL_SERVICE', label: 'خدمات تواصل اجتماعي' },
  { value: 'DIGITAL_FILE', label: 'ملف رقمي / كتب' },
];

export default function ProductsManagement() {
  const router = useRouter();
  const { user } = useAuthStore();

  const hasAccess = user && (user.role === 'SUPER_ADMIN' || user.permissions?.includes('PRODUCT_VIEW'));

  useEffect(() => {
    if (user && !hasAccess) {
      toast.error('غير مصرح لك بدخول هذه الصفحة');
      router.replace('/admin');
    }
  }, [user, hasAccess, router]);

  if (user && !hasAccess) {
    return null;
  }

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Filters
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Form State
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    price: '',
    productType: 'SUBSCRIPTION',
    categoryId: '',
    imageUrl: '',
    isActive: true,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProducts(prodRes.data?.data?.products || []);
      
      const cats = catRes.data?.data?.categories || catRes.data?.data || [];
      setCategories(cats);
      if (cats.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: cats[0].id }));
      }
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء تحميل بيانات المنتجات');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      nameAr: '',
      nameEn: '',
      descriptionAr: '',
      price: '',
      productType: 'SUBSCRIPTION',
      categoryId: categories[0]?.id || '',
      imageUrl: '',
      isActive: true,
      variants: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      nameAr: product.nameAr || '',
      nameEn: product.nameEn || '',
      descriptionAr: product.descriptionAr || '',
      price: product.basePrice || product.price || '',
      productType: product.productType || 'SUBSCRIPTION',
      categoryId: product.categoryId || '',
      imageUrl: product.imageUrl || '',
      isActive: product.isActive !== false,
      variants: product.variants || [],
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast.error('يرجى اختيار القسم أولاً');
      return;
    }

    try {
      const variantsPayload = formData.productType === 'SUBSCRIPTION' ? formData.variants.map(v => ({
        id: v.id,
        nameAr: v.nameAr,
        price: Number(v.price),
        isActive: v.isActive !== false
      })) : [];

      const payload = {
        ...formData,
        price: Number(formData.price),
        basePrice: Number(formData.price),
        variants: variantsPayload
      };

      if (editingProduct) {
        // Edit flow
        const res = await api.patch(`/products/${editingProduct.id}`, payload);
        toast.success('تم تحديث المنتج بنجاح 🚀');
        const updated = res.data?.data?.product || { ...editingProduct, ...payload };
        setProducts(products.map(p => p.id === editingProduct.id ? updated : p));
      } else {
        // Create flow
        const res = await api.post('/products', payload);
        toast.success('تم إضافة المنتج بنجاح 🎉');
        const created = res.data?.data?.product;
        if (created) {
          setProducts([created, ...products]);
        } else {
          fetchInitialData();
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'فشل حفظ المنتج');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج نهائياً؟')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('تم حذف المنتج بنجاح 🗑️');
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      toast.error('فشل حذف المنتج من قاعدة البيانات');
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      const updatedStatus = !product.isActive;
      await api.patch(`/products/${product.id}`, { isActive: updatedStatus });
      toast.success(`تم ${updatedStatus ? 'تفعيل' : 'تعطيل'} المنتج بنجاح`);
      setProducts(products.map(p => p.id === product.id ? { ...p, isActive: updatedStatus } : p));
    } catch (err) {
      console.error(err);
      toast.error('فشل تحديث حالة المنتج');
    }
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategoryFilter === 'ALL' || p.categoryId === selectedCategoryFilter;
    
    let matchesStatus = true;
    if (selectedStatusFilter === 'ACTIVE') matchesStatus = p.isActive === true;
    if (selectedStatusFilter === 'INACTIVE') matchesStatus = p.isActive === false;

    return matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-8 relative pb-24 font-noto text-white">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white mb-2">إدارة المنتجات</h2>
          <p className="text-text/50 font-bold">تحكم كامل في كتالوج المنتجات، الأسعار، الأجهزة، والاشتراكات</p>
        </div>
        
        <button 
          onClick={handleOpenAddModal}
          className="btn-gold px-6 py-3.5 flex items-center justify-center gap-2 gold-glow"
        >
          <Plus size={20} /> إضافة منتج جديد
        </button>
      </div>

      {/* Filters/Actions Bar */}
      <div className="bg-[#111118]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <select 
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-gold cursor-pointer"
          >
            <option value="ALL" className="bg-[#111118]">جميع الأقسام</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id} className="bg-[#111118]">{cat.nameAr}</option>
            ))}
          </select>
          
          <select 
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-gold cursor-pointer"
          >
            <option value="ALL" className="bg-[#111118]">جميع الحالات</option>
            <option value="ACTIVE" className="bg-[#111118]">نشط فقط</option>
            <option value="INACTIVE" className="bg-[#111118]">معطل فقط</option>
          </select>
        </div>

        <span className="text-xs font-bold text-text/40">إجمالي المنتجات المعروضة: {filteredProducts.length}</span>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-white/5 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center bg-[#111118]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem]">
          <PackageOpen size={48} className="text-gold/30 mx-auto mb-4" />
          <h3 className="text-lg font-black text-white">لا توجد منتجات مسجلة حالياً</h3>
          <p className="text-xs text-text/40 mt-1 font-bold">ابدأ بإضافة أول منتج لمتجرك الآن.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredProducts.map((product, idx) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.03 }}
                key={product.id}
                className={`bg-[#111118]/60 backdrop-blur-2xl border rounded-[2rem] p-6 transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                  product.isActive ? 'border-white/5 hover:border-gold/30' : 'border-red-500/10 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-start gap-4">
                    {/* Media Thumbnail */}
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 relative overflow-hidden">
                      {product.imageUrl ? (
                        <Image 
                          src={product.imageUrl} 
                          alt={product.nameAr} 
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <ImageIcon size={24} className="text-gold" />
                      )}
                    </div>
                    
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                        <span className="text-[9px] font-black uppercase text-gold bg-gold/10 px-2 py-0.5 rounded">
                          {product.category?.nameAr || 'قسم عام'}
                        </span>
                        <span className="text-[9px] font-bold text-text/40 bg-white/5 px-2 py-0.5 rounded">
                          {PRODUCT_TYPES.find(t => t.value === product.productType)?.label || product.productType}
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-white leading-snug line-clamp-2" title={product.nameAr}>
                        {product.nameAr}
                      </h3>
                      <span className="text-lg font-black text-gold block mt-2">{Number(product.basePrice || product.price).toLocaleString('ar-EG')} <span className="text-xs">ر.س</span></span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Bottom */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between shrink-0">
                  <button 
                    onClick={() => handleToggleStatus(product)}
                    className={`flex items-center gap-1.5 text-[10px] font-black px-3 py-2 rounded-xl transition-all ${
                      product.isActive 
                        ? 'bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20' 
                        : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                    }`}
                  >
                    {product.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {product.isActive ? 'نشط بالمتجر' : 'غير معروض'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleOpenEditModal(product)}
                      className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text/60 hover:text-gold hover:bg-gold/10 transition-all"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)}
                      className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text/60 hover:text-red-500 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* CRUD Product Modal */}
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
              className="relative w-full max-w-xl bg-[#111118] border border-white/10 p-8 rounded-[2.5rem] shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 left-6 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text/60 hover:text-white"
              >
                <X size={18} />
              </button>

              <h3 className="text-xl font-black text-white mb-1">
                {editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد للكتالوج'}
              </h3>
              <p className="text-xs text-text/50 font-bold mb-8">قم بتعبئة حقول المنتج بالكامل لحفظ السجلات</p>

              <form onSubmit={handleFormSubmit} className="space-y-5 text-xs font-bold text-white">
                
                <div className="space-y-2">
                  <label className="text-white block">اسم المنتج باللغة العربية *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.nameAr}
                    onChange={(e) => setFormData({...formData, nameAr: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold transition-all"
                    placeholder="مثال: اشتراك سمارترز سنة كاملة"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-white block">اسم المنتج باللغة الإنجليزية</label>
                  <input 
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({...formData, nameEn: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold transition-all"
                    placeholder="Smarters Subscription 1 Year"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-white block">نوع المنتج *</label>
                    <select 
                      value={formData.productType}
                      onChange={(e) => setFormData({...formData, productType: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold cursor-pointer"
                    >
                      {PRODUCT_TYPES.map(t => (
                        <option key={t.value} value={t.value} className="bg-[#111118]">{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-white block">القسم المرتبط *</label>
                    <select 
                      value={formData.categoryId}
                      onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold cursor-pointer"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id} className="bg-[#111118]">{cat.nameAr}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-white block">سعر البيع (ر.س) *</label>
                    <input 
                      type="number" 
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold transition-all"
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-white block">رابط الصورة المميزة (imageUrl)</label>
                    <input 
                      type="text" 
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold transition-all"
                      placeholder="https://example.com/image.png"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-white block">شرح وتفاصيل المنتج (بالعربية)</label>
                  <textarea 
                    rows={3}
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({...formData, descriptionAr: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold transition-all resize-none"
                    placeholder="شروط التفعيل، مميزات المنتج..."
                  />
                </div>

                {formData.productType === 'SUBSCRIPTION' && (
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-black text-white">خيارات وباقات المنتج (Variants)</h4>
                        <p className="text-[10px] text-text/40 font-bold">أضف باقات تسعيرية متعددة للمنتج (مثل مدد اشتراك مختلفة)</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            variants: [...(prev.variants || []), { nameAr: '', price: '', isActive: true }]
                          }));
                        }}
                        className="px-4 py-2 rounded-xl bg-gold/10 border border-gold/20 text-gold text-[10px] font-black hover:bg-gold/20 transition-all flex items-center gap-1.5"
                      >
                        <Plus size={12} /> إضافة باقة جديدة
                      </button>
                    </div>

                    {formData.variants && formData.variants.length > 0 ? (
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                        {formData.variants.map((variant, index) => (
                          <div key={index} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3.5 relative group">
                            {/* Variant Name */}
                            <div className="flex-1 space-y-1.5">
                              <label className="text-[10px] text-text/50 block">اسم الباقة *</label>
                              <input
                                type="text"
                                required
                                value={variant.nameAr || ''}
                                onChange={(e) => {
                                  const newVariants = [...formData.variants];
                                  newVariants[index] = { ...newVariants[index], nameAr: e.target.value };
                                  setFormData({ ...formData, variants: newVariants });
                                }}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold transition-all"
                                placeholder="مثال: اشتراك سنة"
                              />
                            </div>

                            {/* Variant Price */}
                            <div className="w-32 space-y-1.5">
                              <label className="text-[10px] text-text/50 block">السعر (ر.س) *</label>
                              <input
                                type="number"
                                required
                                value={variant.price || ''}
                                onChange={(e) => {
                                  const newVariants = [...formData.variants];
                                  newVariants[index] = { ...newVariants[index], price: e.target.value };
                                  setFormData({ ...formData, variants: newVariants });
                                }}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold transition-all"
                                placeholder="180"
                              />
                            </div>

                            {/* Trash Action */}
                            <div className="pt-5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  const newVariants = formData.variants.filter((_, i) => i !== index);
                                  setFormData({ ...formData, variants: newVariants });
                                }}
                                className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all"
                                title="حذف الباقة"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center bg-white/5 border border-dashed border-white/10 rounded-2xl">
                        <HelpCircle size={24} className="text-text/20 mx-auto mb-1.5" />
                        <p className="text-[10px] text-text/40 font-bold">لا يوجد باقات مضافة حالياً. يعتمد المنتج على سعر البيع الأساسي.</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <button 
                    type="submit"
                    className="flex-1 btn-gold py-4 font-black text-sm"
                  >
                    {editingProduct ? 'تحديث وحفظ' : 'إضافة المنتج بالمتجر'}
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
