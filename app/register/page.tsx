"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/shoofly/button';
import { FiUser, FiMail, FiLock, FiBriefcase, FiShield, FiTruck } from 'react-icons/fi';
import { registerUser } from '@/lib/api/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CLIENT');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await registerUser({ fullName, email, password, role: role as any });
      router.push('/login?registered=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل إنشاء الحساب. يرجى مراجعة البيانات.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 py-8 text-right dir-rtl font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Logo & Welcome */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-white mb-2">
            <FiShield size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">إنشاء حساب</h1>
          <p className="text-slate-500 text-sm">انضم إلى منصة شوفلي</p>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">الاسم بالكامل</label>
              <div className="relative">
                <FiUser className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="أدخل اسمك الثلاثي" 
                  className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary focus:bg-white outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">البريد الإلكتروني</label>
              <div className="relative">
                <FiMail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com" 
                  className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary focus:bg-white outline-none transition-all text-left"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">نوع الحساب</label>
              <div className="grid grid-cols-3 gap-2">
                 <RoleCard 
                    active={role === 'CLIENT'} 
                    onClick={() => setRole('CLIENT')} 
                    icon={<FiUser />} 
                    label="عميل" 
                 />
                 <RoleCard 
                    active={role === 'VENDOR'} 
                    onClick={() => setRole('VENDOR')} 
                    icon={<FiBriefcase />} 
                    label="تاجر" 
                 />
                 <RoleCard 
                    active={role === 'DELIVERY'} 
                    onClick={() => setRole('DELIVERY')} 
                    icon={<FiTruck />} 
                    label="مندوب" 
                 />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">كلمة المرور</label>
              <div className="relative">
                <FiLock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary focus:bg-white outline-none transition-all text-left"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium rounded-xl mt-2" 
              isLoading={isLoading}
            >
               إنشاء حساب
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
             <p className="text-sm text-slate-500">
               لديك حساب بالفعل؟ <Link href="/login" className="text-primary font-medium hover:underline">سجل دخولك</Link>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoleCard({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <div 
      onClick={onClick}
      className={`cursor-pointer p-3 rounded-xl border transition-all flex flex-col items-center gap-2 group ${
        active 
          ? "bg-primary/5 border-primary text-primary" 
          : "bg-slate-50 border-slate-200 text-slate-600 hover:border-primary/50 hover:bg-white"
      }`}
    >
       <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-colors ${
         active ? "bg-primary text-white" : "bg-white border border-slate-200 text-slate-500 group-hover:border-primary/30"
       }`}>
         {icon}
       </div>
       <span className="text-xs font-medium">{label}</span>
    </div>
  );
}
