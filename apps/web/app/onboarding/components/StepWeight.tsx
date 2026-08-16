'use client';

import { type OnboardingState } from '../../../store/onboardingStore';
import { Scale } from 'lucide-react';

interface StepWeightProps {
  store: OnboardingState;
}

export default function StepWeight({ store }: StepWeightProps) {
  return (
    <div className="flex flex-col flex-1 h-full space-y-10">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Scale className="text-[#10b981]" size={28} />
          <h2 className="text-3xl font-bold">Chỉ số cơ thể</h2>
        </div>
        <p className="text-white/60 text-base">Xác định điểm xuất phát và đích đến của bạn.</p>
      </div>

      <div className="space-y-8">
        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col items-center">
          <span className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-2">Hiện tại</span>
          <div className="flex items-end text-[#10b981]">
            <input
              type="number"
              suppressHydrationWarning
              value={store.weight || ''}
              onChange={(e) => store.setWeight(parseFloat(e.target.value))}
              placeholder="0"
              className="bg-transparent text-5xl font-bold w-28 text-center outline-none border-b-2 border-[#10b981]"
            />
            <span className="text-lg pb-2 ml-1">kg</span>
          </div>
        </div>

        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col items-center">
          <span className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-2">Mục tiêu</span>
          <div className="flex items-end text-[#10b981]">
            <input
              type="number"
              suppressHydrationWarning
              value={store.targetWeight || ''}
              onChange={(e) => store.setTargetWeight(parseFloat(e.target.value))}
              placeholder="0"
              className="bg-transparent text-5xl font-bold w-28 text-center outline-none border-b-2 border-[#10b981]"
            />
            <span className="text-lg pb-2 ml-1">kg</span>
          </div>
        </div>
      </div>
    </div>
  );
}
