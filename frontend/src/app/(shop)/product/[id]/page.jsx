"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, ShieldCheck, Zap, Info, ChevronRight, Mail, User, Server, Key, MonitorPlay, Gamepad2, Heart, Rocket } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { toast } from 'react-hot-toast';
import { getProductById } from '@/services/storefront.service.js';

const mapSlugToIcon = (slug = '') => {
  const s = slug.toLowerCase();
  if (s.includes('iptv') || s.includes('smarters') || s.includes('falcon') || s.includes('netflix') || s.includes('streaming')) {
    return MonitorPlay;
  }
  if (s.includes('coin') || s.includes('gaming') || s.includes('pubg') || s.includes('roblox') || s.includes('code') || s.includes('game') || s.includes('fc')) {
    return Gamepad2;
  }
  return Rocket;
};

const ProductPage = ({ params }) => {
  const id = params?.id || '';
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCartStore();
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const favorited = isFavorite(id);
  
  // State for dynamic inputs
  const [email, setEmail] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [server, setServer] = useState('');
  const [backupCodes, setBackupCodes] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const fetchedProduct = await getProductById(id);
      if (fetchedProduct) {
        setProduct(fetchedProduct);
        if (fetchedProduct.variants && fetchedProduct.variants.length > 0) {
          setSelectedVariantId(fetchedProduct.variants[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load product details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 font-noto text-right bg-background flex flex-col items-center justify-center" dir="rtl">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-white/60 font-bold">جاري تحميل تفاصيل المنتج الفاخر...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto font-noto text-center flex flex-col items-center justify-center" dir="rtl">
        <h2 className="text-3xl font-black text-white mb-4">عذراً، لم نتمكن من العثور على هذا المنتج!</h2>
        <p className="text-text/40 font-bold mb-8">ربما تم نقله أو إزالته من قبل إدارة المتجر.</p>
        <Link href="/products" className="btn-gold px-8 py-4 rounded-2xl font-black flex items-center gap-2">
          العودة للمتجر <ChevronRight size={18} />
        </Link>
      </div>
    );
  }

  const isPhysical = product.productType === 'PHYSICAL' || product.slug?.includes('xiaomi') || product.slug?.includes('device') || product.category?.slug?.includes('xiaomi') || product.category?.slug?.includes('devices');
  const isGaming = product.productType === 'GAME_CURRENCY' || product.productType === 'GAME_COINS';
  const productType = isPhysical ? 'physical' : isGaming ? 'gaming' : 'subscription';
  
  // Resolve current active price and title
  const activeVariant = product.variants?.find(v => v.id === selectedVariantId);
  const activePrice = activeVariant ? activeVariant.price : product.basePrice;
  const activeCompareAtPrice = activeVariant ? activeVariant.compareAtPrice : product.compareAtPrice;
  const activeTitle = activeVariant 
    ? `${product.nameAr} - ${activeVariant.nameAr}` 
    : product.nameAr;

  const handleAddToCart = () => {
    let customerData = {};

    if (productType === 'physical') {
      // Physical products do not require account activation data
      customerData = {};
    } else if (productType === 'gaming') {
      if (!playerId.trim() || !server.trim() || !backupCodes.trim()) {
        toast.error('الرجاء إدخال كامل البيانات المطلوبة (رقم اللاعب، السيرفر، وأكواد الاحتياط)');
        return;
      }
      customerData = {
        playerId: playerId.trim(),
        server: server.trim(),
        backupCodes: backupCodes.trim()
      };
    } else {
      if (!email.trim()) {
        toast.error('الرجاء إدخال اسم الحساب/البريد الإلكتروني للتفعيل');
        return;
      }
      customerData = {
        email: email.trim()
      };
    }

    // Prepare item for store
    const cartItem = {
      id: product.id,
      variantId: selectedVariantId || undefined,
      title: activeTitle,
      price: Number(activePrice),
      iconName: productType === "physical" ? "Tv" : productType === "gaming" ? "Gamepad2" : "MonitorPlay",
      category: product.category?.nameAr || 'منتج مميز',
      isPhysical: productType === 'physical'
    };

    addToCart(cartItem, customerData);
  };

  const ProductIcon = mapSlugToIcon(product.slug);

  // Fallback guides if no activationSteps are seeded in DB
  const defaultGuide = [
    { step: "١", title: "الدفع الآمن", desc: "اختر وسيلة الدفع المناسبة لك وأكمل العملية بأمان تشفير تام." },
    { step: "٢", title: "تجهيز وتوصيل تلقائي", desc: "سيقوم النظام بإرسال بيانات اشتراكك فورياً عبر الواتساب والرسائل النصية." },
    { step: "٣", title: "تفعيل فوري للخدمة", desc: "اتبع إرشادات التفعيل المرفقة واستمتع بالخدمة في ثوانٍ معدودة." }
  ];
  
  const guideSteps = product.activationSteps && product.activationSteps.length > 0
    ? product.activationSteps.map(step => ({
        step: step.stepNo.toString(),
        title: `الخطوة ${step.stepNo}`,
        desc: step.textAr
      }))
    : defaultGuide;

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto font-noto text-right" dir="rtl">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm font-bold text-text/40 mb-12">
        <Link href="/" className="hover:text-gold transition-colors">الرئيسية</Link>
        <ChevronRight size={14} className="rotate-180" />
        <Link href="/products" className="hover:text-gold transition-colors">المنتجات</Link>
        <ChevronRight size={14} className="rotate-180" />
        <Link href={`/products?category=${product.categoryId}`} className="hover:text-gold transition-colors">{product.category?.nameAr}</Link>
        <ChevronRight size={14} className="rotate-180" />
        <span className="text-white truncate">{product.nameAr}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Right: Product Images/Icons */}
        <div className="lg:col-span-5 w-full aspect-square bg-card rounded-[3rem] border border-white/5 flex items-center justify-center relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-3xl rounded-full animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 blur-3xl rounded-full animate-pulse" />
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-full h-full p-8 flex items-center justify-center relative z-10"
          >
            {product?.imageUrl ? (
              <Image 
                src={product.imageUrl} 
                alt={product.nameAr}
                width={500}
                height={500}
                className="w-full h-full object-cover rounded-[2rem] transition-transform duration-500 group-hover:scale-105 relative z-10"
                priority
              />
            ) : (
              <ProductIcon size={128} className="text-gold/40 group-hover:text-gold transition-colors duration-500" />
            )}
          </motion.div>
        </div>

        {/* Left: Product Info & Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-7 space-y-8"
        >
          
          <div className="space-y-4">
            <span className="text-xs font-black text-gold bg-gold/10 px-4 py-1.5 rounded-full border border-gold/10 uppercase tracking-wider inline-block">
              {product.category?.nameAr || 'منتج رقمي مميز'}
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white leading-tight">{product.nameAr}</h1>
            
            <div className="flex items-center gap-6 pt-2">
              <div className="flex flex-col">
                <span className="text-3xl md:text-4xl font-black text-gold">
                  {activePrice} <span className="text-lg text-text/60 font-bold">ر.س</span>
                </span>
                {activeCompareAtPrice && (
                  <span className="text-sm text-text/40 font-bold line-through mr-1">
                    {activeCompareAtPrice} ر.س
                  </span>
                )}
              </div>
              <div className="h-8 w-[1px] bg-white/10" />
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck size={20} />
                <span>متوفر وتوصيل رقمي فوري</span>
              </div>
            </div>
          </div>

          <p className="text-lg text-text/60 leading-relaxed font-medium">
            {product.descriptionAr || product.shortDescAr || 'استمتع بالخدمة الفاخرة المضمونة والمقدمة فورا من متجر وافي بأعلى مستويات الجودة والأمان.'}
          </p>

          {/* Product Variants Selector Dropdown */}
          {product.variants && product.variants.length > 0 && (
            <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-4 shadow-inner">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Zap size={18} className="text-gold" /> اختر الباقة المناسبة لك
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`p-4 rounded-2xl border text-right transition-all duration-300 flex flex-col justify-between h-24 ${
                      selectedVariantId === v.id
                        ? 'border-gold bg-gold/10 shadow-[0_0_20px_rgba(245,197,24,0.15)] text-white'
                        : 'border-white/5 bg-white/5 text-text/60 hover:border-white/15'
                    }`}
                  >
                    <span className="text-xs font-black truncate">{v.nameAr}</span>
                    <span className="text-lg font-black text-gold mt-2">{v.price} <span className="text-[10px] text-text/60">ر.س</span></span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Inputs Requirement Forms */}
          {productType !== 'physical' ? (
            <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-8 shadow-inner">
              <h3 className="text-xl font-black flex items-center gap-3">
                <Info size={20} className="text-gold" /> بيانات التفعيل المطلوبة
              </h3>
              
              <div className="space-y-6">
                {productType === 'subscription' ? (
                  <div className="space-y-3">
                    <label className="text-xs font-black text-text/40 mr-1 uppercase">اسم الحساب / البريد الإلكتروني للتفعيل</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text/20" size={20} />
                      <input 
                        type="text" 
                        placeholder="أدخل البريد الإلكتروني أو اسم الحساب"
                        className="w-full bg-background border border-white/10 rounded-2xl py-4 pr-4 pl-12 focus:outline-none focus:border-gold transition-all text-white font-bold"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-xs font-black text-text/40 mr-1 uppercase">اسم أو رقم اللاعب (ID)</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text/20" size={20} />
                          <input 
                            type="text" 
                            placeholder="أدخل معرف اللاعب (ID)"
                            className="w-full bg-background border border-white/10 rounded-2xl py-4 pr-4 pl-12 focus:outline-none focus:border-gold transition-all text-white font-bold"
                            value={playerId}
                            onChange={(e) => setPlayerId(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black text-text/40 mr-1 uppercase">السيرفر الخاص بك</label>
                        <div className="relative">
                          <Server className="absolute left-4 top-1/2 -translate-y-1/2 text-text/20" size={20} />
                          <input 
                            type="text" 
                            placeholder="أدخل السيرفر (مثال: أوروبا)"
                            className="w-full bg-background border border-white/10 rounded-2xl py-4 pr-4 pl-12 focus:outline-none focus:border-gold transition-all text-white font-bold"
                            value={server}
                            onChange={(e) => setServer(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-black text-text/40 mr-1 uppercase">أكواد الاحتياط (Backup Codes)</label>
                      <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-text/20" size={20} />
                        <input 
                          type="text" 
                          placeholder="مثال: 1234-5678, 8765-4321"
                          className="w-full bg-background border border-white/10 rounded-2xl py-4 pr-4 pl-12 focus:outline-none focus:border-gold transition-all text-white font-bold"
                          value={backupCodes}
                          onChange={(e) => setBackupCodes(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CTAs */}
              <div className="flex items-center gap-4 mt-8">
                <button 
                  onClick={handleAddToCart}
                  className="btn-gold flex-1 py-6 text-xl flex items-center justify-center gap-3 gold-glow"
                >
                  <ShoppingCart size={24} /> أضف إلى السلة
                </button>
                
                <button
                  onClick={() => toggleFavorite({
                    id: product.id,
                    title: product.nameAr,
                    price: Number(activePrice),
                    category: product.category?.nameAr || 'قسم مميز',
                    iconName: productType === "gaming" ? "Gamepad2" : "MonitorPlay",
                    imageUrl: product.imageUrl
                  })}
                  className={`w-20 h-[76px] rounded-3xl flex items-center justify-center border backdrop-blur-xl transition-all duration-300 shadow-md ${
                    favorited
                      ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:bg-red-500/20'
                      : 'bg-white/5 border-white/10 text-text/40 hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/5'
                  }`}
                >
                  <Heart size={28} className={favorited ? 'fill-red-500' : ''} />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-4 shadow-inner">
              {/* CTAs directly for physical products */}
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleAddToCart}
                  className="btn-gold flex-1 py-6 text-xl flex items-center justify-center gap-3 gold-glow"
                >
                  <ShoppingCart size={24} /> أضف إلى السلة
                </button>
                
                <button
                  onClick={() => toggleFavorite({
                    id: product.id,
                    title: product.nameAr,
                    price: Number(activePrice),
                    category: product.category?.nameAr || 'قسم مميز',
                    iconName: "Tv",
                    imageUrl: product.imageUrl
                  })}
                  className={`w-20 h-[76px] rounded-3xl flex items-center justify-center border backdrop-blur-xl transition-all duration-300 shadow-md ${
                    favorited
                      ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:bg-red-500/20'
                      : 'bg-white/5 border-white/10 text-text/40 hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/5'
                  }`}
                >
                  <Heart size={28} className={favorited ? 'fill-red-500' : ''} />
                </button>
              </div>
            </div>
          )}

          {/* Guide */}
          <div className="space-y-8">
            <h3 className="text-2xl font-black">كيفية تفعيل الطلب؟</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {guideSteps.map((step) => (
                <div key={step.step} className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                  <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center text-black font-black text-xl">
                    {step.step}
                  </div>
                  <h4 className="font-black text-white">{step.title}</h4>
                  <p className="text-xs text-text/40 leading-relaxed font-bold">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default ProductPage;
