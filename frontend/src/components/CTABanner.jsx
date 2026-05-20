"use client";
import React from 'react';

const CTABanner = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto rounded-[40px] bg-gold-gradient p-12 md:p-24 relative overflow-hidden text-center gold-glow">
        {/* Animated Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        
        <div className="relative z-10">
          <h2 className="text-4xl md:text-7xl font-black text-black mb-10 leading-tight">
            جاهز تبدأ؟ <br className="md:hidden" /> اختر منتجك الآن
          </h2>
          <button className="bg-black text-gold px-16 py-6 rounded-2xl text-2xl font-black hover:scale-105 transition-transform shadow-2xl">
            ابدأ التسوق الآن
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
