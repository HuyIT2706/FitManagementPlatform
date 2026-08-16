/* eslint-disable @next/next/no-img-element */
'use client';

import { Camera, History, Lock, ChevronsLeftRight } from 'lucide-react';
import type { TransformationJourneyProps } from '../../../interface';

export default function TransformationJourneySlider({
  goal,
  weightKg,
  targetWeightKg,
  goalTextMap,
}: TransformationJourneyProps) {
  return (
    <section className="bento-card rounded-2xl p-6 md:p-8 flex flex-col gap-4 relative overflow-hidden border border-outline-variant/30">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-headline-md font-bold text-on-surface">Hành Trình Lột Xác</h3>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-light/10 border border-green-light/30 text-green-light text-[10px] font-bold shadow-[0_0_10px_rgba(102,200,28,0.3)] w-max">
            {goalTextMap[goal] || 'Mục tiêu tập luyện'} ({weightKg}kg -&gt; {targetWeightKg}kg)
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            suppressHydrationWarning
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors cursor-pointer"
          >
            <Camera size={14} />
            Cập nhật ảnh mới
          </button>
          <button
            type="button"
            suppressHydrationWarning
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-bright/40 border border-white/5 text-on-surface-variant text-xs font-semibold hover:bg-surface-bright/80 transition-colors cursor-pointer"
          >
            <History size={14} />
            Lịch sử
          </button>
        </div>
      </div>

      <div className="relative w-full h-80 md:h-96 rounded-xl overflow-hidden border border-white/10 group">
        {/* After Image */}
        <img
          alt="After"
          className="absolute inset-0 w-full h-full object-cover"
          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1000&q=80"
        />
        <div className="absolute bottom-4 right-4 px-3 py-1 bg-surface-dim/90 backdrop-blur-md border border-green-light rounded-lg text-green-light text-xs font-bold z-20">
          Hiện tại • {weightKg} kg
        </div>

        {/* Before Image (Overlay 50%) */}
        <div className="absolute inset-0 w-1/2 overflow-hidden border-r-2 border-green-light z-10">
          <img
            alt="Before"
            className="absolute inset-0 h-full object-cover max-w-none"
            style={{ width: '200%' }}
            src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1000&q=80"
          />
          <div className="absolute bottom-4 left-4 px-3 py-1 bg-surface-dim/90 backdrop-blur-md border border-white/20 rounded-lg text-on-surface text-xs font-bold">
            Bắt đầu • {weightKg + 5} kg
          </div>
        </div>

        <div className="absolute top-0 bottom-0 left-1/2 -ml-5 flex items-center justify-center z-30 pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-green-light shadow-[0_0_15px_rgba(102,200,28,0.6)] flex items-center justify-center text-dark-slate">
            <ChevronsLeftRight size={20} className="stroke-[2.5]" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-on-surface-variant opacity-80">
        <Lock size={14} className="shrink-0" />
        <p>Ảnh của bạn được bảo mật riêng tư chỉ bạn và PT phụ trách có quyền xem.</p>
      </div>
    </section>
  );
}
