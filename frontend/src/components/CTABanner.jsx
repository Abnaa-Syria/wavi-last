"use client";
import React from 'react';

const CTABanner = () => {
  return (
    <section className="py-12 sm:py-20 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto rounded-3xl bg-gold-gradient p-8 sm:p-12 md:p-24 relative overflow-hidden text-center gold-glow">
        {/* Animated Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-black mb-6 sm:mb-8 leading-[1.4]">
            جاهز تبدأ؟ <br className="md:hidden" /> اختر منتجك الآن
          </h2>
          <button className="bg-black text-gold px-8 sm:px-16 py-3.5 sm:py-6 rounded-xl sm:rounded-2xl text-lg sm:text-2xl font-black hover:scale-105 transition-transform shadow-2xl">
            ابدأ التسوق الآن
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
