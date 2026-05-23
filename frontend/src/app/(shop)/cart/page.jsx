"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, 
  HelpCircle, CreditCard, MonitorPlay, Gamepad2, Youtube, Tv, Smartphone, Rocket 
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const ICON_MAP = {
  MonitorPlay: MonitorPlay,
  Gamepad2: Gamepad2,
  Youtube: Youtube,
  Tv: Tv,
  Smartphone: Smartphone,
  Rocket: Rocket
};

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { 
    cartItems, 
    totalAmount, 
    isLoading, 
    updateQuantity, 
    removeItem, 
    fetchServerCart,
    updateCustomerData
  } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [editingData, setEditingData] = useState({});

  // Fetch server cart upon mounting if authenticated
  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) {
      fetchServerCart();
    }
  }, [isAuthenticated, fetchServerCart]);

  // Initializing state for editing inline customer details
  useEffect(() => {
    const initialEditing = {};
    cartItems.forEach(item => {
      initialEditing[item.id] = { ...(item.customerData || {}) };
    });
    setEditingData(initialEditing);
  }, [cartItems]);

  const handleUpdateCustomerData = (itemId, key, value) => {
    const updatedFields = {
      ...editingData[itemId],
      [key]: value
    };
    
    setEditingData(prev => ({
      ...prev,
      [itemId]: updatedFields
    }));

    // In-memory update of store item to persist details locally
    const targetItem = cartItems.find(item => item.id === itemId);
    if (targetItem) {
      targetItem.customerData = updatedFields;
      targetItem.dynamicData = updatedFields;
    }
  };

  const handlePersistCustomerData = (itemId) => {
    const data = editingData[itemId] || {};
    updateCustomerData(itemId, data);
  };

  const handleCheckoutRedirect = () => {
    if (cartItems.length === 0) {
      toast.error('سلتك فارغة حالياً!');
      return;
    }
    
    // Check if any required customer details are empty
    let hasEmptyRequired = false;
    cartItems.forEach(item => {
      const data = item.customerData || {};
      const values = Object.values(data);
      if (values.length > 0 && values.some(val => !val || String(val).trim() === '')) {
        hasEmptyRequired = true;
      }
    });

    if (hasEmptyRequired) {
      toast.error('يرجى ملء كافة البيانات المطلوبة للمنتجات في السلة');
      return;
    }

    router.push('/checkout');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex items-center justify-center bg-background font-noto">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto font-noto text-right" dir="rtl">
      {/* Title Header */}
      <div className="mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white mb-2">سلة المشتريات</h1>
        <p className="text-text/50 font-medium">مراجعة عناصر سلتك وإضافة متطلبات التشغيل للطلب</p>
      </div>

      <AnimatePresence mode="wait">
        {cartItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-16 flex flex-col items-center justify-center text-center shadow-xl"
          >
            <div className="w-24 h-24 bg-gold/5 rounded-full flex items-center justify-center mb-6 border border-gold/10 shadow-[0_0_40px_rgba(245,197,24,0.05)] animate-pulse">
              <ShoppingBag size={40} className="text-gold" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-white mb-3">سلة المشتريات فارغة</h3>
            <p className="text-text/40 font-bold mb-8 max-w-md">ابدأ بتصفح المنتجات الرقمية والاشتراكات المتميزة واملأ سلتك بأفضل العروض!</p>
            <Link 
              href="/products" 
              className="btn-gold px-10 py-4 font-black text-lg flex items-center gap-2 gold-glow"
            >
              <ArrowRight size={20} className="rotate-180" />
              تصفح المنتجات الآن
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence>
                {cartItems.map((item, index) => {
                  const ItemIcon = ICON_MAP[item.iconName] || Rocket;
                  const itemData = editingData[item.id] || {};
                  
                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      key={item.id}
                      className="bg-card/60 backdrop-blur-2xl border border-white/5 p-6 rounded-[2.5rem] hover:border-gold/25 transition-all duration-300 group shadow-lg"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        
                        {/* Image/Icon & Titles */}
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-gold/20 transition-colors shrink-0">
                            <ItemIcon size={28} className="text-gold/40 group-hover:text-gold transition-colors" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-gold bg-gold/10 px-3 py-1 rounded-full w-fit mb-2 inline-block">
                              {item.product?.productType === 'subscription' ? 'اشتراك رقمي' : 'منتج رقمي'}
                            </span>
                            <h3 className="font-black text-white text-lg leading-tight line-clamp-2">{item.title}</h3>
                            {item.variant && (
                              <p className="text-xs text-text/40 font-bold mt-1">النوع: {item.variant.nameAr}</p>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls & Price */}
                        <div className="flex items-center justify-between md:flex-col md:items-end gap-4 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                          <span className="font-black text-gold text-2xl leading-none">
                            {item.price * item.quantity} <span className="text-xs text-text/40">ر.س</span>
                          </span>

                          <div className="flex items-center gap-4">
                            {/* Quantity Buttons */}
                            <div className="flex items-center bg-background border border-white/10 rounded-2xl p-1">
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-text/60 hover:text-gold hover:bg-white/5 transition-all"
                              >
                                <Plus size={16} />
                              </button>
                              <span className="w-10 text-center font-black text-white text-sm">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-text/60 hover:text-red-400 hover:bg-white/5 transition-all"
                                disabled={item.quantity <= 1}
                              >
                                <Minus size={16} />
                              </button>
                            </div>

                            {/* Deletion Button */}
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Injected Customer Data Fields Requirement Panel */}
                      {Object.keys(itemData).length > 0 && (
                        <div className="mt-6 pt-6 border-t border-white/5 space-y-4 bg-white/[0.02] p-6 rounded-3xl border border-white/5">
                          <p className="text-xs font-black text-text/40 mr-1 uppercase">بيانات التفعيل المطلوبة للطلب:</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(itemData).map(([key, val]) => (
                              <div key={key} className="space-y-2">
                                <label className="text-xs font-bold text-white/70 mr-1 uppercase">
                                  {key === 'playerName' && 'اسم اللاعب في اللعبة'}
                                  {key === 'playerId' && 'معرف اللاعب (Player ID)'}
                                  {key === 'backupCodes' && 'أكواد الاحتياط (Backup Codes)'}
                                  {key === 'profileName' && 'اسم ملف الحساب الشخصي'}
                                  {key === 'whatsappNumber' && 'رقم الواتساب للتفعيل'}
                                  {!['playerName', 'playerId', 'backupCodes', 'profileName', 'whatsappNumber'].includes(key) && key}
                                </label>
                                <input 
                                  type="text"
                                  value={val}
                                  placeholder={`أدخل ${key}...`}
                                  onChange={(e) => handleUpdateCustomerData(item.id, key, e.target.value)}
                                  onBlur={() => handlePersistCustomerData(item.id)}
                                  className="w-full bg-background border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-gold transition-all text-white text-sm font-medium"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Sidebar Pricing Breakdown */}
            <div className="bg-card/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 shadow-xl space-y-8 sticky top-32">
              <div>
                <h3 className="text-xl font-black text-white mb-2">خلاصة السلة</h3>
                <p className="text-text/40 text-xs font-bold">تفاصيل الأسعار واشتراكات طلبك الرقمي</p>
              </div>

              <div className="space-y-4 border-t border-b border-white/5 py-6">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-text/60 text-sm">المجموع الفرعي</span>
                  <span className="text-white text-lg">{totalAmount} ر.س</span>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span className="text-text/60 text-sm">الضريبة المضافة (١٥٪)</span>
                  <span className="text-white/60 text-sm">مشمولة في الأسعار</span>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span className="text-text/60 text-sm">الشحن والتسليم الرقمي</span>
                  <span className="text-emerald-400 text-sm font-black">فوري ومجاني</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-white">المجموع النهائي</span>
                <span className="text-3xl font-black text-gold leading-none">{totalAmount} ر.س</span>
              </div>

              <div className="space-y-4 pt-4">
                <button 
                  onClick={handleCheckoutRedirect}
                  className="btn-gold w-full py-5 text-lg font-black flex items-center justify-center gap-3 gold-glow"
                >
                  <CreditCard size={20} />
                  الذهاب للدفع
                </button>

                <div className="flex items-center justify-center gap-2 text-text/40 text-xs font-bold">
                  <ShieldCheck size={16} className="text-gold" />
                  مدفوعات آمنة ومشفرة ١٠٠٪
                </div>
              </div>

            </div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
