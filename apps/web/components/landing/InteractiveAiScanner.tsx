/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Camera, Mic, RefreshCw, Plus, Minus } from 'lucide-react';
import { DEMO_DISHES, VOICE_SAMPLES } from './constants';

export default function InteractiveAiScanner() {
  const [demoMode, setDemoMode] = useState<'vision' | 'voice'>('vision');
  const [selectedDishIdx, setSelectedDishIdx] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [activeVoiceIdx, setActiveVoiceIdx] = useState(0);

  // Dynamic grams adjuster for interactive sandbox
  const [gramAdjustments, setGramAdjustments] = useState<Record<number, number>>({});

  // Trigger smooth scanning animation when dish changes
  const handleSelectDish = (idx: number) => {
    setSelectedDishIdx(idx);
    setGramAdjustments({});
    setIsScanning(true);
    const timer = setTimeout(() => setIsScanning(false), 800);
    return () => clearTimeout(timer);
  };

  const currentDish = DEMO_DISHES[selectedDishIdx];

  // Calculate dynamic totals with strict 1-decimal rounding
  const computedDishTotals = useMemo(() => {
    const raw = (currentDish?.components || []).reduce(
      (acc, comp, i) => {
        const factor = (gramAdjustments[i] ?? comp.defaultGrams) / 100;
        return {
          cal: acc.cal + Math.round(comp.calPer100 * factor),
          pro: acc.pro + comp.proPer100 * factor,
          carb: acc.carb + comp.carbPer100 * factor,
          fat: acc.fat + comp.fatPer100 * factor,
        };
      },
      { cal: 0, pro: 0, carb: 0, fat: 0 }
    );
    return {
      cal: Math.round(raw.cal),
      pro: Math.round(raw.pro * 10) / 10,
      carb: Math.round(raw.carb * 10) / 10,
      fat: Math.round(raw.fat * 10) / 10,
    };
  }, [currentDish, gramAdjustments]);

  const handleAdjustGram = (compIdx: number, delta: number) => {
    const currentComp = currentDish?.components[compIdx];
    if (!currentComp) return;
    const currentVal = gramAdjustments[compIdx] ?? currentComp.defaultGrams;
    const nextVal = Math.max(10, Math.min(500, currentVal + delta));
    setGramAdjustments((prev) => ({ ...prev, [compIdx]: nextVal }));
  };

  const currentVoice = VOICE_SAMPLES[activeVoiceIdx];

  return (
    <section id="ai-scanner" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-20">
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-black">
          Chụp ảnh nhận diện món ăn đa dạng
        </h2>
        <p className="text-zinc-600 text-sm sm:text-base">
          Chọn một món ăn mẫu hoặc câu nói dưới đây để trải nghiệm cách NutriCore bóc tách Calo và thành phần dinh dưỡng.
        </p>

        {/* Mode Switcher Tabs */}
        <div className="inline-flex p-1 rounded-full bg-zinc-100 mt-3 shadow-xs">
          <button
            onClick={() => setDemoMode('vision')}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              demoMode === 'vision'
                ? 'bg-white text-black shadow-xs font-bold'
                : 'text-zinc-600 hover:text-black'
            }`}
          >
            <Camera size={14} />
            <span>Quét ảnh thực đơn</span>
          </button>
          <button
            onClick={() => setDemoMode('voice')}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              demoMode === 'voice'
                ? 'bg-white text-black shadow-xs font-bold'
                : 'text-zinc-600 hover:text-black'
            }`}
          >
            <Mic size={14} />
            <span>Nói tự nhiên</span>
          </button>
        </div>
      </div>

      {demoMode === 'vision' ? (
        <div className="rounded-3xl bg-white p-5 sm:p-8 shadow-sm space-y-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400 font-bold mb-3">
              Chọn đĩa ăn để phân tích:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {DEMO_DISHES.map((dish, idx) => (
                <button
                  key={dish.id}
                  onClick={() => handleSelectDish(idx)}
                  className={`text-left p-3 rounded-2xl transition-all flex flex-col gap-2 cursor-pointer ${
                    selectedDishIdx === idx
                      ? 'bg-zinc-100 shadow-sm'
                      : 'bg-zinc-50/80 hover:bg-zinc-100/70'
                  }`}
                >
                  <img
                    src={dish.image}
                    alt={dish.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-24 rounded-xl object-cover"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 block truncate">
                      {dish.tag}
                    </span>
                    <p className="text-xs font-bold text-black truncate mt-0.5">{dish.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Split View: Photo + Interactive Component Weights */}
          <div className="grid md:grid-cols-12 gap-8 items-start pt-2 border-t border-zinc-100">
            {/* Left Photo View */}
            <div className="md:col-span-6 space-y-4">
              <div className="relative rounded-2xl overflow-hidden aspect-4/3 bg-zinc-100">
                <img
                  src={currentDish?.image}
                  alt={currentDish?.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
                {isScanning && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center">
                    <div className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-xs font-semibold shadow-md">
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Đang phân tích món ăn...</span>
                    </div>
                  </div>
                )}

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                  <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full font-bold text-zinc-900 shadow-xs">
                    {currentDish?.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side: Nutrients & Granular Gram Adjuster */}
            <div className="md:col-span-6 space-y-6">
              {/* Total Calories Bar */}
              <div className="p-4 rounded-2xl bg-zinc-50">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tổng Dinh Dưỡng</p>
                    <p className="text-3xl font-extrabold text-black mt-0.5">
                      {computedDishTotals.cal} <span className="text-sm font-semibold text-zinc-500">kcal</span>
                    </p>
                  </div>
                  <div className="flex gap-2 text-xs font-bold">
                    <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800">
                      P: {computedDishTotals.pro}g
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                      C: {computedDishTotals.carb}g
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-800">
                      F: {computedDishTotals.fat}g
                    </span>
                  </div>
                </div>
              </div>

              {/* Components Adjuster */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold">
                  <span>Thành phần nhận diện</span>
                </div>

                {currentDish?.components.map((comp, idx) => {
                  const currentGrams = gramAdjustments[idx] ?? comp.defaultGrams;
                  const factor = currentGrams / 100;
                  const itemCal = Math.round(comp.calPer100 * factor);

                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-zinc-50 flex items-center justify-between gap-3 text-xs shadow-xs"
                    >
                      <div>
                        <p className="font-bold text-black">{comp.name}</p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">{itemCal} kcal</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleAdjustGram(idx, -10)}
                          className="w-7 h-7 rounded-full bg-white hover:bg-zinc-200 text-zinc-800 font-bold flex items-center justify-center transition shadow-xs cursor-pointer"
                          aria-label="Giảm 10g"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-14 text-center font-extrabold text-black text-xs">
                          {currentGrams}g
                        </span>
                        <button
                          onClick={() => handleAdjustGram(idx, 10)}
                          className="w-7 h-7 rounded-full bg-white hover:bg-zinc-200 text-zinc-800 font-bold flex items-center justify-center transition shadow-xs cursor-pointer"
                          aria-label="Tăng 10g"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link
                href="/onboarding"
                className="w-full py-3.5 rounded-full bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider text-center transition flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Lưu thực đơn & Đo TDEE của bạn →</span>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Voice NLP Clean Sandbox */
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-xl font-bold text-black">
              Thuật toán bóc tách khẩu phần ăn dân dã Việt Nam
            </h3>
            <p className="text-zinc-600 text-xs sm:text-sm">
              Người Việt thường nói: <em>&ldquo;2 quả trứng&rdquo;, &ldquo;nửa chén cơm&rdquo;, &ldquo;1 tô phở&rdquo;</em>. NutriCore tự động nhận dạng quy đổi sang trọng lượng tương đương.
            </p>
          </div>

          {/* Voice Samples */}
          <div className="grid sm:grid-cols-3 gap-3">
            {VOICE_SAMPLES.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => setActiveVoiceIdx(idx)}
                className={`p-4 rounded-2xl text-left transition-all cursor-pointer ${
                  activeVoiceIdx === idx
                    ? 'bg-zinc-100 shadow-sm'
                    : 'bg-zinc-50/80 hover:bg-zinc-100/70'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 mb-2">
                  <Mic size={14} className="text-emerald-600" />
                  <span>Mẫu nói {idx + 1}</span>
                </div>
                <p className="text-xs font-medium text-black line-clamp-2 leading-relaxed">
                  &ldquo;{sample.spoken}&rdquo;
                </p>
                <p className="text-[11px] font-bold text-emerald-700 mt-3 pt-2 border-t border-zinc-200/50">
                  Tổng: {sample.totalCal} kcal
                </p>
              </button>
            ))}
          </div>

          {/* Current Voice Result */}
          <div className="p-5 rounded-2xl bg-zinc-50 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <span className="text-xs font-bold text-zinc-500 uppercase">Kết quả phân tích NLP</span>
              <span className="text-sm font-extrabold text-black">
                {currentVoice?.totalCal} kcal • {currentVoice?.totalP}g Protein
              </span>
            </div>

            <div className="space-y-2">
              {currentVoice?.tokens.map((token, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-white flex items-center justify-between text-xs shadow-xs"
                >
                  <div>
                    <span className="text-zinc-400 font-medium block">Từ nói: &ldquo;{token.raw}&rdquo;</span>
                    <span className="font-bold text-black mt-0.5 block">➔ Quy đổi: {token.parsed}</span>
                  </div>
                  <div className="flex items-center gap-3 font-semibold text-zinc-600">
                    <span>P: {token.p}</span>
                    <span>C: {token.c}</span>
                    <span>F: {token.f}</span>
                    <span className="font-extrabold text-black">{token.cal} kcal</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
