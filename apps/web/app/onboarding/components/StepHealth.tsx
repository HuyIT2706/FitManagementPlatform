'use client';

import { type OnboardingState } from '../../../store/onboardingStore';
import { Check, Activity } from 'lucide-react';

interface StepHealthProps {
  store: OnboardingState;
}

export default function StepHealth({ store }: StepHealthProps) {
  const options = [
    { id: 'HEALTHY', label: 'Khỏe mạnh', desc: 'Không có vấn đề sức khỏe đặc biệt' },
    { id: 'DIABETES', label: 'Tiểu đường', desc: 'Đường huyết cao, cần kiểm soát chỉ số GI' },
    { id: 'BLOOD_PRESSURE', label: 'Huyết áp cao', desc: 'Hoặc các vấn đề tim mạch' },
    { id: 'STOMACH', label: 'Dạ dày', desc: 'Khó tiêu, viêm loét dạ dày' },
  ];

  const handleSelect = (optId: string) => {
    if (optId === 'HEALTHY') {
      store.toggleHealthCondition('HEALTHY');
    } else {
      if (store.healthConditions.includes('HEALTHY')) {
        store.toggleHealthCondition('HEALTHY');
      }
      store.toggleHealthCondition(optId);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="text-[#10b981]" size={28} />
        <h2 className="text-3xl font-bold">Tình trạng sức khỏe</h2>
      </div>
      <p className="text-white/60 text-base mb-8">Vui lòng chọn để thiết lập các bài tập và dinh dưỡng an toàn.</p>

      <div className="space-y-4 overflow-y-auto pb-4">
        {options.map((opt) => {
          const isSelected = store.healthConditions.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              suppressHydrationWarning
              onClick={() => handleSelect(opt.id)}
              className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all text-left cursor-pointer ${
                isSelected
                  ? 'border-[#10b981] bg-[#10b981]/15'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div>
                <span className={`text-lg font-bold block mb-1 ${isSelected ? 'text-[#10b981]' : 'text-white'}`}>
                  {opt.label}
                </span>
                <span className="text-sm text-white/60">{opt.desc}</span>
              </div>
              <div
                className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ml-4 transition-colors ${
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
