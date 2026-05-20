"use client";
import React from 'react';
import { MessageCircle, Instagram, Twitter, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-card pt-24 pb-12 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-gold-gradient rounded-xl flex items-center justify-center rotate-12">
                <span className="text-black font-black text-xl -rotate-12">W</span>
              </div>
              <span className="text-2xl font-black text-gold">وافي <span className="text-white opacity-50">WAVI</span></span>
            </div>
            <p className="text-text/50 font-medium leading-relaxed mb-8">
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
            <h4 className="text-xl font-black mb-8 text-white">روابط سريعة</h4>
            <ul className="flex flex-col gap-4 font-bold text-text/50">
              <li><a href="#" className="hover:text-gold transition-colors">الرئيسية</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">الأقسام</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">الأسئلة الشائعة</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">تواصل معنا</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-xl font-black mb-8 text-white">سياسات المتجر</h4>
            <ul className="flex flex-col gap-4 font-bold text-text/50">
              <li><a href="#" className="hover:text-gold transition-colors">سياسة الاستبدال</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">سياسة الخصوصية</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">شروط الاستخدام</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">طرق الدفع</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xl font-black mb-8 text-white">تواصل معنا</h4>
            <div className="flex flex-col gap-6 font-bold text-text/50">
              <a href="tel:+966550240110" className="flex items-center gap-3 hover:text-gold transition-colors" dir="ltr">
                <Phone size={18} className="text-gold" />
                +966 550 240 110
              </a>
              <a href="https://wa.me/966550240110" className="flex items-center gap-3 hover:text-gold transition-colors">
                <MessageCircle size={18} className="text-gold" />
                واتساب المبيعات
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-text/30 font-bold">جميع الحقوق محفوظة © ٢٠٢٤ متجر وافي الرقمي</p>
          
          {/* Payment Methods */}
          <div className="flex flex-wrap justify-center gap-4 text-[10px] font-black uppercase text-text/20 tracking-widest">
            <span className="px-3 py-1 border border-white/10 rounded">Mada</span>
            <span className="px-3 py-1 border border-white/10 rounded">Visa</span>
            <span className="px-3 py-1 border border-white/10 rounded">Apple Pay</span>
            <span className="px-3 py-1 border border-white/10 rounded">Tabby</span>
            <span className="px-3 py-1 border border-white/10 rounded">Tamara</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
