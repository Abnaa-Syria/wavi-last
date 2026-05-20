"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, HelpCircle, X, CheckCircle2, ChevronDown, ChevronUp, FolderPlus } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function FaqsManagement() {
  const router = useRouter();
  const { user } = useAuthStore();

  const hasAccess = user && (user.role === 'SUPER_ADMIN' || user.permissions?.includes('SETTINGS_MANAGE'));

  useEffect(() => {
    if (user && !hasAccess) {
      toast.error('غير مصرح لك بدخول هذه الصفحة');
      router.replace('/admin');
    }
  }, [user, hasAccess, router]);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  
  const [editingCat, setEditingCat] = useState(null);
  const [editingFaq, setEditingFaq] = useState(null);

  // Expanded Categories local tracking
  const [expandedCatIds, setExpandedCatIds] = useState({});

  // Category Form State
  const [catForm, setCatForm] = useState({
    nameAr: '',
    nameEn: '',
    sortOrder: '0',
  });

  // FAQ Form State
  const [faqForm, setFaqForm] = useState({
    categoryId: '',
    questionAr: '',
    questionEn: '',
    answerAr: '',
    answerEn: '',
    sortOrder: '0',
  });

  useEffect(() => {
    if (user && hasAccess) {
      fetchFaqs();
    }
  }, [user, hasAccess]);

  if (user && !hasAccess) {
    return null;
  }

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/faqs/admin');
      const cats = res.data?.data?.categories || [];
      setCategories(cats);
      
      // Auto-expand all categories by default
      const expandMap = {};
      cats.forEach(c => {
        expandMap[c.id] = true;
      });
      setExpandedCatIds(expandMap);
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء تحميل الأسئلة الشائعة');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategoryExpand = (catId) => {
    setExpandedCatIds(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  // CATEGORY ACTIONS
  const handleOpenAddCat = () => {
    setEditingCat(null);
    setCatForm({ nameAr: '', nameEn: '', sortOrder: '0' });
    setIsCatModalOpen(true);
  };

  const handleOpenEditCat = (cat) => {
    setEditingCat(cat);
    setCatForm({
      nameAr: cat.nameAr || '',
      nameEn: cat.nameEn || '',
      sortOrder: String(cat.sortOrder || 0),
    });
    setIsCatModalOpen(true);
  };

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    if (!catForm.nameAr) return;

    try {
      const payload = {
        nameAr: catForm.nameAr,
        nameEn: catForm.nameEn || null,
        sortOrder: Number(catForm.sortOrder || 0),
      };

      if (editingCat) {
        await api.patch(`/faqs/categories/${editingCat.id}`, payload);
        toast.success('تم تحديث القسم بنجاح 🚀');
      } else {
        await api.post('/faqs/categories', payload);
        toast.success('تم إضافة قسم الأسئلة بنجاح 🎉');
      }
      fetchFaqs();
      setIsCatModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'فشل حفظ القسم');
    }
  };

  const handleDeleteCat = async (catId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا القسم بالكامل؟ سيتم حذف جميع الأسئلة التابعة له!')) return;
    try {
      await api.delete(`/faqs/categories/${catId}`);
      toast.success('تم حذف القسم بنجاح 🗑️');
      fetchFaqs();
    } catch (err) {
      console.error(err);
      toast.error('فشل حذف قسم الأسئلة الشائعة');
    }
  };

  // FAQ ACTIONS
  const handleOpenAddFaq = (catId) => {
    setEditingFaq(null);
    setFaqForm({
      categoryId: catId || categories[0]?.id || '',
      questionAr: '',
      questionEn: '',
      answerAr: '',
      answerEn: '',
      sortOrder: '0',
    });
    setIsFaqModalOpen(true);
  };

  const handleOpenEditFaq = (faq) => {
    setEditingFaq(faq);
    setFaqForm({
      categoryId: faq.categoryId || '',
      questionAr: faq.questionAr || '',
      questionEn: faq.questionEn || '',
      answerAr: faq.answerAr || '',
      answerEn: faq.answerEn || '',
      sortOrder: String(faq.sortOrder || 0),
    });
    setIsFaqModalOpen(true);
  };

  const handleFaqSubmit = async (e) => {
    e.preventDefault();
    if (!faqForm.categoryId || !faqForm.questionAr || !faqForm.answerAr) {
      toast.error('يرجى تعبئة الحقول الأساسية للسؤال والجواب');
      return;
    }

    try {
      const payload = {
        categoryId: faqForm.categoryId,
        questionAr: faqForm.questionAr,
        questionEn: faqForm.questionEn || null,
        answerAr: faqForm.answerAr,
        answerEn: faqForm.answerEn || null,
        sortOrder: Number(faqForm.sortOrder || 0),
      };

      if (editingFaq) {
        await api.patch(`/faqs/${editingFaq.id}`, payload);
        toast.success('تم تحديث السؤال بنجاح 🚀');
      } else {
        await api.post('/faqs', payload);
        toast.success('تم إضافة السؤال الشائع بنجاح 🎉');
      }
      fetchFaqs();
      setIsFaqModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'فشل حفظ السؤال الشائع');
    }
  };

  const handleDeleteFaq = async (faqId) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا السؤال؟')) return;
    try {
      await api.delete(`/faqs/${faqId}`);
      toast.success('تم حذف السؤال بنجاح 🗑️');
      fetchFaqs();
    } catch (err) {
      console.error(err);
      toast.error('فشل حذف السؤال الشائع');
    }
  };

  return (
    <div className="space-y-8 relative pb-24 font-noto text-white">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white mb-2">إدارة الأسئلة الشائعة</h2>
          <p className="text-text/50 font-bold">بناء وتخصيص أسئلة الدعم الفني المتكررة المعروضة في المتجر للعملاء</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleOpenAddCat}
            className="px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl font-black text-xs hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <FolderPlus size={16} /> إضافة قسم جديد
          </button>
          <button 
            onClick={() => handleOpenAddFaq('')}
            className="btn-gold px-6 py-3.5 flex items-center justify-center gap-2 gold-glow"
          >
            <Plus size={20} /> إضافة سؤال وجواب
          </button>
        </div>
      </div>

      {/* FAQs Groups Queue */}
      {loading ? (
        <div className="space-y-6 py-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-40 bg-white/5 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="py-20 text-center bg-[#111118]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem]">
          <HelpCircle size={48} className="text-gold/30 mx-auto mb-4" />
          <h3 className="text-lg font-black text-white">لا توجد أسئلة شائعة حالياً</h3>
          <p className="text-xs text-text/40 mt-1 font-bold">ابدأ بإنشاء أقسام وأسئلة الدعم الفني لمتجرك.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => {
            const isExpanded = expandedCatIds[cat.id];
            
            return (
              <motion.div 
                layout
                key={cat.id}
                className="bg-[#111118]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] overflow-hidden"
              >
                
                {/* Category Header Row */}
                <div 
                  onClick={() => toggleCategoryExpand(cat.id)}
                  className="p-6 bg-white/[0.01] hover:bg-white/[0.02] cursor-pointer flex items-center justify-between transition-colors select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center text-gold font-black shrink-0">
                      ؟
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">{cat.nameAr}</h3>
                      <p className="text-[10px] text-text/40 font-bold mt-0.5">
                        عدد الأسئلة: {cat.faqs?.length || 0} | الترتيب: {cat.sortOrder}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => handleOpenAddFaq(cat.id)}
                      className="text-[10px] font-black text-gold hover:underline"
                    >
                      + إضافة سؤال للقسم
                    </button>
                    
                    <button 
                      onClick={() => handleOpenEditCat(cat)}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-text/60 hover:text-gold hover:bg-gold/10 transition-colors"
                    >
                      <Edit size={12} />
                    </button>

                    <button 
                      onClick={() => handleDeleteCat(cat.id)}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-text/60 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>

                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-text/40">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Category Questions List */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden border-t border-white/5"
                    >
                      <div className="p-6 space-y-4">
                        {cat.faqs && cat.faqs.length > 0 ? (
                          cat.faqs.map((faq) => (
                            <div key={faq.id} className="p-5 rounded-2xl bg-black/20 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div className="space-y-1.5 flex-1 pr-2">
                                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                                  <span className="text-gold font-mono">س.</span> {faq.questionAr}
                                </h4>
                                <p className="text-xs font-bold text-text/50">
                                  <span className="text-emerald-400 font-mono">ج.</span> {faq.answerAr}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                                <span className="text-[10px] text-text/40 font-bold bg-white/5 px-2 py-0.5 rounded mr-2">
                                  ترتيب: {faq.sortOrder}
                                </span>
                                <button 
                                  onClick={() => handleOpenEditFaq(faq)}
                                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-text/60 hover:text-gold hover:bg-gold/10 transition-colors"
                                >
                                  <Edit size={12} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteFaq(faq.id)}
                                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-text/60 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-xs text-text/40 font-bold">لا توجد أسئلة مضافة في هذا القسم حالياً</div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            );
          })}
        </div>
      )}

      {/* CRUD Category Modal */}
      <AnimatePresence>
        {isCatModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCatModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#111118] border border-white/10 p-8 rounded-[2.5rem] shadow-2xl"
            >
              <button 
                onClick={() => setIsCatModalOpen(false)}
                className="absolute top-6 left-6 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text/60 hover:text-white"
              >
                <X size={18} />
              </button>

              <h3 className="text-xl font-black text-white mb-1">
                {editingCat ? 'تعديل قسم الأسئلة الشائعة' : 'إضافة قسم أسئلة جديد'}
              </h3>
              <p className="text-xs text-text/50 font-bold mb-8">إنشاء الأقسام التي تجمع الأسئلة الشائعة بالمتجر</p>

              <form onSubmit={handleCatSubmit} className="space-y-5 text-xs font-bold text-white">
                
                <div className="space-y-2">
                  <label className="text-white block">اسم القسم باللغة العربية *</label>
                  <input 
                    type="text" 
                    required
                    value={catForm.nameAr}
                    onChange={(e) => setCatForm({...catForm, nameAr: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold transition-all"
                    placeholder="مثال: الأسئلة العامة حول التفعيل"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-white block">الاسم بالإنجليزية</label>
                    <input 
                      type="text" 
                      value={catForm.nameEn}
                      onChange={(e) => setCatForm({...catForm, nameEn: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold transition-all"
                      placeholder="General Activation Questions"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-white block">ترتيب العرض (رقمي)</label>
                    <input 
                      type="number" 
                      value={catForm.sortOrder}
                      onChange={(e) => setCatForm({...catForm, sortOrder: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="submit"
                    className="flex-1 btn-gold py-4 font-black text-sm"
                  >
                    {editingCat ? 'تحديث وحفظ' : 'إضافة القسم'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsCatModalOpen(false)}
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

      {/* CRUD FAQ Item Modal */}
      <AnimatePresence>
        {isFaqModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFaqModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-[#111118] border border-white/10 p-8 rounded-[2.5rem] shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setIsFaqModalOpen(false)}
                className="absolute top-6 left-6 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text/60 hover:text-white"
              >
                <X size={18} />
              </button>

              <h3 className="text-xl font-black text-white mb-1">
                {editingFaq ? 'تعديل السؤال الشائع' : 'إضافة سؤال وجواب جديد'}
              </h3>
              <p className="text-xs text-text/50 font-bold mb-8">تحديد السؤال وجواب الدعم الفني وتعيين القسم</p>

              <form onSubmit={handleFaqSubmit} className="space-y-5 text-xs font-bold text-white">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-white block">القسم المرتبط *</label>
                    <select 
                      value={faqForm.categoryId}
                      onChange={(e) => setFaqForm({...faqForm, categoryId: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold cursor-pointer"
                    >
                      <option value="">-- اختر القسم --</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id} className="bg-[#111118]">{cat.nameAr}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-white block">ترتيب العرض (رقمي)</label>
                    <input 
                      type="number" 
                      value={faqForm.sortOrder}
                      onChange={(e) => setFaqForm({...faqForm, sortOrder: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-white block">السؤال باللغة العربية *</label>
                  <input 
                    type="text" 
                    required
                    value={faqForm.questionAr}
                    onChange={(e) => setFaqForm({...faqForm, questionAr: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold transition-all"
                    placeholder="مثال: كيف أحصل على بيانات تفعيل اشتراكي بعد الشراء؟"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-white block">السؤال باللغة الإنجليزية</label>
                  <input 
                    type="text" 
                    value={faqForm.questionEn}
                    onChange={(e) => setFaqForm({...faqForm, questionEn: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold transition-all"
                    placeholder="How do I get my activation details after purchase?"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-white block">الجواب باللغة العربية *</label>
                  <textarea 
                    rows={3}
                    required
                    value={faqForm.answerAr}
                    onChange={(e) => setFaqForm({...faqForm, answerAr: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold transition-all resize-none"
                    placeholder="سيتم إرسال رسالة تفعيل فورية إلى بريدك الإلكتروني والواتساب المسجل..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-white block">الجواب باللغة الإنجليزية</label>
                  <textarea 
                    rows={3}
                    value={faqForm.answerEn}
                    onChange={(e) => setFaqForm({...faqForm, answerEn: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold transition-all resize-none"
                    placeholder="An activation message will be sent immediately to your email..."
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="submit"
                    className="flex-1 btn-gold py-4 font-black text-sm"
                  >
                    {editingFaq ? 'تحديث السؤال' : 'إضافة سؤال وجواب'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsFaqModalOpen(false)}
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
