"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, MonitorPlay, Gamepad2, Tv, Sparkles, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { getStoreCategories } from '@/services/storefront.service.js';

const mapSlugToIcon = (slug = '') => {
  const s = slug.toLowerCase();
  if (s.includes('iptv') || s.includes('smarters') || s.includes('falcon') || s.includes('netflix') || s.includes('streaming')) {
    return MonitorPlay;
  }
  if (s.includes('coin') || s.includes('gaming') || s.includes('pubg') || s.includes('roblox') || s.includes('code') || s.includes('game') || s.includes('fc') || s.includes('universe')) {
    return Gamepad2;
  }
  if (s.includes('tv') || s.includes('device') || s.includes('box') || s.includes('receiver') || s.includes('printer')) {
    return Tv;
  }
  return Sparkles;
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Fetch complete directory tree
      const data = await getStoreCategories(false);
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories tree:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 font-noto bg-[#0d0d0d] relative text-right" dir="rtl">
      {/* Background Decor */}
      <div className="fixed inset-0 bg-grid pointer-events-none z-0 opacity-20" />
      <div className="fixed top-1/4 left-0 w-[500px] h-[500px] bg-yellow-500/5 blur-[150px] pointer-events-none z-0 rounded-full" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 flex items-center gap-6"
        >
          <div className="w-20 h-20 bg-yellow-500/10 rounded-3xl border border-yellow-500/20 flex items-center justify-center rotate-3 shadow-[0_0_30px_rgba(234,179,8,0.15)]">
            <LayoutGrid size={40} className="text-yellow-500" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">دليل التصنيفات الرقمية</h1>
            <p className="text-gray-400 font-bold text-lg">تصفح باقة وتصنيفات المنتجات الرقمية والاشتراكات الحصرية المتوفرة في وافي.</p>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] space-y-4 animate-pulse h-64" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-16 text-center flex flex-col items-center justify-center">
            <LayoutGrid size={64} className="text-yellow-500/40 mb-4 animate-pulse" />
            <h3 className="text-xl font-black text-white">لا توجد تصنيفات حالياً</h3>
            <p className="text-xs text-gray-500 mt-1 font-bold">يرجى العودة لاحقاً بعد تزويد الداتا بيز بالبيانات.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {categories.map((cat) => {
              const IconComponent = mapSlugToIcon(cat.slug);
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] flex flex-col justify-between group hover:border-yellow-500/30 transition-all duration-500 h-full min-h-[300px]"
                >
                  <div>
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden">
                      <div className="absolute inset-0 bg-yellow-500/5 blur-xl group-hover:bg-yellow-500/10 transition-colors" />
                      <IconComponent size={28} className="text-yellow-500 relative z-10" />
                    </div>

                    <h3 className="text-2xl font-black text-white mb-2 leading-tight group-hover:text-yellow-500 transition-colors">{cat.nameAr}</h3>
                    <p className="text-gray-400 font-bold text-sm leading-relaxed mb-6 line-clamp-3">
                      {cat.descriptionAr || `تصفح أرقى عروض وباقات ${cat.nameAr} الحصرية والفاخرة بأسعار مميزة في متجر وافي.`}
                    </p>
                  </div>

                  {/* Subcategories or Actions */}
                  <div className="space-y-4">
                    {cat.children && cat.children.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {cat.children.map((child) => (
                          <Link 
                            key={child.id}
                            href={`/category/${child.slug || child.id}`}
                            className="text-xs font-bold bg-white/5 hover:bg-yellow-500/15 hover:text-yellow-500 text-white/60 px-3 py-1.5 rounded-full border border-white/5 transition-all"
                          >
                            {child.nameAr}
                          </Link>
                        ))}
                      </div>
                    )}
                    <Link 
                      href={`/category/${cat.slug || cat.id}`}
                      className="py-4 border border-white/10 rounded-2xl text-sm font-black text-white bg-white/5 hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      تصفح المنتجات
                      <ChevronLeft size={16} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
