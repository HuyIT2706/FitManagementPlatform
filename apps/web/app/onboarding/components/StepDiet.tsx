'use client';

import { type OnboardingState } from '../../../store/onboardingStore';
import { Check, ShieldCheck } from 'lucide-react';

interface StepDietProps {
  store: OnboardingState;
}

export default function StepDiet({ store }: StepDietProps) {
  const options = [
    { id: 'NONE', label: 'Không bị dị ứng' },
    { id: 'SEAFOOD', label: 'Hải sản' },
    { id: 'MILK', label: 'Sữa & Sản phẩm từ sữa' },
    { id: 'EGG', label: 'Trứng' },
    { id: 'PEANUT', label: 'Đậu phộng / Các loại hạt' },
  ];

  const handleSelect = (optId: string) => {
    if (optId === 'NONE') {
      // If select NONE, clear all others and set NONE
      store.toggleDietaryPreference('NONE');
    } else {
      // If select specific allergy, remove NONE if present
      if (store.dietaryPreferences.includes('NONE')) {
        store.toggleDietaryPreference('NONE');
      }
      store.toggleDietaryPreference(optId);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="text-[#10b981]" size={28} />
        <h2 className="text-3xl font-bold">Hạn chế ăn uống hoặc Dị ứng</h2>
      </div>
      <p className="text-white/60 mb-8">Vui lòng chọn để chúng tôi loại trừ các thực phẩm gây dị ứng khỏi thực đơn của bạn.</p>

      <div className="space-y-3">
        {options.map((opt) => {
          const isSelected = store.dietaryPreferences.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              suppressHydrationWarning
              onClick={() => handleSelect(opt.id)}
              className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#10b981] bg-[#10b981]/15 text-[#10b981]'
                  : 'border-white/10 bg-white/5 text-white hover:border-white/20'
              }`}
            >
              <span className="font-bold text-base">{opt.label}</span>
              <div
                className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                  isSelected
                    ? 'border-[#10b981] bg-[#10b981]'
                    : 'border-white/30 bg-transparent'
                }`}
              >
                {isSelected && <Check size={14} className="text-[#003824] stroke-[3]" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
