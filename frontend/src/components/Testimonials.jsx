"use client";
import React, { useState, useEffect } from 'react';
import { Star, Quote, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonialsData = [
  { name: "محمد العتيبي", quote: "خدمة سريعة جداً وتفعيل فوري. اشتراك IPTV يعمل بامتياز وبدون أي تقطيع. شكراً وافي ستور!" },
  { name: "سارة القحطاني", quote: "أفضل متجر لشحن كوينز الألعاب. تعامل راقي وسعر مناسب جداً مقارنة بالمتاجر الأخرى." },
  { name: "فهد الشمري", quote: "الدعم الفني متعاون جداً ساعدوني في تفعيل الاشتراك خلال دقائق. تجربة شراء ممتازة." },
  { name: "عبد الله الدوسري", quote: "متجر موثوق وسريع جداً في التسليم، أنصح الجميع بالتعامل معهم واشتراكاتهم ممتازة." },
  { name: "نورة اليوسف", quote: "أسهل وأسرع عملية شراء كود تفعيل IPTV مررت بها، الدعم متجاوب ولطيف جداً." }
];

const TestimonialCard = ({ name, quote }) => (
  <div className="glass-card p-4 sm:p-6 lg:p-8 relative h-full flex flex-col justify-between text-right" dir="rtl">
    <div>
      <Quote className="absolute top-4 left-4 text-gold/10 w-8 h-8 sm:w-12 sm:h-12" />
      <div className="flex gap-0.5 mb-3 sm:mb-4 justify-start">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} size={14} fill="#F5C518" className="text-gold" />
        ))}
      </div>
      <p className="text-xs sm:text-sm lg:text-base font-medium leading-relaxed mb-4 text-text/80 italic">"{quote}"</p>
    </div>
    <div className="flex items-center gap-3 border-t border-white/5 pt-4">
      <div className="w-10 h-10 bg-gold-gradient rounded-full flex items-center justify-center font-black text-black text-sm shrink-0">
        {name[0]}
      </div>
      <div className="min-w-0">
        <h4 className="font-bold text-white text-xs sm:text-sm truncate">{name}</h4>
        <span className="text-[10px] text-text/50 block">عميل موثق</span>
      </div>
    </div>
  </div>
);

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setVisibleItems(2); // 2 cards side-by-side on mobile!
      } else {
        setVisibleItems(3); // 3 cards on desktop
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = testimonialsData.length - visibleItems;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= maxIndex) return 0;
        return prev + 1;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [maxIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  return (
    <section className="py-16 sm:py-24 lg:py-32 px-6 relative overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 leading-[1.4] text-white">ماذا يقول عملاؤنا</h2>
          <p className="text-text/50 text-base sm:text-lg md:text-xl font-medium">ثقة عملائنا هي سر تميزنا ونجاحنا.</p>
        </div>

        {/* Carousel Container */}
        <div className="relative" dir="ltr">
          <div className="overflow-hidden w-full px-1">
            <div 
              className="flex gap-4 sm:gap-6 transition-transform duration-500 ease-in-out py-2"
              style={{
                transform: `translateX(-${currentIndex * (100 / visibleItems)}%)`
              }}
            >
              {testimonialsData.map((testimonial, idx) => {
                const gapSize = visibleItems === 2 ? 16 : 24;
                const gapCompensation = ((visibleItems - 1) * gapSize) / visibleItems;
                return (
                  <div 
                    key={idx} 
                    className="shrink-0 h-auto"
                    style={{
                      width: `calc(100% / ${visibleItems} - ${gapCompensation}px)`
                    }}
                  >
                    <TestimonialCard {...testimonial} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Slide navigation controls */}
          <button 
            onClick={handlePrev}
            className="absolute top-1/2 -left-3 sm:-left-6 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-card/85 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center text-gray-300 hover:text-gold hover:border-gold/50 transition-all z-20"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={handleNext}
            className="absolute top-1/2 -right-3 sm:-right-6 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-card/85 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center text-gray-300 hover:text-gold hover:border-gold/50 transition-all z-20"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Dots Navigation */}
        <div className="flex justify-center gap-2 mt-8">
          {[...Array(maxIndex + 1)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === idx ? 'w-6 bg-gold' : 'w-2 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
