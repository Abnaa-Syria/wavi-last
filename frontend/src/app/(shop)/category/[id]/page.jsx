"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, LayoutGrid, MonitorPlay, Gamepad2, Youtube, Tv, Rocket, Star, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { toast } from 'react-hot-toast';
import { getAllProducts, getStoreCategories } from '@/services/storefront.service.js';

const mapSlugToIcon = (slug = '') => {
  const s = slug.toLowerCase();
  if (s.includes('iptv') || s.includes('smarters') || s.includes('falcon') || s.includes('netflix') || s.includes('streaming')) {
    return MonitorPlay;
  }
  if (s.includes('coin') || s.includes('gaming') || s.includes('pubg') || s.includes('roblox') || s.includes('code') || s.includes('game') || s.includes('fc')) {
    return Gamepad2;
  }
  if (s.includes('youtube') || s.includes('premium')) {
    return Youtube;
  }
  if (s.includes('tv') || s.includes('device') || s.includes('box') || s.includes('receiver') || s.includes('printer')) {
    return Tv;
  }
  return Rocket;
};

const ProductCard = ({ id, nameAr, categoryNameAr, basePrice, slug, imageUrl }) => {
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const favorited = isFavorite(id);
  const IconComponent = mapSlugToIcon(slug);

  return (
    <div className="relative group h-full">
      {/* Heart Toggle Button */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite({ id, title: nameAr, price: basePrice, category: categoryNameAr });
        }}
        className="absolute top-4 left-4 z-20 w-10 h-10 bg-[#121212]/80 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/5 hover:border-gold/30 hover:bg-gold/10 group/btn transition-all duration-300 shadow-md"
      >
        <Heart 
          size={18} 
          className={`transition-colors duration-300 ${
            favorited 
              ? 'text-red-500 fill-red-500' 
              : 'text-text/40 group-hover/btn:text-red-400'
          }`} 
        />
      </button>

      <Link href={`/product/${id}`} className="block h-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{ y: -10 }}
          className="bg-card/60 backdrop-blur-xl border border-white/5 p-6 rounded-[2.5rem] flex flex-col group hover:border-gold/30 transition-all duration-500 h-full"
        >
          <div className="aspect-square bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gold/5 blur-2xl group-hover:bg-gold/10 transition-colors animate-pulse" />
            {imageUrl ? (
              <Image 
                src={imageUrl} 
                alt={nameAr}
                width={300}
                height={300}
                className="w-full h-full object-cover rounded-[2rem] transition-transform duration-500 group-hover:scale-110 relative z-10"
              />
            ) : (
              <IconComponent size={64} className="text-gold drop-shadow-[0_0_20px_rgba(245,197,24,0.3)] relative z-10 transition-transform duration-500 group-hover:scale-110" />
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gold bg-gold/10 px-3 py-1 rounded-full">
                {categoryNameAr || 'قسم مميز'}
              </span>
            </div>
            <h3 className="text-xl font-black text-white leading-tight line-clamp-2">{nameAr}</h3>
            
            <div className="flex items-center justify-between pt-4">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-gold">{basePrice} <span className="text-xs text-text/40">ر.س</span></span>
                <span className="text-[10px] text-text/40 font-bold uppercase">شامل الضريبة</span>
              </div>
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-gold hover:text-black transition-all duration-300">
                <ShoppingCart size={20} />
              </div>
            </div>
          </div>

          <div className="mt-8 py-4 border border-white/10 rounded-2xl text-sm font-black text-white hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center gap-2">
            عرض التفاصيل
            <ChevronLeft size={16} />
          </div>
        </motion.div>
      </Link>
    </div>
  );
};


const CategoryPage = ({ params }) => {
  const id = params?.id || '';
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState({ title: 'منتجات القسم', description: 'تصفح باقة خدماتنا ومنتجاتنا الرقمية الفاخرة.' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch dynamic products of this category
      const fetchedProducts = await getAllProducts({ category: id });
      setProducts(fetchedProducts);

      // Find active category info to display Arabic name and details
      const fetchedCats = await getStoreCategories();
      const activeCat = fetchedCats.find(c => c.id === id || c.slug === id);
      if (activeCat) {
        setCategory({
          title: activeCat.nameAr,
          description: activeCat.nameEn || 'Premium digital products catalog.'
        });
      }
    } catch (err) {
      console.error('Failed to load category products:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 font-noto" dir="rtl">
      {/* Background Decor */}
      <div className="fixed inset-0 bg-grid pointer-events-none z-0" />
      <div className="fixed top-1/4 left-0 w-[500px] h-[500px] bg-gold/5 blur-[150px] pointer-events-none z-0 rounded-full" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Category Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 flex items-center gap-6"
        >
          <div className="w-20 h-20 bg-gold/10 rounded-3xl border border-gold/20 flex items-center justify-center rotate-3 shadow-[0_0_30px_rgba(245,197,24,0.15)]">
            <LayoutGrid size={40} className="text-gold" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter capitalize">{category.title}</h1>
            <p className="text-text/50 font-bold text-lg">{category.description}</p>
          </div>
        </motion.div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card/40 border border-white/5 p-6 rounded-[2.5rem] space-y-6 animate-pulse">
                <div className="aspect-square bg-white/5 rounded-[2rem]" />
                <div className="h-4 bg-white/10 rounded-md w-1/3" />
                <div className="h-6 bg-white/10 rounded-md w-2/3" />
                <div className="flex justify-between items-center pt-4">
                  <div className="h-8 bg-white/10 rounded-md w-20" />
                  <div className="w-12 h-12 bg-white/5 rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-card/40 border border-white/5 rounded-[2.5rem] p-16 text-center flex flex-col items-center justify-center">
            <LayoutGrid size={64} className="text-text/20 mb-4 animate-pulse text-gold/40" />
            <h3 className="text-xl font-black text-white">لا توجد منتجات في هذا القسم حالياً</h3>
            <p className="text-xs text-text/40 mt-1 font-bold">يرجى تفقد الأقسام الأخرى أو العودة لاحقاً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                nameAr={product.nameAr}
                categoryNameAr={product.category?.nameAr || category.title}
                basePrice={product.basePrice}
                slug={product.slug}
                imageUrl={product.imageUrl}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
