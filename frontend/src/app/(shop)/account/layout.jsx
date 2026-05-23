"use client";
import React, { useEffect } from 'react';
import { User, Package, Heart, LogOut, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-hot-toast';

export default function AccountLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user, isAdmin } = useAuthStore();

  useEffect(() => {
    if (isAdmin) {
      router.push('/admin');
    }
  }, [isAdmin, router]);

  if (isAdmin) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex items-center justify-center font-noto bg-background">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    toast.success('تم تسجيل الخروج بنجاح');
    router.push('/login');
  };

  const navLinks = [
    { name: 'البيانات الشخصية', href: '/account/profile', icon: User },
    { name: 'سجل الطلبات', href: '/account/orders', icon: Package },
    { name: 'الدعم الفني', href: '/account/tickets', icon: HelpCircle },
    { name: 'قائمة المفضلة', href: '/favorites', icon: Heart },
  ];


  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto font-noto" dir="rtl">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Right Sidebar */}
        <aside className="w-full lg:w-1/4 bg-card/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-6 shadow-xl sticky top-32">
          
          <div className="flex items-center gap-4 mb-6 lg:mb-8 pb-6 lg:pb-8 border-b border-white/5">
            <div className="w-16 h-16 bg-gold/10 rounded-full border border-gold/20 flex items-center justify-center font-black text-2xl text-gold shrink-0">
              {user?.name?.[0] || 'م'}
            </div>
            <div>
              <h3 className="font-black text-white text-lg truncate max-w-[150px]">{user?.name || 'مستخدم'}</h3>
              <p className="text-xs text-text/40 font-bold truncate max-w-[150px]">{user?.email || ''}</p>
            </div>
          </div>

          <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 custom-scrollbar">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-4 rounded-2xl font-bold transition-all duration-300 whitespace-nowrap ${
                    isActive 
                      ? 'bg-gold/10 text-gold border border-gold/20 shadow-[0_0_15px_rgba(245,197,24,0.1)]' 
                      : 'text-text/60 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-gold' : 'opacity-60'} />
                  {link.name}
                </Link>
              );
            })}

            <div className="hidden lg:block h-[1px] bg-white/5 my-4 mx-2" />
            <div className="lg:hidden w-[1px] bg-white/5 my-2 mx-2 shrink-0" />

            <button
              onClick={handleLogout}
              className="flex items-center justify-center lg:justify-start gap-3 px-4 py-4 rounded-2xl font-bold text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-300 w-full lg:w-auto whitespace-nowrap"
            >
              <LogOut size={20} className="opacity-80" />
              <span className="hidden lg:inline">تسجيل الخروج</span>
            </button>
          </nav>
        </aside>

        {/* Left Main Content */}
        <main className="w-full lg:w-3/4">
          {children}
        </main>

      </div>
    </div>
  );
}
