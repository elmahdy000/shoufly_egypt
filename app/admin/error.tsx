"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Admin Error]", error);
  }, [error]);

  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center text-center px-6"
      dir="rtl"
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>

      <h1 className="mb-2 text-xl font-black text-slate-900">
        حدث خطأ غير متوقع
      </h1>
      <p className="mb-8 max-w-sm text-sm text-slate-500">
        واجهنا مشكلة في تحميل هذه الصفحة. يمكنك المحاولة مرة أخرى أو العودة
        للوحة التحكم.
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="rounded-xl border border-primary/30 bg-primary/10 px-6 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary/20"
        >
          إعادة المحاولة
        </button>
        <Link
          href="/admin"
          className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
        >
          لوحة التحكم
        </Link>
      </div>

      {process.env.NODE_ENV !== "production" && (
        <details className="mt-8 w-full max-w-lg text-left">
          <summary className="cursor-pointer text-xs font-bold text-slate-500">
            تفاصيل الخطأ (dev only)
          </summary>
          <pre className="mt-2 overflow-auto rounded-xl bg-gray-50 p-4 text-xs text-gray-500 border border-gray-200">
            {error.message}
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}
