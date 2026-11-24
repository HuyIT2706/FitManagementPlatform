/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CtaBanner() {
  return (
    <section className="relative w-full overflow-hidden bg-black text-white py-24 sm:py-32 lg:py-36 border-t border-zinc-200">
      {/* 1. Full-width Luxury Gym Background Image */}
      <img
        src="/cta-gym.jpg"
        alt="NutriCore Luxury Fitness Space"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover object-center scale-105"
      />

      {/* 2. Deep Cinematic Dark Gradient Overlay for Supreme Text Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/85 to-black/75 backdrop-blur-[2px]" />

      {/* 3. Ambient 3D Floating Glowing Mesh Spheres */}
      <div
        className="absolute top-1/4 left-10 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none"
        style={{ animation: 'float-orb-slow 18s ease-in-out infinite alternate' }}
      />
      <div
        className="absolute bottom-1/4 right-10 w-96 h-96 rounded-full bg-teal-500/15 blur-3xl pointer-events-none"
        style={{ animation: 'float-orb-slow 22s ease-in-out infinite alternate-reverse' }}
      />

      {/* 4. Section Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
          Kỷ luật tạo nên hình thể. <br />
          <span className="text-emerald-400">Dữ liệu tạo nên kết quả.</span>
        </h2>

        <p className="text-zinc-200 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-normal">
          Trải nghiệm toàn bộ sức mạnh công nghệ AI dinh dưỡng và kết nối trực tiếp với Huấn luyện viên cá nhân của bạn. Không còn phỏng đoán, chỉ còn kết quả rõ ràng qua từng ngày.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/onboarding"
            className="w-full sm:w-auto px-9 py-4 rounded-full bg-white text-black font-extrabold text-sm tracking-wide hover:bg-zinc-100 transition-all shadow-xl shadow-black/40 hover:scale-105 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Thiết lập TDEE miễn phí ngay</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/25 font-semibold text-sm transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Đăng nhập tài khoản</span>
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes float-orb-slow {
          0%   { transform: translateY(0px) scale(1); }
          50%  { transform: translateY(-24px) scale(1.05); }
          100% { transform: translateY(16px) scale(0.95); }
        }
      `}</style>
    </section>
  );
}
