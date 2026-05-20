"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Sliders, Type, Plus, Trash2, Link as LinkIcon, Save, Eye, Check, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function HomepageCMS() {
  const router = useRouter();
  const { user } = useAuthStore();

  const hasAccess = user && (user.role === 'SUPER_ADMIN' || user.permissions?.includes('SETTINGS_MANAGE'));

  useEffect(() => {
    if (user && !hasAccess) {
      toast.error('غير مصرح لك بدخول هذه الصفحة');
      router.replace('/admin');
    }
  }, [user, hasAccess, router]);

  const [activeTab, setActiveTab] = useState('banners'); // 'banners' | 'sections'
  const [banners, setBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [submittingBanner, setSubmittingBanner] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    homepage_hero_title: '',
    homepage_hero_subtitle: '',
    homepage_bestsellers_title: 'الأكثر مبيعاً',
    homepage_bestsellers_subtitle: 'اشتراكات حصرية بأفضل الأسعار المتاحة في السوق',
    homepage_featured_title: 'باقاتنا المميزة',
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Banner Form State
  const [bannerForm, setBannerForm] = useState({
    titleAr: '',
    imageUrl: '',
    linkUrl: '',
    placement: 'hero',
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    if (user && hasAccess) {
      fetchBanners();
      fetchSettings();
    }
  }, [user, hasAccess]);

  if (user && !hasAccess) {
    return null;
  }

  const fetchBanners = async () => {
    try {
      setBannersLoading(true);
      const res = await api.get('/marketing/banners/admin');
      const bannerList = res.data?.data?.banners || [];
      setBanners(bannerList);
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء تحميل البانرات');
    } finally {
      setBannersLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      setSettingsLoading(true);
      const res = await api.get('/marketing/settings?group=homepage');
      const loaded = res.data?.data?.settings || [];
      const updatedSettings = { ...settings };
      loaded.forEach((item) => {
        if (item.key in updatedSettings) {
          updatedSettings[item.key] = item.value;
        }
      });
      setSettings(updatedSettings);
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء تحميل إعدادات العناوين');
    } finally {
      setSettingsLoading(false);
    }
  };

  // Submit Banner
  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    if (!bannerForm.imageUrl) {
      toast.error('رابط الصورة مطلوب');
      return;
    }

    try {
      setSubmittingBanner(true);
      const res = await api.post('/marketing/banners', {
        ...bannerForm,
        sortOrder: Number(bannerForm.sortOrder),
      });
      toast.success('تمت إضافة البانر بنجاح 🎉');
      
      const newBanner = res.data?.data?.banner;
      if (newBanner) {
        setBanners([...banners, newBanner].sort((a, b) => a.sortOrder - b.sortOrder));
      } else {
        fetchBanners();
      }

      // Reset Form
      setBannerForm({
        titleAr: '',
        imageUrl: '',
        linkUrl: '',
        placement: 'hero',
        sortOrder: 0,
        isActive: true,
      });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'فشل إضافة البانر');
    } finally {
      setSubmittingBanner(false);
    }
  };

  // Delete Banner
  const handleDeleteBanner = async (id) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا البانر؟')) return;

    try {
      await api.delete(`/marketing/banners/${id}`);
      toast.success('تم حذف البانر بنجاح');
      setBanners(banners.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
      toast.error('فشل حذف البانر');
    }
  };

  // Submit Settings
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const payload = Object.keys(settings).map((key) => ({
        key,
        value: settings[key],
        group: 'homepage',
      }));

      await api.post('/marketing/settings', payload);
      toast.success('تم حفظ عناوين وأقسام الصفحة الرئيسية بنجاح 🚀');
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-8 font-noto" dir="rtl">
      {/* Header Panel */}
      <div className="bg-[#111118]/60 backdrop-blur-2xl border border-white/5 p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Sliders className="text-gold" size={28} />
            <span>إدارة محتوى الصفحة الرئيسية</span>
          </h1>
          <p className="text-text/60 mt-2 text-sm font-medium">قم بتعديل السلايدر الإعلاني ونصوص أقسام المتجر الأساسية بشكل ديناميكي.</p>
        </div>

        {/* Tab Controls */}
        <div className="bg-white/5 border border-white/10 p-1.5 rounded-2xl flex gap-1 self-start">
          <button
            onClick={() => setActiveTab('banners')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
              activeTab === 'banners' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-text/60 hover:text-white'
            }`}
          >
            <ImageIcon size={16} />
            <span>البانرات الإعلانية</span>
          </button>
          <button
            onClick={() => setActiveTab('sections')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
              activeTab === 'sections' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-text/60 hover:text-white'
            }`}
          >
            <Type size={16} />
            <span>نصوص وأقسام المتجر</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'banners' ? (
          <motion.div
            key="banners"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Create Banner Form */}
            <div className="lg:col-span-1 bg-[#111118]/60 backdrop-blur-2xl border border-white/5 p-8 rounded-[2rem] h-fit">
              <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2.5">
                <Plus className="text-gold" size={20} />
                <span>إضافة بانر جديد</span>
              </h2>

              <form onSubmit={handleBannerSubmit} className="space-y-5">
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text/80">عنوان البانر (اختياري)</label>
                  <input
                    type="text"
                    value={bannerForm.titleAr}
                    onChange={(e) => setBannerForm({ ...bannerForm, titleAr: e.target.value })}
                    placeholder="مثال: خصومات الربيع الكبرى"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:border-gold/50 focus:outline-none transition-colors"
                  />
                </div>

                {/* Image URL */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text/80">رابط صورة البانر (المقاس المقترح 1200x400)</label>
                  <input
                    type="url"
                    value={bannerForm.imageUrl}
                    onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                    placeholder="https://example.com/banner.jpg"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:border-gold/50 focus:outline-none transition-colors font-mono text-left"
                    dir="ltr"
                    required
                  />
                </div>

                {/* Link URL */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text/80">رابط التوجيه (اختياري)</label>
                  <input
                    type="url"
                    value={bannerForm.linkUrl}
                    onChange={(e) => setBannerForm({ ...bannerForm, linkUrl: e.target.value })}
                    placeholder="https://wavi.store/products/..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:border-gold/50 focus:outline-none transition-colors font-mono text-left"
                    dir="ltr"
                  />
                </div>

                {/* Sort Order & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-text/80">الترتيب</label>
                    <input
                      type="number"
                      value={bannerForm.sortOrder}
                      onChange={(e) => setBannerForm({ ...bannerForm, sortOrder: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-gold/50 focus:outline-none transition-colors"
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-text/80">الحالة</label>
                    <div className="flex items-center h-[52px]">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bannerForm.isActive}
                          onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                        <span className="mr-3 text-sm font-bold text-white">
                          {bannerForm.isActive ? 'مفعل' : 'مسودة'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingBanner}
                  className="w-full bg-gold-gradient text-black font-black py-4 rounded-xl hover:shadow-[0_0_20px_rgba(245,197,24,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {submittingBanner ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus size={18} />
                      <span>إضافة البانر</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Banners Grid List */}
            <div className="lg:col-span-2 bg-[#111118]/60 backdrop-blur-2xl border border-white/5 p-8 rounded-[2rem]">
              <h2 className="text-xl font-black text-white mb-6">البانرات الحالية ({banners.length})</h2>

              {bannersLoading ? (
                <div className="flex flex-col items-center gap-4 py-20">
                  <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                  <span className="text-text/60 font-bold">جاري تحميل السلايدر...</span>
                </div>
              ) : banners.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-20 text-center border border-dashed border-white/10 rounded-2xl">
                  <ImageIcon className="text-text/30" size={48} />
                  <p className="text-text/40 font-bold">لا يوجد أي بانرات مضافة حالياً.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {banners.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-gold/30 hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        {/* Banner Image wrapper */}
                        <div className="relative aspect-[3/1] bg-black overflow-hidden border-b border-white/10">
                          <img
                            src={item.imageUrl}
                            alt={item.titleAr || 'Slider Banner'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.src = 'https://placehold.co/1200x400/111118/e5c158?text=Image+Load+Error';
                            }}
                          />
                          <span className={`absolute top-3 left-3 px-2 py-1 rounded-lg text-[10px] font-black tracking-wider ${
                            item.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/10 text-white/50 border border-white/10'
                          }`}>
                            {item.isActive ? 'نشط' : 'مسودة'}
                          </span>
                          <span className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-gold text-xs px-2.5 py-1 rounded-lg font-black">
                            ترتيب: {item.sortOrder}
                          </span>
                        </div>

                        {/* Banner Details */}
                        <div className="p-4 space-y-3">
                          <p className="font-bold text-white truncate text-base">{item.titleAr || <span className="text-white/30 italic">بدون عنوان</span>}</p>
                          {item.linkUrl && (
                            <a
                              href={item.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-gold flex items-center gap-1.5 hover:underline font-mono truncate"
                            >
                              <LinkIcon size={12} />
                              <span>{item.linkUrl}</span>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Delete bar */}
                      <div className="p-4 pt-0">
                        <button
                          onClick={() => handleDeleteBanner(item.id)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 text-red-400 font-bold transition-all text-xs"
                        >
                          <Trash2 size={14} />
                          <span>حذف البانر</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="sections"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="bg-[#111118]/60 backdrop-blur-2xl border border-white/5 p-8 rounded-[2rem] max-w-4xl"
          >
            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2.5">
              <Type className="text-gold" size={20} />
              <span>تعديل نصوص الصفحة الرئيسية</span>
            </h2>

            {settingsLoading ? (
              <div className="flex flex-col items-center gap-4 py-20">
                <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                <span className="text-text/60 font-bold">جاري تحميل العناوين...</span>
              </div>
            ) : (
              <form onSubmit={handleSettingsSubmit} className="space-y-6">
                {/* Hero section group */}
                <div className="space-y-4 border-b border-white/5 pb-6">
                  <h3 className="text-gold font-black text-sm">أولاً: قسم الترحيب (Hero Banner Text)</h3>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-text/80">العنوان الترحيبي الأساسي</label>
                    <input
                      type="text"
                      value={settings.homepage_hero_title}
                      onChange={(e) => setSettings({ ...settings, homepage_hero_title: e.target.value })}
                      placeholder="مثال: متجر وافي - بوابتك لعالم الترفيه والاشتراكات"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-gold/50 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-text/80">العنوان الترحيبي الفرعي</label>
                    <textarea
                      rows="2"
                      value={settings.homepage_hero_subtitle}
                      onChange={(e) => setSettings({ ...settings, homepage_hero_subtitle: e.target.value })}
                      placeholder="مثال: استمتع بأعلى جودة تفعيل فوري وخدمة عملاء على مدار الساعة"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-gold/50 focus:outline-none transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Best sellers section group */}
                <div className="space-y-4 border-b border-white/5 pb-6">
                  <h3 className="text-gold font-black text-sm">ثانياً: قسم الأكثر مبيعاً (Best Sellers Section)</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-text/80">عنوان القسم</label>
                      <input
                        type="text"
                        value={settings.homepage_bestsellers_title}
                        onChange={(e) => setSettings({ ...settings, homepage_bestsellers_title: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-gold/50 focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-text/80">العنوان الفرعي للقسم</label>
                      <input
                        type="text"
                        value={settings.homepage_bestsellers_subtitle}
                        onChange={(e) => setSettings({ ...settings, homepage_bestsellers_subtitle: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-gold/50 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Featured section group */}
                <div className="space-y-4 pb-4">
                  <h3 className="text-gold font-black text-sm">ثالثاً: قسم الباقات والأجهزة المميزة (Featured Products)</h3>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-text/80">عنوان القسم</label>
                    <input
                      type="text"
                      value={settings.homepage_featured_title}
                      onChange={(e) => setSettings({ ...settings, homepage_featured_title: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-gold/50 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Save button */}
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="bg-gold-gradient text-black font-black px-8 py-4 rounded-xl hover:shadow-[0_0_20px_rgba(245,197,24,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-2"
                >
                  {savingSettings ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={18} />
                      <span>حفظ التعديلات والنشر فوراً</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
