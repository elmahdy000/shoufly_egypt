"use client";

import Link from "next/link";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatDate } from "@/lib/formatters";
import {
  FiArrowRight, FiMessageSquare, FiUser, FiRefreshCw, FiInbox
} from "react-icons/fi";

interface Conversation {
  partnerId: number;
  requestId: number | null;
  name: string;
  role: string;
  lastMsg: string;
  time: string;
}

const roleLabel: Record<string, string> = {
  VENDOR: 'تاجر',
  DELIVERY: 'مندوب',
  ADMIN: 'إدارة',
  CLIENT: 'عميل',
};

export default function ChatListPage() {
  const { data, loading, error, refresh } = useAsyncData<Conversation[]>(
    () => apiFetch('/api/messages/conversations', 'CLIENT'), []
  );

  return (
    <div className="p-5 max-w-2xl mx-auto space-y-4 font-sans text-right pb-28" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/client" className="text-sm text-slate-500 hover:text-primary flex items-center gap-1 mb-1">
            <FiArrowRight size={14} /> الرئيسية
          </Link>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FiMessageSquare className="text-primary" size={20} /> المحادثات
          </h1>
        </div>
        <button onClick={refresh} className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
          <FiRefreshCw size={16} />
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 animate-pulse">
              <div className="w-12 h-12 bg-slate-100 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-32" />
                <div className="h-3 bg-slate-100 rounded w-48" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm p-4 rounded-2xl">
          {error}
        </div>
      )}

      {!loading && !error && (data?.length ?? 0) === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
            <FiInbox size={28} />
          </div>
          <h3 className="font-semibold text-slate-800 mb-1">لا توجد محادثات</h3>
          <p className="text-sm text-slate-400">ستظهر هنا محادثاتك مع التجار والمندوبين</p>
        </div>
      )}

      {!loading && !error && (data ?? []).length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
          {(data ?? []).map((conv) => (
            <Link
              key={`${conv.partnerId}-${conv.requestId}`}
              href={`/client/chat/${conv.partnerId}?requestId=${conv.requestId}`}
              className="flex items-center gap-3 px-4 py-4 hover:bg-slate-50 transition-colors"
            >
              <div className="w-11 h-11 bg-violet-100 rounded-full flex items-center justify-center shrink-0 text-violet-600 font-bold text-sm">
                {conv.name?.charAt(0) ?? '؟'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-0.5">
                  <p className="font-semibold text-slate-900 text-sm truncate">{conv.name}</p>
                  <p className="text-xs text-slate-400 shrink-0">{formatDate(conv.time)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-medium shrink-0">
                    {roleLabel[conv.role] ?? conv.role}
                  </span>
                  <p className="text-xs text-slate-500 truncate">{conv.lastMsg}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
