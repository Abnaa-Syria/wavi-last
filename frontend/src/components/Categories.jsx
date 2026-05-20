"use client";
import React from 'react';

const CategoryCard = ({ title, desc, children }) => (
  <div className="glass-card p-8 flex flex-col items-center text-center group hover:scale-[1.02] cursor-pointer">
    <div className="mb-8 relative flex items-center justify-center">
      {/* Subtle Glow behind icon */}
      <div className="absolute inset-0 bg-gold/5 blur-2xl rounded-full scale-150 group-hover:bg-gold/10 transition-all duration-500" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
    <h3 className="text-2xl font-black mb-4 group-hover:text-gold transition-colors">{title}</h3>
    <p className="text-text/50 font-medium leading-relaxed">{desc}</p>
    <div className="mt-8 w-12 h-1.5 bg-gold/20 rounded-full group-hover:w-full group-hover:bg-gold transition-all duration-500" />
  </div>
);

const Categories = () => {
  return (
    <section id="categories" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black mb-6">اختر القسم المناسب لك</h2>
          <p className="text-text/50 text-xl font-medium max-w-2xl mx-auto">
            نوفر لك تشكيلة واسعة من المنتجات الرقمية المختارة بعناية لتناسب جميع احتياجاتك.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          <CategoryCard 
            title="باقات المشاهدة" 
            desc="اشتراكات IPTV عالية الجودة بدون تقطيع مع كافة القنوات العالمية."
          >
            <img 
              src="/charming-retro-orange-television-3d-render-transparent-background.png" 
              alt="باقات المشاهدة"
              style={{ animationDelay: '0s' }}
              className="w-32 h-32 object-contain mx-auto mb-6 drop-shadow-[0_0_20px_rgba(245,197,24,0.5)] transition-transform duration-300 group-hover:scale-110 animate-float"
            />
          </CategoryCard>

          <CategoryCard 
            title="اشتراكات المنصات" 
            desc="يوتيوب بريميوم، نيتفلكس، وشاهد VIP بأسعار منافسة."
          >
            <img 
              src="/shopping-basket-present.png" 
              alt="اشتراكات المنصات"
              style={{ animationDelay: '0.4s' }}
              className="w-32 h-32 object-contain mx-auto mb-6 drop-shadow-[0_0_20px_rgba(245,197,24,0.5)] transition-transform duration-300 group-hover:scale-110 animate-float"
            />
          </CategoryCard>

          <CategoryCard 
            title="شحن الألعاب" 
            desc="شحن كوينز فيفا، شدات ببجي، وجواهر فري فاير."
          >
            <img 
              src="/3d-render-golden-control.png" 
              alt="شحن الألعاب"
              style={{ animationDelay: '0.8s' }}
              className="w-32 h-32 object-contain mx-auto mb-6 drop-shadow-[0_0_20px_rgba(245,197,24,0.5)] transition-transform duration-300 group-hover:scale-110 animate-float"
            />
          </CategoryCard>

          <CategoryCard 
            title="خدمات السوشيال" 
            desc="متابعين، لايكات، ومشاهدات لجميع المنصات العالمية."
          >
            <img 
              src="/3d-human-hand-gesture-symbol-design-3d-render-illustration.png" 
              alt="خدمات السوشيال"
              style={{ animationDelay: '1.2s' }}
              className="w-32 h-32 object-contain mx-auto mb-6 drop-shadow-[0_0_20px_rgba(245,197,24,0.5)] transition-transform duration-300 group-hover:scale-110 animate-float"
            />
          </CategoryCard>

          <CategoryCard 
            title="أجهزة وملحقات" 
            desc="أفضل الأجهزة الرقمية والملحقات التقنية الأصلية."
          >
            <img 
              src="/golden-keyboard-wireless-connection-3d-rendering.png" 
              alt="أجهزة وملحقات"
              style={{ animationDelay: '1.6s' }}
              className="w-32 h-32 object-contain mx-auto mb-6 drop-shadow-[0_0_20px_rgba(245,197,24,0.5)] transition-transform duration-300 group-hover:scale-110 animate-float"
            />
          </CategoryCard>
        </div>
      </div>
    </section>
  );
};

export default Categories;
