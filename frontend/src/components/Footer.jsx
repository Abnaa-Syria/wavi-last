"use client";
import React from 'react';
import { MessageCircle, Instagram, Twitter, Phone } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import DashboardFooter from './DashboardFooter';

const Footer = () => {
  const pathname = usePathname();
  
  // Hide footer on login and register pages
  if (pathname?.startsWith('/login') || pathname?.startsWith('/register')) {
    return null;
  }

  return (
    <footer className="bg-card pt-12 sm:pt-24 pb-0 px-4 sm:px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 lg:gap-16 mb-10 sm:mb-20">
          
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4 sm:mb-8">
              <div className="w-10 h-10 bg-gold-gradient rounded-xl flex items-center justify-center rotate-12">
                <span className="text-black font-black text-xl -rotate-12">W</span>
              </div>
              <span className="text-2xl font-black text-gold">وافي</span>
            </div>
            <p className="text-text/50 font-medium leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base">
              متجر وافي هو خيارك الأول والأسرع للحصول على كافة اشتراكاتك الرقمية وخدمات الألعاب في المملكة ودول الخليج.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-gold hover:text-black transition-all">
                <Twitter size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-gold hover:text-black transition-all">
                <Instagram size={20} />
              </a>
              <a href="https://wa.me/966550240110" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-gold hover:text-black transition-all">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-lg sm:text-xl font-black mb-4 sm:mb-8 text-white">روابط سريعة</h4>
            <ul className="flex flex-col gap-3 sm:gap-4 font-bold text-text/50 text-sm sm:text-base">
              <li><Link href="/" className="hover:text-gold transition-colors">الرئيسية</Link></li>
              <li><Link href="/categories" className="hover:text-gold transition-colors">الأقسام</Link></li>
              <li><Link href="/#faq" className="hover:text-gold transition-colors">الأسئلة الشائعة</Link></li>
              <li><a href="https://wa.me/966550240110" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">تواصل معنا</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-lg sm:text-xl font-black mb-4 sm:mb-8 text-white">سياسات المتجر</h4>
            <ul className="flex flex-col gap-3 sm:gap-4 font-bold text-text/50 text-sm sm:text-base">
              <li><Link href="/policies/refund" className="hover:text-gold transition-colors">سياسة الاستبدال</Link></li>
              <li><Link href="/policies/privacy" className="hover:text-gold transition-colors">سياسة الخصوصية</Link></li>
              <li><Link href="/policies/terms" className="hover:text-gold transition-colors">شروط الاستخدام</Link></li>
              <li><Link href="/policies/payment" className="hover:text-gold transition-colors">طرق الدفع</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg sm:text-xl font-black mb-4 sm:mb-8 text-white">تواصل معنا</h4>
            <div className="flex flex-col gap-3 sm:gap-4 font-bold text-text/50">
              <a 
                href="tel:+966550240110" 
                className="flex items-center gap-3 hover:text-gold transition-all duration-300 group w-fit"
              >
                <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-gold transition-all duration-300 shrink-0">
                  <Phone size={16} className="text-gold group-hover:text-black transition-colors" />
                </div>
                <span dir="ltr" className="font-sans text-white/70 group-hover:text-gold transition-colors text-sm sm:text-base">+966 550 240 110</span>
              </a>
              
              <a 
                href="https://wa.me/966550240110" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-gold transition-all duration-300 group w-fit"
              >
                <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-gold transition-all duration-300 shrink-0">
                  <MessageCircle size={16} className="text-gold group-hover:text-black transition-colors" />
                </div>
                <span className="text-white/70 group-hover:text-gold transition-colors text-sm sm:text-base">واتساب المبيعات</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-6 sm:pt-12 pb-6 sm:pb-8 border-t border-white/5 flex flex-col items-center justify-center gap-6 sm:gap-8">
          
          {/* Payment Methods */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-[9px] sm:text-[10px] font-black uppercase text-text/20 tracking-widest">
            <span className="px-2 sm:px-3 py-1 border border-white/10 rounded">Mada</span>
            <span className="px-2 sm:px-3 py-1 border border-white/10 rounded">Visa</span>
            <span className="px-2 sm:px-3 py-1 border border-white/10 rounded">Apple Pay</span>
            <span className="px-2 sm:px-3 py-1 border border-white/10 rounded">Tabby</span>
            <span className="px-2 sm:px-3 py-1 border border-white/10 rounded">Tamara</span>
          </div>
        </div>
      </div>
      <DashboardFooter />
    </footer>
  );
};

export default Footer;
