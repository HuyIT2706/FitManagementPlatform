'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected client error to monitoring console
    console.error('Unhandled Client Exception:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#090d0b] text-[#dde4dd] flex flex-col items-center justify-center p-6 text-center select-none font-sans">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6 shadow-[0_0_30px_rgba(244,63,94,0.15)] animate-pulse">
        <AlertTriangle size={32} />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
        Đã có sự cố xảy ra!
      </h1>
      <p className="text-slate-400 text-sm sm:text-base max-w-md mb-8 leading-relaxed">
        Hệ thống gặp sự cố không mong muốn trong lúc hiển thị trang. Vui lòng nhấn thử lại hoặc quay về trang chủ.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
        <button
          onClick={() => reset()}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-emerald-400 text-slate-950 font-bold transition-all duration-200 shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <RefreshCw size={18} />
          <span>Thử lại ngay</span>
        </button>

        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium border border-white/10 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Home size={18} />
          <span>Trang chủ</span>
        </Link>
      </div>

      {process.env.NODE_ENV === 'development' && error.message && (
        <div className="mt-8 p-4 rounded-xl bg-black/40 border border-white/10 text-left text-xs font-mono text-rose-300 max-w-lg overflow-x-auto">
          <p className="font-bold text-white mb-1">Debug Error Trace:</p>
          <p>{error.message}</p>
        </div>
      )}
    </div>
  );
}
