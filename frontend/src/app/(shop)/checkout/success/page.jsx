"use client";
import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ShoppingBag, ClipboardList, ShieldCheck, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function SuccessSplash() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'WAVI-2026-XXXXX';

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    alert('تم نسخ رقم الطلب بنجاح! 📋');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl bg-card/60 backdrop-blur-2xl border border-white/5 rounded-[3rem] p-10 md:p-12 shadow-2xl text-center relative overflow-hidden"
    >
      {/* Absolute floating golden shapes */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-gold/5 blur-3xl rounded-full" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-gold/5 blur-3xl rounded-full" />
      
      {/* Glowing animated checkmark icon */}
      <motion.div 
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
        className="w-24 h-24 bg-gold/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-gold/20 shadow-[0_0_50px_rgba(245,197,24,0.15)]"
      >
        <CheckCircle2 className="text-gold" size={48} />
      </motion.div>

      {/* Confirmation text headers */}
      <h2 className="text-3xl md:text-4xl font-black text-white mb-3">تهانينا! تم تسجيل طلبك بنجاح</h2>
      <p className="text-text/50 font-medium max-w-md mx-auto mb-8 text-sm md:text-base leading-relaxed">
        شكرًا لشرائك من متجر وافي. طلبك قيد المراجعة الآن وسيتم تسليم وتفعيل اشتراكاتك الرقمية خلال دقائق معدودة.
      </p>

      {/* Copy-able order tracking ID block */}
      <div className="bg-white/5 rounded-[2rem] p-6 border border-white/5 max-w-md mx-auto mb-8 space-y-3">
        <span className="text-[10px] font-black text-text/40 tracking-widest uppercase">رقم تتبع الطلب الموحد</span>
        <div className="flex items-center justify-between bg-background border border-white/10 rounded-2xl p-4 font-mono font-black text-white text-base md:text-lg">
          <button 
            onClick={handleCopyOrderId}
            className="text-xs font-bold text-gold hover:text-white transition-colors bg-gold/10 hover:bg-gold px-3 py-1.5 rounded-lg border border-gold/15"
          >
            نسخ الرقم
          </button>
          <span className="tracking-wider select-all">{orderId}</span>
        </div>
      </div>

      {/* Order tracing & continue shopping actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Link 
          href="/account/orders"
          className="btn-gold w-full sm:w-auto px-8 py-4 font-black text-base flex items-center justify-center gap-2 gold-glow"
        >
          <ClipboardList size={18} />
          متابعة الطلب في حسابي
        </Link>
        <Link 
          href="/products"
          className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2"
        >
          <ShoppingBag size={18} />
          الاستمرار في التسوق
        </Link>
      </div>

      {/* Protection metadata */}
      <div className="mt-12 pt-6 border-t border-white/5 flex items-center justify-center gap-4 text-[10px] font-bold text-text/30">
        <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-gold" /> تفعيل وضمان فوري</span>
        <span className="w-1.5 h-1.5 bg-white/5 rounded-full" />
        <span className="flex items-center gap-1"><Mail size={12} className="text-gold" /> تذكير فوري بالبريد</span>
      </div>

    </motion.div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen pt-32 pb-24 px-6 flex items-center justify-center bg-background font-noto" dir="rtl">
      <Suspense fallback={
        <div className="h-96 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <SuccessSplash />
      </Suspense>
    </div>
  );
}
