"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, CreditCard, MonitorPlay, Gamepad2, Youtube, Tv, Smartphone, Rocket } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';

const ICON_MAP = {
  MonitorPlay: MonitorPlay,
  Gamepad2: Gamepad2,
  Youtube: Youtube,
  Tv: Tv,
  Smartphone: Smartphone,
  Rocket: Rocket
};

const CartDrawer = () => {
  const { items, isDrawerOpen, setDrawerOpen, removeItem, removeFromCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute dynamic cart total to prevent any caching/out-of-sync hydration bugs
  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1;
    return sum + (price * quantity);
  }, 0);

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999]"
          />

          {/* Drawer - Slides from Left */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-screen w-full md:max-w-md bg-[#0A0A0F]/90 backdrop-blur-2xl border-r border-white/10 z-[1000] flex flex-col font-noto shadow-2xl"
            dir="rtl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-gold" size={24} />
                <h2 className="text-xl font-black text-white">سلة المشتريات</h2>
              </div>
              <button 
                onClick={() => setDrawerOpen(false)}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold/10 transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {!mounted || items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <ShoppingBag size={64} className="mb-4" />
                  <p className="text-lg font-bold">السلة فارغة حالياً</p>
                </div>
              ) : (
                items.map((item, idx) => {
                  const ItemIcon = ICON_MAP[item.iconName] || Rocket;
                  const dataEntries = Object.entries(item.customerData || item.dynamicData || {});
                  
                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={`${item.id}-${idx}`}
                      className="p-4 bg-white/5 rounded-3xl border border-white/5 flex gap-4 group"
                    >
                      <div className="relative w-20 h-20 bg-background rounded-2xl flex-shrink-0 border border-white/5 flex items-center justify-center">
                        <ItemIcon size={32} className="text-gold/40 group-hover:text-gold transition-colors" />
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-black text-sm text-white line-clamp-1">{item.title}</h4>
                          
                          {/* Dynamic Customer Data Injection (Zero Mock Hardcoding) */}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {dataEntries.length > 0 ? (
                              dataEntries.map(([key, val]) => (
                                <span key={key} className="text-[10px] bg-white/5 px-2.5 py-1 rounded-md text-text/60 font-bold border border-white/5">
                                  {key === 'playerName' && 'اللاعب'}
                                  {key === 'playerId' && 'معرف اللاعب'}
                                  {key === 'backupCodes' && 'أكواد الاحتياط'}
                                  {key === 'profileName' && 'الملف الشخصي'}
                                  {key === 'whatsappNumber' && 'رقم الجوال'}
                                  {key === 'email' && 'البريد الإلكتروني'}
                                  {!['playerName', 'playerId', 'backupCodes', 'profileName', 'whatsappNumber', 'email'].includes(key) && key}
                                  : <span className="text-white">{val}</span>
                                </span>
                              ))
                            ) : (
                              <span className="text-[9px] text-text/30 font-bold">لا توجد بيانات إضافية</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-gold font-black text-sm">{item.price * item.quantity} ر.س</span>
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-white/40">الكمية: {item.quantity}</span>
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="p-2 text-red-500/40 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {mounted && items.length > 0 && (
              <div className="p-8 bg-card/50 border-t border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-text/60 font-bold">المجموع الكلي</span>
                  <span className="text-2xl font-black text-gold">{subtotal} ر.س</span>
                </div>
                
                <Link 
                  href="/checkout"
                  onClick={() => setDrawerOpen(false)}
                  className="btn-gold w-full py-5 text-lg flex items-center justify-center gap-3 gold-glow"
                >
                  <CreditCard size={20} /> الذهاب للدفع
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
