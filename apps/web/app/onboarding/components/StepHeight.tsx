'use client';

import { type OnboardingState } from '../../../store/onboardingStore';
import { Ruler } from 'lucide-react';

interface StepHeightProps {
  store: OnboardingState;
}

export default function StepHeight({ store }: StepHeightProps) {
  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="flex items-center gap-2 mb-2">
        <Ruler className="text-[#10b981]" size={28} />
        <h2 className="text-3xl font-bold">Chiều cao hiện tại</h2>
      </div>
      <p className="text-white/60 text-base mb-12">Thông tin này giúp chúng tôi tính chỉ số BMI và mục tiêu calo.</p>

      <div className="flex items-end justify-center text-[#10b981] mt-10">
        <input
          type="number"
          suppressHydrationWarning
          value={store.height || ''}
          onChange={(e) => store.setHeight(parseFloat(e.target.value))}
          placeholder="170"
          className="bg-transparent text-7xl font-bold w-36 text-center outline-none border-b-2 border-[#10b981]"
        />
        <span className="text-2xl pb-4 ml-2 font-semibold">cm</span>
      </div>
    </div>
  );
}
