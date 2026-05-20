"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Store, Shield, AlertTriangle, Phone, DollarSign, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const hasAccess = user && (user.role === 'SUPER_ADMIN' || user.permissions?.includes('SETTINGS_MANAGE'));

  useEffect(() => {
    if (user && !hasAccess) {
      toast.error('غير مصرح لك بدخول هذه الصفحة');
      router.replace('/admin');
    }
  }, [user, hasAccess, router]);

  if (user && !hasAccess) {
    return null;
  }
  const [settings, setSettings] = useState({
    storeName: 'وافي ستور | Wavi Store',
    whatsappNumber: '+966550240110',
    currency: 'SAR',
    allowRegistration: true,
    maintenanceMode: false
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('تم حفظ الإعدادات بنجاح');
    }, 1500);
  };

  return (
    <div className="space-y-8 relative pb-32 font-noto" dir="rtl">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-white mb-2">إعدادات المتجر</h2>
        <p className="text-text/50 font-bold">التحكم الشامل في إعدادات المنصة الأساسية</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column (Main Settings) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* General Settings */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111118]/60 backdrop-blur-2xl border border-white/5 rounded-3xl p-8"
          >
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                <Store className="text-gold" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">إعدادات عامة</h3>
                <p className="text-sm font-bold text-text/50">المعلومات الأساسية للمتجر</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-white">اسم المتجر</label>
                <input 
                  type="text" 
                  value={settings.storeName}
                  onChange={(e) => setSettings({...settings, storeName: e.target.value})}
                  className="w-full bg-background border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold transition-all font-bold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white">رقم دعم واتساب</label>
                  <div className="relative">
                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-text/40" size={20} />
                    <input 
                      type="text" 
                      dir="ltr"
                      value={settings.whatsappNumber}
                      onChange={(e) => setSettings({...settings, whatsappNumber: e.target.value})}
                      className="w-full bg-background border border-white/10 rounded-xl py-4 pr-12 pl-4 text-white focus:outline-none focus:border-gold transition-all font-bold text-left"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-white">العملة الافتراضية</label>
                  <div className="relative">
                    <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 text-text/40" size={20} />
                    <select 
                      value={settings.currency}
                      onChange={(e) => setSettings({...settings, currency: e.target.value})}
                      className="w-full bg-background border border-white/10 rounded-xl py-4 pr-12 pl-4 text-white focus:outline-none focus:border-gold transition-all font-bold appearance-none"
                    >
                      <option value="SAR" className="bg-background">ريال سعودي (SAR)</option>
                      <option value="EGP" className="bg-background">جنيه مصري (EGP)</option>
                      <option value="USD" className="bg-background">دولار أمريكي (USD)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Right Column (Toggles & Security) */}
        <div className="space-y-6">
          
          {/* Auth Settings */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#111118]/60 backdrop-blur-2xl border border-white/5 rounded-3xl p-8"
          >
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                <Shield className="text-gold" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">التسجيل والمصادقة</h3>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserPlus size={20} className="text-text/60" />
                <div>
                  <h4 className="font-bold text-white">تسجيل أعضاء جدد</h4>
                  <p className="text-xs font-bold text-text/40">السماح بإنشاء حسابات جديدة</p>
                </div>
              </div>
              
              {/* Toggle Switch */}
              <button 
                onClick={() => setSettings({...settings, allowRegistration: !settings.allowRegistration})}
                className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${
                  settings.allowRegistration ? 'bg-gold' : 'bg-white/10'
                }`}
              >
                <div className={`w-6 h-6 rounded-full bg-black shadow-md transform transition-transform duration-300 ${
                  settings.allowRegistration ? '-translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </motion.div>

          {/* Maintenance Mode */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#111118]/60 backdrop-blur-2xl border border-red-500/10 rounded-3xl p-8 relative overflow-hidden group"
          >
            {settings.maintenanceMode && (
              <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
            )}
            
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5 relative z-10">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                settings.maintenanceMode ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-text/60'
              }`}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">وضع الصيانة</h3>
              </div>
            </div>

            <div className="flex items-center justify-between relative z-10">
              <div className="max-w-[180px]">
                <h4 className="font-bold text-white">تفعيل الصيانة</h4>
                <p className="text-xs font-bold text-text/40 mt-1">إغلاق المتجر مؤقتاً وعرض صفحة الصيانة للزوار</p>
              </div>
              
              {/* Toggle Switch */}
              <button 
                onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 shrink-0 ${
                  settings.maintenanceMode ? 'bg-red-500' : 'bg-white/10'
                }`}
              >
                <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                  settings.maintenanceMode ? '-translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Floating Action Button Bar */}
      <div className="fixed bottom-0 left-0 w-full lg:w-[calc(100%-18rem)] bg-background/80 backdrop-blur-2xl border-t border-white/5 p-6 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-end">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="btn-gold px-12 py-4 text-xl flex items-center gap-3 gold-glow disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto justify-center"
          >
            {isSaving ? (
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save size={24} />
                حفظ التغييرات
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
