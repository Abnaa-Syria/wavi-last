"use client";
import React from 'react';
import { CreditCard, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function PaymentMethods() {
  return (
    <div className="min-h-screen pt-32 pb-24 font-noto bg-[#080808] relative text-right" dir="rtl">
      {/* Background Decor */}
      <div className="fixed inset-0 bg-grid pointer-events-none z-0 opacity-20" />
      <div className="fixed top-1/4 left-0 w-[500px] h-[500px] bg-gold/5 blur-[150px] pointer-events-none z-0 rounded-full" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-bold text-text/40 mb-8">
          <Link href="/" className="hover:text-gold transition-colors">الرئيسية</Link>
          <ArrowRight size={14} className="rotate-180" />
          <span className="text-white">طرق الدفع والشحن الرقمي</span>
        </div>

        {/* Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">طرق الدفع والشحن الرقمي</h1>
          <p className="text-text/50 font-bold text-sm sm:text-base">توفير خيارات دفع متعددة، مرنة وآمنة بالكامل لضمان سرعة إتمام العمليات</p>
        </motion.div>

        {/* Content Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card/60 backdrop-blur-2xl border border-white/5 p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] shadow-xl space-y-8 text-white/80 leading-relaxed text-xs sm:text-base font-medium"
        >
          <section className="space-y-4">
            <h2 className="text-lg sm:text-2xl font-black text-gold flex items-center gap-3">
              <CreditCard className="text-gold" size={24} /> قنوات الدفع المدعومة في وافي
            </h2>
            <p>
              نحن نوفر لعملائنا في المملكة العربية السعودية ودول الخليج العربي أفضل بوابات الدفع الإلكتروني المعتمدة والمرخصة. يمكنك سداد قيمة طلبك بكل سهولة وأمان عبر الخيارات التالية:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                <span className="font-black text-sm text-white">مدى Mada</span>
                <span className="text-[10px] text-text/40 mt-1 font-bold">للبطاقات المحلية بالمملكة</span>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                <span className="font-black text-sm text-white">Visa / Mastercard</span>
                <span className="text-[10px] text-text/40 mt-1 font-bold">البطاقات الائتمانية العالمية</span>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                <span className="font-black text-sm text-white">Apple Pay</span>
                <span className="text-[10px] text-text/40 mt-1 font-bold">دفع سريع بلمسة زر واحدة</span>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                <span className="font-black text-sm text-white">Tabby & Tamara</span>
                <span className="text-[10px] text-text/40 mt-1 font-bold">تقسيط مرن بدون فوائد</span>
              </div>
            </div>
          </section>

          <section className="space-y-4 border-t border-white/5 pt-8">
            <h2 className="text-lg sm:text-2xl font-black text-gold flex items-center gap-3">
              <ShieldCheck className="text-gold" size={24} /> حماية وتشفير المعاملات المالية
            </h2>
            <p>
              جميع قنوات السداد لدينا متصلة ببوابات دفع إلكترونية ذات معايير أمان معتمدة عالمياً (PCI-DSS) وتتم العمليات بتشفير كامل للبيانات البنكية، مما يضمن عدم حفظ أي تفاصيل لبطاقتك الائتمانية في خوادم متجر وافي وتأمين أموالك ومعلوماتك بنسبة 100%.
            </p>
          </section>

          <section className="space-y-4 border-t border-white/5 pt-8">
            <h2 className="text-lg sm:text-2xl font-black text-gold">آلية التوصيل والشحن الرقمي الفوري</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>بمجرد إتمام الدفع بنجاح، يقوم النظام تلقائياً بمعالجة طلبك وإرسال أكواد التفعيل وتفاصيل الحسابات إليك.</li>
              <li>يتم تسليم تفاصيل المنتجات والاشتراكات فوراً عبر **رسالة نصية (SMS)** وعلى **رقم الواتساب المسجل** في الحساب وملاحظات الطلب.</li>
              <li>لا توجد أي رسوم شحن إضافية للمنتجات الرقمية؛ الشحن مجاني فوري وتلقائي لكافة العملاء.</li>
            </ul>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
