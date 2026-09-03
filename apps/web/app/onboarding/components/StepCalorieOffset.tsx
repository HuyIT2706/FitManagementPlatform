'use client';

import { useState, useEffect } from 'react';
import { type OnboardingState } from '../../../store/onboardingStore';
import apiClient from '../../../api/axios';
import { Flame, SlidersHorizontal } from 'lucide-react';
import type { CalorieOffsetOption } from '../../../interface';

interface StepCalorieOffsetProps {
  store: OnboardingState;
}

const StepCalorieOffset = ({ store }: StepCalorieOffsetProps) => {
  const isLosing = (store.weight || 0) > (store.targetWeight || 0);
  const [options, setOptions] = useState<CalorieOffsetOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCustom, setIsCustom] = useState(false);
  const [customInput, setCustomInput] = useState<string>(() => {
    if (store.caloriesOffset !== undefined && store.caloriesOffset !== null) {
      return String(Math.abs(store.caloriesOffset));
    }
    return isLosing ? '500' : '400';
  });

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

          // Check if current stored offset is a custom value
          const currentOffset = store.caloriesOffset;
          if (currentOffset !== undefined && currentOffset !== null) {
            const matchesPreset = res.data.calorieOffsetOptions.some(
              (opt: CalorieOffsetOption) => opt.offset === currentOffset,
            );
            if (!matchesPreset) {
              setIsCustom(true);
              setCustomInput(String(Math.abs(currentOffset)));
            }
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching calorie offset options from BE:', err);
      })
      .finally(() => setLoading(false));
  }, [store.weight, store.targetWeight, store.height, store.gender, store.activityLevel, store.birthYear, store.caloriesOffset]);

  const currentOffset = store.caloriesOffset ?? (isLosing ? -400 : 400);

  const handleCustomInputChange = (val: string) => {
    setCustomInput(val);
    const num = Math.abs(parseInt(val, 10));
    if (!isNaN(num) && num > 0) {
      store.setCaloriesOffset(isLosing ? -num : num);
    }
  };

  const handleSelectPresetChip = (val: number) => {
    setCustomInput(String(val));
    store.setCaloriesOffset(isLosing ? -val : val);
  };

  const customNum = Math.abs(parseInt(customInput, 10)) || 0;
  const weeklyRate = ((customNum * 7) / 7700).toFixed(2);

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
          <>
            {options.map((opt, idx) => {
              const isSelected = !isCustom && currentOffset === opt.offset;
              return (
                <button
                  key={`${opt.offset}-${idx}`}
                  type="button"
                  suppressHydrationWarning
                  onClick={() => {
                    setIsCustom(false);
                    store.setCaloriesOffset(opt.offset);
                  }}
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
            })}

            {/* Custom Calorie Deficit/Surplus Option */}
            <div
              onClick={() => {
                if (!isCustom) {
                  setIsCustom(true);
                  const num = Math.abs(parseInt(customInput, 10)) || (isLosing ? 600 : 500);
                  store.setCaloriesOffset(isLosing ? -num : num);
                }
              }}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all cursor-pointer relative space-y-3 ${
                isCustom
                  ? 'border-[#10b981] bg-[#10b981]/15 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      isCustom
                        ? 'bg-[#10b981] text-dark-slate font-bold'
                        : 'bg-white/10 text-white/70'
                    }`}
                  >
                    <SlidersHorizontal size={16} />
                  </div>
                  <h3
                    className={`text-lg font-bold ${
                      isCustom ? 'text-[#10b981]' : 'text-white'
                    }`}
                  >
                    {isLosing ? 'Tùy chỉnh mức thâm hụt' : 'Tùy chỉnh mức thặng dư'}
                  </h3>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold bg-white/10 text-white/80 border border-white/15 px-2.5 py-1 rounded-full shrink-0">
                  Tự nhập
                </span>
              </div>

              <p className="text-sm text-white/70 leading-relaxed">
                {isLosing
                  ? 'Tự nhập lượng calo bạn muốn thâm hụt mỗi ngày (ví dụ: 500, 600, 700 kcal...)'
                  : 'Tự nhập lượng calo bạn muốn thặng dư mỗi ngày (ví dụ: 300, 500, 600 kcal...)'}
              </p>

              {/* Input field and quick chips displayed when selected */}
              {isCustom && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="pt-2 border-t border-white/10 space-y-3 animate-in fade-in duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="50"
                        max="2000"
                        step="50"
                        value={customInput}
                        onChange={(e) => handleCustomInputChange(e.target.value)}
                        placeholder="Ví dụ: 600"
                        className="w-full bg-[#121620] border border-white/20 focus:border-[#10b981] rounded-xl px-4 py-3 text-white font-extrabold text-base outline-none pr-28 transition-all"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-white/50 pointer-events-none">
                        kcal / ngày
                      </span>
                    </div>
                  </div>

                  {/* Quick Preset Chips */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-white/50 font-medium">Gợi ý nhanh:</span>
                    {(isLosing ? [300, 500, 600, 700, 800] : [200, 300, 400, 500, 600]).map((val) => (
                      <button
                        key={val}
                        type="button"
                        suppressHydrationWarning
                        onClick={() => handleSelectPresetChip(val)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                          customNum === val
                            ? 'bg-[#10b981] text-dark-slate border-[#10b981] shadow-sm'
                            : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
                        }`}
                      >
                        {val} kcal
                      </button>
                    ))}
                  </div>

                  {/* Realtime impact estimate */}
                  {customNum > 0 && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white/80">
                      <Flame size={15} className="text-[#10b981] shrink-0" />
                      <span>
                        {isLosing ? 'Thâm hụt ' : 'Thặng dư '}
                        <strong className="text-[#10b981]">{customNum} kcal/ngày</strong>
                        {' '}&bull; Dự kiến {isLosing ? 'giảm' : 'tăng'}{' '}
                        <strong className="text-white">~{weeklyRate} kg/tuần</strong>
                      </span>
                    </div>
                  )}

                  {/* Warning if deficit is very high */}
                  {isLosing && customNum > 1000 && (
                    <p className="text-[11px] text-amber-400 font-medium">
                      ⚠️ Mức thâm hụt trên 1000 kcal/ngày là rất lớn, cần đảm bảo đủ chất dinh dưỡng và tham khảo ý kiến HLV/bác sĩ.
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StepCalorieOffset;
