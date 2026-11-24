import React from 'react';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import HeroScannerTilt from './HeroScannerTilt';

export default function HeroSection() {
  return (
    <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden bg-gradient-to-b from-zinc-50/60 via-white to-white">
      {/* 3D Soft Ambient Mesh Floating Spheres */}
      <div
        className="absolute top-12 left-1/4 w-96 h-96 rounded-full bg-gradient-to-tr from-emerald-100/40 via-teal-50/30 to-transparent blur-3xl pointer-events-none"
        style={{ animation: 'float-orb-slow 16s ease-in-out infinite alternate' }}
      />
      <div
        className="absolute top-36 right-1/4 w-80 h-80 rounded-full bg-gradient-to-bl from-zinc-200/40 via-emerald-50/20 to-transparent blur-3xl pointer-events-none"
        style={{ animation: 'float-orb-slow 20s ease-in-out infinite alternate-reverse' }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        {/* Minimalist Stark Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-black leading-[1.08]">
          Chụp ảnh bữa ăn. <br />
          <span className="text-zinc-400">Biết ngay từng gam Macro.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-zinc-600 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed font-normal">
          Không cần cân tiểu ly. Chỉ cần một bức ảnh hoặc một câu nói tự nhiên, NutriCore tự động nhận diện món ăn Việt Nam, tính chuẩn Calo & Protein và kết nối trực tiếp với Huấn luyện viên của bạn.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/onboarding"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-black hover:bg-zinc-800 text-white font-bold text-sm tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <span>Tính chỉ số TDEE miễn phí</span>
            <ArrowRight size={16} />
          </Link>
          <a
            href="#ai-scanner"
            className="w-full sm:w-auto px-7 py-4 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <span>Xem Demo</span>
          </a>
        </div>

        {/* Social Proof Star Rating */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-zinc-500">
          <div className="flex items-center gap-1 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={15} fill="currentColor" />
            ))}
          </div>
          <span className="font-medium text-zinc-700">
            4.9/5 xếp hạng • Cơ sở dữ liệu hơn 10,000 món ăn & thức uống Việt Nam
          </span>
        </div>
      </div>

      {/* Centerpiece Visual: 3D Tilt Card & Multi-layer Food Scanner HUD */}
      <HeroScannerTilt />

      <style>{`
        @keyframes float-orb-slow {
          0%   { transform: translateY(0px) scale(1); }
          50%  { transform: translateY(-22px) scale(1.04); }
          100% { transform: translateY(12px) scale(0.96); }
        }
      `}</style>
    </section>
  );
}
