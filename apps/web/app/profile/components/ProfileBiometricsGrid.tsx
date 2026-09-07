'use client';

import { Cake, Ruler, Scale, Target, Activity, Zap, Flame } from 'lucide-react';
import type { ProfileBiometricsGridProps } from '../../../interface';

const ProfileBiometricsGrid = ({
  ageYears,
  heightCm,
  weightKg,
  targetWeightKg,
  bmi,
  bmr,
  tdee,
}: ProfileBiometricsGridProps) => {
  const bmiCategory =
    bmi < 18.5 ? 'Thiếu cân' : bmi < 24.9 ? 'Bình thường' : 'Thừa cân';

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
      {/* Age */}
      <div className="bento-card rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between border border-outline-variant/30">
        <div className="flex items-center gap-1.5 sm:gap-2 text-on-surface-variant text-[11px] sm:text-xs font-semibold mb-1 sm:mb-2">
          <Cake size={15} className="text-primary shrink-0 sm:w-4 sm:h-4" /> Tuổi
        </div>
        <div className="text-2xl sm:text-3xl font-headline-md font-bold text-on-surface">{ageYears}</div>
      </div>

      {/* Height */}
      <div className="bento-card rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between border border-outline-variant/30">
        <div className="flex items-center gap-1.5 sm:gap-2 text-on-surface-variant text-[11px] sm:text-xs font-semibold mb-1 sm:mb-2">
          <Ruler size={15} className="text-primary shrink-0 sm:w-4 sm:h-4" /> Chiều cao
        </div>
        <div className="text-2xl sm:text-3xl font-headline-md font-bold text-on-surface">
          {heightCm}
          <span className="text-xs sm:text-sm font-normal text-on-surface-variant ml-1">cm</span>
        </div>
      </div>

      {/* Weight */}
      <div className="bento-card rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between border border-outline-variant/30">
        <div className="flex items-center gap-1.5 sm:gap-2 text-on-surface-variant text-[11px] sm:text-xs font-semibold mb-1 sm:mb-2">
          <Scale size={15} className="text-primary shrink-0 sm:w-4 sm:h-4" /> Cân nặng
        </div>
        <div className="text-2xl sm:text-3xl font-headline-md font-bold text-on-surface">
          {weightKg}
          <span className="text-xs sm:text-sm font-normal text-on-surface-variant ml-1">kg</span>
        </div>
      </div>

      {/* Target Weight */}
      <div className="bento-card rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between bg-green-light/10 border border-green-light/30">
        <div className="flex items-center gap-1.5 sm:gap-2 text-green-light text-[11px] sm:text-xs font-semibold mb-1 sm:mb-2">
          <Target size={15} className="text-green-light shrink-0 sm:w-4 sm:h-4" /> Mục tiêu
        </div>
        <div className="text-2xl sm:text-3xl font-headline-md font-bold text-green-light">
          {targetWeightKg}
          <span className="text-xs sm:text-sm font-normal text-green-light/70 ml-1">kg</span>
        </div>
      </div>

      {/* Wide Summary Card: BMR, TDEE, BMI */}
      <div className="col-span-2 md:col-span-4 bento-card rounded-2xl p-4 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 border border-outline-variant/30 items-center">
        {/* BMI */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-surface-bright/50 flex items-center justify-center border border-white/5 shrink-0">
            <Activity size={20} className="text-primary sm:w-[22px] sm:h-[22px]" />
          </div>
          <div>
            <div className="text-[10px] sm:text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              BMI
            </div>
            <div className="text-lg sm:text-xl font-bold text-primary">
              {bmi} • {bmiCategory}
            </div>
          </div>
        </div>

        {/* BMR */}
        <div className="flex items-center gap-3 sm:gap-4 md:border-l border-white/10 md:pl-6 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-surface-bright/50 flex items-center justify-center border border-white/5 shrink-0">
            <Zap size={20} className="text-blue-400 sm:w-[22px] sm:h-[22px]" />
          </div>
          <div>
            <div className="text-[10px] sm:text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              BMR (Năng lượng cơ bản)
            </div>
            <div className="text-lg sm:text-xl font-bold text-blue-400">
              {bmr} <span className="text-xs font-normal text-white/70">kcal/ngày</span>
            </div>
          </div>
        </div>

        {/* TDEE */}
        <div className="flex items-center gap-3 sm:gap-4 md:border-l border-white/10 md:pl-6 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-surface-bright/50 flex items-center justify-center border border-white/5 shrink-0">
            <Flame size={20} className="text-orange-400 fill-orange-400/20 sm:w-[22px] sm:h-[22px]" />
          </div>
          <div>
            <div className="text-[10px] sm:text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              TDEE
            </div>
            <div className="text-lg sm:text-xl font-bold text-orange-400">
              {tdee} <span className="text-xs font-normal text-white/70">kcal/ngày</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileBiometricsGrid;
