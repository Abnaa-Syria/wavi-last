"use client";
import React, { useState, useEffect } from 'react';
import { ShoppingCart, MessageCircle, Menu, X, UserCircle, LogOut, LayoutDashboard, ChevronDown, Heart } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const { setDrawerOpen, itemCount } = useCartStore();
  const { isAuthenticated, logout, user, isAdmin } = useAuthStore();
  const { favorites } = useFavoritesStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isClient && isAuthenticated) {
      useCartStore.getState().syncCartWithServer();
    }
  }, [isClient, isAuthenticated]);

  const navLinks = [
    { name: 'الرئيسية', href: '/' },
    { name: 'سمارترز', href: '/category/smarters-iptv' },
    { name: 'يونيفرس', href: '/category/universe-iptv' },
    { name: 'فالكون برو', href: '/category/falcon-pro-iptv' },
    { name: 'Xiaomi TV Box 2026', href: '/category/xiaomi-tv-box' },
    { name: 'جميع التصنيفات', href: '/categories' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${
        isMobileMenuOpen
          ? 'bg-[#0a0a0a] border-white/10'
          : isScrolled
            ? 'bg-[#080808]/90 backdrop-blur-xl border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.28)]'
            : 'bg-[#080808]/75 backdrop-blur-xl border-white/5'
      }`}
      dir="rtl"
    >
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 xl:px-8">
        <div className="flex h-[72px] min-h-[72px] items-center justify-between gap-4">
          
          {/* الجانب الأيمن: الشعار + الروابط */}
          <div className="flex min-w-0 flex-1 items-center gap-6 xl:gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 rounded-2xl flex items-center justify-center rotate-12 group-hover:rotate-0 transition-all duration-300 shadow-[0_0_22px_rgba(234,179,8,0.32)]">
                <span className="text-black font-black text-xl -rotate-12 group-hover:rotate-0 transition-transform duration-300">W</span>
              </div>
              <span className="text-2xl font-black tracking-tight text-yellow-500 leading-none">
                وافي
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden xl:flex min-w-0 flex-1 items-center justify-center gap-1.5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`whitespace-nowrap rounded-xl px-3.5 py-2.5 text-[13px] font-black leading-none transition-all ${
                      isActive
                        ? 'text-black bg-gradient-to-r from-yellow-300 to-yellow-600 shadow-[0_0_18px_rgba(245,197,24,0.18)]'
                        : 'text-gray-300 hover:text-white hover:bg-white/[0.07]'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* الجانب الأيسر: الإجراءات (حساب، عربة، واتساب) */}
          <div className="hidden xl:flex shrink-0 items-center justify-end gap-3">
            
            {/* WhatsApp Button */}
            <a
              href="https://wa.me/966550240110"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 px-4 py-2.5 text-xs font-black text-[#25D366] transition-all hover:bg-[#25D366] hover:text-white"
            >
              <MessageCircle size={17} />
              <span>دعم واتساب</span>
            </a>

            <div className="h-9 w-px bg-white/10" /> {/* فاصل */}

            {/* User Auth */}
            {(!isClient || !isAuthenticated) ? (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="rounded-xl px-3.5 py-2.5 text-xs font-black text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-gradient-to-r from-yellow-300 to-yellow-600 px-5 py-2.5 text-xs font-black text-black shadow-[0_0_18px_rgba(234,179,8,0.22)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(234,179,8,0.42)]"
                >
                  حساب جديد
                </Link>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-gray-200 transition-colors hover:bg-white/5"
                >
                  <UserCircle size={22} className="text-yellow-500" />
                  <span className="max-w-[100px] truncate text-xs font-black">{user?.name || 'حسابي'}</span>
                  <ChevronDown size={14} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute top-full left-0 mt-3 w-56 bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 bg-white/5 border-b border-white/10">
                      <p className="text-[11px] text-gray-400 uppercase font-bold mb-1">مرحباً بك</p>
                      <p className="text-sm font-black text-white truncate">{user?.name || 'مستخدم'}</p>
                    </div>
                    <div className="p-2 flex flex-col gap-1">
                      {isAdmin ? (
                        <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-gray-300 hover:text-yellow-500 hover:bg-white/5 rounded-xl transition-all" onClick={() => setIsUserMenuOpen(false)}>
                          <LayoutDashboard size={18} /> لوحة التحكم
                        </Link>
                      ) : (
                        <Link href="/account/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-gray-300 hover:text-yellow-500 hover:bg-white/5 rounded-xl transition-all" onClick={() => setIsUserMenuOpen(false)}>
                          <UserCircle size={18} /> حسابي الشخصي
                        </Link>
                      )}
                      <button 
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                          window.location.href = '/login';
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-all w-full text-right mt-1"
                      >
                        <LogOut size={18} /> تسجيل الخروج
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Favorites Button */}
            <Link
              href="/favorites"
              className="group relative rounded-full border border-white/10 bg-white/5 p-2.5 transition-all hover:bg-white/10"
            >
              <Heart size={20} className="text-gray-300 group-hover:text-yellow-500 transition-colors" />
              {isClient && favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#121212]">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="group relative rounded-full border border-white/10 bg-white/5 p-2.5 transition-all hover:bg-white/10"
            >
              <ShoppingCart size={20} className="text-gray-300 group-hover:text-yellow-500 transition-colors" />
              {isClient && itemCount() > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#121212]">
                  {itemCount()}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Actions (Favorites, Cart & Hamburger) */}
          <div className="flex items-center gap-3 xl:hidden">
            <Link href="/favorites" className="relative p-2">
              <Heart size={24} className="text-white" />
              {isClient && favorites.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-yellow-500 text-black text-[10px] font-black rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>
            <button onClick={() => setDrawerOpen(true)} className="relative p-2">
              <ShoppingCart size={24} className="text-white" />
              {isClient && itemCount() > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-yellow-500 text-black text-[10px] font-black rounded-full flex items-center justify-center">
                  {itemCount()}
                </span>
              )}
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-white">
              {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`xl:hidden fixed inset-x-0 top-[72px] bottom-0 bg-[#0a0a0a] z-40 transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="flex flex-col h-full p-6 overflow-y-auto">
          
          <div className="flex flex-col gap-2 mb-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={`px-4 py-4 rounded-xl text-lg font-bold transition-all ${isActive ? 'bg-yellow-500/10 text-yellow-500' : 'text-gray-300 hover:bg-white/5'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="mt-auto flex flex-col gap-4 pb-8">
            {(!isClient || !isAuthenticated) ? (
              <div className="grid grid-cols-2 gap-3">
                <Link href="/register" className="flex items-center justify-center py-3.5 bg-yellow-500 text-black rounded-xl font-bold" onClick={() => setIsMobileMenuOpen(false)}>
                  حساب جديد
                </Link>
                <Link href="/login" className="flex items-center justify-center py-3.5 bg-white/10 text-white rounded-xl font-bold" onClick={() => setIsMobileMenuOpen(false)}>
                  تسجيل الدخول
                </Link>
              </div>
            ) : (
              <div className="bg-white/5 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                  <UserCircle size={32} className="text-yellow-500" />
                  <div>
                    <p className="text-xs text-gray-400">مرحباً بك</p>
                    <p className="text-sm font-bold text-white">{user?.name}</p>
                  </div>
                </div>
                {isAdmin ? (
                  <Link href="/admin" className="flex items-center gap-3 py-2 text-gray-300 font-bold" onClick={() => setIsMobileMenuOpen(false)}>
                    <LayoutDashboard size={20} /> لوحة التحكم
                  </Link>
                ) : (
                  <Link href="/account/profile" className="flex items-center gap-3 py-2 text-gray-300 font-bold" onClick={() => setIsMobileMenuOpen(false)}>
                    <UserCircle size={20} /> حسابي الشخصي
                  </Link>
                )}
                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 py-2 text-red-400 font-bold mt-1">
                  <LogOut size={20} /> تسجيل الخروج
                </button>
              </div>
            )}
            
            <a href="https://wa.me/966550240110" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-4 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] rounded-xl font-bold">
              <MessageCircle size={20} /> تواصل مع الدعم عبر واتساب
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;