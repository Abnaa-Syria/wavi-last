"use client";
import React from 'react';
import { Star, Quote } from 'lucide-react';

const TestimonialCard = ({ name, quote }) => (
  <div className="glass-card p-10 relative">
    <Quote className="absolute top-6 left-6 text-gold/10" size={60} />
    <div className="flex gap-1 mb-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={18} fill="#F5C518" className="text-gold" />
      ))}
    </div>
    <p className="text-xl font-medium leading-relaxed mb-8 text-text/80 italic">"{quote}"</p>
    <div className="flex items-center gap-4 border-t border-white/5 pt-8">
      <div className="w-12 h-12 bg-gold-gradient rounded-full flex items-center justify-center font-black text-black">
        {name[0]}
      </div>
      <div>
        <h4 className="font-black text-white">{name}</h4>
        <span className="text-sm text-text/50">عميل موثق</span>
      </div>
    </div>
  </div>
);

const Testimonials = () => {
  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-black mb-6">ماذا يقول عملاؤنا</h2>
          <p className="text-text/50 text-xl font-medium">ثقة عملائنا هي سر تميزنا ونجاحنا.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <TestimonialCard 
            name="محمد العتيبي"
            quote="خدمة سريعة جداً وتفعيل فوري. اشتراك IPTV يعمل بامتياز وبدون أي تقطيع. شكراً وافي ستور!"
          />
          <TestimonialCard 
            name="سارة القحطاني"
            quote="أفضل متجر لشحن كوينز الألعاب. تعامل راقي وسعر مناسب جداً مقارنة بالمتاجر الأخرى."
          />
          <TestimonialCard 
            name="فهد الشمري"
            quote="الدعم الفني متعاون جداً ساعدوني في تفعيل الاشتراك خلال دقائق. تجربة شراء ممتازة."
          />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
