/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';

export default function LandingFooter() {
  return (
    <footer className="border-t border-zinc-200 py-10 text-xs text-zinc-500 bg-zinc-50/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full overflow-hidden border border-zinc-200 bg-white flex items-center justify-center shadow-xs">
              <img src="/logoApp.jpg" alt="NutriCore Logo" loading="lazy" decoding="async" className="w-full h-full object-cover" />
            </div>
            <span className="font-extrabold text-sm text-black tracking-tight">
              Nutri<span className="text-emerald-600">Core</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-5 font-semibold text-zinc-600 text-xs">
            <a href="#ai-scanner" className="hover:text-black transition">Chụp món ăn</a>
            <a href="#comparison" className="hover:text-black transition">So sánh</a>
            <a href="#reviews" className="hover:text-black transition">Đánh giá</a>
            <a href="#roles" className="hover:text-black transition">Học viên & PT</a>
            <a href="#faq" className="hover:text-black transition">Hỏi đáp</a>
            <Link href="/login" className="hover:text-black transition">Đăng nhập</Link>
          </div>
        </div>

        <div className="border-t border-zinc-200/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400">
          <p>© {new Date().getFullYear()} NutriCore. Tất cả quyền được bảo lưu.</p>
          <p>Mã hóa dữ liệu sức khỏe AES-256-GCM • Chuẩn giao thức PWA & Android Native</p>
        </div>
      </div>
    </footer>
  );
}
