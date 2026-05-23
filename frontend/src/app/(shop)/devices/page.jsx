"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Tv, ChevronLeft, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const ProductCard = ({ id, title, category, price }) => {
  const finalImageUrl = 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80'; // Xiaomi media box / smart streaming device

  return (
    <Link href={`/product/${id}`} className="block h-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -6 }}
        className="bg-card/60 backdrop-blur-xl border border-white/5 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col group hover:border-gold/30 transition-all duration-500 h-full"
      >
        <div className="aspect-square bg-white/5 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gold/5 blur-2xl group-hover:bg-gold/10 transition-colors animate-pulse" />
          <Image 
            src={finalImageUrl}
            alt={title}
            width={300}
            height={300}
            className="w-full h-full object-cover rounded-lg sm:rounded-xl transition-transform duration-500 group-hover:scale-105 relative z-10"
          />
        </div>

        <div className="flex-1 space-y-2.5 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-gold bg-gold/10 px-2 py-0.5 rounded-full">
                {category}
              </span>
            </div>
            <h3 className="text-xs sm:text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-gold transition-colors">{title}</h3>
          </div>
          
          <div className="flex items-center justify-between pt-1.5 mt-auto">
            <div className="flex flex-col">
              <span className="text-sm sm:text-[1.05rem] md:text-xl font-black text-gold">{price} <span className="text-[9px] sm:text-[10px] text-text/40">ر.س</span></span>
              <span className="text-[8px] sm:text-[9px] text-text/40 font-bold uppercase">شامل الضريبة</span>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/5 rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-gold hover:text-black transition-all duration-300 shrink-0">
              <ShoppingCart size={15} className="w-[15px] h-[15px] sm:w-[18px] sm:h-[18px]" />
            </div>
          </div>
        </div>

        <div className="mt-3 py-1.5 sm:py-2.5 border border-white/10 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black text-white hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center gap-1.5">
          عرض التفاصيل
          <ChevronLeft size={14} />
        </div>
      </motion.div>
    </Link>
  );
};

const devicesProducts = [
  { id: "4", title: "شاومي تي في بوكس 2026", category: "أجهزة", price: "200" },
  { id: "7", title: "ريسيفر بي ان سبورت 4K", category: "أجهزة", price: "850" },
];

export default function DevicesPage() {
  return (
    <div className="min-h-screen pt-32 pb-24 font-noto" dir="rtl">
      <div className="fixed inset-0 bg-grid pointer-events-none z-0" />
      <div className="fixed top-1/4 left-0 w-[500px] h-[500px] bg-gold/5 blur-[150px] pointer-events-none z-0 rounded-full" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gold/10 rounded-3xl border border-gold/20 flex items-center justify-center rotate-3 shadow-[0_0_30px_rgba(245,197,24,0.15)]">
              <Tv size={40} className="text-gold" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 tracking-tighter">الأجهزة والملحقات</h1>
              <p className="text-text/50 font-bold text-lg">أفضل أجهزة البث والملحقات التقنية</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
          {devicesProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

      </div>
    </div>
  );
}
