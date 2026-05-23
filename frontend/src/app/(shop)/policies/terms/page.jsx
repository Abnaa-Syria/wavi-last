"use client";
import React from 'react';
import { FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function TermsOfUse() {
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
          <span className="text-white">شروط الاستخدام</span>
        </div>

        {/* Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">شروط الاستخدام</h1>
          <p className="text-text/50 font-bold text-sm sm:text-base">يرجى قراءة شروط الخدمة بعناية قبل استخدام متجر وافي وإتمام طلباتك</p>
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
              <FileText className="text-gold" size={24} /> شروط عامة وقبول الاتفاقية
            </h2>
            <p>
              يعد استخدامك لمتجر وافي أو إتمام عملية شراء منه بمثابة موافقة صريحة وكاملة منك على جميع الشروط والأحكام الواردة في هذه الصفحة. إذا كنت لا توافق على هذه الشروط، يرجى عدم استخدام المتجر أو طلب الخدمات.
            </p>
          </section>

          <section className="space-y-4 border-t border-white/5 pt-8">
            <h2 className="text-lg sm:text-2xl font-black text-gold">الاشتراطات الخاصة بالحسابات والبيانات</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>يلتزم العميل بتزويدنا بمعلومات صحيحة ودقيقة ومحدثة عند التسجيل أو عند كتابة بيانات التفعيل الخاصة بالمنتجات (اسم المستخدم، معرف اللاعب، رقم الجوال).</li>
              <li>يكون العميل مسؤولاً بشكل كامل عن سرية بيانات حسابه وكلمة المرور الخاصة به وأي عمليات تتم من خلال حسابه المسجل في المتجر.</li>
              <li>يمنع استخدام المتجر بأي شكل يهدف إلى الاحتيال، أو التلاعب بالأسعار، أو التعدي على حقوق الآخرين الفكرية أو البرمجية.</li>
            </ul>
          </section>

          <section className="space-y-4 border-t border-white/5 pt-8">
            <h2 className="text-lg sm:text-2xl font-black text-gold">المنتجات الرقمية والتفعيل والتسليم</h2>
            <p>
              جميع السلع المتوفرة في المتجر هي خدمات ومنتجات رقمية يتم تسليمها تلقائياً للمشتري فور إتمام السداد بنجاح.
            </p>
            <ul className="list-disc pr-6 space-y-2">
              <li>نحن نضمن صلاحية الأكواد والاشتراكات المسلمة وتفعيلها لفترة الضمان الموضحة في تفاصيل كل باقة.</li>
              <li>لا يتحمل متجر وافي أي مسؤولية أو خسارة مالية تنتج عن قيام العميل بشحن حساب خاطئ بسبب إدخال بيانات مغلوطة منه أثناء إتمام الطلب.</li>
              <li>تخضع فترات معالجة الطلبات لمدى توفر مزود الخدمة والتحديثات الرسمية للألعاب والبرمجيات ذات الصلة.</li>
            </ul>
          </section>

          <section className="space-y-4 border-t border-white/5 pt-8">
            <h2 className="text-lg sm:text-2xl font-black text-gold">حقوق الملكية الفكرية</h2>
            <p>
              جميع المحتويات المتوفرة في متجر وافي، بما في ذلك الشعارات، والتصاميم، والنصوص، والصور، والأكواد البرمجية، والمكونات البرمجية التفاعلية هي ملكية حصرية لمتجر وافي أو الجهات المرخصة له، ومحمية بموجب أنظمة حماية الملكية الفكرية وحقوق المؤلف المعمول بها في المملكة العربية السعودية والقوانين الدولية. يمنع نسخها أو إعادة إنتاجها بدون إذن خطي مسبق.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
