/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { CheckCircle2, Sparkles, Flame } from 'lucide-react';
import TiltCard3D from './TiltCard3D';

export default function HeroScannerTilt() {
  return (
    <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-10" style={{ perspective: '1200px' }}>
      {/* 3D Floating Spatial Micro-Chips (Orbiting the Centerpiece) */}
      <div className="hidden lg:flex items-center gap-2.5 absolute -top-1 -left-4 z-20 px-4 py-2.5 rounded-2xl bg-black/85 border border-emerald-400/40 backdrop-blur-md text-white text-xs font-bold shadow-2xl animate-float-slow">
        <Sparkles size={16} className="text-emerald-400 shrink-0" />
        <span>AI Vision: Nhận diện 4 món (1.2s)</span>
      </div>

      <div className="hidden lg:flex items-center gap-2.5 absolute -bottom-3 -right-4 z-20 px-4 py-2.5 rounded-2xl bg-black/85 border border-amber-400/40 backdrop-blur-md text-white text-xs font-bold shadow-2xl animate-float-slow-delayed">
        <Flame size={16} className="text-amber-400 shrink-0" />
        <span>Thâm hụt calo: -450 kcal hôm nay</span>
      </div>

      <TiltCard3D
        maxTilt={4}
        glowColor="rgba(52, 211, 153, 0.22)"
        className="rounded-3xl bg-zinc-950/85 border border-white/20 backdrop-blur-xl p-4 sm:p-7 shadow-2xl shadow-black/70"
      >
        <div className="grid md:grid-cols-12 gap-6 items-center">
          {/* Left: Food Scanner Preview with 3D Spatial Laser & Target Brackets */}
          <div
            className="md:col-span-7 relative rounded-2xl overflow-hidden aspect-4/3 sm:aspect-16/10 bg-zinc-900 group/scan"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <img
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=78&w=800&auto=format&fit=crop"
              alt="Food Scan Preview"
              fetchPriority="high"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-700 group-hover/scan:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30" />

            {/* 3D Laser Scanline Animation */}
            <div
              className="pointer-events-none absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_18px_rgba(52,211,153,1)]"
              style={{ animation: 'laser-scan 3.5s ease-in-out infinite' }}
            />
            <div
              className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 text-xs"
              style={{ transform: 'translateZ(40px)' }}
            >
              <span className="backdrop-blur-md bg-black/85 border border-white/15 text-white font-medium px-3 py-1 rounded-full shadow-sm">
                Sườn nướng: 140g (339 kcal)
              </span>
              <span className="backdrop-blur-md bg-black/85 border border-white/15 text-white font-medium px-3 py-1 rounded-full shadow-sm">
                Cơm tấm: 200g (260 kcal)
              </span>
              <span className="backdrop-blur-md bg-black/85 border border-white/15 text-white font-medium px-3 py-1 rounded-full shadow-sm">
                Chả trứng: 60g (111 kcal)
              </span>
            </div>
          </div>

          {/* Right: Sleek Dark Glassmorphic Macro Metrics HUD */}
          <div className="md:col-span-5 p-4 sm:p-6 space-y-6 text-left">
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                <span>Mục Tiêu Hôm Nay</span>
                <span className="text-emerald-400 font-extrabold">Đạt 88%</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tracking-tight text-white">2,110</span>
                <span className="text-sm font-semibold text-zinc-400">/ 2,400 kcal</span>
              </div>
              <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden mt-3">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full w-[88%] rounded-full shadow-[0_0_12px_rgba(52,211,153,0.5)]" />
              </div>
            </div>

            {/* Macro Chips with Subtle Glass Glow */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.06] border border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                  <span className="text-xs font-bold text-zinc-200">Chất đạm (Protein)</span>
                </div>
                <span className="text-sm font-extrabold text-white">
                  165g <span className="text-xs font-normal text-zinc-400">/ 180g</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.06] border border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                  <span className="text-xs font-bold text-zinc-200">Tinh bột (Carbs)</span>
                </div>
                <span className="text-sm font-extrabold text-white">
                  210g <span className="text-xs font-normal text-zinc-400">/ 240g</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.06] border border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)]" />
                  <span className="text-xs font-bold text-zinc-200">Chất béo (Fat)</span>
                </div>
                <span className="text-sm font-extrabold text-white">
                  55g <span className="text-xs font-normal text-zinc-400">/ 65g</span>
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3 text-xs text-zinc-300">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>Coach Đào Trần đã xem & duyệt thực đơn 10 phút trước</span>
            </div>
          </div>
        </div>
      </TiltCard3D>

      <style>{`
        @keyframes laser-scan {
          0%   { top: 2%; opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { top: 96%; opacity: 0; }
        }
        @keyframes float-slow {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        @keyframes float-slow-delayed {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(8px); }
          100% { transform: translateY(0px); }
        }
        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }
        .animate-float-slow-delayed {
          animation: float-slow-delayed 4.5s ease-in-out infinite 0.5s;
        }
      `}</style>
    </div>
  );
}
