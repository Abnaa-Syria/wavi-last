'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore.js';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, Phone, User, ShieldAlert, ArrowLeft, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, user, isLoading, error, clearError } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    clearError();
  }, [clearError]);

  // Handle successful registration redirects
  useEffect(() => {
    if (isAuthenticated && user) {
      toast.success(`مرحباً بك في وافي ستور، ${user.firstName || 'مستخدم وافي'}! تم إنشاء حسابك بنجاح.`);
      router.replace('/account/profile');
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validations
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !password) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (password.length < 8) {
      toast.error('يجب أن تكون كلمة المرور مكونة من 8 أحرف على الأقل');
      return;
    }

    // Phone format validation
    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(phone.trim())) {
      toast.error('يرجى إدخال رقم هاتف صحيح يحتوي على أرقام فقط');
      return;
    }

    const result = await register(
      firstName.trim(),
      lastName.trim(),
      email.trim().toLowerCase(),
      phone.trim(),
      password
    );

    if (result.success) {
      router.push('/account/profile');
    } else {
      toast.error(result.error || 'فشلت عملية إنشاء الحساب. يرجى مراجعة البيانات المدخلة');
    }
  };

  return (
    <div className="relative min-h-screen bg-background flex flex-col justify-center items-center px-4 overflow-hidden bg-grid pt-28 pb-12">
      {/* Premium Background Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '3s' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-xl glass-card bg-card/75 border border-gold/15 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl relative z-10"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gold-gradient" />

        {/* Logo and Brand Headers */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 mb-4 animate-pulse-gold">
            <span className="text-3xl font-black text-gold">W</span>
          </div>
          <h1 className="text-2xl font-black text-white mb-2">إنشاء حساب جديد</h1>
          <p className="text-text-muted text-sm font-medium">انضم لمجتمع وافي واحصل على عروض حصرية وتوصيل فوري</p>
        </div>

        {/* Backend Error Notifications Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-3 text-red-200 text-sm"
          >
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="font-semibold leading-relaxed">{error}</div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Full Name (Double-column Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-text-muted mb-2 pr-1 uppercase">الاسم الأول</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-text-muted">
                  <User className="w-5 h-5 text-gold/60" />
                </div>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="محمد"
                  className="w-full bg-background border border-white/10 focus:border-gold text-white rounded-2xl py-4 pr-11 pl-4 placeholder:text-text-muted/50 focus:outline-none transition-all duration-300 font-bold"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-text-muted mb-2 pr-1 uppercase">اسم العائلة</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-text-muted">
                  <User className="w-5 h-5 text-gold/60" />
                </div>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="المالكي"
                  className="w-full bg-background border border-white/10 focus:border-gold text-white rounded-2xl py-4 pr-11 pl-4 placeholder:text-text-muted/50 focus:outline-none transition-all duration-300 font-bold"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Email Input Field */}
          <div>
            <label className="block text-xs font-black text-text-muted mb-2 pr-1 uppercase">البريد الإلكتروني</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-text-muted">
                <Mail className="w-5 h-5 text-gold/60" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="w-full bg-background border border-white/10 focus:border-gold text-white rounded-2xl py-4 pr-11 pl-4 text-left direction-ltr placeholder:text-text-muted/50 focus:outline-none transition-all duration-300 font-bold"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Phone Input Field (WhatsApp Number) */}
          <div>
            <label className="block text-xs font-black text-text-muted mb-2 pr-1 uppercase">رقم الهاتف (الواتساب)</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-text-muted">
                <Phone className="w-5 h-5 text-gold/60" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9665xxxxxxxx"
                className="w-full bg-background border border-white/10 focus:border-gold text-white rounded-2xl py-4 pr-11 pl-4 text-left direction-ltr placeholder:text-text-muted/50 focus:outline-none transition-all duration-300 font-bold"
                disabled={isLoading}
              />
            </div>
            <p className="text-text-muted/70 text-[10px] mt-1.5 pr-1 leading-normal">أدخل الرقم بدون كود الدولة المزدوج (مثال: 966598765432)</p>
          </div>

          {/* Password Input Field */}
          <div>
            <label className="block text-xs font-black text-text-muted mb-2 pr-1 uppercase">كلمة المرور</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-text-muted">
                <Lock className="w-5 h-5 text-gold/60" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 أحرف أو أرقام على الأقل"
                className="w-full bg-background border border-white/10 focus:border-gold text-white rounded-2xl py-4 pr-11 pl-12 text-left direction-ltr placeholder:text-text-muted/50 focus:outline-none transition-all duration-300 font-bold"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 left-0 pl-4 flex items-center text-text-muted hover:text-gold transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            className="w-full btn-gold py-5 text-xl flex items-center justify-center gap-3 gold-glow mt-8 disabled:opacity-50 disabled:pointer-events-none"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Activity className="w-5 h-5 animate-spin" />
                جاري تسجيل الحساب...
              </span>
            ) : (
              'إنشاء حساب جديد ✨'
            )}
          </button>
        </form>

        {/* Go to Login Page Option */}
        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <p className="text-text-muted text-sm font-semibold">
            لديك حساب بالفعل في وافي ستور؟{' '}
            <Link href="/login" className="text-gold font-black hover:underline inline-flex items-center gap-1">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Return to Store Option */}
      <Link href="/" className="mt-6 text-text-muted hover:text-white flex items-center gap-2 text-sm font-bold transition-all relative z-10">
        <ArrowLeft className="w-4 h-4" />
        العودة إلى المتجر الرئيسي
      </Link>
    </div>
  );
}
