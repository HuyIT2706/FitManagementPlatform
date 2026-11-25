import React from 'react';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import HeroScannerTilt from './HeroScannerTilt';

export default function HeroSection() {
  return (
    <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 overflow-hidden bg-black text-white">
      {/* 1. Cinematic Luxury Gym Background Image */}
      <div
        aria-hidden="true"
        className="absolute inset-0 w-full h-full bg-cover bg-center scale-105 opacity-30 pointer-events-none"
        style={{ backgroundImage: "url('/cta-gym.jpg')" }}
      />

      {/* 2. Deep Dark Cinematic Gradient & Ambient Lighting */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-black/80 to-black/90 backdrop-blur-[2px] pointer-events-none" />

      {/* 3. 3D Floating Glowing Mesh Spheres */}
      <div
        className="absolute top-12 left-1/4 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none"
        style={{ animation: 'float-orb-slow 16s ease-in-out infinite alternate' }}
      />
      <div
        className="absolute top-36 right-1/4 w-80 h-80 rounded-full bg-teal-500/15 blur-3xl pointer-events-none"
        style={{ animation: 'float-orb-slow 20s ease-in-out infinite alternate-reverse' }}
      />

      {/* 4. Main Hero Typography & Call-To-Action */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        {/* Minimalist Stark Headline with Emerald Accent */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
          Chụp ảnh bữa ăn. <br />
          <span className="text-emerald-400">Biết ngay từng gam Macro.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-zinc-200 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed font-normal">
          Không cần cân tiểu ly. Chỉ cần một bức ảnh hoặc một câu nói tự nhiên, NutriCore tự động nhận diện món ăn Việt Nam, tính chuẩn Calo & Protein và kết nối trực tiếp với Huấn luyện viên của bạn.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/onboarding"
            className="w-full sm:w-auto px-9 py-4 rounded-full bg-white text-black font-extrabold text-sm tracking-wide hover:bg-zinc-100 transition-all shadow-xl shadow-black/40 hover:scale-105 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Tính chỉ số TDEE miễn phí</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#ai-scanner"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/25 font-semibold text-sm transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Xem Demo</span>
          </a>
        </div>

        {/* Social Proof Star Rating */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-zinc-300">
          <div className="flex items-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={15} fill="currentColor" />
            ))}
          </div>
          <span className="font-medium text-zinc-200">
            4.9/5 xếp hạng • Với hơn 8,000 món ăn & thức uống Việt Nam
          </span>
        </div>
      </div>

      {/* 5. Centerpiece Visual: 3D Tilt Card & Multi-layer Food Scanner HUD */}
      <HeroScannerTilt />

      {/* 6. Smooth Bottom Fade Transition into White Scanner Section */}
      <div className="absolute bottom-0 inset-x-0 h-28 sm:h-36 bg-gradient-to-b from-transparent via-white/50 to-white pointer-events-none z-1" />

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
