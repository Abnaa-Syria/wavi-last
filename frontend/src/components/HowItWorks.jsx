"use client";
import React from 'react';

const Step = ({ num, title, desc }) => (
  <div className="flex flex-col items-center text-center relative z-10 group">
    <div className="w-20 h-20 bg-card border-4 border-gold/20 rounded-full flex items-center justify-center mb-8 group-hover:border-gold group-hover:shadow-[0_0_30px_rgba(245,197,24,0.3)] transition-all duration-500">
      <span className="text-4xl font-black text-gold group-hover:scale-125 transition-transform">{num}</span>
    </div>
    <h3 className="text-2xl font-black mb-4">{title}</h3>
    <p className="text-text/50 font-medium leading-relaxed max-w-[200px]">{desc}</p>
  </div>
);

const HowItWorks = () => {
  return (
    <section className="py-32 px-6 bg-card/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-black mb-6">كيف تشتري وتستلم؟</h2>
          <p className="text-text/50 text-xl font-medium">خطوات بسيطة تفصلك عن منتجك الرقمي المفضل.</p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-10 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold/20 to-transparent z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <Step 
              num="١"
              title="اختر المنتج"
              desc="تصفح الأقسام واختر المنتج الذي يناسب احتياجك."
            />
            <Step 
              num="٢"
              title="أكمل الدفع"
              desc="ادفع بأمان عبر وسائل الدفع الإلكترونية المتاحة."
            />
            <Step 
              num="٣"
              title="استلم التفعيل"
              desc="ستصلك بيانات التفعيل أو الشحن فوراً وتلقائياً."
            />
            <Step 
              num="٤"
              title="الدعم معك"
              desc="فريقنا متاح دائماً لمساعدتك في التفعيل."
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
