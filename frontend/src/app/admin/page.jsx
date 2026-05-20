"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CircleDollarSign, ShoppingBag, Layers, Eye, Ticket, AlertCircle, 
  ArrowRightLeft, Clock, ShieldAlert, BadgeAlert, Layers2, User
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

// Sparkline stub for active state
const sparklineData = [
  { val: 15 }, { val: 20 }, { val: 18 }, { val: 35 }, { val: 30 }, { val: 55 }, { val: 75 }
];

const mockChartData = [
  { name: 'الأحد', total: 100 },
  { name: 'الإثنين', total: 250 },
  { name: 'الثلاثاء', total: 150 },
  { name: 'الأربعاء', total: 400 },
  { name: 'الخميس', total: 300 },
  { name: 'الجمعة', total: 500 },
  { name: 'السبت', total: 350 },
];

const StatCard = ({ title, value, icon: Icon, trend, delay, isGold = false, loading = false }) => {
  const isZeroOrLoading = loading || value === 0 || value === '0' || value === '0 ر.س';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[#111118]/60 backdrop-blur-2xl border border-white/5 p-6 rounded-[2rem] flex flex-col relative overflow-hidden group hover:border-gold/30 transition-all duration-300"
    >
      {/* Ghost Icon */}
      <Icon className="absolute -right-6 -bottom-6 w-32 h-32 text-white/[0.03] group-hover:text-gold/[0.06] pointer-events-none transition-colors duration-500" />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <p className="text-text/60 font-bold text-sm mb-1">{title}</p>
          <h3 className={`text-3xl font-black ${isGold ? 'text-gold' : 'text-white'}`}>{value}</h3>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative shrink-0">
          <div className="absolute inset-0 bg-gold/20 blur-xl group-hover:bg-gold/40 transition-colors" />
          <Icon size={24} className="text-gold relative z-10" />
        </div>
      </div>
      
      <div className="mt-auto flex items-center justify-between relative z-10">
        <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">+{trend}%</span>
        <div className="h-8 w-24 relative overflow-hidden">
          {isZeroOrLoading ? (
            /* Shimmer wave */
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-full h-1 bg-white/10 rounded overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold to-transparent w-1/2 animate-shimmer-custom" />
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line type="monotone" dataKey="val" stroke="#F5C518" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const TableSkeleton = () => (
  <div className="divide-y divide-white/5">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="p-5 flex items-center justify-between animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5" />
          <div className="space-y-2">
            <div className="h-4 w-24 bg-white/10 rounded" />
            <div className="h-3 w-16 bg-white/5 rounded" />
          </div>
        </div>
        <div className="h-4 w-20 bg-white/10 rounded" />
        <div className="h-6 w-16 bg-white/5 rounded-full" />
      </div>
    ))}
  </div>
);

const SupportSkeleton = () => (
  <div className="p-5 space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex gap-4 items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/5" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-white/10 rounded" />
            <div className="h-3 w-20 bg-white/5 rounded" />
          </div>
        </div>
        <div className="h-6 w-14 bg-white/5 rounded-full" />
      </div>
    ))}
  </div>
);

