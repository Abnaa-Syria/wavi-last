"use client";
import React from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function RefundPolicy() {
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
          <span className="text-white">سياسة الاستبدال والاسترجاع</span>
        </div>

        {/* Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">سياسة الاستبدال والاسترجاع</h1>
          <p className="text-text/50 font-bold text-sm sm:text-base">توضيح شروط استبدال واسترجاع المنتجات الرقمية والاشتراكات في وافي ستور</p>
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
              <ShieldCheck className="text-gold" size={24} /> طبيعة المنتجات الرقمية
            </h2>
            <p>
              نظرًا لأن جميع المنتجات والخدمات المقدمة في متجر وافي هي منتجات رقمية (أكواد تفعيل، شحن ألعاب، واشتراكات برمجية) ويتم تسليمها وتفعيلها بشكل فوري وتلقائي للمشتري، فإنها غير قابلة للإلغاء أو الاسترجاع بمجرد إتمام عملية الدفع والتسليم.
            </p>
          </section>

          <section className="space-y-4 border-t border-white/5 pt-8">
            <h2 className="text-lg sm:text-2xl font-black text-gold">حالات استثنائية للاستبدال والاسترجاع</h2>
            <p>
              نحن في وافي نضع رضا العميل أولاً، لذا نقوم باستبدال أو استرجاع المنتج في الحالات التالية فقط:
            </p>
            <ul className="list-disc pr-6 space-y-2">
              <li>وجود خلل فني أو عيب مصنعي في الكود الرقمي يمنع تفعيله، ويتم تأكيد ذلك من خلال فريق الدعم الفني لدينا.</li>
              <li>إذا تبين أن الكود المرسل مستخدم مسبقاً أو غير صالح قبل وقت وتاريخ إتمام الطلب الخاص بك.</li>
              <li>في حال تم إرسال منتج أو باقة مختلفة عن التي قمت بطلبها وسداد قيمتها.</li>
            </ul>
          </section>

          <section className="space-y-4 border-t border-white/5 pt-8">
            <h2 className="text-lg sm:text-2xl font-black text-gold">شروط عامة لطلب التعويض</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>يجب تقديم طلب الاستبدال أو الاسترجاع خلال 24 ساعة كحد أقصى من تاريخ ووقت استلام الطلب.</li>
              <li>يلتزم العميل بتزويد الدعم الفني بالصور أو لقطات الفيديو والبيانات اللازمة التي توضح المشكلة عند التفعيل.</li>
              <li>لا يتحمل متجر وافي أي مسؤولية في حال إدخال العميل لبيانات خاطئة أثناء الطلب (مثل: معرف لاعب خاطئ، أو بريد إلكتروني غير صحيح للتفعيل).</li>
            </ul>
          </section>

          <section className="space-y-4 border-t border-white/5 pt-8">
            <h2 className="text-lg sm:text-2xl font-black text-gold">آلية معالجة المبالغ المستردة</h2>
            <p>
              في حال الموافقة على طلب الاسترجاع بعد التحقق من صحة المشكلة، سيتم إعادة المبلغ المدفوع إلى نفس البطاقة أو الحساب البنكي الذي تم استخدامه أثناء السداد. قد تستغرق عملية استعادة الأموال من 7 إلى 14 يوم عمل حسب سياسة البنك المصدر للبطاقة.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
