'use client';

import React, { useState, useEffect, useRef } from 'react';
import { type OnboardingState } from '../../../store/onboardingStore';
import { Calendar, AlertCircle, Minus, Plus, CheckCircle2 } from 'lucide-react';

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

  const handleAdjust = (delta: number) => {
    const base = isCompleteYear ? numericYear : 2002;
    const next = Math.min(Math.max(base + delta, minYear), maxYear);
    setInputVal(next.toString());
    store.setBirthYear(next);
  };

  return (
    <div className="flex flex-col flex-1 h-full pb-4 sm:pb-6">
      <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
        <Calendar className="text-[#10b981] shrink-0" size={24} />
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">Năm sinh của bạn?</h2>
      </div>
      <p className="text-white/60 text-xs sm:text-sm md:text-base mb-4 sm:mb-6">
        Nhập trực tiếp năm sinh của bạn (Độ tuổi hợp lệ: <strong className="text-[#10b981]">13 - 65 tuổi</strong>).
      </p>

      <div className="w-full my-auto flex flex-col items-center">
        {/* Main Year Input Card */}
        <div
          onClick={() => inputRef.current?.focus()}
          className={`relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-white/5 border transition-all duration-200 w-full max-w-sm cursor-text ${
            isCompleteYear && isValidAge
              ? 'border-[#10b981]/50 shadow-[0_0_30px_rgba(16,185,129,0.15)]'
              : isCompleteYear && !isValidAge
                ? 'border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.15)]'
                : 'border-white/10 hover:border-white/20'
          }`}
        >
          <span className="text-xs uppercase tracking-wider text-white/50 font-semibold mb-3">
            Năm sinh
          </span>

          <div className="flex items-center justify-center gap-3 w-full">
            <button
              type="button"
              suppressHydrationWarning
              onClick={(e) => {
                e.stopPropagation();
                handleAdjust(-1);
              }}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Giảm 1 năm"
            >
              <Minus size={18} />
            </button>

            <div className="flex flex-col items-center">
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
                className="w-36 sm:w-44 text-center text-5xl sm:text-6xl font-extrabold text-[#10b981] bg-transparent outline-none tracking-wider placeholder:text-white/20 border-b-2 border-[#10b981]/50 focus:border-[#10b981] transition-colors"
              />
            </div>

            <button
              type="button"
              suppressHydrationWarning
              onClick={(e) => {
                e.stopPropagation();
                handleAdjust(1);
              }}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Tăng 1 năm"
            >
              <Plus size={18} />
            </button>
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

        {/* Quick Helper Slider for easy dragging if user prefers */}
        <div className="w-full max-w-sm mt-6 space-y-2 px-3">
          <div className="flex justify-between text-xs text-white/40">
            <span>{minYear} (65 tuổi)</span>
            <span>{maxYear} (13 tuổi)</span>
          </div>
          <input
            type="range"
            min={minYear}
            max={maxYear}
            step={1}
            value={isCompleteYear && isValidAge ? numericYear : 2002}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setInputVal(val.toString());
              store.setBirthYear(val);
            }}
            className="w-full h-2 bg-white/15 rounded-lg appearance-none cursor-pointer accent-[#10b981]"
          />
        </div>
      </div>

      {/* Validation Warning Notice */}
      {isCompleteYear && !isValidAge && (
        <div className="w-full max-w-sm mx-auto bg-rose-500/10 border border-rose-500/30 p-3.5 rounded-2xl flex items-center gap-3 text-rose-400 text-xs sm:text-sm mt-auto">
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
