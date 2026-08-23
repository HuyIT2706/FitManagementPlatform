'use client';

import { useState, useEffect } from 'react';
import { type OnboardingState } from '../../../store/onboardingStore';
import apiClient from '../../../api/axios';
import { Flame } from 'lucide-react';
import type { CalorieOffsetOption } from '../../../interface';

interface StepCalorieOffsetProps {
  store: OnboardingState;
}

const StepCalorieOffset = ({ store }: StepCalorieOffsetProps) => {
  const isLosing = (store.weight || 0) > (store.targetWeight || 0);
  const [options, setOptions] = useState<CalorieOffsetOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const selectedYear = store.birthYear || 2002;
    const dateOfBirth = new Date(selectedYear, 0, 1).toISOString();

    apiClient
      .post('/users/preview-tdee', {
        weight: store.weight || 70,
        targetWeight: store.targetWeight || 70,
        height: store.height || 170,
        gender: store.gender || 'MALE',
        activityLevel: store.activityLevel || 'SEDENTARY',
        dateOfBirth,
      })
      .then((res) => {
        if (res.data?.calorieOffsetOptions && Array.isArray(res.data.calorieOffsetOptions)) {
          setOptions(res.data.calorieOffsetOptions);
        }
      })
      .catch((err) => {
        console.error('Error fetching calorie offset options from BE:', err);
      })
      .finally(() => setLoading(false));
  }, [store.weight, store.targetWeight, store.height, store.gender, store.activityLevel, store.birthYear]);

  const currentOffset = store.caloriesOffset ?? (isLosing ? -400 : 400);

  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="flex items-center gap-2 mb-2">
        <Flame className="text-[#10b981]" size={28} />
        <h2 className="text-3xl font-bold">
          {isLosing ? 'Mức độ Thâm hụt Calo' : 'Mức độ Thặng dư Calo'}
        </h2>
      </div>
      <p className="text-white/60 text-base mb-6">
        Chọn tốc độ {isLosing ? 'giảm cân' : 'tăng cân'} phù hợp nhất với cơ địa & lối sống của bạn.
      </p>

      <div className="space-y-4 overflow-y-auto pb-4 no-scrollbar">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-5 rounded-2xl border border-white/10 bg-white/5 animate-pulse h-24" />
            ))}
          </div>
        ) : (
          options.map((opt, idx) => {
            const isSelected = currentOffset === opt.offset;
            return (
              <button
                key={`${opt.offset}-${idx}`}
                type="button"
                suppressHydrationWarning
                onClick={() => store.setCaloriesOffset(opt.offset)}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-[#10b981] bg-[#10b981]/15 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h3
                    className={`text-lg font-bold ${
                      isSelected ? 'text-[#10b981]' : 'text-white'
                    }`}
                  >
                    {opt.title}
                  </h3>
                  {opt.recommended && (
                    <span className="text-[10px] uppercase tracking-wider font-extrabold bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 px-2.5 py-1 rounded-full shrink-0">
                      Khuyên dùng
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/70 leading-relaxed">{opt.desc}</p>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StepCalorieOffset;
