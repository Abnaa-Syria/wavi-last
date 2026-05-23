"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCompare, X, ChevronLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCompareStore } from '@/store/useCompareStore';

export default function CompareBar() {
  const { compareItems, removeFromCompare, clearCompare } = useCompareStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || compareItems.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-black/80 backdrop-blur-2xl border-t border-white/10 text-white font-noto"
        dir="rtl"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Right: Compare Count & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-gold/10 border border-gold/20 rounded-xl flex items-center justify-center text-gold">
              <GitCompare size={20} />
            </div>
            <div>
              <h4 className="font-black text-sm md:text-base">مقارنة المنتجات</h4>
              <p className="text-[10px] md:text-xs text-text-muted">
                تم اختيار <span className="text-gold font-bold">{compareItems.length}</span> من أصل <span className="font-bold">4</span>
              </p>
            </div>
          </div>

          {/* Middle: Selected Products Thumbnails */}
          <div className="flex items-center gap-3 overflow-x-auto py-1 max-w-full no-scrollbar">
            {compareItems.map((item) => (
              <div
                key={item.id}
                className="relative flex items-center gap-2 bg-white/5 border border-white/5 pr-2 pl-8 py-1.5 rounded-xl shrink-0 group hover:border-gold/30 transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden relative shrink-0">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <GitCompare size={14} className="text-gold" />
                  )}
                </div>
                <span className="text-xs font-bold text-white max-w-[100px] truncate">
                  {item.title}
                </span>
                
                {/* Remove button */}
                <button
                  onClick={() => removeFromCompare(item.id)}
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-white/5 rounded-md flex items-center justify-center text-gray-400 hover:bg-red-500/20 hover:text-red-500 transition-colors duration-200"
                  title="إزالة من المقارنة"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>

          {/* Left: Action Buttons */}
          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
            <button
              onClick={clearCompare}
              className="flex-1 md:flex-none px-4 py-3 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 rounded-xl text-xs md:text-sm font-bold text-gray-300 hover:text-red-400 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Trash2 size={14} />
              <span>إلغاء الكل</span>
            </button>
            
            <Link
              href="/compare"
              className="flex-1 md:flex-none px-6 py-3 bg-gold-gradient text-black font-black text-xs md:text-sm rounded-xl hover:shadow-[0_0_20px_rgba(245,197,24,0.4)] transition-all duration-300 flex items-center justify-center gap-1.5"
            >
              <span>قارن الآن</span>
              <ChevronLeft size={16} />
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
