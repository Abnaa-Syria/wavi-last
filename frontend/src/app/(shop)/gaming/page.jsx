"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, ChevronLeft, ShoppingCart, Heart, GitCompare } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useCompareStore } from '@/store/useCompareStore';

const ProductCard = ({ id, title, category, price }) => {
  const finalImageUrl = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80'; // Sci-fi universe gaming setup
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { toggleCompare, isInCompare } = useCompareStore();
  const favorited = isFavorite(id);
  const inCompare = isInCompare(id);

  return (
    <div className="relative group h-full">
      {/* Heart Toggle Button */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite({ id, title, price, category, imageUrl: finalImageUrl });
        }}
        className="absolute top-2.5 left-2.5 z-20 w-8 h-8 bg-[#121212]/80 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/5 hover:border-gold/30 hover:bg-gold/10 group/btn transition-all duration-300 shadow-md"
      >
        <Heart 
          size={14} 
          className={`transition-colors duration-300 ${
            favorited 
              ? 'text-red-500 fill-red-500' 
              : 'text-gray-400 group-hover/btn:text-red-400'
          }`} 
        />
      </button>

      {/* Compare Toggle Button */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleCompare({ id, title, price, category, imageUrl: finalImageUrl });
        }}
        className={`absolute top-12 left-2.5 z-20 w-8 h-8 rounded-lg flex items-center justify-center border backdrop-blur-md transition-all duration-300 shadow-md ${
          inCompare 
            ? 'bg-gold/20 border-gold/40 text-gold' 
            : 'bg-[#121212]/80 border-white/5 text-gray-400 hover:border-gold/30 hover:bg-gold/10 hover:text-gold'
        }`}
        title="مقارنة المنتج"
      >
        <GitCompare size={14} className={inCompare ? 'scale-110' : ''} />
      </button>

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
    </div>
  );
};


const gamingProducts = [
  { id: "3", title: "كوينز EA FC 26 - 100K", category: "ألعاب", price: "30" },
  { id: "6", title: "شحن شدات ببجي - 1800 UC", category: "ألعاب", price: "80" },
  { id: "8", title: "شحن روبلوكس - 4500 Robux", category: "ألعاب", price: "120" },
];

export default function GamingPage() {
  return (
    <div className="min-h-screen pt-32 pb-24 font-noto" dir="rtl">
      <div className="fixed inset-0 bg-grid pointer-events-none z-0" />
      <div className="fixed top-1/4 left-0 w-[500px] h-[500px] bg-gold/5 blur-[150px] pointer-events-none z-0 rounded-full" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gold/10 rounded-3xl border border-gold/20 flex items-center justify-center rotate-3 shadow-[0_0_30px_rgba(245,197,24,0.15)]">
              <Gamepad2 size={40} className="text-gold" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 tracking-tighter">شحن الألعاب</h1>
              <p className="text-text/50 font-bold text-lg">عملات وشحنات سريعة لأشهر الألعاب</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
          {gamingProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

      </div>
    </div>
  );
}
