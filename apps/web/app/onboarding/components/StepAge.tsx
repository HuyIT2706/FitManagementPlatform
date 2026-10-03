'use client';

import React, { useState, useEffect, useRef } from 'react';
import { type OnboardingState } from '../../../store/onboardingStore';
import { Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';

interface StepAgeProps {
  store: OnboardingState;
}

const StepAge = ({ store }: StepAgeProps) => {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 65;
  const maxYear = currentYear - 13;

  const [inputVal, setInputVal] = useState<string>(
    store.birthYear ? store.birthYear.toString() : '2002'
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (store.birthYear) {
      setInputVal(store.birthYear.toString());
    }
  }, [store.birthYear]);

  const numericYear = parseInt(inputVal, 10);
  const isCompleteYear = inputVal.length === 4 && !isNaN(numericYear);
  const calculatedAge = isCompleteYear ? currentYear - numericYear : null;
  const isValidAge =
    calculatedAge !== null && calculatedAge >= 13 && calculatedAge <= 65;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setInputVal(raw);
    if (raw.length === 4) {
      const year = parseInt(raw, 10);
      store.setBirthYear(year);
    } else if (raw.length === 0) {
      store.setBirthYear(0);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full pb-4 sm:pb-6">
      <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
        <Calendar className="text-[#10b981] shrink-0" size={24} />
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">Năm sinh của bạn?</h2>
      </div>
      <p className="text-emerald-100/70 text-xs sm:text-sm md:text-base mb-4 sm:mb-6">
        Nhập năm sinh để chúng tôi tính toán độ tuổi và chế độ phù hợp.
      </p>

      <div className="w-full my-auto flex flex-col items-center">
        {/* Main Year Input Card */}
        <div
          onClick={() => inputRef.current?.focus()}
          className={`relative flex flex-col mt-5 items-center justify-center p-6 sm:p-8 rounded-3xl bg-[#131d17] border transition-all duration-200 w-full max-w-sm cursor-text ${
            isCompleteYear && isValidAge
              ? 'border-[#10b981]/50 shadow-[0_0_30px_rgba(16,185,129,0.15)]'
              : isCompleteYear && !isValidAge
                ? 'border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.15)]'
                : 'border-emerald-500/20 hover:border-emerald-500/40'
          }`}
        >
          <span className="text-xs uppercase tracking-wider text-emerald-300/80 font-semibold mb-3">
            Năm sinh
          </span>

          <div className="flex flex-col items-center justify-center w-full">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={inputVal}
              onChange={handleInputChange}
              onFocus={(e) => e.target.select()}
              placeholder="2002"
              className="w-44 sm:w-52 text-center text-5xl sm:text-6xl font-extrabold text-[#10b981] bg-transparent outline-none tracking-wider placeholder:text-white/20 border-b-2 border-[#10b981]/50 focus:border-[#10b981] transition-colors pb-1"
            />
          </div>

          {/* Age Status Pill */}
          <div className="mt-4 flex items-center gap-2">
            {isCompleteYear ? (
              <>
                <span className="text-lg font-bold text-white">
                  {calculatedAge} tuổi
                </span>
                {isValidAge ? (
                  <span className="bg-[#10b981]/20 text-[#10b981] text-xs px-2.5 py-0.5 rounded-full font-bold border border-[#10b981]/30 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Hợp lệ
                  </span>
                ) : (
                  <span className="bg-rose-500/20 text-rose-400 text-xs px-2.5 py-0.5 rounded-full font-bold border border-rose-500/30 flex items-center gap-1">
                    <AlertCircle size={12} /> Không hợp lệ
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-white/40 italic">
                Nhập đủ 4 số năm sinh (VD: 2002)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Validation Warning Notice */}
      {isCompleteYear && !isValidAge && (
        <div className="w-full max-w-sm mx-auto  bg-rose-500/10 border border-rose-500/30 p-3.5 rounded-2xl flex items-center gap-3 text-rose-400 text-xs sm:text-sm mt-auto">
          <AlertCircle size={18} className="shrink-0" />
          <p>
            Độ tuổi hợp lệ từ <strong>13 đến 65 tuổi</strong> ({minYear} - {maxYear}).
          </p>
        </div>
      )}
    </div>
  );
};

export default StepAge;
