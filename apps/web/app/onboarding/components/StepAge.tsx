'use client';

import { type OnboardingState } from '../../../store/onboardingStore';
import { Calendar, AlertCircle } from 'lucide-react';

interface StepAgeProps {
  store: OnboardingState;
}

export default function StepAge({ store }: StepAgeProps) {
  const currentYear = new Date().getFullYear();
  const selectedYear = store.birthYear || 2002;
  const calculatedAge = currentYear - selectedYear;
  const isValidAge = calculatedAge >= 13 && calculatedAge <= 65;


  return (
    <div className="flex flex-col items-center justify-between flex-1 h-full pb-6">
      <div className="w-full text-center">
        <div className="w-16 h-16 bg-[#10b981]/15 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#10b981]/30">
          <Calendar className="text-[#10b981]" size={32} />
        </div>
        <h2 className="text-3xl font-bold mb-2">Năm sinh của bạn?</h2>
        <p className="text-white/60 text-ms px-4">
          Kéo thanh để chọn năm sinh (Độ tuổi hợp lệ: <strong className="text-[#10b981]">13 - 65 tuổi</strong>).
        </p>
      </div>

      <div className="w-full my-8 flex flex-col items-center">
        {/* Main Display Badge */}
        <div className="relative flex flex-col items-center justify-center p-6 rounded-3xl bg-white/5 border border-white/10 w-full max-w-sm">
          <span className="text-6xl font-extrabold text-[#10b981] tracking-wider mb-1">
            {selectedYear}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">
              {calculatedAge} tuổi
            </span>
            {isValidAge ? (
              <span className="bg-[#10b981]/20 text-[#10b981] text-xs px-2.5 py-0.5 rounded-full font-bold border border-[#10b981]/30">
                Hợp lệ
              </span>
            ) : (
              <span className="bg-red-500/20 text-red-400 text-xs px-2.5 py-0.5 rounded-full font-bold border border-red-500/30">
                Không hợp lệ
              </span>
            )}
          </div>
        </div>

        {/* Year Slider */}
        <div className="w-full max-w-sm mt-8 space-y-3 px-2">
          <input
            type="range"
            min={1955}
            max={currentYear - 10}
            step={1}
            value={selectedYear}
            onChange={(e) => store.setBirthYear(parseInt(e.target.value))}
            className="w-full h-5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#10b981]"
          />
        </div>
      </div>
      {/* Validation Warning Notice */}
      {!isValidAge && (
        <div className="w-full max-w-sm bg-red-500/10 border border-red-500/30 p-3.5 rounded-2xl flex items-center gap-3 text-red-400 text-ms">
          <AlertCircle size={20} className="shrink-0" />
          <p>
            Độ tuổi tham gia tập luyện hợp lệ là từ <strong>13 đến 65 tuổi</strong>. Vui lòng chọn lại năm sinh từ <strong>{currentYear - 65}</strong> đến <strong>{currentYear - 13}</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
