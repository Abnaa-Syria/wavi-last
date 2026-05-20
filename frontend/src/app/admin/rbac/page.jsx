"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Key, CheckSquare, Square, Save, RefreshCw, AlertTriangle, Check, Info, Lock 
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function RbacManagement() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Guard: SUPER_ADMIN only
  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN') {
      toast.error('غير مصرح لك بدخول هذه الصفحة');
      router.replace('/admin');
    }
  }, [user, router]);

  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [activeRoleId, setActiveRoleId] = useState(null);
  const [activeRolePermissions, setActiveRolePermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New Role Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [creatingRole, setCreatingRole] = useState(false);

  useEffect(() => {
    if (user && user.role === 'SUPER_ADMIN') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/auth/roles'),
        api.get('/auth/permissions'),
      ]);

      const fetchedRoles = rolesRes.data?.data?.roles || [];
      const fetchedPerms = permsRes.data?.data?.permissions || [];

      setRoles(fetchedRoles);
      setPermissions(fetchedPerms);

      // Default to SUPPORT role if active role not selected yet
      if (fetchedRoles.length > 0) {
        const supportRole = fetchedRoles.find(r => r.id === 'SUPPORT') || fetchedRoles[0];
        setActiveRoleId(supportRole.id);
        setActiveRolePermissions(supportRole.permissions || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('فشل تحميل سجل الصلاحيات والأدوار');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (roleId) => {
    setActiveRoleId(roleId);
    const selectedRole = roles.find(r => r.id === roleId);
    setActiveRolePermissions(selectedRole?.permissions || []);
  };

  const handlePermissionToggle = (permKey) => {
    if (activeRoleId === 'SUPER_ADMIN') {
      toast.error('صلاحيات المدير الخارق ثابتة للنظام ولا يمكن تقييدها 🛡️');
      return;
    }

    setActiveRolePermissions((prev) => {
      if (prev.includes(permKey)) {
        return prev.filter(p => p !== permKey);
      } else {
        return [...prev, permKey];
      }
    });
  };

  const handleSavePermissions = async () => {
    if (!activeRoleId) return;
    if (activeRoleId === 'SUPER_ADMIN') {
      toast.error('صلاحيات المدير الخارق ثابتة للنظام ولا يمكن تعديلها');
      return;
    }

    setSaving(true);
    try {
      await api.patch(`/auth/roles/${activeRoleId}/permissions`, {
        permissions: activeRolePermissions,
      });

      toast.success(`تم تحديث وحفظ صلاحيات دور (${activeRoleId}) بنجاح 🎉`);
      
      // Refresh local roles mapping data to sync
      const rolesRes = await api.get('/auth/roles');
      setRoles(rolesRes.data?.data?.roles || []);
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء حفظ التحديثات');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      toast.error('يرجى إدخال اسم الدور');
      return;
    }
    setCreatingRole(true);
    try {
      const res = await api.post('/auth/roles', {
        name: newRoleName,
        description: newRoleDesc
      });
      toast.success('تمت إضافة الدور الجديد بنجاح 🎉');
      setIsModalOpen(false);
      setNewRoleName('');
      setNewRoleDesc('');
      
      // Refresh list
      const rolesRes = await api.get('/auth/roles');
      const fetchedRoles = rolesRes.data?.data?.roles || [];
      setRoles(fetchedRoles);
      
      // Set active role to the newly created one
      const newRole = res.data?.data?.role;
      if (newRole) {
        setActiveRoleId(newRole.id);
        setActiveRolePermissions([]);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'فشل إنشاء الدور الجديد');
    } finally {
      setCreatingRole(false);
    }
  };

  if (!user || user.role !== 'SUPER_ADMIN') {
    return null;
  }

  // Group permissions by category
  const groupedPermissions = permissions.reduce((acc, perm) => {
    const cat = perm.category || 'أخرى';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(perm);
    return acc;
  }, {});

  return (
    <div className="space-y-8 font-noto text-white min-h-screen" dir="rtl">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#111118]/60 backdrop-blur-2xl border border-white/5 p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Shield size={32} className="text-gold" /> إدارة صلاحيات الأدوار (RBAC)
          </h1>
          <p className="text-text/60 mt-2 text-sm font-medium">
            تخصيص الصلاحيات الدقيقة وتوزيع المهام على فرق العمل والمشرفين بشكل فوري وتفاعلي.
          </p>
        </div>
        <button 
          onClick={fetchData}
          disabled={loading}
          className="bg-white/5 hover:bg-white/10 text-white font-bold p-4 rounded-2xl flex items-center gap-2 transition-all border border-white/10 shrink-0"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          <span>تحديث البيانات</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
          <span className="text-text/60 font-bold">جاري تحميل مصفوفة الصلاحيات...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Right Column: Roles Cards */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-lg font-black text-white">أدوار النظام المتاحة</h3>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gold-gradient hover:shadow-[0_0_15px_rgba(245,197,24,0.3)] text-black text-xs font-black px-3 py-1.5 rounded-xl transition-all duration-300"
              >
                + إضافة دور جديد
              </button>
            </div>

            <div className="space-y-3">
              {roles.map((roleObj) => {
                const isActive = roleObj.id === activeRoleId;
                const isSuperAdmin = roleObj.id === 'SUPER_ADMIN';
                const isAdmin = roleObj.id === 'ADMIN';

                return (
                  <div
                    key={roleObj.id}
                    onClick={() => handleRoleSelect(roleObj.id)}
                    className={`p-5 rounded-[1.8rem] border transition-all duration-300 cursor-pointer flex flex-col relative overflow-hidden ${
                      isActive 
                        ? 'border-gold/50 bg-gold/15 shadow-[0_0_30px_rgba(245,197,24,0.1)]' 
                        : 'border-white/5 bg-[#111118]/40 hover:border-white/15'
                    }`}
                  >
                    {/* Glowing active indicator */}
                    {isActive && (
                      <div className="absolute top-0 right-0 w-2 h-full bg-gold-gradient" />
                    )}

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-base font-black text-white">{roleObj.name}</span>
                      <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg text-text/50 font-bold font-mono">
                        {roleObj.id}
                      </span>
                    </div>

                    <p className="text-xs text-text/50 font-bold mb-3">
                      {isSuperAdmin 
                        ? 'يمتلك كامل صلاحيات النظام والتحكم المطلق ولا يمكن التقييد.' 
                        : isAdmin
                          ? 'يمتلك صلاحيات الإدارة العادية وتعديل المحتوى والمنتجات تلقائياً.'
                          : `يمتلك عدد (${roleObj.permissions?.length || 0}) صلاحية مخصصة ومحددة.`}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {isSuperAdmin || isAdmin ? (
                        <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Check size={10} /> مرور كامل للمشرفين
                        </span>
                      ) : (
                        <span className="text-[9px] bg-gold/10 border border-gold/20 text-gold font-black px-2 py-0.5 rounded-md">
                          {roleObj.permissions?.length || 0} صلاحيات نشطة
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Warning Box */}
            <div className="p-5 rounded-[1.8rem] border border-red-500/10 bg-red-500/5 text-red-400 text-xs font-bold space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} />
                <span className="font-black text-sm">تنبيه أمني هام</span>
              </div>
              <p className="leading-relaxed">
                أي تعديلات في صلاحيات الأدوار سيتم تطبيقها فورا على جميع الموظفين التابعين لهذا الدور وسيتم تحديث جلساتهم تلقائياً. يرجى توخي الحذر قبل إزالة صلاحيات حساسة.
              </p>
            </div>
          </div>

          {/* Left Column: Interactive Permissions Matrix */}
          <div className="lg:col-span-2 space-y-6 bg-[#111118]/60 backdrop-blur-2xl border border-white/5 p-8 rounded-[2.5rem] relative">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6 flex-wrap gap-4">
              <div>
                <h3 className="text-xl font-black text-white">تخصيص مصفوفة الصلاحيات</h3>
                <p className="text-text/50 text-xs font-bold mt-1">
                  الدور النشط حالياً: <span className="text-gold font-black">({roles.find(r => r.id === activeRoleId)?.name || activeRoleId})</span>
                </p>
              </div>

              {activeRoleId !== 'SUPER_ADMIN' && activeRoleId !== 'ADMIN' && (
                <button
                  onClick={handleSavePermissions}
                  disabled={saving}
                  className="bg-gold-gradient hover:shadow-[0_0_30px_rgba(245,197,24,0.3)] text-black font-black px-6 py-3 rounded-2xl flex items-center gap-2 transition-all duration-300 disabled:opacity-40"
                >
                  {saving ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>جاري حفظ الصلاحيات...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>حفظ الصلاحيات</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {activeRoleId === 'SUPER_ADMIN' || activeRoleId === 'ADMIN' ? (
              <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Lock size={28} className="text-emerald-400" />
                </div>
                <h4 className="text-base font-black text-white">صلاحيات كاملة وغير مقيدة تلقائياً</h4>
                <p className="text-xs text-text/40 font-bold max-w-sm mx-auto leading-relaxed">
                  يتمتع حساب ({activeRoleId}) بحق الوصول المطلق إلى جميع بوابات التحكم والعمليات المتاحة في النظام لضمان استمرارية التشغيل.
                </p>
              </div>
            ) : (
              <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                  <div key={category} className="space-y-4">
                    <h4 className="text-sm font-black text-white/50 bg-white/5 px-4 py-2.5 rounded-xl border border-white/5 flex items-center gap-2">
                      <Key size={14} className="text-gold" /> {category}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {perms.map((perm) => {
                        const isChecked = activeRolePermissions.includes(perm.key);

                        return (
                          <div
                            key={perm.key}
                            onClick={() => handlePermissionToggle(perm.key)}
                            className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between select-none ${
                              isChecked 
                                ? 'border-gold/30 bg-gold/5 text-white' 
                                : 'border-white/5 bg-white/[0.01] hover:border-white/10 text-text/60'
                            }`}
                          >
                            <div className="space-y-1 pr-1">
                              <p className={`text-xs font-black ${isChecked ? 'text-white' : 'text-text/80'}`}>
                                {perm.label}
                              </p>
                              <span className="text-[9px] text-text/30 font-mono font-bold uppercase">{perm.key}</span>
                            </div>
                            
                            <div className="shrink-0 text-gold mr-3">
                              {isChecked ? (
                                <CheckSquare size={20} className="fill-gold/10" />
                              ) : (
                                <Square size={20} className="text-white/20" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      )}

      {/* Create Custom Role Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111118] border border-white/10 rounded-[2rem] w-full max-w-md p-8 relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] font-noto text-right"
            >
              <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2 justify-end">
                إضافة دور جديد للنظام <Shield size={20} className="text-gold" />
              </h3>
              <p className="text-xs text-text/50 mb-6 font-bold">قم بتعريف اسم الدور الجديد ووصف الصلاحيات العامة المرتبطة به.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-white/70 mb-2">اسم الدور (باللغة الإنجليزية/العربية)</label>
                  <input
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="مثال: SALES or مبيعات"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-gold/50 transition-all font-bold text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-white/70 mb-2">وصف الدور</label>
                  <textarea
                    value={newRoleDesc}
                    onChange={(e) => setNewRoleDesc(e.target.value)}
                    placeholder="اكتب وصفاً مختصراً لمهام هذا الدور..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-gold/50 transition-all font-bold resize-none text-right"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleCreateRole}
                  disabled={creatingRole}
                  className="flex-1 bg-gold-gradient text-black font-black py-3 rounded-xl hover:shadow-[0_0_20px_rgba(245,197,24,0.3)] transition-all duration-300 text-sm disabled:opacity-40"
                >
                  {creatingRole ? 'جاري الحفظ...' : 'حفظ الدور الجديد'}
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black py-3 rounded-xl border border-white/10 transition-all text-sm"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
