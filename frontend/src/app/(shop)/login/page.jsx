'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore, isAdminPanelRole, syncAdminSessionCookie, markAuthHydrated } from '@/store/useAuthStore.js';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, User, ShieldAlert, ArrowLeft, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, user, isLoading, clearError, _hasHydrated, token } = useAuthStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      markAuthHydrated();
    } else {
      const unsub = useAuthStore.persist.onFinishHydration(() => markAuthHydrated());
      return unsub;
    }
  }, []);

  // Sync error states from search queries (e.g. redirected from middleware or expired token)
  useEffect(() => {
    clearError();
    const errType = searchParams.get('error');
    if (errType === 'unauthorized') {
      toast.error('عذراً، يجب تسجيل الدخول كمسؤول للوصول إلى لوحة التحكم', { id: 'unauth-toast' });
    } else if (errType === 'expired') {
      toast.error('انتهت صلاحية الجلسة، يرجى إعادة تسجيل الدخول مرة أخرى', { id: 'expired-toast' });
    }
  }, [searchParams, clearError]);

  // Redirect already-authenticated users (after store hydration)
  useEffect(() => {
    if (!_hasHydrated || !isAuthenticated || !user) return;

    const redirect = searchParams.get('redirect');
    if (isAdminPanelRole(user.role)) {
      syncAdminSessionCookie(user, token);
      window.location.href = redirect?.startsWith('/admin') ? redirect : '/admin';
    } else {
      window.location.href = '/account/profile';
    }
  }, [_hasHydrated, isAuthenticated, user, token, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const result = await login(identifier.trim(), password);

    if (result.success) {
      toast.success('تم تسجيل الدخول بنجاح');
      const redirect = searchParams.get('redirect');
      if (isAdminPanelRole(result.role)) {
        window.location.href = redirect?.startsWith('/admin') ? redirect : '/admin';
      } else {
        window.location.href = '/account/profile';
      }
    } else {
      toast.error(result.error || 'عذراً، البريد الإلكتروني أو رقم الواتساب أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email or WhatsApp Input Field */}
      <div>
        <label className="block text-xs font-black text-text-muted mb-2 pr-1 uppercase">البريد الإلكتروني أو رقم الواتساب</label>
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-text-muted">
            <User className="w-5 h-5 text-gold/60" />
          </div>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="example@mail.com أو 9665xxxxxxxx"
            className="w-full bg-background border border-white/10 focus:border-gold text-white rounded-2xl py-4 pr-11 pl-4 text-left direction-ltr placeholder:text-text-muted/50 focus:outline-none transition-all duration-300 font-bold"
            disabled={isLoading}
          />
        </div>
        <p className="text-text-muted/70 text-[10px] mt-1.5 pr-1 leading-normal">يمكنك استخدام البريد الإلكتروني أو رقم الواتساب بدون كود الدولة المزدوج (966)</p>
      </div>

      {/* Password Input Field */}
      <div>
        <div className="flex justify-between items-center mb-2 pr-1">
          <label className="text-xs font-black text-text-muted uppercase">كلمة المرور</label>
          <Link href="/forgot-password" className="text-gold hover:text-gold-hover text-[10px] font-black transition-colors">
            نسيت كلمة المرور؟
          </Link>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-text-muted">
            <Lock className="w-5 h-5 text-gold/60" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
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
            جاري التحقق...
          </span>
        ) : (
          'تسجيل الدخول 🚀'
        )}
      </button>
    </form>
  );
}

export default function LoginPage() {
  const { error } = useAuthStore();

  return (
    <div className="relative min-h-screen bg-background flex flex-col justify-center items-center px-4 overflow-hidden bg-grid pt-24 pb-12">
      {/* Premium Background Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '3s' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md glass-card bg-card/75 border border-gold/15 backdrop-blur-xl p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gold-gradient" />

        {/* Logo and Brand Headers */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 mb-4 animate-pulse-gold">
            <span className="text-3xl font-black text-gold">W</span>
          </div>
          <h1 className="text-2xl font-black text-white mb-2">أهلاً بك مجدداً</h1>
          <p className="text-text-muted text-sm font-medium">عالم الترفيه الرقمي واشتراكات IPTV بين يديك</p>
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

        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <Activity className="w-8 h-8 text-gold animate-spin" />
            <p className="text-text-muted text-sm font-bold">جاري تحميل حقول تسجيل الدخول...</p>
          </div>
        }>
          <LoginFormContent />
        </Suspense>

        {/* Go to Register Page Option */}
        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <p className="text-text-muted text-sm font-semibold">
            ليس لديك حساب في وافي ستور؟{' '}
            <Link href="/register" className="text-gold font-black hover:underline inline-flex items-center gap-1">
              إنشاء حساب جديد
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
