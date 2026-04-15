"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ClientError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("[Client Error]", error);
  }, [error]);

  return (
    <div
      className="flex min-h-[70vh] flex-col items-center justify-center text-center px-6"
      dir="rtl"
    >
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-orange-50">
        <span className="text-5xl">😬</span>
      </div>

      <h1 className="mb-2 text-2xl font-black text-slate-900">
        عذراً، حصل خطأ
      </h1>
      <p className="mb-8 max-w-sm text-sm leading-relaxed text-slate-500">
        لا تقلق! المشكلة مؤقتة. جرب تحديث الصفحة أو العودة للرئيسية.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl"
        >
          تحديث الصفحة
        </button>
        <button
          onClick={() => router.back()}
          className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
        >
          الرجوع
        </button>
      </div>
    </div>
  );
}
