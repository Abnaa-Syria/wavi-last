"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Mail, MessageSquare, ShieldAlert, ShieldCheck, User, Calendar, Copy, Check, Shield 
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function UsersManagement() {
  const router = useRouter();
  const { user } = useAuthStore();

  const hasAccess = user && (user.role === 'SUPER_ADMIN' || user.permissions?.includes('USER_VIEW'));

  useEffect(() => {
    if (user && !hasAccess) {
      toast.error('غير مصرح لك بدخول هذه الصفحة');
      router.replace('/admin');
    }
  }, [user, hasAccess, router]);

  if (user && !hasAccess) {
    return null;
  }

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Add User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'SUPPORT'
  });
  const [creatingUser, setCreatingUser] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async (searchQuery = '') => {
    try {
      setLoading(true);
      const res = await api.get('/users', {
        params: { search: searchQuery || undefined }
      });
      const userList = res.data?.data?.users || res.data?.data || [];
      setUsers(userList);
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await api.get('/auth/roles');
      setRoles(res.data?.data?.roles || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const handleSearchClear = () => {
    setSearch('');
    fetchUsers('');
  };

  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('تم النسخ إلى الحافظة');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getWhatsappLink = (phone) => {
    if (!phone) return '#';
    let cleaned = phone.replace(/\D/g, ''); // strip non-digits
    if (cleaned.startsWith('05')) {
      cleaned = '966' + cleaned.substring(1);
    } else if (cleaned.startsWith('5') && cleaned.length === 9) {
      cleaned = '966' + cleaned;
    }
    return `https://wa.me/${cleaned}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleUserRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      toast.success('تم تحديث دور المستخدم بنجاح 🎉');
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'فشل تحديث دور المستخدم');
    }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setCreatingUser(true);
    try {
      await api.post('/users/create', formData);
      toast.success('تم إنشاء حساب المستخدم/الموظف بنجاح 🎉');
      setIsAddUserOpen(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        role: 'SUPPORT'
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'فشل إنشاء المستخدم');
    } finally {
      setCreatingUser(false);
    }
  };

  return (
    <div className="space-y-8 font-noto text-white" dir="rtl">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#111118]/60 backdrop-blur-2xl border border-white/5 p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">سجل العملاء والمستخدمين</h1>
          <p className="text-text/60 mt-2 text-sm font-medium">إدارة ومراقبة حسابات العملاء والطاقم الإداري المسجلين بالمنصة.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddUserOpen(true)}
            className="bg-gold-gradient text-black font-black px-6 py-3.5 rounded-2xl hover:shadow-[0_0_20px_rgba(245,197,24,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-sm"
          >
            + إضافة مستخدم / موظف جديد
          </button>
          <div className="bg-gold/10 border border-gold/20 text-gold font-bold px-4 py-3.5 rounded-2xl text-sm">
            إجمالي المسجلين: {users.length}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111118]/60 backdrop-blur-2xl border border-white/5 p-6 rounded-[2rem]">
        <form onSubmit={handleSearchSubmit} className="flex gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن مستخدم بالاسم، البريد الإلكتروني، أو رقم الهاتف..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white placeholder-white/30 focus:border-gold/50 focus:outline-none transition-all duration-300 font-medium text-right"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
          </div>
          <button
            type="submit"
            className="bg-gold-gradient text-black font-black px-8 py-4 rounded-2xl hover:shadow-[0_0_20px_rgba(245,197,24,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            بحث
          </button>
          {search && (
            <button
              type="button"
              onClick={handleSearchClear}
              className="bg-white/5 hover:bg-white/10 text-white font-bold px-6 py-4 rounded-2xl transition-all duration-300"
            >
              إلغاء
            </button>
          )}
        </form>
      </div>

      {/* Users Table List */}
      <div className="bg-[#111118]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-text/40 text-xs font-black uppercase tracking-wider">
                <th className="px-8 py-5">المستخدم</th>
                <th className="px-6 py-5">معلومات التواصل</th>
                <th className="px-6 py-5">الدور الوظيفي</th>
                <th className="px-6 py-5">حالة الحساب</th>
                <th className="px-8 py-5">تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm font-medium text-white">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 justify-center">
                      <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                      <span className="text-text/60 font-bold">جاري تحميل سجل المستخدمين...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-text/40 font-bold">
                    لا يوجد أي مستخدمين يطابقون خيارات البحث.
                  </td>
                </tr>
              ) : (
                users.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors duration-300">
                    
                    {/* User profile & Name */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center shrink-0">
                          <User size={18} className="text-gold" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-base">
                            {item.firstName} {item.lastName}
                          </p>
                          <span className="text-xs text-text/40 font-mono">ID: {item.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Email and Phone */}
                    <td className="px-6 py-5 space-y-2">
                      <div className="flex items-center gap-3 text-text/80">
                        <Mail size={15} className="text-white/40" />
                        <span className="hover:text-white transition-colors">{item.email}</span>
                        <button
                          onClick={() => handleCopyText(item.email, `mail-${item.id}`)}
                          className="text-white/30 hover:text-gold transition-colors"
                        >
                          {copiedId === `mail-${item.id}` ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                      {item.phone ? (
                        <div className="flex items-center gap-3">
                          <MessageSquare size={15} className="text-emerald-400/80" />
                          <span className="text-text/80">{item.phone}</span>
                          <a
                            href={getWhatsappLink(item.phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1.5 transition-all duration-300 font-bold"
                          >
                            واتساب
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-text/30 italic">لا يوجد رقم هاتف</span>
                      )}
                    </td>

                    {/* Role selector dropdown */}
                    <td className="px-6 py-5">
                      <select
                        value={item.role}
                        onChange={(e) => handleUserRoleChange(item.id, e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-black text-white focus:outline-none focus:border-gold/50 cursor-pointer transition-all"
                      >
                        {roles.map((r) => (
                          <option key={r.id} value={r.id} className="bg-[#111118] text-white font-bold">
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Ban / Active status */}
                    <td className="px-6 py-5">
                      {item.isBanned ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-black">
                          <ShieldAlert size={14} />
                          <span>محظور</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-green-500/20 bg-green-500/10 text-green-400 text-xs font-black">
                          <ShieldCheck size={14} />
                          <span>نشط</span>
                        </span>
                      )}
                    </td>

                    {/* Registration date */}
                    <td className="px-8 py-5 text-text/60">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-white/20" />
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {isAddUserOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddUserOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111118] border border-white/10 rounded-[2.5rem] w-full max-w-lg p-8 relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] font-noto text-right"
            >
              <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2 justify-end">
                إضافة مستخدم / موظف جديد <Shield size={20} className="text-gold" />
              </h3>
              <p className="text-xs text-text/50 mb-6 font-bold">يرجى تعبئة بيانات المستخدم الجديد مع تحديد دوره الوظيفي والصلاحيات المناسبة له.</p>

              <form onSubmit={handleAddUserSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-white/70 mb-2">الاسم الأخير</label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="العتيبي"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-gold/50 transition-all font-bold text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-white/70 mb-2">الاسم الأول</label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="خالد"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-gold/50 transition-all font-bold text-right"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-white/70 mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="name@wavi.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-gold/50 transition-all font-bold text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-white/70 mb-2">كلمة المرور</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-gold/50 transition-all font-bold text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-white/70 mb-2">رقم الواتساب (اختياري)</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="05xxxxxxx"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-gold/50 transition-all font-bold text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-white/70 mb-2">الدور الوظيفي</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full bg-[#111118] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-gold/50 cursor-pointer transition-all font-bold"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id} className="bg-[#111118] text-white font-bold">
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    type="submit"
                    disabled={creatingUser}
                    className="flex-1 bg-gold-gradient text-black font-black py-3 rounded-xl hover:shadow-[0_0_20px_rgba(245,197,24,0.3)] transition-all duration-300 text-sm disabled:opacity-40"
                  >
                    {creatingUser ? 'جاري إنشاء الحساب...' : 'تأكيد إنشاء الحساب'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddUserOpen(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black py-3 rounded-xl border border-white/10 transition-all text-sm"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
