"use client";

import { memo } from "react";
import Link from "next/link";
import { FiMoreVertical, FiMapPin, FiCalendar } from "react-icons/fi";
import { formatDate } from "@/lib/formatters";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING_ADMIN_REVISION:      { label: "قيد المراجعة",    color: "bg-slate-100 text-slate-600 border-slate-200" },
  OPEN_FOR_BIDDING:            { label: "مفتوح للعروض",    color: "bg-blue-50 text-blue-600 border-blue-200" },
  OFFERS_FORWARDED:            { label: "عروض جديدة",       color: "bg-amber-50 text-amber-600 border-amber-200" },
  ORDER_PAID_PENDING_DELIVERY: { label: "جاري التنفيذ",    color: "bg-violet-50 text-violet-600 border-violet-200" },
  CLOSED_SUCCESS:              { label: "مكتمل",            color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CLOSED_FAILED:               { label: "فشل",              color: "bg-rose-50 text-rose-600 border-rose-200" },
  CLOSED_CANCELLED:            { label: "ملغي",             color: "bg-rose-50 text-rose-500 border-rose-200" },
};

function RequestRowComponent({ request }: { request: any }) {
  const st = STATUS_MAP[request.status] ?? { label: request.status, color: "bg-slate-100 text-slate-600 border-slate-200" };
  
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
      <td className="p-4 align-middle">
        <Link href={`/client/requests/${request.id}`} className="block w-full">
          <div className="font-bold text-slate-900 text-sm mb-1 group-hover:text-primary transition-colors line-clamp-1">{request.title}</div>
          <div className="text-[11px] text-slate-400 font-medium">#{request.id}</div>
        </Link>
      </td>
      <td className="p-4 align-middle">
        <span className={`inline-flex px-2.5 py-1 rounded-lg border text-[10px] font-black tracking-widest ${st.color}`}>
          {st.label}
        </span>
      </td>
      <td className="p-4 align-middle">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 font-medium">
          <FiMapPin size={12} className="text-slate-400 shrink-0" /> <span className="truncate max-w-[150px]">{request.address || "لا يوجد عنوان"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
          <FiCalendar size={12} className="shrink-0" /> {formatDate(request.createdAt)}
        </div>
      </td>
      <td className="p-4 align-middle text-left">
        <div className="inline-flex items-center justify-end w-full">
           <Link href={`/client/requests/${request.id}`} className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all shadow-sm">
              <FiMoreVertical size={16} />
           </Link>
        </div>
      </td>
    </tr>
  );
}

export const RequestRow = memo(RequestRowComponent);
