"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import { 
  User, Phone, Mail, ShieldCheck, CreditCard, Apple, CheckCircle2, 
  Rocket, Ticket, Sparkles, ShoppingBag, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const paymentOptions = [
  { id: 'mada', name: 'مدى Mada', icon: <CreditCard className="text-blue-400" /> },
  { id: 'visa', name: 'Visa / Mastercard', icon: <CreditCard className="text-gold" /> },
  { id: 'apple', name: 'Apple Pay', icon: <Apple className="text-white" /> },
  { id: 'tabby', name: 'تمارا / تابي', icon: <CheckCircle2 className="text-emerald-400" /> },
];

function CheckoutForm() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { cartItems, totalAmount, clearCart, fetchServerCart } = useCartStore();

  const [paymentMethod, setPaymentMethod] = useState('mada');
  const [formData, setFormData] = useState({
    phone: '',
    notes: ''
  });

  // Shipping Address State for physical products
  const [shippingAddress, setShippingAddress] = useState({
    city: '',
    district: '',
    addressDetails: ''
  });

  const [couponCode, setCouponCode] = useState('');
  const [couponDetails, setCouponDetails] = useState(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detect physical items in the cart
  const hasPhysicalItem = cartItems.some(item => 
    item.isPhysical || 
    item.category?.toLowerCase()?.includes('xiaomi') || 
    item.category?.toLowerCase()?.includes('أجهزة') || 
    item.title?.toLowerCase()?.includes('شاومي') || 
    item.title?.toLowerCase()?.includes('xiaomi') || 
    item.title?.toLowerCase()?.includes('ريسيفر') || 
    item.title?.toLowerCase()?.includes('جهاز')
  );

  // Sync / fetch cart on mount
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('يرجى تسجيل الدخول أولاً لإتمام عملية الشراء');
      router.push('/login?redirect=/checkout');
    } else {
      fetchServerCart();
    }
  }, [isAuthenticated, fetchServerCart, router]);

  // Pre-fill user data upon load
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    try {
      const res = await api.post('/marketing/coupons/validate', {
        code: couponCode,
        subtotal: totalAmount
      });
      const data = res.data?.data;
      if (data) {
        setCouponDetails(data);
        toast.success('تم تطبيق كود الخصم بنجاح! 🎉');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'كود الخصم المدخل غير صحيح أو منتهي الصلاحية');
      setCouponDetails(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponDetails(null);
    setCouponCode('');
    toast.success('تم إزالة كود الخصم');
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error('لا توجد عناصر في السلة لإتمام الطلب');
      return;
    }

    if (!formData.phone || formData.phone.trim().length < 5) {
      toast.error('الرجاء إدخال رقم الجوال/الواتساب للتواصل التلقائي');
      return;
    }

    // Validation for physical product delivery addresses
    if (hasPhysicalItem) {
      if (!shippingAddress.city.trim() || !shippingAddress.district.trim() || !shippingAddress.addressDetails.trim()) {
        toast.error('الرجاء إدخال كامل بيانات الشحن والتوصيل للجهاز الفيزيائي');
        return;
      }
    }

    setIsSubmitting(false);
    setIsSubmitting(true);
    try {
      // Serialize shipping address fields into customerNotes parameter
      let finalNotes = formData.notes || '';
      if (hasPhysicalItem) {
        const addressString = `[عنوان الشحن والتوصيل] المدينة: ${shippingAddress.city} | الحي/المنطقة: ${shippingAddress.district} | العنوان بالتفصيل: ${shippingAddress.addressDetails}`;
        finalNotes = finalNotes ? `${finalNotes}\n\n${addressString}` : addressString;
      }

      const res = await api.post('/orders', {
        couponCode: couponDetails?.code || null,
        customerPhone: formData.phone,
        customerNotes: finalNotes || null
      });

      const order = res.data?.data?.order;
      if (order) {
        toast.success('تم إنشاء طلبك بنجاح! 🎉');
        clearCart(); // Wipes local Zustand items
        router.push(`/checkout/success?orderId=${order.orderNumber}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'حدث خطأ أثناء معالجة الطلب، يرجى المحاولة لاحقاً');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentTotal = couponDetails ? couponDetails.finalTotal : totalAmount;
  const discountAmount = couponDetails ? couponDetails.discountAmount : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start text-right" dir="rtl">
      
      {/* Right Column: Customer Info & Payments */}
      <div className="lg:col-span-7 space-y-8">
        
        {/* User profile recap */}
        <section className="p-8 bg-card rounded-[2.5rem] border border-white/5 space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-24 h-24 bg-gold/5 blur-2xl rounded-full" />
          <h3 className="text-xl font-black flex items-center gap-3">
            <User size={20} className="text-gold" /> بيانات العميل المسجل
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/[0.01] p-6 rounded-3xl border border-white/5">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-text/30 uppercase tracking-widest">الاسم الكامل</span>
              <p className="font-bold text-white text-base">{user?.firstName} {user?.lastName}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-text/30 uppercase tracking-widest">البريد الإلكتروني</span>
              <p className="font-bold text-white text-base truncate">{user?.email}</p>
            </div>
          </div>
        </section>

        {/* Dynamic delivery requirements */}
        <section className="p-8 bg-card rounded-[2.5rem] border border-white/5 space-y-6 shadow-xl">
          <h3 className="text-xl font-black flex items-center gap-3">
            <Phone size={20} className="text-gold" /> معلومات التواصل والتسليم
          </h3>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-text/40 mr-1 uppercase">رقم الجوال / الواتساب للتفعيل</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text/20" size={18} />
                <input 
                  type="text"
                  placeholder="05xxxxxxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-background border border-white/10 rounded-2xl py-4 pr-4 pl-12 focus:outline-none focus:border-gold transition-all text-white font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-text/40 mr-1 uppercase">ملاحظات إضافية للطلب (اختياري)</label>
              <textarea 
                rows="3"
                placeholder="أدخل أي ملاحظات خاصة بطلبك هنا..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-background border border-white/10 rounded-2xl py-4 px-4 focus:outline-none focus:border-gold transition-all text-white font-bold resize-none"
              />
            </div>
          </div>
        </section>

        {/* Shipping Address Section (Conditional) */}
        {hasPhysicalItem && (
          <section className="p-8 bg-card rounded-[2.5rem] border border-white/5 space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-24 h-24 bg-yellow-500/5 blur-2xl rounded-full" />
            <h3 className="text-xl font-black flex items-center gap-3 text-white">
              <Rocket size={20} className="text-gold" /> عنوان التوصيل والشحن (للأجهزة والملحقات)
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-text/40 mr-1 uppercase">المدينة</label>
                  <input 
                    type="text"
                    placeholder="مثال: الرياض"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-2xl py-4 px-4 focus:outline-none focus:border-gold transition-all text-white font-bold"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-black text-text/40 mr-1 uppercase">المنطقة / الحي</label>
                  <input 
                    type="text"
                    placeholder="مثال: حي الياسمين"
                    value={shippingAddress.district}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, district: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-2xl py-4 px-4 focus:outline-none focus:border-gold transition-all text-white font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-text/40 mr-1 uppercase">العنوان بالتفصيل (اسم الشارع، رقم المنزل)</label>
                <textarea 
                  rows="2"
                  placeholder="شارع التخصصي، بجانب سوبرماركت الدانوب، رقم المنزل 12"
                  value={shippingAddress.addressDetails}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, addressDetails: e.target.value })}
                  className="w-full bg-background border border-white/10 rounded-2xl py-4 px-4 focus:outline-none focus:border-gold transition-all text-white font-bold resize-none"
                />
              </div>
            </div>
          </section>
        )}

        {/* Payment options */}
        <section className="p-8 bg-card rounded-[2.5rem] border border-white/5 space-y-6 shadow-xl">
          <h3 className="text-xl font-black flex items-center gap-3">
            <CreditCard size={20} className="text-gold" /> وسيلة الدفع المفضلة
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setPaymentMethod(opt.id)}
                className={`p-6 rounded-3xl border-2 flex items-center justify-between transition-all duration-300 ${
                  paymentMethod === opt.id 
                  ? 'border-gold bg-gold/10 shadow-[0_0_20px_rgba(245,197,24,0.1)]' 
                  : 'border-white/5 bg-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center">
                    {opt.icon}
                  </div>
                  <span className="font-black text-sm">{opt.name}</span>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === opt.id ? 'border-gold' : 'border-white/20'
                }`}>
                  {paymentMethod === opt.id && <div className="w-3 h-3 bg-gold rounded-full" />}
                </div>
              </button>
            ))}
          </div>
        </section>

        <button 
          onClick={handleConfirmOrder}
          disabled={isSubmitting || cartItems.length === 0}
          className="btn-gold w-full py-6 text-xl flex items-center justify-center gap-3 gold-glow mt-8 disabled:opacity-40"
        >
          {isSubmitting ? (
            <div className="w-6 h-6 border-2 border-background border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              تأكيد الطلب والدفع الرقمي 🚀
            </>
          )}
        </button>
      </div>

      {/* Left Column: Order details & coupon validator */}
      <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-32">
        
        {/* Order Items Breakdown */}
        <section className="p-8 bg-card/50 rounded-[2.5rem] border border-white/5 space-y-6 shadow-xl">
          <h3 className="text-xl font-black border-b border-white/5 pb-4">ملخص الطلب</h3>
          
          <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {cartItems.length === 0 ? (
              <div className="text-center py-8 opacity-40">
                <ShoppingBag size={48} className="mx-auto mb-2 text-text/40" />
                <p className="font-bold text-sm">السلة فارغة</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="relative w-12 h-12 bg-background rounded-xl flex-shrink-0 border border-white/5 flex items-center justify-center">
                    <Rocket className="text-gold/40" size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-sm text-white line-clamp-1">{item.title}</h4>
                    <p className="text-[10px] text-text/40 font-bold">الكمية: {item.quantity}</p>
                  </div>
                  <span className="font-black text-gold text-sm whitespace-nowrap">
                    {item.price * item.quantity} ر.س
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Coupon inputs */}
          <div className="pt-6 border-t border-white/5 space-y-4">
            <label className="text-xs font-black text-text/40 mr-1 uppercase flex items-center gap-2">
              <Ticket size={14} className="text-gold" /> تطبيق كود الخصم (Coupon)
            </label>

            <AnimatePresence mode="wait">
              {!couponDetails ? (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex gap-2"
                >
                  <input 
                    type="text"
                    placeholder="كود الخصم"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-background border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-gold transition-all text-white font-bold uppercase text-sm"
                  />
                  <button 
                    onClick={handleApplyCoupon}
                    disabled={isValidatingCoupon || !couponCode.trim()}
                    className="btn-gold px-6 py-3 font-bold text-sm disabled:opacity-40"
                  >
                    {isValidatingCoupon ? (
                      <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'تطبيق'
                    )}
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="text-emerald-400" size={18} />
                    <div>
                      <p className="text-xs font-bold text-emerald-400">تم تطبيق الخصم ({couponDetails.code})</p>
                      <p className="text-[10px] text-text/50 font-medium">خصم بقيمة {couponDetails.discountAmount} ر.س</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleRemoveCoupon}
                    className="text-xs font-bold text-red-400 hover:text-red-500 transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10"
                  >
                    إلغاء الكود
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pricing breakdowns */}
          <div className="pt-6 border-t border-white/5 space-y-4 font-bold text-sm">
            <div className="flex justify-between text-text/60">
              <span>المجموع الفرعي</span>
              <span>{totalAmount} ر.س</span>
            </div>
            
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>الخصم المطبق</span>
                <span>-{discountAmount} ر.س</span>
              </div>
            )}

            <div className="flex justify-between text-emerald-400">
              <span>الرسوم الرقمية والشحن</span>
              <span>مجاني فوري</span>
            </div>

            <div className="flex justify-between text-2xl font-black text-white pt-4 border-t border-white/5">
              <span>الإجمالي الكلي</span>
              <span className="text-gold">{currentTotal} ر.س</span>
            </div>
          </div>

          <div className="p-4 bg-gold/5 rounded-2xl flex items-center gap-3 border border-gold/10">
            <ShieldCheck className="text-gold" size={20} />
            <p className="text-[10px] font-bold text-text/60 leading-relaxed">
              طلبك محمي ومؤمن ١٠٠٪. سيتم تسليم الأكواد التفعيلية وتفعيل الاشتراكات رقمياً فور تأكيد الطلب.
            </p>
          </div>
        </section>
      </div>

    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto font-noto" dir="rtl">
      <div className="mb-12 text-right">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black mb-4">إتمام الطلب</h1>
        <p className="text-text/50 font-medium text-lg">الرجاء إدخال بياناتك للتسليم الرقمي الفوري للطلب</p>
      </div>

      <Suspense fallback={
        <div className="h-96 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <CheckoutForm />
      </Suspense>
    </div>
  );
}
