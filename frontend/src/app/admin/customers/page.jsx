"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, MessageCircle, Ban, Mail, Phone, Calendar, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-hot-toast';

const mockCustomers = [
  { id: "CUST-001", name: "محمد العتيبي", email: "mohammed@example.com", phone: "+966 50 123 4567", joined: "١٢ مايو ٢٠٢٦", orders: 15, isBanned: false },
  { id: "CUST-002", name: "سارة الخالدي", email: "sara.k@example.com", phone: "+966 55 987 6543", joined: "١٠ مايو ٢٠٢٦", orders: 8, isBanned: false },
  { id: "CUST-003", name: "عبدالله السالم", email: "abdullah99@example.com", phone: "+966 54 333 2211", joined: "٠٥ مايو ٢٠٢٦", orders: 2, isBanned: true },
  { id: "CUST-004", name: "نورة الفهد", email: "noura.fhd@example.com", phone: "+966 50 444 5566", joined: "٠١ مايو ٢٠٢٦", orders: 24, isBanned: false },
  { id: "CUST-005", name: "فيصل المطيري", email: "faisal_m@example.com", phone: "+966 56 777 8899", joined: "٢٨ أبريل ٢٠٢٦", orders: 0, isBanned: false },
  { id: "CUST-006", name: "ريم الدوسري", email: "reem.d@example.com", phone: "+966 53 111 2233", joined: "٢٠ أبريل ٢٠٢٦", orders: 11, isBanned: false },
];

export default function CustomersPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const hasAccess = user && (user.role === 'SUPER_ADMIN' || user.permissions?.includes('USER_VIEW'));

  useEffect(() => {
    if (user && !hasAccess) {
      toast.error('غير مصرح لك بدخول هذه الصفحة');
      router.replace('/admin');
    }
  }, [user, hasAccess, router]);

  const [customers, setCustomers] = useState(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');

  if (user && !hasAccess) {
    return null;
  }

  const toggleBan = (id) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, isBanned: !c.isBanned } : c));
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 relative pb-24 font-noto" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white mb-2">إدارة العملاء</h2>
          <p className="text-text/50 font-bold">متابعة حسابات العملاء والتواصل معهم</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-text/40" size={18} />
            <input 
              type="text" 
              placeholder="ابحث بالاسم أو البريد..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-card/60 backdrop-blur-xl border border-white/10 rounded-xl py-2.5 pr-10 pl-4 focus:outline-none focus:border-gold transition-all text-white text-sm font-bold w-full md:w-64"
            />
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111118]/60 backdrop-blur-2xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-right whitespace-nowrap">
            <thead className="bg-white/5 border-b border-white/5">
              <tr>
                <th className="p-5 font-bold text-sm text-text/40">اسم العميل</th>
                <th className="p-5 font-bold text-sm text-text/40">بيانات الاتصال</th>
                <th className="p-5 font-bold text-sm text-text/40">تاريخ التسجيل</th>
                <th className="p-5 font-bold text-sm text-text/40 text-center">الطلبات</th>
                <th className="p-5 font-bold text-sm text-text/40 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={customer.id} 
                    className={`hover:bg-white/5 transition-colors group ${customer.isBanned ? 'opacity-50' : ''}`}
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
                          customer.isBanned ? 'bg-red-500/10 text-red-500' : 'bg-gold/10 text-gold'
                        }`}>
                          {customer.name[0]}
                        </div>
                        <div>
                          <span className={`font-bold block ${customer.isBanned ? 'text-red-400 line-through' : 'text-white'}`}>
                            {customer.name}
                          </span>
                          <span className="text-[10px] text-text/40 font-mono tracking-widest">{customer.id}</span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-5">
                      <div className="flex flex-col gap-1 text-xs font-bold text-white/70">
                        <div className="flex items-center gap-2">
                          <Mail size={12} className="text-text/40" />
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-2 text-text/50">
                          <Phone size={12} className="text-text/40" />
                          <span dir="ltr">{customer.phone}</span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-5">
                      <div className="flex items-center gap-2 text-xs font-bold text-text/60">
                        <Calendar size={14} className="text-text/40" />
                        {customer.joined}
                      </div>
                    </td>
                    
                    <td className="p-5 text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-sm font-black text-gold">
                        <ShoppingBag size={14} className="text-text/60" />
                        {customer.orders}
                      </div>
                    </td>
                    
                    <td className="p-5">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text/60 hover:text-white hover:bg-white/10 transition-colors" title="عرض التفاصيل">
                          <Eye size={14} />
                        </button>
                        <a href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-[#25D366]/10 flex items-center justify-center text-[#25D366] hover:bg-[#25D366]/20 transition-colors" title="مراسلة عبر واتساب">
                          <MessageCircle size={14} />
                        </a>
                        <button 
                          onClick={() => toggleBan(customer.id)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            customer.isBanned 
                              ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' 
                              : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                          }`}
                          title={customer.isBanned ? "إلغاء الحظر" : "حظر المستخدم"}
                        >
                          <Ban size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-16 text-center text-text/40 font-bold">
                    لا يوجد عملاء مطابقين للبحث
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

    </div>
  );
}
