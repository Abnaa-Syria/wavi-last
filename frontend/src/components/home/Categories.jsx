'use client';

import React, { useState, useEffect } from 'react';
import { MonitorPlay, Gamepad2, Youtube, Smartphone, Tv, LayoutGrid, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getStoreCategories } from '@/services/storefront.service.js';

// Dynamic icon mapper that matches category slugs to corresponding Lucide icons
const getCategoryIcon = (slug) => {
  const map = {
    'iptv': MonitorPlay,
    'game': Gamepad2,
    'gaming': Gamepad2,
    'card': Gamepad2,
    'pos': Tv,
    'device': Tv,
    'printer': Tv,
    'youtube': Youtube,
    'platform': Youtube,
    'social': Smartphone,
    'mobile': Smartphone,
  };
  const lowerSlug = (slug || '').toLowerCase();
  for (const [key, icon] of Object.entries(map)) {
    if (lowerSlug.includes(key)) return icon;
  }
  return LayoutGrid;
};

const CategoryCard = ({ id, nameAr, slug }) => {
  const Icon = getCategoryIcon(slug);
  
  return (
    <Link href={`/category/${id}`} className="block">
      <motion.div
        whileHover={{ y: -8 }}
        className="bg-card/60 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] flex flex-col items-center text-center group hover:border-gold/50 transition-all duration-300 cursor-pointer shadow-lg"
      >
        <div className="mb-6 p-5 rounded-2xl bg-gold/5 group-hover:bg-gold/10 group-hover:scale-110 transition-all duration-300">
          <Icon
            size={48}
            className="text-gold drop-shadow-[0_0_15px_rgba(245,197,24,0.45)] group-hover:text-gold transition-colors"
          />
        </div>
        <h3 className="text-lg font-black text-white group-hover:text-gold transition-colors leading-tight">
          {nameAr}
        </h3>
      </motion.div>
    </Link>
  );
};

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        // Fetch root/main categories only
        const data = await getStoreCategories(true);
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  return (
    <section className="py-24 px-6 relative">
      <div className="absolute top-0 right-1/3 w-80 h-80 bg-gold/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="max-w-7xl mx-auto">
        
        {/* Header Title Section */}
        <div className="text-center mb-16">
          <span className="text-xs font-black text-gold/80 tracking-widest uppercase mb-3 block">
            🏷️ تصنيفات متجر وافي
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            تصفح أقسام متجرنا الرقمي
          </h2>
          <p className="text-text-muted text-sm sm:text-base font-semibold mt-3 max-w-xl mx-auto">
            اختر تصنيفك المفضل وابدأ رحلتك الترفيهية فوراً مع تفعيل لحظي
          </p>
        </div>

        {loading ? (
          /* Premium Coordinated Pulse Skeletons */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, idx) => (
              <div
                key={idx}
                className="bg-card/40 border border-white/5 p-8 rounded-[2.5rem] flex flex-col items-center animate-pulse"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 mb-6" />
                <div className="h-6 bg-white/5 rounded-full w-24" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          /* Fallback static mock layout if database has no active categories yet */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <CategoryCard id="iptv" nameAr="باقات المشاهدة IPTV" slug="iptv-servers" />
            <CategoryCard id="gaming" nameAr="شحن الألعاب" slug="game-codes" />
            <CategoryCard id="social" nameAr="خدمات السوشيال" slug="social-media" />
            <CategoryCard id="platforms" nameAr="اشتراكات المنصات" slug="platforms" />
            <CategoryCard id="devices" nameAr="أجهزة وملحقات" slug="pos-devices" />
          </div>
        ) : (
          /* Dynamic Grid populated with live database categories */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} id={cat.id} nameAr={cat.nameAr} slug={cat.slug} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
