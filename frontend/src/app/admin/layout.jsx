"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, ShoppingBag, Layers, Users, Settings, 
  Search, Bell, Menu, HelpCircle, Ticket, Gift, LogOut, Sliders, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, isAdminPanelRole, markAuthHydrated } from '@/store/useAuthStore';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated, _hasHydrated } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    if (useAuthStore.persist.hasHydrated()) {
      markAuthHydrated();
    } else {
      const unsub = useAuthStore.persist.onFinishHydration(() => {
        markAuthHydrated();
      });
      const timeout = setTimeout(markAuthHydrated, 1500);
      return () => {
        unsub?.();
        clearTimeout(timeout);
      };
    }
  }, []);

  // Handshake Profile Sync to fetch active permissions dynamically
  useEffect(() => {
    if (_hasHydrated && isAuthenticated && user) {
      const syncUserSession = async () => {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.data?.user) {
            useAuthStore.getState().updateUser(res.data.data.user);
          }
        } catch (err) {
          console.error('Failed to sync user session permissions', err);
        }
      };
      syncUserSession();
    }
  }, [_hasHydrated, isAuthenticated]);

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!isAuthenticated || !user) {
      window.location.href = '/login?redirect=/admin';
      return;
    }

    if (!isAdminPanelRole(user.role)) {
      toast.error('غير مصرح لك بدخول لوحة التحكم');
      window.location.href = '/';
    }
  }, [_hasHydrated, isAuthenticated, user]);

  const isReady =
    isMounted && _hasHydrated && isAuthenticated && user && isAdminPanelRole(user.role);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-noto text-white">
        <motion.div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const role = user.role || 'SUPPORT';

  // Dynamic Permission-Based Navigation links mapping
  const allLinks = [
    { name: 'الرئيسية', href: '/admin', icon: LayoutDashboard, permission: 'REPORTS_VIEW' },
    { name: 'الطلبات', href: '/admin/orders', icon: ShoppingBag, permission: 'ORDER_VIEW' },
    { name: 'المنتجات', href: '/admin/products', icon: Layers, permission: 'PRODUCT_VIEW' },
    { name: 'التصنيفات', href: '/admin/categories', icon: Layers, permission: 'CATEGORY_CREATE' },
    { name: 'كوبونات الخصم', href: '/admin/coupons', icon: Gift, permission: 'COUPON_CREATE' },
    { name: 'المستخدمين', href: '/admin/users', icon: Users, permission: 'USER_VIEW' },
    { name: 'إدارة المحتوى', href: '/admin/cms', icon: Sliders, permission: 'SETTINGS_MANAGE' },
    { name: 'التذاكر الفنية', href: '/admin/tickets', icon: Ticket, permission: 'SUPPORT_MANAGE' },
    { name: 'الأسئلة الشائعة', href: '/admin/faqs', icon: HelpCircle, permission: 'SUPPORT_MANAGE' },
    { name: 'إدارة الصلاحيات (RBAC)', href: '/admin/rbac', icon: Shield, permission: 'SETTINGS_MANAGE' },
    { name: 'الإعدادات', href: '/admin/settings', icon: Settings, permission: 'SETTINGS_MANAGE' },
  ];

  const userPermissions = user?.permissions || [];
  const sidebarLinks = user?.role === 'SUPER_ADMIN'
    ? allLinks
    : allLinks
        .filter(link => link.href !== '/admin/rbac')
        .filter(link => userPermissions.includes(link.permission));

  const handleLogout = () => {
    logout();
    toast.success('تم تسجيل الخروج بنجاح');
    router.push('/login');
  };

  const getRoleBadge = (r) => {
    if (r === 'SUPER_ADMIN') return 'المدير الخارق ';
    if (r === 'ADMIN') return 'المدير العام';
    if (r === 'STAFF') return 'مشرف النظام';
    return 'فريق الدعم الفني';
  };

  return (
    <div className="min-h-screen bg-background font-noto text-white flex" dir="rtl">
      
      {/* Background Decor */}
      <div className="fixed inset-0 bg-grid pointer-events-none z-0 opacity-40" />
      <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-gold/5 blur-[200px] pointer-events-none z-0 rounded-full" />

      {/* Desktop Sidebar (Right) */}
      <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 right-0 bg-[#111118]/80 backdrop-blur-3xl border-l border-white/5 z-20">
        <div className="p-8 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 bg-gold-gradient rounded-xl flex items-center justify-center rotate-12 shadow-[0_0_20px_rgba(245,197,24,0.3)]">
            <span className="text-black font-black text-lg -rotate-12">W</span>
          </div>
          <div>
            <span className="text-2xl font-black tracking-tighter text-gold">وافي <span className="text-white opacity-40 text-sm">Dashboard</span></span>
          </div>
        </div>

        <nav className="flex-1 px-6 py-8 space-y-2 overflow-y-auto">
          <p className="text-[10px] font-black text-text/40 uppercase tracking-widest mb-4 px-4">لوحة القيادة</p>
          {sidebarLinks.map((link) => {
            const isActive = link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link key={link.name} href={link.href} className="block relative group">
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gold/10 border border-gold/20 rounded-2xl shadow-[0_0_15px_rgba(245,197,24,0.1)]"
                  />
                )}
                <div className={`relative flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all duration-300 z-10 ${
                  isActive ? 'text-gold' : 'text-text/60 hover:text-white hover:bg-white/5'
                }`}>
                  <Icon size={20} className={isActive ? 'drop-shadow-[0_0_10px_rgba(245,197,24,0.5)] text-gold' : ''} />
                  {link.name}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center shrink-0">
              <span className="font-black text-gold text-lg">{user?.firstName?.[0] || 'م'}</span>
            </div>
            <div className="truncate">
              <p className="text-sm font-black text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] font-bold text-text/40">{getRoleBadge(role)}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-300 border border-transparent hover:border-red-500/20"
          >
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-80 bg-[#111118] border-l border-white/5 z-50 p-6 flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                <span className="text-xl font-black text-gold">وافي لوحة التحكم</span>
                <button 
                  onClick={() => setIsMobileOpen(false)} 
                  className="text-white/60 hover:text-white font-bold"
                >
                  إغلاق
                </button>
              </div>

              <nav className="flex-1 space-y-2 overflow-y-auto">
                {sidebarLinks.map((link) => {
                  const isActive = link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href);
                  const Icon = link.icon;
                  return (
                    <Link 
                      key={link.name} 
                      href={link.href} 
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all ${
                        isActive ? 'bg-gold/10 text-gold border border-gold/20' : 'text-text/60 hover:text-white'
                      }`}
                    >
                      <Icon size={20} />
                      {link.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-6 border-t border-white/5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center font-black text-gold shrink-0">
                    {user?.firstName?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">{user?.firstName} {user?.lastName}</p>
                    <p className="text-[10px] font-bold text-text/40">{getRoleBadge(role)}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
                >
                  <LogOut size={18} />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Pane */}
      <div className="flex-1 lg:pr-72 relative z-10 flex flex-col min-h-screen">
        
        {/* Header Bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-white/5 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden text-white/80 hover:text-white"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-black text-white hidden md:block">أهلاً {user?.firstName} 👋</h1>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
              <Bell size={20} className="text-text/80" />
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background" />
            </button>
          </div>
        </header>

        {/* Child Router Content */}
        <main className="flex-1 p-8">
          {children}
        </main>

      </div>
    </div>
  );
}
