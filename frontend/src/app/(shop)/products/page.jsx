"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { 
  Heart, MonitorPlay, Gamepad2, Tv, ChevronLeft, ShoppingCart, 
  Search, LayoutGrid, Sparkles, Filter, SlidersHorizontal, ArrowUpDown, X 
} from 'lucide-react';
import Link from 'next/link';
import { getAllProducts, getStoreCategories } from '@/services/storefront.service.js';

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

const ProductCard = ({ id, nameAr, categoryNameAr, basePrice, slug, imageUrl }) => {
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const favorited = isFavorite(id);
  const IconComponent = mapSlugToIcon(slug);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="relative group h-full"
    >
      {/* Heart Toggle Button */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite({ id, title: nameAr, price: basePrice, category: categoryNameAr });
        }}
        className="absolute top-4 left-4 z-20 w-10 h-10 bg-[#121212]/80 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/5 hover:border-yellow-500/30 hover:bg-yellow-500/10 group/btn transition-all duration-300 shadow-md"
      >
        <Heart 
          size={18} 
          className={`transition-colors duration-300 ${
            favorited 
              ? 'text-red-500 fill-red-500' 
              : 'text-gray-400 group-hover/btn:text-red-400'
          }`} 
        />
      </button>

      <Link href={`/product/${id}`} className="block h-full">
        <div className="bg-white/5 backdrop-blur-xl border border-white/5 p-6 rounded-[2.5rem] flex flex-col group hover:border-yellow-500/30 transition-all duration-500 h-full">
          <div className="aspect-square bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-yellow-500/5 blur-2xl group-hover:bg-yellow-500/10 transition-colors animate-pulse" />
            {imageUrl ? (
              <Image 
                src={imageUrl} 
                alt={nameAr}
                width={300}
                height={300}
                className="w-full h-full object-cover rounded-[2rem] transition-transform duration-500 group-hover:scale-110 relative z-10"
              />
            ) : (
              <IconComponent size={64} className="text-yellow-500 drop-shadow-[0_0_20px_rgba(234,179,8,0.3)] relative z-10 transition-transform duration-500 group-hover:scale-110" />
            )}
          </div>

          <div className="flex-1 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full inline-block">
                {categoryNameAr || 'منتج مميز'}
              </span>
              <h3 className="text-xl font-black text-white leading-tight line-clamp-2 group-hover:text-yellow-500 transition-colors">{nameAr}</h3>
            </div>
            
            <div className="flex items-center justify-between pt-4 mt-auto">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-yellow-500">{basePrice} <span className="text-xs text-gray-400">ر.س</span></span>
                <span className="text-[10px] text-gray-500 font-bold uppercase">شامل الضريبة</span>
              </div>
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-black transition-all duration-300">
                <ShoppingCart size={20} />
              </div>
            </div>
          </div>

          <div className="mt-8 py-4 border border-white/10 rounded-2xl text-sm font-black text-white bg-white/5 group-hover:bg-white group-hover:text-black transition-all duration-300 flex items-center justify-center gap-2">
            عرض التفاصيل
            <ChevronLeft size={16} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};


