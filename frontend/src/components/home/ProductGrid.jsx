"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MonitorPlay, ChevronLeft, ShoppingCart, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllProducts } from '@/services/storefront.service.js';

const ProductCard = ({ id, nameAr, categoryNameAr, basePrice, imageUrl }) => (
  <Link href={`/product/${id}`} className="block h-full">
    <motion.div 
      whileHover={{ y: -10 }}
      className="bg-card/60 backdrop-blur-xl border border-white/5 p-6 rounded-[2.5rem] flex flex-col group hover:border-gold/30 transition-all duration-500 h-full"
    >
      {/* Image Area */}
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
          <MonitorPlay size={64} className="text-gold drop-shadow-[0_0_20px_rgba(245,197,24,0.3)] relative z-10" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-gold bg-gold/10 px-3 py-1 rounded-full">
            {categoryNameAr}
          </span>
        </div>
        <h3 className="text-xl font-black text-white leading-tight line-clamp-2 group-hover:text-gold transition-colors">{nameAr}</h3>
        
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

      {/* Action */}
      <div className="mt-8 py-4 border border-white/10 rounded-2xl text-sm font-black text-white hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center gap-2">
        عرض التفاصيل
        <ChevronLeft size={16} />
      </div>
    </motion.div>
  </Link>
);

const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestsellers = async () => {
      try {
        setLoading(true);
        // Fetch real seeded products (limit to 4)
        const allProducts = await getAllProducts({ limit: 4 });
        setProducts(allProducts.slice(0, 4));
      } catch (error) {
        console.error('Error loading best sellers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBestsellers();
  }, []);

  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-grid">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center gap-5 text-center mb-10 sm:mb-12 md:flex-row md:items-end md:justify-between md:text-right">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black leading-[1.35] text-white">الأكثر مبيعاً</h2>
            <p className="mx-auto max-w-xs text-sm sm:max-w-none sm:text-base text-text/50 font-medium leading-7 md:mx-0">
              اختر من بين أفضل المنتجات الرقمية المتاحة حالياً
            </p>
          </div>
          <Link href="/products" className="inline-flex items-center justify-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-5 py-2.5 text-sm font-black text-gold transition-all hover:-translate-x-2 hover:bg-gold/15">
            مشاهدة الكل <ChevronLeft size={20} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
            <LayoutGrid size={64} className="text-gold/40 mb-4 animate-pulse" />
            <h3 className="text-xl font-black text-white">لا توجد منتجات متوفرة حالياً</h3>
            <p className="text-xs text-text/40 mt-1 font-bold">يرجى العودة لاحقاً لتفقد الباقات الجديدة.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                nameAr={product.nameAr}
                categoryNameAr={product.category?.nameAr || 'قسم مميز'}
                basePrice={product.basePrice}
                imageUrl={product.imageUrl}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
