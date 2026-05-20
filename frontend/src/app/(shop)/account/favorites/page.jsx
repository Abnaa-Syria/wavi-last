"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MonitorPlay, Gamepad2, ChevronLeft, Heart, Trash2, Rocket } from 'lucide-react';
import Link from 'next/link';
import { useFavoritesStore } from '@/store/useFavoritesStore';

const ICON_MAP = {
  MonitorPlay: MonitorPlay,
  Gamepad2: Gamepad2,
  Rocket: Rocket
};

const FavoriteCard = ({ id, title, category, price, iconName, onRemove }) => {
  const Icon = ICON_MAP[iconName] || Rocket;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -8 }}
      className="bg-card/60 backdrop-blur-xl border border-white/5 p-6 rounded-[2.5rem] flex flex-col group hover:border-gold/30 transition-all duration-500 shadow-xl relative text-right"
    >
      {/* Remove Action */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          onRemove(id);
        }}
        className="absolute top-4 left-4 w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:text-red-500 transition-colors z-20"
      >
        <Trash2 size={16} />
      </button>

      <div className="aspect-square bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gold/5 blur-2xl group-hover:bg-gold/10 transition-colors" />
        <Icon size={64} className="text-gold drop-shadow-[0_0_20px_rgba(245,197,24,0.3)] relative z-10 transition-transform duration-500 group-hover:scale-110" />
      </div>

      <div className="flex-1 space-y-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-gold bg-gold/10 px-3 py-1 rounded-full w-fit inline-block">
          {category}
        </span>
        <h3 className="text-lg font-black text-white leading-tight line-clamp-2">{title}</h3>
        
        <div className="flex items-center justify-between pt-4">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-gold">{price} <span className="text-xs">ر.س</span></span>
          </div>
        </div>
      </div>

      <Link 
        href={`/product/${id}`}
        className="mt-6 py-4 border border-white/10 rounded-2xl text-sm font-black text-white hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center gap-2"
      >
        عرض التفاصيل
        <ChevronLeft size={16} />
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
      <div className="h-48 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 text-right"
      dir="rtl"
    >
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">قائمة المفضلة</h1>
        <p className="text-text/50 font-medium">منتجاتك المحفوظة للرجوع إليها لاحقاً</p>
      </div>

      <AnimatePresence mode="popLayout">
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-16 flex flex-col items-center justify-center text-center"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Heart size={32} className="text-text/20" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">القائمة فارغة</h3>
            <p className="text-text/40 font-bold mb-8">لم تقم بإضافة أي منتجات للمفضلة بعد</p>
            <Link href="/products" className="btn-gold px-8 py-3 gold-glow">
              تصفح المنتجات
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
