'use client';

import { Cake, Ruler, Scale, Target, Activity, Zap, Flame } from 'lucide-react';
import type { ProfileBiometricsGridProps } from '../../../interface';

export default function ProfileBiometricsGrid({
  ageYears,
  heightCm,
  weightKg,
  targetWeightKg,
  bmi,
  bmr,
  tdee,
}: ProfileBiometricsGridProps) {
  const bmiCategory =
    bmi < 18.5 ? 'Thiếu cân' : bmi < 24.9 ? 'Bình thường' : 'Thừa cân';

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Age */}
      <div className="bento-card rounded-2xl p-4 flex flex-col justify-between border border-outline-variant/30">
        <div className="flex items-center gap-2 text-on-surface-variant text-xs font-semibold mb-2">
          <Cake size={16} className="text-primary shrink-0" /> Tuổi
        </div>
        <div className="text-3xl font-headline-md font-bold text-on-surface">{ageYears}</div>
      </div>

      {/* Height */}
      <div className="bento-card rounded-2xl p-4 flex flex-col justify-between border border-outline-variant/30">
        <div className="flex items-center gap-2 text-on-surface-variant text-xs font-semibold mb-2">
          <Ruler size={16} className="text-primary shrink-0" /> Chiều cao
        </div>
        <div className="text-3xl font-headline-md font-bold text-on-surface">
          {heightCm}
          <span className="text-sm font-normal text-on-surface-variant ml-1">cm</span>
        </div>
      </div>

      {/* Weight */}
      <div className="bento-card rounded-2xl p-4 flex flex-col justify-between border border-outline-variant/30">
        <div className="flex items-center gap-2 text-on-surface-variant text-xs font-semibold mb-2">
          <Scale size={16} className="text-primary shrink-0" /> Cân nặng
        </div>
        <div className="text-3xl font-headline-md font-bold text-on-surface">
          {weightKg}
          <span className="text-sm font-normal text-on-surface-variant ml-1">kg</span>
        </div>
      </div>

      {/* Target Weight */}
      <div className="bento-card rounded-2xl p-4 flex flex-col justify-between bg-green-light/10 border border-green-light/30">
        <div className="flex items-center gap-2 text-green-light text-xs font-semibold mb-2">
          <Target size={16} className="text-green-light shrink-0" /> Mục tiêu
        </div>
        <div className="text-3xl font-headline-md font-bold text-green-light">
          {targetWeightKg}
          <span className="text-sm font-normal text-green-light/70 ml-1">kg</span>
        </div>
      </div>

      {/* Wide Summary Card: BMR, TDEE, BMI */}
      <div className="col-span-2 md:col-span-4 bento-card rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 border border-outline-variant/30 items-center">
        {/* BMI */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-surface-bright/50 flex items-center justify-center border border-white/5 shrink-0">
            <Activity size={22} className="text-primary" />
          </div>
          <div>
            <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              BMI
            </div>
            <div className="text-xl font-bold text-primary">
              {bmi} • {bmiCategory}
            </div>
          </div>
        </div>

        {/* BMR */}
        <div className="flex items-center gap-4 md:border-l border-white/10 md:pl-6">
          <div className="w-12 h-12 rounded-full bg-surface-bright/50 flex items-center justify-center border border-white/5 shrink-0">
            <Zap size={22} className="text-blue-400" />
          </div>
          <div>
            <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              BMR (Năng lượng cơ bản)
            </div>
            <div className="text-xl font-bold text-blue-400">
              {bmr} <span className="text-xs font-normal text-white/70">kcal/ngày</span>
            </div>
          </div>
        </div>

        {/* TDEE */}
        <div className="flex items-center gap-4 md:border-l border-white/10 md:pl-6">
          <div className="w-12 h-12 rounded-full bg-surface-bright/50 flex items-center justify-center border border-white/5 shrink-0">
            <Flame size={22} className="text-orange-400 fill-orange-400/20" />
          </div>
          <div>
            <div className="text-xl font-bold text-orange-400">
              {tdee} <span className="text-xs font-normal text-white/70">kcal/ngày</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
