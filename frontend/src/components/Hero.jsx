'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Truck, ShieldCheck, MessageSquare, ChevronRight, ChevronLeft, Activity } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { getHeroBanners } from '@/services/storefront.service.js';

export default function Hero() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const data = await getHeroBanners();
        setBanners(data);
      } catch (err) {
        console.error('Failed to load banners:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBanners();
  }, []);

  // Slide Auto-play: changes slide every 6 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  const handleNext = () => {
    if (banners.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePrev = () => {
    if (banners.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Rendering loading state or fallback default banner if empty
  const hasBanners = banners.length > 0;

  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex items-center pt-32 pb-20 px-6 overflow-hidden bg-grid">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#121212] via-transparent to-[#121212] -z-10" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gold/10 blur-[150px] -z-10 rounded-full animate-pulse-gold" />

      <div className="max-w-7xl mx-auto w-full">
        {loading ? (
          /* Premium Coordinated Pulse Loading Skeleton */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 text-center lg:text-right">
              <div className="h-16 bg-white/5 rounded-3xl w-3/4 mx-auto lg:mr-0 animate-pulse" />
              <div className="h-12 bg-white/5 rounded-3xl w-1/2 mx-auto lg:mr-0 animate-pulse" />
              <div className="h-20 bg-white/5 rounded-3xl w-full mx-auto lg:mr-0 animate-pulse" />
              <div className="flex gap-4 justify-center lg:justify-start">
                <div className="h-14 bg-gold/10 rounded-xl w-36 animate-pulse" />
                <div className="h-14 bg-white/5 rounded-xl w-36 animate-pulse" />
              </div>
            </div>
            <div className="h-[400px] bg-white/5 rounded-[3rem] animate-pulse" />
          </div>
        ) : !hasBanners ? (
          /* Default Static Hero Layout if no active banners exist */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-[2.5rem] xl:text-[3rem] font-black mb-6 sm:mb-8 leading-[1.5] sm:leading-[1.4] lg:leading-[1.45] tracking-tight text-white">
                منتجاتك الرقمية… <br />
                <span className="text-gold">في دقائق تكون جاهز</span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-text/60 mb-6 sm:mb-10 max-w-xl mx-auto lg:mr-0 leading-relaxed font-medium">
                متجر وافي يوفر لك أفضل الاشتراكات الرقمية، شحن الألعاب، وخدمات السوشيال ميديا. تسليم فوري، دفع آمن، ودعم فني على مدار الساعة.
              </p>
              <div className="flex flex-row items-center justify-center lg:justify-start gap-3 w-full sm:w-auto mb-16">
                <Link href="/products" className="btn-gold flex-1 sm:flex-initial text-sm sm:text-lg px-4 sm:px-10 py-3 sm:py-4 text-center">
                  تسوق الآن
                </Link>
                <a href="#how-it-works" className="btn-outline flex-1 sm:flex-initial text-sm sm:text-lg px-4 sm:px-10 py-3 sm:py-4 text-center">
                  كيف يعمل؟
                </a>
              </div>
            <div className="relative h-[450px] w-full flex items-center justify-center animate-float">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gold/10 blur-[120px] -z-10 rounded-full" />
              <div className="w-[450px] h-[450px] relative rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl bg-card">
                <Image src="https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=800&q=80" alt="Default Hero Image" fill className="object-cover" />
              </div>
            </div>
          </div>
        ) : (
          /* Live Dynamic Banners Slider System */
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
              >
                {/* Left Side: Custom Slide Content */}
                <div className="z-10 text-center lg:text-right">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 border border-gold/20 text-gold rounded-full text-xs font-black mb-6 uppercase tracking-widest">
                    🔥 عروض حصرية ومميزة
                  </span>
                  <h1 className="mx-auto max-w-3xl text-xl sm:text-3xl md:text-4xl lg:text-[2.5rem] xl:text-[3rem] font-black mb-4 sm:mb-6 leading-[1.5] sm:leading-[1.4] lg:leading-[1.45] tracking-tight text-white lg:mr-0">
                    {banners[currentIndex].titleAr}
                  </h1>
                  {banners[currentIndex].titleEn && (
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-text-muted mb-6 tracking-wide font-sans">
                      {banners[currentIndex].titleEn}
                    </h2>
                  )}
                  <p className="text-sm sm:text-base md:text-lg text-text/60 mb-6 sm:mb-10 max-w-xl mx-auto lg:mr-0 leading-relaxed font-semibold">
                    نوفر لك أكواد تفعيل وتوصيل فوري وتلقائي بعد الدفع مباشرة مع ضمان كامل فترة التشغيل، ادفع بسهولة عبر وسائل الدفع المفضلة لديك.
                  </p>
                  
                  <div className="flex flex-row items-center justify-center lg:justify-start gap-3 w-full sm:w-auto">
                    <Link href="/products" className="btn-gold flex-1 sm:flex-initial text-sm sm:text-lg px-4 sm:px-10 py-3 sm:py-4 text-center">
                      تسوق الآن 🛍️
                    </Link>
                    <a href="#how-it-works" className="btn-outline flex-1 sm:flex-initial text-sm sm:text-lg px-4 sm:px-10 py-3 sm:py-4 text-center">
                      كيف يعمل؟
                    </a>
                  </div>
                </div>

                {/* Right Side: Slider Image Visual with glowing gold borders */}
                <div className="relative h-[300px] sm:h-[400px] lg:h-[450px] w-full flex items-center justify-center">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-gold/10 blur-[100px] -z-10 rounded-full" />
                  <div className="w-full h-full max-w-[550px] relative rounded-[2rem] sm:rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(245,197,24,0.15)] bg-card/40 backdrop-blur-md group">
                    <Image
                      src={banners[currentIndex].imageUrl}
                      alt={banners[currentIndex].titleAr}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-w-768px) 100vw, 550px"
                      priority
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slider Navigation Arrows (Only displays if more than 1 banner exists) */}
            {banners.length > 1 && (
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20">
                <button
                  onClick={handlePrev}
                  className="w-12 h-12 bg-card/60 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center text-text-muted hover:text-gold hover:border-gold/50 transition-all active:scale-95"
                >
                  <ChevronRight size={22} />
                </button>
                {/* Dots indicator */}
                <div className="flex gap-2">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        currentIndex === idx ? 'w-8 bg-gold' : 'w-2.5 bg-white/20'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={handleNext}
                  className="w-12 h-12 bg-card/60 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center text-text-muted hover:text-gold hover:border-gold/50 transition-all active:scale-95"
                >
                  <ChevronLeft size={22} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Coordinated Trust Bar Footer */}
        <div className={`flex flex-wrap items-center justify-center lg:justify-start gap-8 border-t border-white/5 pt-10 ${hasBanners ? 'mt-28' : 'mt-0'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center border border-gold/20">
              <Truck className="text-gold" size={20} />
            </div>
            <span className="font-bold text-sm text-white">تسليم فوري وتلقائي</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center border border-gold/20">
              <ShieldCheck className="text-gold" size={20} />
            </div>
            <span className="font-bold text-sm text-white">دفع آمن بالكامل</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center border border-gold/20">
              <MessageSquare className="text-gold" size={20} />
            </div>
            <span className="font-bold text-sm text-white">دعم فني سريع ٢٤/٧</span>
          </div>
        </div>
      </div>
    </section>
  );
}
