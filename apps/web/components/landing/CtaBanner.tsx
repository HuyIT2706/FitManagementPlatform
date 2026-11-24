/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';

export default function CtaBanner() {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      <div className="relative rounded-3xl overflow-hidden shadow-2xl min-h-[380px] sm:min-h-[440px] flex items-center justify-center">
        {/* Luxury Gym Background Image */}
        <img
          src="/cta-gym.jpg"
          alt="NutriCore Fitness Space"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-center scale-105"
        />
        {/* Rich Dark Frosted Glass Gradient Overlay for Maximum Text Contrast & Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/75 to-black/60 backdrop-blur-[2px]" />

        <div className="relative z-10 p-8 sm:p-14 text-center space-y-6 max-w-2xl mx-auto">
          <span className="inline-block px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-zinc-100 text-xs font-semibold uppercase tracking-wider border border-white/20 shadow-xs">
            Bắt đầu miễn phí hôm nay
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Kỷ luật tạo nên hình thể. <br />
            <span className="text-emerald-400">Dữ liệu tạo nên kết quả.</span>
          </h2>
          <p className="text-zinc-200 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto font-normal">
            Mở toàn bộ tính năng hoàn toàn miễn phí. Khám phá chỉ số TDEE cá nhân và theo dõi calo dễ dàng hơn bao giờ hết.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-black font-extrabold text-sm tracking-wide hover:bg-zinc-100 transition shadow-lg hover:scale-105"
            >
              Thiết lập TDEE của tôi ngay
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/25 font-semibold text-sm transition hover:scale-105"
            >
              Đăng nhập tài khoản
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
