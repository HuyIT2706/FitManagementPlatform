/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import Link from 'next/link';
import { Camera, Target, QrCode, ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import TiltCard3D from './TiltCard3D';

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
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        {/* Main CTA Pitch */}
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md text-zinc-100 text-xs font-semibold tracking-wider uppercase border border-white/20 transition-all shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Khởi đầu hành trình thể hình thế hệ mới</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
            Kỷ luật tạo nên hình thể. <br />
            <span className="text-emerald-400">Dữ liệu tạo nên kết quả.</span>
          </h2>

          <p className="text-zinc-200 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-normal">
            Trải nghiệm toàn bộ sức mạnh công nghệ AI dinh dưỡng và kết nối trực tiếp với Huấn luyện viên cá nhân của bạn. Không còn phỏng đoán, chỉ còn kết quả rõ ràng qua từng ngày.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
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

        {/* 5. 3 Interactive 3D Spatial Feature Cards ("các tính năng 3D thêm") */}
        <div className="pt-6" style={{ perspective: '1200px' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            {/* Card 1: AI Vision 1 Giây */}
            <TiltCard3D
              maxTilt={6}
              glowColor="rgba(52, 211, 153, 0.22)"
              className="rounded-3xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 hover:border-emerald-400/50 backdrop-blur-md p-6 sm:p-7 flex flex-col justify-between space-y-4 shadow-xl transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-inner">
                    <Camera size={22} />
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-400/15 text-emerald-300 border border-emerald-400/25">
                    Tốc độ 1 Giây
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                    <span>01. AI Vision Đĩa Ăn Việt</span>
                    <Sparkles size={14} className="text-emerald-400" />
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
                    Chụp nhanh đĩa cơm tấm, phở bò hay salad. AI tự động bóc tách từng món, ước tính gram và tính toán calo chuẩn xác.
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-white/10 flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
                <Zap size={13} className="text-emerald-400" />
                <span>Không cần cân tiểu ly hay gõ tên món</span>
              </div>
            </TiltCard3D>

            {/* Card 2: Thâm Hụt Calo Chuẩn Khoa Học */}
            <TiltCard3D
              maxTilt={6}
              glowColor="rgba(251, 191, 36, 0.22)"
              className="rounded-3xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 hover:border-amber-400/50 backdrop-blur-md p-6 sm:p-7 flex flex-col justify-between space-y-4 shadow-xl transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-inner">
                    <Target size={22} />
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/25">
                    Khoa học & Cá nhân hóa
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    02. Cân Bằng Macro & Thâm Hụt
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
                    Tính toán BMR, TDEE và xây dựng mục tiêu calo thâm hụt dựa trên thuật toán Knapsack Heuristic, bảo đảm đủ Protein chống mất cơ.
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-white/10 flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
                <Zap size={13} className="text-amber-400" />
                <span>Theo dõi chuỗi Streak kỷ luật mỗi ngày</span>
              </div>
            </TiltCard3D>

            {/* Card 3: Kết Nối PT 1:1 & Điểm Danh Minh Bạch */}
            <TiltCard3D
              maxTilt={6}
              glowColor="rgba(56, 189, 248, 0.22)"
              className="rounded-3xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 hover:border-sky-400/50 backdrop-blur-md p-6 sm:p-7 flex flex-col justify-between space-y-4 shadow-xl transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shadow-inner">
                    <QrCode size={22} />
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-sky-400/15 text-sky-300 border border-sky-400/25">
                    Mã hóa AES-256
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    03. Đồng Hành 1:1 Cùng PT
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
                    Liên kết học viên và HLV tức thì qua mã QR. Huấn luyện viên duyệt bữa ăn, giao giáo án và điểm danh trừ buổi tập nguyên tử.
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-white/10 flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
                <ShieldCheck size={13} className="text-sky-400" />
                <span>Bảo mật dữ liệu vóc dáng chuẩn quân đội</span>
              </div>
            </TiltCard3D>
          </div>
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
