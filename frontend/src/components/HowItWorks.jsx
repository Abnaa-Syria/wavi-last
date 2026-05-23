"use client";
import React from 'react';

const Step = ({ num, title, desc }) => (
  <div className="flex flex-col items-center text-center relative z-10 group">
    <div className="w-12 h-12 sm:w-20 sm:h-20 bg-card border-2 sm:border-4 border-gold/20 rounded-full flex items-center justify-center mb-3 sm:mb-8 group-hover:border-gold group-hover:shadow-[0_0_30px_rgba(245,197,24,0.3)] transition-all duration-500">
      <span className="text-xl sm:text-4xl font-black text-gold group-hover:scale-125 transition-transform">{num}</span>
    </div>
    <h3 className="text-sm sm:text-2xl font-black mb-1 sm:mb-3">{title}</h3>
    <p className="text-xs sm:text-base text-text/50 font-medium leading-relaxed max-w-[200px]">{desc}</p>
  </div>
);

const HowItWorks = () => {
  return (
    <section className="py-16 sm:py-24 lg:py-32 px-6 bg-card/30 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 leading-[1.4]">كيف تشتري وتستلم؟</h2>
          <p className="text-text/50 text-base sm:text-lg md:text-xl font-medium">خطوات بسيطة تفصلك عن منتجك الرقمي المفضل.</p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-10 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold/20 to-transparent z-0" />
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 lg:gap-12">
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
