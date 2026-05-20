"use client";
import React from 'react';
import { Eye, Shield, Headphones } from 'lucide-react';

const Feature = ({ icon: Icon, title, desc }) => (
  <div className="flex flex-col items-center text-center">
    <div className="w-20 h-20 bg-gold/10 rounded-3xl flex items-center justify-center mb-8 gold-border">
      <Icon className="text-gold" size={40} />
    </div>
    <h3 className="text-2xl font-black mb-4">{title}</h3>
    <p className="text-text/50 font-medium leading-relaxed max-w-sm">{desc}</p>
  </div>
);

const WhyWavi = () => {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Arabic Pattern BG */}
      <div className="absolute inset-0 opacity-[0.03] -z-10 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="50" cy="50" r="10" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#pattern)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-black mb-6">ليش الناس تختارنا؟</h2>
          <p className="text-text/50 text-xl font-medium">نحن لسنا مجرد متجر، نحن شركاؤك في تجربتك الرقمية.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <Feature 
            icon={Eye}
            title="تجربة شراء واضحة"
            desc="خطوات بسيطة وواجهة سهلة الاستخدام تضمن لك الوصول لمنتجك بسرعة وبدون تعقيد."
          />
          <Feature 
            icon={Shield}
            title="حلول متعددة بمتجر واحد"
            desc="نجمع لك كل ما تحتاجه من اشتراكات وخدمات وأجهزة في مكان واحد وبجودة مضمونة."
          />
          <Feature 
            icon={Headphones}
            title="متابعة بعد الشراء"
            desc="فريق الدعم الفني معك دائماً للإجابة على استفساراتك وحل أي مشكلة تواجهك."
          />
        </div>
      </div>
    </section>
  );
};

export default WhyWavi;
