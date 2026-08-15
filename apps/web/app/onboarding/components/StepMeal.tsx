'use client';

import { type OnboardingState } from '../../../store/onboardingStore';
import { Check } from 'lucide-react';

interface StepMealProps {
  store: OnboardingState;
}

export default function StepMeal({ store }: StepMealProps) {
  const options = [2, 3, 4, 5];
  return (
    <div className="flex flex-col flex-1 h-full">
      <h2 className="text-3xl font-bold mb-4">Tần suất bữa ăn hàng ngày</h2>
      <p className="text-white/60 mb-10">Chia nhỏ lượng calo sẽ giúp tối ưu hóa việc tiêu hóa và hấp thụ.</p>

      <div className="space-y-4">
        {options.map((num) => (
          <button
            key={num}
            type="button"
            suppressHydrationWarning
            onClick={() => store.setMealFrequency(num)}
            className={`w-full flex items-center p-5 rounded-2xl border-2 transition-all cursor-pointer ${store.mealFrequency === num ? 'border-[#10b981] bg-[#10b981]/10' : 'border-white/10 bg-white/5'}`}
          >
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center mr-4 ${store.mealFrequency === num ? 'border-[#10b981] bg-[#10b981]' : 'border-white/30'}`}>
              {store.mealFrequency === num && <Check size={16} className="text-[#003824]" />}
            </div>
            <span className="text-xl font-semibold">{num} bữa / ngày</span>
            {num === 5 && <span className="ml-auto text-xs bg-white/10 px-2 py-1 rounded-md text-white/60">Khuyên dùng</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
