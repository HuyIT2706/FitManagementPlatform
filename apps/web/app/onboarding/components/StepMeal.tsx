'use client';

import { type OnboardingState } from '../../../store/onboardingStore';
import { Check, Utensils } from 'lucide-react';

interface StepMealProps {
  store: OnboardingState;
}

const StepMeal = ({ store }: StepMealProps) => {
  const options = [2, 3, 4, 5];
  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
        <Utensils className="text-[#10b981] shrink-0" size={24} />
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">Tần suất bữa ăn hàng ngày</h2>
      </div>
      <p className="text-white/60 text-xs sm:text-sm md:text-base mb-4 sm:mb-6">Chia nhỏ lượng calo sẽ giúp tối ưu hóa việc tiêu hóa và hấp thụ.</p>

      <div className="space-y-3 sm:space-y-4">
        {options.map((num) => (
          <button
            key={num}
            type="button"
            suppressHydrationWarning
            onClick={() => store.setMealFrequency(num)}
            className={`w-full flex items-center p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer ${store.mealFrequency === num ? 'border-[#10b981] bg-[#10b981]/10' : 'border-white/10 bg-white/5'}`}
          >
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center mr-3 sm:mr-4 shrink-0 ${store.mealFrequency === num ? 'border-[#10b981] bg-[#10b981]' : 'border-white/30'}`}>
              {store.mealFrequency === num && <Check size={16} className="text-[#003824]" />}
            </div>
            <span className="text-base sm:text-lg md:text-xl font-bold text-white">{num} bữa / ngày</span>
            {num === 5 && <span className="ml-auto text-xs bg-white/10 px-2 py-1 rounded-md text-white/60">Khuyên dùng</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StepMeal;
