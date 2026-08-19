'use client';

import { type OnboardingState } from '../../../store/onboardingStore';
import { Ruler, AlertCircle } from 'lucide-react';

interface StepHeightProps {
  store: OnboardingState;
}

export default function StepHeight({ store }: StepHeightProps) {
  const height = store.height || 0;
  const isHeightValid = height >= 100 && height <= 200;

  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="flex items-center gap-2 mb-2">
        <Ruler className="text-[#10b981]" size={28} />
        <h2 className="text-3xl font-bold">Chiều cao hiện tại</h2>
      </div>
      <p className="text-white/60 text-base mb-8">
        Thông tin này giúp tính chỉ số BMI & Calo (Hợp lệ: 100cm - 200cm).
      </p>

      <div className="flex flex-col items-center justify-center mt-6 space-y-4">
        <div className="flex items-end justify-center text-[#10b981]">
          <input
            type="number"
            min="100"
            max="200"
            suppressHydrationWarning
            value={store.height || ''}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              store.setHeight(isNaN(val) ? 0 : val);
            }}
            placeholder="170"
            className="bg-transparent text-7xl font-bold w-44 text-center outline-none border-b-2 border-[#10b981]"
          />
          <span className="text-2xl pb-4 ml-2 font-semibold">cm</span>
        </div>

        {height > 0 && !isHeightValid && (
          <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
            <AlertCircle size={16} />
            <span>Chiều cao phải nằm trong khoảng từ 100cm đến 200cm</span>
          </div>
        )}
      </div>
    </div>
  );
}
