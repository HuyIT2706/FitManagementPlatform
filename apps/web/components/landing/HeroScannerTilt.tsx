/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import TiltCard3D from './TiltCard3D';

export default function HeroScannerTilt() {
  return (
    <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-10" style={{ perspective: '1200px' }}>
      <TiltCard3D
        maxTilt={4}
        glowColor="rgba(16, 185, 129, 0.08)"
        className="rounded-3xl bg-white p-3 sm:p-5 shadow-xl shadow-zinc-200/50"
      >
        <div className="grid md:grid-cols-12 gap-6 items-center">
          {/* Left: Food Scanner Preview with 3D Spatial Laser & Target Brackets */}
          <div
            className="md:col-span-7 relative rounded-2xl overflow-hidden aspect-4/3 sm:aspect-16/10 bg-zinc-100 group/scan"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <img
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=78&w=800&auto=format&fit=crop"
              alt="Food Scan Preview"
              fetchPriority="high"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-700 group-hover/scan:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {/* 3D Laser Scanline Animation */}
            <div
              className="pointer-events-none absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_14px_rgba(52,211,153,0.9)]"
              style={{ animation: 'laser-scan 3.5s ease-in-out infinite' }}
            />
            <div
              className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 text-xs"
              style={{ transform: 'translateZ(40px)' }}
            >
              <span className="backdrop-blur-md bg-black/80 text-white font-medium px-3 py-1 rounded-full shadow-sm">
                Sườn nướng: 140g (339 kcal)
              </span>
              <span className="backdrop-blur-md bg-black/80 text-white font-medium px-3 py-1 rounded-full shadow-sm">
                Cơm tấm: 200g (260 kcal)
              </span>
              <span className="backdrop-blur-md bg-black/80 text-white font-medium px-3 py-1 rounded-full shadow-sm">
                Chả trứng: 60g (111 kcal)
              </span>
            </div>
          </div>

          {/* Right: Clean White Macro Metrics HUD */}
          <div className="md:col-span-5 p-4 sm:p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                <span>Mục Tiêu Hôm Nay</span>
                <span className="text-emerald-600 font-extrabold">Đạt 88%</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tracking-tight text-black">2,110</span>
                <span className="text-sm font-semibold text-zinc-600">/ 2,400 kcal</span>
              </div>
              <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden mt-3">
                <div className="bg-black h-full w-[88%] rounded-full" />
              </div>
            </div>

            {/* Macro Chips */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-xs font-bold text-zinc-700">Chất đạm (Protein)</span>
                </div>
                <span className="text-sm font-extrabold text-black">
                  165g <span className="text-xs font-normal text-zinc-400">/ 180g</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs font-bold text-zinc-700">Tinh bột (Carbs)</span>
                </div>
                <span className="text-sm font-extrabold text-black">
                  210g <span className="text-xs font-normal text-zinc-400">/ 240g</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span className="text-xs font-bold text-zinc-700">Chất béo (Fat)</span>
                </div>
                <span className="text-sm font-extrabold text-black">
                  55g <span className="text-xs font-normal text-zinc-400">/ 65g</span>
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3 text-xs text-zinc-500">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
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
      `}</style>
    </div>
  );
}
