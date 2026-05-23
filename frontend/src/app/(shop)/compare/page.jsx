"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCompare, Trash2, ShoppingCart, ChevronLeft, X, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCompareStore } from '@/store/useCompareStore';
import { useCartStore } from '@/store/useCartStore';
import { toast } from 'react-hot-toast';

export default function ComparePage() {
  const { compareItems, removeFromCompare, clearCompare } = useCompareStore();
  const { addToCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex items-center justify-center bg-[#0d0d0d] font-noto">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleAddToCart = (product) => {
    // Determine product type
    const isPhysical = product.productType === 'PHYSICAL' || product.slug?.includes('xiaomi') || product.slug?.includes('device');
    const isGaming = product.productType === 'GAME_CURRENCY' || product.productType === 'GAME_COINS';
    const productType = isPhysical ? 'physical' : isGaming ? 'gaming' : 'subscription';

    // Prepare item for store
    const cartItem = {
      id: product.id,
      title: product.title,
      price: Number(product.price),
      iconName: productType === "physical" ? "Tv" : productType === "gaming" ? "Gamepad2" : "MonitorPlay",
      category: product.category || 'منتج مميز',
      isPhysical: isPhysical
    };

    // For simplicity in comparison grid, add directly with empty activation info or redirect to product page if details needed
    if (productType === 'gaming' || productType === 'subscription') {
      toast.error('هذا المنتج يتطلب بيانات تفعيل. سيتم توجيهك لصفحة المنتج.');
      window.location.href = `/product/${product.id}`;
      return;
    }

    addToCart(cartItem, {});
    toast.success('تمت إضافة المنتج للسلة 🛒');
  };

  const getProductTypeName = (product) => {
    const isPhysical = product.productType === 'PHYSICAL' || product.slug?.includes('xiaomi') || product.slug?.includes('device');
    const isGaming = product.productType === 'GAME_CURRENCY' || product.productType === 'GAME_COINS';
    if (isPhysical) return 'جهاز مادي';
    if (isGaming) return 'شحن ألعاب';
    return 'اشتراك رقمي';
  };

  return (
    <div className="min-h-screen pt-32 pb-24 font-noto bg-[#0d0d0d] text-white relative text-right" dir="rtl">
      {/* Background Decor */}
      <div className="fixed inset-0 bg-grid pointer-events-none z-0 opacity-20" />
      <div className="fixed top-1/4 left-0 w-[500px] h-[500px] bg-gold/5 blur-[150px] pointer-events-none z-0 rounded-full" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 border-b border-white/5 pb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gold/10 rounded-3xl border border-gold/20 flex items-center justify-center rotate-3 shadow-[0_0_30px_rgba(245,197,24,0.15)]">
              <GitCompare size={40} className="text-gold" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 tracking-tighter">مقارنة المنتجات</h1>
              <p className="text-gray-400 font-bold text-lg">قارن بين مواصفات وأسعار الخدمات والاشتراكات لاختيار الأفضل لك</p>
            </div>
          </div>

          {compareItems.length > 0 && (
            <button
              onClick={clearCompare}
              className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl text-red-400 text-sm font-black transition-all duration-300 flex items-center gap-2"
            >
              <Trash2 size={16} />
              <span>إفراغ قائمة المقارنة</span>
            </button>
          )}
        </div>

        {compareItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 border border-white/5 rounded-[2.5rem] p-16 flex flex-col items-center justify-center text-center backdrop-blur-xl"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
              <GitCompare size={32} className="text-gray-600 animate-pulse" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">قائمة المقارنة فارغة</h3>
            <p className="text-gray-400 font-bold mb-8">يرجى إضافة بعض المنتجات من الكتالوج لمقارنتها هنا.</p>
            <Link href="/products" className="btn-gold px-10 py-4 text-lg font-black gold-glow flex items-center gap-2">
              <span>تصفح كتالوج المنتجات</span>
              <ChevronLeft size={20} />
            </Link>
          </motion.div>
        ) : (
          <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-4 md:p-8 backdrop-blur-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full border-collapse text-right min-w-[600px]">
                <thead>
                  <tr className="border-b border-white/10">
                    {/* Fixed First Column Title */}
                    <th className="py-6 px-4 font-black text-lg text-gold w-1/5 min-w-[150px]">
                      الخصائص
                    </th>
                    {/* Product Columns */}
                    {compareItems.map((item) => (
                      <th key={item.id} className="py-6 px-4 text-center align-top relative w-1/4 min-w-[200px] border-r border-white/5">
                        {/* Remove Action */}
                        <button
                          onClick={() => removeFromCompare(item.id)}
                          className="absolute left-2 top-2 w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-500/20 hover:text-red-500 transition-colors z-20"
                          title="إزالة"
                        >
                          <X size={14} />
                        </button>

                        <div className="flex flex-col items-center space-y-4">
                          <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/5 overflow-hidden flex items-center justify-center relative p-2">
                            {item.imageUrl ? (
                              <Image
                                src={item.imageUrl}
                                alt={item.title}
                                width={96}
                                height={96}
                                className="w-full h-full object-cover rounded-xl"
                              />
                            ) : (
                              <GitCompare size={36} className="text-gold/40" />
                            )}
                          </div>
                          <Link href={`/product/${item.id}`} className="hover:text-gold transition-colors duration-300">
                            <h3 className="font-black text-sm text-white line-clamp-2 leading-relaxed text-center px-2">
                              {item.title}
                            </h3>
                          </Link>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Price Row */}
                  <tr className="border-b border-white/5 hover:bg-white-[0.02] transition-colors">
                    <td className="py-6 px-4 font-black text-sm text-gray-400">السعر الحالي</td>
                    {compareItems.map((item) => (
                      <td key={item.id} className="py-6 px-4 text-center font-black text-lg text-gold border-r border-white/5">
                        {item.price} <span className="text-xs font-bold text-gray-500">ر.س</span>
                      </td>
                    ))}
                  </tr>

                  {/* Category Row */}
                  <tr className="border-b border-white/5 hover:bg-white-[0.02] transition-colors">
                    <td className="py-6 px-4 font-black text-sm text-gray-400">القسم</td>
                    {compareItems.map((item) => (
                      <td key={item.id} className="py-6 px-4 text-center border-r border-white/5">
                        <span className="text-xs font-black uppercase tracking-wider text-gold bg-gold/10 px-3 py-1 rounded-full inline-block border border-gold/10">
                          {item.category}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Product Type Row */}
                  <tr className="border-b border-white/5 hover:bg-white-[0.02] transition-colors">
                    <td className="py-6 px-4 font-black text-sm text-gray-400">نوع الخدمة</td>
                    {compareItems.map((item) => (
                      <td key={item.id} className="py-6 px-4 text-center border-r border-white/5 text-sm font-bold text-white">
                        {getProductTypeName(item)}
                      </td>
                    ))}
                  </tr>

                  {/* Description Row */}
                  <tr className="border-b border-white/5 hover:bg-white-[0.02] transition-colors">
                    <td className="py-6 px-4 font-black text-sm text-gray-400">نظرة عامة / الوصف</td>
                    {compareItems.map((item) => (
                      <td key={item.id} className="py-6 px-4 text-center border-r border-white/5 text-xs text-gray-400 leading-relaxed font-bold max-w-[220px]">
                        <p className="line-clamp-4">{item.descriptionAr || 'اشتراك مضمون وآمن يتم تسليمه وتفعيله فورياً عبر موقعنا.'}</p>
                      </td>
                    ))}
                  </tr>

                  {/* Actions Row */}
                  <tr className="hover:bg-white-[0.02] transition-colors">
                    <td className="py-6 px-4 font-black text-sm text-gray-400">الطلب السريع</td>
                    {compareItems.map((item) => (
                      <td key={item.id} className="py-6 px-4 text-center border-r border-white/5">
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="px-4 py-3 bg-gold/10 hover:bg-gold border border-gold/30 hover:border-transparent text-gold hover:text-black font-black text-xs rounded-xl transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
                        >
                          <ShoppingCart size={14} />
                          <span>شراء وتفعيل</span>
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
