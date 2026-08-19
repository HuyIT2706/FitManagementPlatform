'use client';

import { type OnboardingState } from '../../../store/onboardingStore';
import { Scale, AlertCircle } from 'lucide-react';

interface StepWeightProps {
  store: OnboardingState;
}

export default function StepWeight({ store }: StepWeightProps) {
  const weight = store.weight || 0;
  const targetWeight = store.targetWeight || 0;

  const isWeightValid = weight >= 30 && weight <= 150;
  const isTargetWeightValid = targetWeight >= 30 && targetWeight <= 150;

  return (
    <div className="flex flex-col flex-1 h-full space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Scale className="text-[#10b981]" size={28} />
          <h2 className="text-3xl font-bold">Chỉ số cơ thể</h2>
        </div>
        <p className="text-white/60 text-base">
          Xác định điểm xuất phát và đích đến của bạn (Hợp lệ: 30kg - 150kg).
        </p>
      </div>

      <div className="space-y-6">
        {/* Current Weight Input */}
        <div
          className={`bg-white/5 p-6 rounded-3xl border transition-all flex flex-col items-center ${
            weight > 0 && !isWeightValid
              ? 'border-rose-500/80 bg-rose-500/5'
              : 'border-white/10'
          }`}
        >
          <span className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-2">
            Hiện tại
          </span>
          <div className="flex items-end text-[#10b981]">
            <input
              type="number"
              min="30"
              max="150"
              suppressHydrationWarning
              value={store.weight || ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                store.setWeight(isNaN(val) ? 0 : val);
              }}
              placeholder="70"
              className="bg-transparent text-5xl font-bold w-36 text-center outline-none border-b-2 border-[#10b981]"
            />
            <span className="text-lg pb-2 ml-1">kg</span>
          </div>
          {weight > 0 && !isWeightValid && (
            <div className="flex items-center gap-1.5 text-xs text-rose-400 mt-3 font-semibold">
              <AlertCircle size={14} />
              <span>Cân nặng hiện tại phải từ 30kg đến 150kg</span>
            </div>
          )}
        </div>

        {/* Target Weight Input */}
        <div
          className={`bg-white/5 p-6 rounded-3xl border transition-all flex flex-col items-center ${
            targetWeight > 0 && !isTargetWeightValid
              ? 'border-rose-500/80 bg-rose-500/5'
              : 'border-white/10'
          }`}
        >
          <span className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-2">
            Mục tiêu
          </span>
          <div className="flex items-end text-[#10b981]">
            <input
              type="number"
              min="30"
              max="150"
              suppressHydrationWarning
              value={store.targetWeight || ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                store.setTargetWeight(isNaN(val) ? 0 : val);
              }}
              placeholder="65"
              className="bg-transparent text-5xl font-bold w-36 text-center outline-none border-b-2 border-[#10b981]"
            />
            <span className="text-lg pb-2 ml-1">kg</span>
          </div>
          {targetWeight > 0 && !isTargetWeightValid && (
            <div className="flex items-center gap-1.5 text-xs text-rose-400 mt-3 font-semibold">
              <AlertCircle size={14} />
              <span>Cân nặng mục tiêu phải từ 30kg đến 150kg</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
