"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { formatDate, formatCurrency } from "@/lib/formatters";
import { forwardAdminBid, listAdminRequestBids } from "@/lib/api/bids";
import { getRequestDetails } from "@/lib/api/requests";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { ArrowRight, MapPin, FileText, CheckCircle, Clock, User, MessageSquare, ChevronRight } from "lucide-react";

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PENDING_ADMIN_REVISION:       { label: "قيد المراجعة",          cls: "bg-amber-50 text-amber-700 border-amber-200"  },
  OPEN_FOR_BIDDING:             { label: "مفتوح للعروض",          cls: "bg-blue-50 text-blue-700 border-blue-200"     },
  BIDS_RECEIVED:                { label: "وصلت عروض",             cls: "bg-purple-50 text-purple-700 border-purple-200"},
  OFFERS_FORWARDED:             { label: "تم إرسال العروض",        cls: "bg-orange-50 text-orange-700 border-orange-200"},
  ORDER_PAID_PENDING_DELIVERY:  { label: "مدفوع — بانتظار التوصيل", cls: "bg-green-50 text-green-700 border-green-200"  },
  CLOSED_SUCCESS:               { label: "مكتمل",                  cls: "bg-gray-100 text-gray-600 border-gray-300"    },
  CLOSED_CANCELLED:             { label: "ملغي",                   cls: "bg-red-50 text-red-700 border-red-200"        },
};

function AdminRequestDetails({ requestId }: { requestId: number }) {
  const router = useRouter();
  const request = useAsyncData(() => getRequestDetails(requestId), [requestId]);
  const bids    = useAsyncData(() => listAdminRequestBids(requestId), [requestId]);
  const [activeActionId, setActiveActionId] = useState<number | null>(null);

  async function handleForward(bidId: number) {
    setActiveActionId(bidId);
    try {
      await forwardAdminBid(bidId);
      bids.setData((rows: any) =>
        (rows ?? []).map((b: any) => ({
          ...b,
          status: b.id === bidId ? "SELECTED" : (b.status === "SELECTED" ? "REJECTED" : b.status),
        }))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActiveActionId(null);
    }
  }

  if (request.loading) {
    return (
      <div className="p-6 space-y-4" dir="rtl">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (request.error || !request.data) {
    return (
      <div className="p-6" dir="rtl">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-4">
          <p className="text-red-700 font-semibold">{request.error ?? "لا يمكن تحميل بيانات الطلب"}</p>
          <div className="flex justify-center gap-3">
            <button onClick={request.refresh} className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition">
              إعادة المحاولة
            </button>
            <button onClick={() => router.push("/admin/requests")} className="px-4 py-2 bg-white text-gray-700 text-sm font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              الرجوع للطلبات
            </button>
          </div>
        </div>
      </div>
    );
  }

  const req = request.data;
  const st  = STATUS_MAP[req.status] ?? { label: req.status, cls: "bg-gray-100 text-gray-600 border-gray-300" };

  return (
    <div className="p-6 space-y-6" dir="rtl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowRight size={15} />
            الرجوع للطلبات
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{req.title}</h1>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${st.cls}`}>
              {st.label}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">#{requestId}</span>
            </span>
            {req.address && (
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-orange-500" />
                {req.address}
              </span>
            )}
            {req.createdAt && (
              <span className="flex items-center gap-1.5">
                <Clock size={13} />
                {formatDate(req.createdAt)}
              </span>
            )}
          </div>
        </div>
        <Link
          href={`/messages?otherId=${req.clientId}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
        >
          <MessageSquare size={15} />
          مراسلة العميل
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Description */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                <FileText size={16} />
              </div>
              <h2 className="text-base font-semibold text-gray-900">تفاصيل الطلب</h2>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-700 leading-relaxed">
                {req.description || "لا يوجد وصف تفصيلي لهذا الطلب."}
              </p>
            </div>
          </div>

          {/* Bids */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">عروض الموردين</h2>
              <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                {bids.data?.length ?? 0} عرض
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {bids.loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-5">
                    <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                  </div>
                ))
              ) : !bids.data?.length ? (
                <div className="p-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                      <FileText size={18} className="text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">لا توجد عروض حتى الآن</p>
                  </div>
                </div>
              ) : (
                (bids.data ?? []).map((bid: any) => (
                  <div key={bid.id} className={`p-5 ${bid.status === "SELECTED" ? "bg-green-50/50" : "hover:bg-gray-50"} transition-colors`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-700 text-sm shrink-0">
                          {bid.vendor?.fullName?.[0] ?? "V"}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-gray-900">{bid.vendor?.fullName ?? `مورد #${bid.vendorId}`}</p>
                            {bid.status === "SELECTED" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                                <CheckCircle size={10} /> تم التوجيه
                              </span>
                            )}
                          </div>
                          {bid.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{bid.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-left shrink-0">
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(bid.clientPrice || 0)}</p>
                        <p className="text-xs text-gray-400 text-center">سعر العميل</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                      <Link
                        href={`/messages?otherId=${bid.vendorId}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <MessageSquare size={12} />
                        مراسلة المورد
                      </Link>
                      <button
                        onClick={() => handleForward(bid.id)}
                        disabled={bid.status === "SELECTED" || activeActionId === bid.id}
                        className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          bid.status === "SELECTED"
                            ? "bg-green-100 text-green-700 border border-green-200 cursor-default"
                            : "bg-orange-500 text-white hover:bg-orange-600 active:scale-95"
                        } disabled:opacity-60`}
                      >
                        {activeActionId === bid.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : bid.status === "SELECTED" ? (
                          <><CheckCircle size={12} /> تم التوجيه</>
                        ) : (
                          <><ChevronRight size={12} /> توجيه للعميل</>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">

          {/* Client Info */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <User size={16} />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">بيانات العميل</h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold">
                  {((req as any).clientName || "ع")[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{(req as any).clientName ?? `عميل #${req.clientId}`}</p>
                  <p className="text-xs text-gray-400">معرف #{req.clientId}</p>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-gray-100">
                {[
                  { label: "تاريخ الإنشاء", value: req.createdAt ? formatDate(req.createdAt) : "—" },
                  { label: "آخر تحديث",     value: req.updatedAt ? formatDate(req.updatedAt) : "—" },
                  { label: "الحالة",         value: st.label },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{label}</span>
                    <span className="text-xs font-semibold text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">التسلسل الزمني</h3>
            </div>
            <div className="p-5">
              {(req as any)?.deliveryTracking?.length > 0 ? (
                <div className="space-y-4">
                  {(req as any).deliveryTracking.map((track: any, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle size={12} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{track.status}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {track.deliveryAgent?.fullName ?? "النظام"} · {formatDate(track.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Clock size={20} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">لا توجد أحداث مسجلة بعد</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function AdminRequestDetailsPage() {
  const params = useParams<{ requestId: string }>();
  const parsed = Number(params.requestId);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return <div className="p-20 text-center text-sm font-medium text-gray-500">معرف الطلب غير صالح.</div>;
  }
  return <AdminRequestDetails requestId={parsed} />;
}
