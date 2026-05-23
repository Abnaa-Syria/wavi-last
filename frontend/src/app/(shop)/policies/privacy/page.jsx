"use client";
import React from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
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
          <span className="text-white">سياسة الخصوصية</span>
        </div>

        {/* Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">سياسة الخصوصية</h1>
          <p className="text-text/50 font-bold text-sm sm:text-base">ملتزمون بحماية خصوصية بياناتك وتوفير تجربة تسوق آمنة تماماً</p>
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
              <Lock className="text-gold" size={24} /> جمع البيانات واستخدامها
            </h2>
            <p>
              نحن في متجر وافي نقدر حماية خصوصيتك وسرية بياناتك الشخصية. يتم جمع بعض البيانات الأساسية اللازمة لإتمام طلباتك وتفعيل الاشتراكات بشكل صحيح، وتشمل هذه البيانات:
            </p>
            <ul className="list-disc pr-6 space-y-2">
              <li>الاسم والبريد الإلكتروني لإنشاء الحساب ومتابعة حالة الطلبات.</li>
              <li>رقم الجوال لتسليم تفعيلات الاشتراكات والتواصل الفني عبر الواتساب عند الحاجة.</li>
              <li>بيانات تفعيل الألعاب مثل (معرف اللاعب أو اسم المستخدم في اللعبة) لشحن وتزويد الحسابات تلقائياً.</li>
            </ul>
          </section>

          <section className="space-y-4 border-t border-white/5 pt-8">
            <h2 className="text-lg sm:text-2xl font-black text-gold">أمن وحماية البيانات</h2>
            <p>
              نحن نطبق أعلى معايير الأمان التقنية لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التعديل أو الإفشاء. يتم تشفير كافة الاتصالات والبيانات المتبادلة بين جهازك والخادم باستخدام بروتوكولات الأمان القياسية (SSL/TLS)، كما أن قواعد البيانات لدينا مشفرة ومحمية ببرمجيات أمان متطورة.
            </p>
          </section>

          <section className="space-y-4 border-t border-white/5 pt-8">
            <h2 className="text-lg sm:text-2xl font-black text-gold">مشاركة البيانات مع أطراف ثالثة</h2>
            <p>
              نحن لا نبيع، ولا نؤجر، ولا نشارك بياناتك الشخصية مع أي جهات خارجية أو أطراف ثالثة بغرض التسويق. يتم مشاركة معلومات محدودة فقط مع مزودي الخدمات الموثوقين لتسهيل العمليات مثل:
            </p>
            <ul className="list-disc pr-6 space-y-2">
              <li>بوابات الدفع الإلكتروني المعتمدة والمرخصة لمعالجة المعاملات المالية بشكل آمن ومشفر بالكامل.</li>
              <li>مزودي خدمات تسليم الرسائل النصية والتلقائية (SMS) لموافاتك ببيانات الطلب الرقمي.</li>
            </ul>
          </section>

          <section className="space-y-4 border-t border-white/5 pt-8">
            <h2 className="text-lg sm:text-2xl font-black text-gold">ملفات تعريف الارتباط (Cookies)</h2>
            <p>
              يستخدم متجر وافي ملفات تعريف الارتباط لتحسين تجربة تصفحك وتذكر محتويات سلة التسوق الخاصة بك وتسهيل عمليات الدخول المستقبلي. يمكنك إيقاف تشغيل ملفات تعريف الارتباط من إعدادات متصفحك في أي وقت، إلا أن ذلك قد يؤثر على عمل بعض خصائص المتجر.
            </p>
          </section>

          <section className="space-y-4 border-t border-white/5 pt-8">
            <h2 className="text-lg sm:text-2xl font-black text-gold">التغييرات على سياسة الخصوصية</h2>
            <p>
              يحتفظ متجر وافي بالحق في تعديل أو تحديث سياسة الخصوصية هذه في أي وقت لمواكبة التغيرات القانونية أو التقنية. سيتم نشر أي تغييرات تطرأ على هذه الصفحة فور اعتمادها وننصح بمراجعتها بشكل دوري.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
