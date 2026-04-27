import { getCurrentUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FiPlus, FiPackage, FiInbox } from "react-icons/fi";
import { RequestRow } from "@/components/requests/RequestRow";
import { FiltersBar } from "@/components/requests/FiltersBar";
import { Pagination } from "@/components/requests/Pagination";

export const metadata = {
  title: "طلباتي | شوفلي",
};

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: { page?: string; limit?: string; status?: string; search?: string };
}) {
  const user = await getCurrentUserFromCookie();
  if (!user || user.role !== "CLIENT") {
    return <div className="p-10 text-center font-bold">غير مصرح لك بدخول هذه الصفحة</div>;
  }

  // Ensure params are properly awaited for compatibility
  const params = await Promise.resolve(searchParams);

  const page = parseInt(params.page || "1") || 1;
  const limit = parseInt(params.limit || "10") || 10;
  const status = params.status || "ALL";
  const search = params.search || "";
  const skip = (page - 1) * limit;

  // Build Query
  const where: any = { clientId: user.id };  
  if (status !== "ALL") where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { address: { contains: search } }
    ];
    const id = parseInt(search);
    if (!isNaN(id)) where.OR.push({ id });
  }

  const [total, requests, totalCountAll] = await Promise.all([
    prisma.request.count({ where }),
    prisma.request.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
      select: {
        id: true,
        title: true,
        status: true,
        address: true,
        createdAt: true,
      }
    }),
    prisma.request.count({ where: { clientId: user.id } }) // Raw total for stats
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8 font-cairo text-right min-h-screen bg-slate-50" dir="rtl">
      {/* StatsHeader */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-sm">
               <FiPackage size={20} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">طلباتي</h1>
          </div>
          <p className="text-sm font-bold text-slate-500">إجمالي {totalCountAll} طلب في حسابك</p>
        </div>
        <Link
          href="/client/requests/new"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl text-sm font-black shadow-lg shadow-primary/20 hover:bg-primary-hover hover:-translate-y-0.5 active:scale-95 transition-all"
        >
          <FiPlus size={20} /> إضافة طلب جديد
        </Link>
      </div>

      <FiltersBar initialSearch={search} initialStatus={status} />

      {/* Requests Table */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden min-h-[400px]">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6 border border-slate-100">
              <FiInbox size={32} />
            </div>
            <h3 className="font-black text-slate-800 mb-2 text-xl">لا توجد طلبات مطابقة</h3>
            <p className="text-sm text-slate-400 font-bold max-w-xs">جرب تغيير الفلاتر أو كلمة البحث، أو ابدأ بإنشاء طلب جديد الآن.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-4 lg:px-6 py-5 rounded-tr-3xl min-w-[200px]">تفاصيل الطلب</th>
                  <th className="px-4 lg:px-6 py-5 whitespace-nowrap">الحالة</th>
                  <th className="px-4 lg:px-6 py-5 min-w-[150px]">العنوان والتاريخ</th>
                  <th className="px-4 lg:px-6 py-5 rounded-tl-3xl text-left w-20">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {requests.map(req => (
                  <RequestRow key={req.id} request={req} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} />
    </div>
  );
}
