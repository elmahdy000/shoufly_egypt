"use client";

import { useState, useMemo } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatCurrency } from "@/lib/formatters";
import { FiUsers, FiUserCheck, FiUserX, FiShield, FiSearch, FiFilter, FiMoreVertical, FiStar, FiMail, FiPhone, FiCheck, FiX, FiAlertCircle, FiArrowLeft, FiActivity } from "react-icons/fi";
import { Button } from "@/components/shoofly/button";

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'VENDORS_PENDING' | 'REPORTS'>('ALL');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data: users, loading, error } = useAsyncData<any[]>(() => apiFetch("/api/admin/users", "ADMIN"), []);
  
  if (error) {
    console.error("Users API Error:", error);
  }
  
  // حساب الإحصائيات ديناميكياً
  const stats = useMemo(() => {
    const allUsers = users ?? [];
    const pendingVendors = allUsers.filter((u: any) => u.role === 'VENDOR' && !u.isVerified).length;
    const vipClients = allUsers.filter((u: any) => u.role === 'CLIENT' && (u.wallet?.balance > 1000 || u.totalSpent > 5000)).length;
    return {
      total: allUsers.length,
      pendingVendors,
      vipClients,
      activeNow: Math.min(allUsers.length, 42), // placeholder until we have real-time data
    };
  }, [users]);

  return (
    <div className="p-8 lg:p-12 max-w-[1600px] mx-auto space-y-8 dir-rtl text-right font-sans">
        {/* Error Display */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
            <p className="font-bold">خطأ في تحميل البيانات:</p>
            <p>{error}</p>
            <p className="mt-2 text-xs">تأكد من تسجيل الدخول كـ Admin</p>
          </div>
        )}
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">إدارة المستخدمين</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">التحكم في العملاء والموردين.</p>
          </div>
          
          <div className="relative w-full md:w-72 group">
             <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-all" />
             <input 
               type="text" 
               placeholder="بحث بالاسم..." 
               className="w-full pr-12 pl-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-primary transition-all"
             />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {[
             { label: 'إجمالي المشتركين', val: loading ? '...' : stats.total, icon: <FiUsers />, bg: 'bg-blue-50', color: 'text-blue-600' },
             { label: 'طلبات توثيق', val: loading ? '...' : stats.pendingVendors, icon: <FiShield />, bg: 'bg-amber-50', color: 'text-amber-600' },
             { label: 'VIP عملاء', val: loading ? '...' : stats.vipClients, icon: <FiStar />, bg: 'bg-rose-50', color: 'text-rose-600' },
             { label: 'نشط الآن', val: loading ? '...' : stats.activeNow, icon: <FiUserCheck />, bg: 'bg-emerald-50', color: 'text-emerald-600' },
           ].map((s, i) => (
             <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${s.bg} ${s.color} flex items-center justify-center text-xl`}>
                  {s.icon}
                </div>
                <div>
                   <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                   <p className="text-2xl font-bold text-slate-900">{s.val}</p>
                </div>
             </div>
           ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
           {[
             { id: 'ALL', label: 'الجميع', icon: <FiUsers /> },
             { id: 'VENDORS_PENDING', label: 'التوثيق', icon: <FiShield />, count: loading ? 0 : stats.pendingVendors },
             { id: 'REPORTS', label: 'البلاغات', icon: <FiAlertCircle /> },
           ].map((t) => (
             <button 
               key={t.id}
               onClick={() => setActiveTab(t.id as any)}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                 activeTab === t.id 
                   ? 'bg-slate-900 text-white' 
                   : 'text-slate-600 hover:bg-slate-100'
               }`}
             >
               {t.icon} {t.label}
               {t.count ? <span className="bg-primary/20 text-white text-xs px-2 py-0.5 rounded-full">{t.count}</span> : null}
             </button>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           {/* Users Table */}
           <div className="lg:col-span-8">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                 <table className="w-full text-right">
                    <thead className="bg-slate-50 border-b border-slate-200">
                       <tr>
                          <th className="py-3 px-6 text-xs font-semibold text-slate-500">المستخدم</th>
                          <th className="py-3 px-6 text-xs font-semibold text-slate-500 text-center">النوع</th>
                          <th className="py-3 px-6 text-xs font-semibold text-slate-500 text-center">الحالة</th>
                          <th className="py-3 px-6 text-xs font-semibold text-slate-500 text-center">التقييم</th>
                          <th className="py-3 px-6"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {loading ? (
                         <tr><td colSpan={5} className="py-12 text-center text-slate-400 text-sm font-medium">جاري تحميل المستخدمين...</td></tr>
                       ) : users?.map((u) => (
                         <tr 
                          key={u.id} 
                          className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${selectedUser?.id === u.id ? 'bg-primary/5' : ''}`}
                          onClick={() => setSelectedUser(u)}
                         >
                            <td className="py-4 px-6">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden">
                                    <img src={`https://ui-avatars.com/api/?name=${u.name}&background=fff&color=0f172a&bold=true`} alt={u.name} />
                                  </div>
                                  <div>
                                     <p className="font-semibold text-slate-900">{u.name}</p>
                                     <p className="text-xs text-slate-400">{u.email}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="py-4 px-6 text-center">
                               <span className={`text-xs font-medium px-3 py-1 rounded-lg ${
                                 u.role === 'VENDOR' ? 'bg-amber-50 text-amber-600' : 
                                 u.role === 'ADMIN' ? 'bg-slate-900 text-white' : 
                                 'bg-slate-100 text-slate-600'
                               }`}>
                                 {u.role}
                               </span>
                            </td>
                            <td className="py-4 px-6 text-center">
                               <div className="flex items-center justify-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${u.isVerified ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                  <p className="text-xs text-slate-600">{u.isVerified ? 'موثق' : 'قيد الانتظار'}</p>
                               </div>
                            </td>
                            <td className="py-4 px-6 text-center text-sm font-medium text-slate-900">
                               {u.avgRating ? `${u.avgRating.toFixed(1)} ⭐` : '---'}
                            </td>
                            <td className="py-4 px-6 text-left">
                               <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><FiArrowLeft size={16} /></button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* User Profile */}
           <div className="lg:col-span-4 space-y-6">
              {selectedUser ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden">
                         <img src={`https://ui-avatars.com/api/?name=${selectedUser.name}&background=fff&color=0f172a&bold=true`} alt="User" />
                      </div>
                      <div className="flex-1">
                         <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-slate-900">{selectedUser.name}</h3>
                            {selectedUser.isVerified && <FiCheck className="text-emerald-500" size={16} />}
                         </div>
                         <p className="text-xs text-slate-400">{selectedUser.email}</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                      <div className="p-4 bg-slate-50 rounded-xl text-center">
                         <p className="text-xs text-slate-400">المحفظة</p>
                         <p className="text-lg font-bold text-slate-900">{formatCurrency(selectedUser.wallet?.balance || 0)}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl text-center">
                         <p className="text-xs text-slate-400">الأداء</p>
                         <p className="text-lg font-bold text-emerald-600">{selectedUser.successRate || '---'}{selectedUser.successRate ? '%' : ''}</p>
                      </div>
                   </div>

                   <div className="space-y-3 pt-4 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-400">الإجراءات</p>
                      <div className="grid gap-2">
                         {selectedUser.role === 'VENDOR' && (
                           <Button 
                             variant={selectedUser.isVerified ? 'secondary' : 'primary'}
                             className="w-full"
                           >
                             {selectedUser.isVerified ? 'إلغاء التوثيق' : 'توثيق الحساب'}
                           </Button>
                         )}
                         <Button variant="danger" className="w-full">
                            <FiUserX size={16} /> حظر الحساب
                         </Button>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4">
                   <FiUsers size={32} className="text-slate-300" />
                   <p className="text-sm text-slate-400">اختر مستخدم لعرض التفاصيل</p>
                </div>
              )}
           </div>
        </div>
    </div>
  );
}
