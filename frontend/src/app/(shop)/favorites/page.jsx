"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MonitorPlay, Gamepad2, ChevronLeft, Heart, Trash2, Rocket } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useFavoritesStore } from '@/store/useFavoritesStore';

const ICON_MAP = {
  MonitorPlay: MonitorPlay,
  Gamepad2: Gamepad2,
  Rocket: Rocket
};

const FavoriteCard = ({ id, title, category, price, imageUrl, iconName, onRemove }) => {
  const Icon = ICON_MAP[iconName] || Rocket;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -6 }}
      className="bg-card/60 backdrop-blur-xl border border-white/5 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col group hover:border-gold/30 transition-all duration-500 shadow-xl relative text-right"
    >
      {/* Remove Action */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          onRemove(id);
        }}
        className="absolute top-2.5 left-2.5 w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:text-red-500 transition-colors z-20"
      >
        <Trash2 size={14} />
      </button>

      <div className="aspect-square bg-white/5 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gold/5 blur-2xl group-hover:bg-gold/10 transition-colors" />
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={title}
            width={300}
            height={300}
            className="w-full h-full object-cover rounded-lg sm:rounded-xl transition-transform duration-500 group-hover:scale-105 relative z-10"
          />
        ) : (
          <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-gold drop-shadow-[0_0_15px_rgba(245,197,24,0.3)] relative z-10 transition-transform duration-500 group-hover:scale-105" />
        )}
      </div>

      <div className="flex-1 space-y-2.5 flex flex-col justify-between">
        <div className="space-y-1.5">
          <span className="text-[9px] font-black uppercase tracking-widest text-gold bg-gold/10 px-2 py-0.5 rounded-full w-fit inline-block">
            {category}
          </span>
          <h3 className="text-xs sm:text-base font-bold text-white leading-snug line-clamp-2">{title}</h3>
        </div>
        
        <div className="flex items-center justify-between pt-1.5 mt-auto">
          <div className="flex flex-col">
            <span className="text-sm sm:text-[1.05rem] md:text-xl font-black text-gold">{price} <span className="text-[9px] sm:text-[10px]">ر.س</span></span>
          </div>
        </div>
      </div>

      <Link 
        href={`/product/${id}`}
        className="mt-3 py-1.5 sm:py-2.5 border border-white/10 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black text-white hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center gap-1.5"
      >
        عرض التفاصيل
        <ChevronLeft size={14} />
      </Link>
    </motion.div>
  );
};

export default function FavoritesPage() {
  const { favorites, removeFromFavorites } = useFavoritesStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex items-center justify-center bg-background font-noto">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto font-noto text-right" dir="rtl">
      {/* Title Header */}
      <div className="mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white mb-2">قائمة المفضلة</h1>
        <p className="text-text/50 font-medium">المنتجات التي قمت بحفظها لتصفحها والشراء لاحقاً</p>
      </div>

      <AnimatePresence mode="popLayout">
        {favorites.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {favorites.map((product) => (
              <FavoriteCard 
                key={product.id} 
                {...product} 
                onRemove={removeFromFavorites} 
              />
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-16 flex flex-col items-center justify-center text-center shadow-xl"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-md">
              <Heart size={32} className="text-text/20" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">القائمة فارغة</h3>
            <p className="text-text/40 font-bold mb-8">لم تقم بإضافة أي منتجات للمفضلة بعد</p>
            <Link href="/products" className="btn-gold px-10 py-4 text-lg font-black gold-glow">
              تصفح المنتجات
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
