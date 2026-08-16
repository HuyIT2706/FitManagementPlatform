'use client';

import { type OnboardingState } from '../../../store/onboardingStore';
import { Zap } from 'lucide-react';

interface StepActivityProps {
  store: OnboardingState;
}

export default function StepActivity({ store }: StepActivityProps) {
  const options = [
    { id: 'SEDENTARY', label: 'Ít vận động', desc: 'Làm việc văn phòng, ít đi lại, không tập thể dục thường xuyên' },
    { id: 'LIGHTLY_ACTIVE', label: 'Vận động nhẹ', desc: 'Tập thể dục nhẹ nhàng 1-3 ngày/tuần hoặc công việc đi lại nhiều' },
    { id: 'MODERATELY_ACTIVE', label: 'Vừa phải', desc: 'Tập thể dục vừa sức 3-5 ngày/tuần hoặc làm việc vất vả' },
    { id: 'VERY_ACTIVE', label: 'Rất năng động', desc: 'Tập thể dục nặng 6-7 ngày/tuần hoặc làm công việc chân tay nặng' },
  ];

  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="text-[#10b981]" size={28} />
        <h2 className="text-3xl font-bold">Lối sống & Mức độ hoạt động</h2>
      </div>
      <p className="text-white/60 text-base mb-8">Chọn mức mô tả đúng nhất hoạt động của bạn hàng ngày.</p>

      <div className="space-y-4 overflow-y-auto pb-4">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            suppressHydrationWarning
            onClick={() => store.setActivityLevel(opt.id)}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all cursor-pointer ${store.activityLevel === opt.id ? 'border-[#10b981] bg-[#10b981]/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
          >
            <h3 className={`text-lg font-bold mb-1 ${store.activityLevel === opt.id ? 'text-[#10b981]' : 'text-white'}`}>{opt.label}</h3>
            <p className="text-sm text-white/60 leading-relaxed">{opt.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
