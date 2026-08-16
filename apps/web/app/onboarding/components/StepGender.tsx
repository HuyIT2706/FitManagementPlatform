'use client';

import { type OnboardingState } from '../../../store/onboardingStore';
import { User, UserCheck, Users } from 'lucide-react';

interface StepGenderProps {
  store: OnboardingState;
}

export default function StepGender({ store }: StepGenderProps) {
  const options = [
    {
      id: 'MALE',
      label: 'Nam',
      sub: 'Dành cho Nam giới',
      icon: (selected: boolean) =>
        selected ? (
          <UserCheck size={44} className="text-[#10b981]" />
        ) : (
          <User size={44} className="text-blue-400/80" />
        ),
    },
    {
      id: 'FEMALE',
      label: 'Nữ',
      sub: 'Dành cho Nữ giới',
      icon: (selected: boolean) =>
        selected ? (
          <UserCheck size={44} className="text-[#10b981]" />
        ) : (
          <User size={44} className="text-pink-400/80" />
        ),
    },
  ];

  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="flex items-center gap-2 mb-2">
        <Users className="text-[#10b981]" size={28} />
        <h2 className="text-3xl font-bold">Giới tính của bạn</h2>
      </div>
      <p className="text-white/60 text-base mb-10">
        Để chúng tôi biết cá nhân hóa chương trình tập luyện phù hợp nhất.
      </p>

      <div className="flex space-x-4">
        {options.map((opt) => {
          const isSelected = store.gender === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              suppressHydrationWarning
              onClick={() => store.setGender(opt.id)}
              className={`flex-1 flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#10b981] bg-[#10b981]/15 text-[#10b981] shadow-[0_0_25px_rgba(16,185,129,0.2)]'
                  : 'border-white/10 bg-white/5 text-white hover:border-white/20'
              }`}
            >
              <div className="mb-4">{opt.icon(isSelected)}</div>
              <span className="font-bold text-xl mb-1">{opt.label}</span>
              <span className="text-xs text-white/50">{opt.sub}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