export default function AdminOverview() {
  const { user, _hasHydrated, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [productsCount, setProductsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);

  useEffect(() => {
    if (!_hasHydrated || !isAuthenticated || !user) return;
    fetchDashboardData();
  }, [_hasHydrated, isAuthenticated, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const ordersRes = await api.get('/orders');
      const fetchedOrders = ordersRes.data?.data?.orders || [];
      setOrders(fetchedOrders);

      const ticketsRes = await api.get('/support');
      const fetchedTickets = ticketsRes.data?.data?.tickets || [];
      setTickets(fetchedTickets);

      const role = user?.role;
      if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        const productsRes = await api.get('/products');
        const fetchedProducts = productsRes.data?.data?.products || [];
        setProductsCount(fetchedProducts.length);
      }

      const hasUserView = user && (user.role === 'SUPER_ADMIN' || user.permissions?.includes('USER_VIEW'));
      if (hasUserView) {
        const usersRes = await api.get('/users');
        const fetchedUsers = usersRes.data?.data?.users || usersRes.data?.data || [];
        setUsersCount(fetchedUsers.length);
      }
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء تحميل بيانات لوحة القيادة');
    } finally {
      setLoading(false);
    }
  };

  const role = user?.role || 'SUPPORT';
  const isSupport = role === 'SUPPORT';

  // Compute live metrics
  const completedOrders = orders.filter(o => o.status === 'COMPLETED');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length;
  const activeTicketsCount = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;

  const hasRevenue = totalRevenue > 0;

  // Chart data: Group orders by date (last 7 days)
  const getChartData = () => {
    const daysMap = { 0: 'الأحد', 1: 'الإثنين', 2: 'الثلاثاء', 3: 'الأربعاء', 4: 'الخميس', 5: 'الجمعة', 6: 'السبت' };
    const chartMap = {};

    // Seed recent 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = daysMap[d.getDay()];
      chartMap[dayName] = 0;
    }

    // Populate order totals
    completedOrders.forEach(o => {
      const orderDate = new Date(o.createdAt);
      const dayName = daysMap[orderDate.getDay()];
      if (chartMap[dayName] !== undefined) {
        chartMap[dayName] += Number(o.totalAmount || 0);
      }
    });

    return Object.entries(chartMap).map(([name, total]) => ({ name, total }));
  };

  const salesChartData = hasRevenue ? getChartData() : mockChartData;

  const sourceData = [
    { name: 'اشتراكات سمارترز', value: 45, color: '#F5C518' },
    { name: 'اشتراكات فالكون برو', value: 35, color: '#6366F1' },
    { name: 'أجهزة Xiaomi TV', value: 20, color: '#10B981' },
  ];

  const getOrderStatusLabel = (status) => {
    const s = status?.toUpperCase();
    if (s === 'PENDING') return { text: 'قيد المراجعة', class: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
    if (s === 'PROCESSING') return { text: 'قيد التنفيذ', class: 'text-blue-400 bg-blue-400/10 border-blue-400/20' };
    if (s === 'COMPLETED') return { text: 'مكتمل', class: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' };
    return { text: 'ملغي', class: 'text-red-400 bg-red-400/10 border-red-400/20' };
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-[2rem] animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 h-[350px] bg-white/5 rounded-3xl animate-pulse" />
          <div className="h-[350px] bg-white/5 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-noto">
      {/* Global CSS Styles for custom animations */}
      <style>{`
        @keyframes shimmer-glow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer-custom {
          animation: shimmer-glow 1.8s infinite linear;
        }
      `}</style>
      
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {!isSupport ? (
          <StatCard 
            title="إجمالي الإيرادات (المبيعات المكتملة)" 
            value={`${totalRevenue.toLocaleString('ar-EG')} ر.س`} 
            icon={CircleDollarSign} 
            trend="14.2" 
            delay={0.1}
            isGold={true}
            loading={loading}
          />
        ) : (
          <div className="bg-[#111118]/60 backdrop-blur-2xl border border-white/5 p-6 rounded-[2rem] flex flex-col justify-center items-center text-center relative overflow-hidden">
            <AlertCircle size={32} className="text-gold mb-2" />
            <h4 className="text-sm font-black text-white">لوحة الدعم والمتابعة</h4>
            <p className="text-[10px] text-text/40 font-bold mt-1">تقتصر صلاحيات حسابك على التذاكر والطلبات</p>
          </div>
        )}
        
        <StatCard title="الطلبات المعلقة والنشطة" value={pendingOrdersCount} icon={ShoppingBag} trend="5.8" delay={0.2} loading={loading} />
        <StatCard title="البطاقات وتذاكر الدعم النشطة" value={activeTicketsCount} icon={Ticket} trend="12.3" delay={0.3} loading={loading} />
        
        {!isSupport ? (
          <StatCard title="المنتجات المتوفرة" value={productsCount} icon={Layers} trend="2.1" delay={0.4} loading={loading} />
        ) : (
          <StatCard title="إجمالي طلبات النظام" value={orders.length} icon={ShoppingBag} trend="4.4" delay={0.4} loading={loading} />
        )}

        {(user?.role === 'SUPER_ADMIN' || user?.permissions?.includes('USER_VIEW')) && (
          <StatCard 
            title="إجمالي الأعضاء والمستخدمين" 
            value={usersCount} 
            icon={User} 
            trend="8.4" 
            delay={0.5} 
            loading={loading} 
          />
        )}
      </div>

      {/* Charts Section - Hiding financial graphics if SUPPORT role */}
      {!isSupport && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Sales Area Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="xl:col-span-2 bg-[#111118]/60 backdrop-blur-2xl border border-white/5 p-6 rounded-3xl relative overflow-hidden"
          >
            <div className="mb-6">
              <h3 className="text-xl font-black text-white">إحصائيات الإيرادات (أسبوعي)</h3>
              <p className="text-text/50 font-bold text-sm">توزيع حجم المبيعات المكتملة خلال الأيام السبعة الماضية</p>
            </div>
            
            <div className="h-[300px] w-full relative" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F5C518" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F5C518" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} ر.س`} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F0F0F', borderColor: '#ffffff20', borderRadius: '16px' }}
                    itemStyle={{ color: '#F5C518', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#F5C518" 
                    strokeWidth={3} 
                    strokeDasharray={hasRevenue ? undefined : "5 5"}
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                  />
                </AreaChart>
              </ResponsiveContainer>

              {/* Faint Dotted Empty State overlay */}
              {!hasRevenue && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1px] rounded-3xl p-6 text-center">
                  <AlertCircle size={40} className="text-gold/60 mb-3 animate-pulse" />
                  <h4 className="text-white font-black text-lg max-w-md mb-1 leading-relaxed">
                    في انتظار استقبال أولى مبيعاتك هذا الأسبوع ليتم رسم المخطط الحركي لايف
                  </h4>
                  <p className="text-text/40 text-xs font-bold">
                    سيتم تحديث هذا الرسم البياني تلقائياً بمجرد إكمال أي طلب جديد في النظام
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Source Pie Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-[#111118]/60 backdrop-blur-2xl border border-white/5 p-6 rounded-3xl flex flex-col"
          >
            <div className="mb-2">
              <h3 className="text-xl font-black text-white">توزيع مصادر الإيرادات</h3>
              <p className="text-text/50 font-bold text-sm">مبيعات المنتجات حسب العلامة التجارية</p>
            </div>
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F0F0F', borderColor: '#ffffff20', borderRadius: '16px' }}
                    itemStyle={{ fontWeight: 'bold', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 gap-2.5 mt-4">
              {sourceData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-bold text-white/80">{item.name}</span>
                  </div>
                  <span className="text-xs font-black text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Bottom Grid Expansion (Split Screen View) */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        
        {/* Right Column: Recent Orders (60% / 3 cols) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="xl:col-span-3 bg-[#111118]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRightLeft size={18} className="text-gold" />
                <h3 className="text-lg font-black text-white">أحدث الطلبات المستلمة في النظام</h3>
              </div>
              <Link href="/admin/orders" className="text-xs font-bold text-gold hover:underline">عرض الكل ←</Link>
            </div>
            
            <div className="overflow-x-auto">
              {orders.length === 0 ? (
                <TableSkeleton />
              ) : (
                <table className="w-full text-right">
                  <thead className="bg-white/5 text-text/40 font-bold text-xs">
                    <tr>
                      <th className="p-5 rounded-tr-xl">رقم الطلب</th>
                      <th className="p-5">العميل</th>
                      <th className="p-5">المبلغ الإجمالي</th>
                      <th className="p-5">الحالة</th>
                      <th className="p-5 rounded-tl-xl text-left">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="text-white text-xs font-bold divide-y divide-white/5">
                    {orders.slice(0, 5).map((order) => {
                      const statusInfo = getOrderStatusLabel(order.status);
                      const formattedDate = new Date(order.createdAt).toLocaleDateString('ar-EG', {
                        month: 'short',
                        day: 'numeric'
                      });

                      return (
                        <tr key={order.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-5 text-gold">#{order.orderNo || order.id.slice(-6).toUpperCase()}</td>
                          <td className="p-5">{order.customer?.firstName} {order.customer?.lastName}</td>
                          <td className="p-5 font-black text-white">{Number(order.totalAmount || 0).toLocaleString('ar-EG')} ر.س</td>
                          <td className="p-5">
                            <span className={`px-3 py-1 rounded-full border text-[10px] ${statusInfo.class}`}>
                              {statusInfo.text}
                            </span>
                          </td>
                          <td className="p-5 text-left text-text/40">{formattedDate}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </motion.div>

        {/* Left Column: Recent Support Tickets Feed (40% / 2 cols) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="xl:col-span-2 bg-[#111118]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-gold" />
                <h3 className="text-lg font-black text-white">أحدث تذاكر الدعم الفني المعلقة</h3>
              </div>
              <Link href="/admin/tickets" className="text-xs font-bold text-gold hover:underline">عرض الكل ←</Link>
            </div>

            <div className="divide-y divide-white/5">
              {tickets.length === 0 ? (
                <SupportSkeleton />
              ) : (
                tickets.slice(0, 5).map((ticket) => {
                  const isUrgent = ticket.priority === 'URGENT' || ticket.priority === 'HIGH';
                  const isOpen = ticket.status === 'OPEN';

                  return (
                    <div key={ticket.id} className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isUrgent ? 'bg-red-500/10 text-red-500' : 'bg-gold/10 text-gold'
                        }`}>
                          <Ticket size={20} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-white text-sm group-hover:text-gold transition-colors line-clamp-1">
                            {ticket.subject}
                          </h4>
                          <p className="text-xs text-text/40 font-bold mt-1">
                            العميل: {ticket.customer?.firstName} {ticket.customer?.lastName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isUrgent && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-500/10 text-red-400 border border-red-500/20">
                            عاجل
                          </span>
                        )}
                        {isOpen ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            قيد الانتظار
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-400/10 text-blue-400 border border-blue-400/20">
                            تحت المعالجة
                          </span>
                        )}
                        <Link 
                          href="/admin/tickets" 
                          className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text/60 hover:text-white hover:bg-gold/20 hover:text-gold transition-all"
                        >
                          <Eye size={14} />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
