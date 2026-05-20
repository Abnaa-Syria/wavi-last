"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, ShieldCheck, Save, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) {
      const combinedName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      setFormData({
        name: combinedName,
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('الرجاء إدخال الاسم الكامل');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('الرجاء إدخال رقم الجوال');
      return;
    }

    setIsSubmitting(true);

    // Split the Arabic full name input into firstName and lastName for database compliance
    const nameParts = formData.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || 'العتيبي'; // Fallback surname if single name provided

    try {
      const response = await api.patch('/users/profile', {
        firstName,
        lastName,
        phone: formData.phone.trim()
      });

      const updatedUser = response.data.data.user;
      
      // Update local state and Zustand storage session context
      updateUser(updatedUser);
      toast.success('تم حفظ التعديلات بنجاح! 💾');
    } catch (err) {
      console.error('Failed to update profile:', err);
      const errorMsg = err.response?.data?.message || 'عذراً، حدث خطأ أثناء حفظ التغييرات. يرجى المحاولة لاحقاً';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
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
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">البيانات الشخصية</h1>
        <p className="text-text/50 font-medium">يمكنك تحديث بياناتك الشخصية من هنا</p>
      </div>

      <div className="bg-card/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-text/40 mr-1 uppercase">الاسم الكامل</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text/20" size={20} />
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-background border border-white/10 rounded-2xl py-4 pr-4 pl-12 focus:outline-none focus:border-gold transition-all text-white font-bold"
                  placeholder="الاسم الأول واسم العائلة"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-text/40 mr-1 uppercase">رقم الجوال</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text/20" size={20} />
                <input 
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-background border border-white/10 rounded-2xl py-4 pr-4 pl-12 focus:outline-none focus:border-gold transition-all text-white font-bold"
                  placeholder="05xxxxxxxx"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="text-xs font-black text-text/40 mr-1 uppercase tracking-wider">البريد الإلكتروني (غير قابل للتعديل)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text/30" size={20} />
                <input 
                  type="email"
                  value={formData.email}
                  readOnly
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pr-4 pl-12 text-white/60 font-bold cursor-not-allowed select-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-text/40 text-xs font-bold">
              <ShieldCheck size={16} className="text-gold" />
              بياناتك مشفرة ومحمية بالكامل
            </div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="btn-gold w-full sm:w-auto px-10 py-4 font-bold text-lg gold-glow flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save size={20} />
                  حفظ التعديلات
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </motion.div>
  );
}