function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State Management
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States initialized from URL params
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');

  // Load categories tree
  useEffect(() => {
    fetchCategories();
  }, []);

  // Sync state with url when it changes
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setSearchTerm(searchParams.get('search') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setSortBy(searchParams.get('sortBy') || 'newest');
  }, [searchParams]);

  // Fetch products on state triggers
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchTerm, minPrice, maxPrice, sortBy]);

  const fetchCategories = async () => {
    const fetchedCats = await getStoreCategories(true); // Root level parent categories
    setCategories(fetchedCats);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (sortBy) params.sortBy = sortBy;

      const fetchedProducts = await getAllProducts(params);
      setProducts(fetchedProducts);
    } catch (err) {
      console.error('Failed to fetch catalog products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to push URL changes
  const updateUrlParams = (newParams) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === '') {
        nextParams.delete(key);
      } else {
        nextParams.set(key, val);
      }
    });
    router.push(`/products?${nextParams.toString()}`);
  };

  const handleCategorySelect = (catId) => {
    updateUrlParams({ category: catId });
  };

  const handlePriceChange = (minVal, maxVal) => {
    updateUrlParams({ minPrice: minVal, maxPrice: maxVal });
  };

  const handleSortChange = (sortVal) => {
    updateUrlParams({ sortBy: sortVal });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateUrlParams({ search: searchTerm });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    router.push('/products');
  };

  return (
    <div className="min-h-screen pt-32 pb-24 font-noto bg-[#0d0d0d] relative text-right text-white" dir="rtl">
      {/* Background Decor */}
      <div className="fixed inset-0 bg-grid pointer-events-none z-0 opacity-20" />
      <div className="fixed top-1/4 left-0 w-[500px] h-[500px] bg-yellow-500/5 blur-[150px] pointer-events-none z-0 rounded-full" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-yellow-500/10 rounded-3xl border border-yellow-500/20 flex items-center justify-center rotate-3 shadow-[0_0_30px_rgba(234,179,8,0.15)]">
              <LayoutGrid size={40} className="text-yellow-500" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">كتالوج المنتجات</h1>
              <p className="text-gray-400 font-bold text-lg">اكتشف الكتالوج الكامل لخدمات ومنتجات وافي ستور</p>
            </div>
          </div>
          
          <form onSubmit={handleSearchSubmit} className="w-full md:w-auto flex-shrink-0">
            <div className="relative w-full md:w-80">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input 
                type="text" 
                placeholder="ابحث عن منتج..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 focus:outline-none focus:border-yellow-500 transition-all text-white font-bold"
              />
            </div>
          </form>
        </div>

        {/* Double-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* 1. Sticky Sidebar Filter (Desktop) */}
          <div className="lg:col-span-1 bg-white/5 border border-white/5 p-6 rounded-[2.5rem] backdrop-blur-xl sticky top-24 space-y-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 font-black text-lg">
                <SlidersHorizontal size={18} className="text-yellow-500" />
                <span>أدوات التصفية</span>
              </div>
              <button 
                onClick={handleClearFilters}
                className="text-xs font-bold text-red-400 hover:underline flex items-center gap-1"
              >
                <X size={12} />
                <span>مسح الكل</span>
              </button>
            </div>

            {/* Category selection */}
            <div className="space-y-4">
              <h3 className="font-black text-sm text-yellow-500 flex items-center gap-2">
                <Filter size={14} />
                <span>الأقسام الأساسية</span>
              </h3>
              <div className="flex flex-col gap-2.5">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="category"
                    checked={!selectedCategory}
                    onChange={() => handleCategorySelect('')}
                    className="accent-yellow-500 w-4 h-4 cursor-pointer"
                  />
                  <span className={`text-sm font-bold transition-colors ${!selectedCategory ? 'text-yellow-500' : 'text-gray-400 group-hover:text-white'}`}>الكل</span>
                </label>
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="category"
                      value={cat.id}
                      checked={selectedCategory === cat.id}
                      onChange={() => handleCategorySelect(cat.id)}
                      className="accent-yellow-500 w-4 h-4 cursor-pointer"
                    />
                    <span className={`text-sm font-bold transition-colors ${selectedCategory === cat.id ? 'text-yellow-500' : 'text-gray-400 group-hover:text-white'}`}>
                      {cat.nameAr}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Inputs */}
            <div className="space-y-4">
              <h3 className="font-black text-sm text-yellow-500 flex items-center gap-2">
                <ArrowUpDown size={14} />
                <span>نطاق السعر (ر.س)</span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">الحد الأدنى</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => handlePriceChange(e.target.value, maxPrice)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-500 font-bold text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">الحد الأقصى</label>
                  <input 
                    type="number" 
                    placeholder="1000"
                    value={maxPrice}
                    onChange={(e) => handlePriceChange(minPrice, e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-500 font-bold text-center"
                  />
                </div>
              </div>
            </div>

            {/* Sort order dropdown */}
            <div className="space-y-4">
              <h3 className="font-black text-sm text-yellow-500 flex items-center gap-2">
                <ArrowUpDown size={14} />
                <span>ترتيب المنتجات</span>
              </h3>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-yellow-500 font-bold cursor-pointer"
              >
                <option value="newest">الأحدث</option>
                <option value="priceAsc">الأسعار: من الأقل للأعلى</option>
                <option value="priceDesc">الأسعار: من الأعلى للأقل</option>
              </select>
            </div>

          </div>

          {/* 2. Catalog Grid Left Column */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Catalog Info Bar */}
            <div className="flex items-center justify-between bg-white/5 border border-white/5 px-6 py-4 rounded-2xl">
              <div className="text-sm font-bold text-gray-400">
                وجدنا <span className="text-yellow-500 font-black">{products.length}</span> منتج مطابق
              </div>
              <div className="text-xs text-gray-500 font-bold">
                تحديث فوري وتلقائي
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] space-y-6 animate-pulse">
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
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/5 border border-white/5 rounded-[2.5rem] p-16 text-center flex flex-col items-center justify-center"
              >
                <LayoutGrid size={64} className="text-yellow-500/40 mb-4 animate-pulse" />
                <h3 className="text-xl font-black text-white">لا توجد منتجات مطابقة لخيارات التصفية</h3>
                <p className="text-xs text-gray-500 mt-1 font-bold">يرجى تعديل خيارات التصفية أو مسح جميع الفلاتر.</p>
                <button 
                  onClick={handleClearFilters}
                  className="mt-6 px-6 py-3 bg-yellow-500 text-black text-sm font-black rounded-xl hover:shadow-[0_0_15px_rgba(234,179,8,0.4)] transition-all"
                >
                  مسح جميع الفلاتر
                </button>
              </motion.div>
            ) : (
              <motion.div 
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      nameAr={product.nameAr}
                      categoryNameAr={product.category?.nameAr}
                      basePrice={product.basePrice}
                      slug={product.slug}
                      imageUrl={product.imageUrl}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-32 pb-24 flex items-center justify-center bg-[#0d0d0d]">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
