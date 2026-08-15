'use client';

import { useState, useEffect } from 'react';
import { type OnboardingState } from '../../../store/onboardingStore';
import apiClient from '../../../api/axios';

interface StepBMIProps {
  store: OnboardingState;
}

export default function StepBMI({ store }: StepBMIProps) {
  const [bmiData, setBmiData] = useState<{
    bmi: number;
    bmiCategory: string;
    bmiColor: string;
    bmiDescription: string;
  } | null>(null);

  useEffect(() => {
    const selectedYear = store.birthYear || 2002;
    const dateOfBirth = new Date(selectedYear, 0, 1).toISOString();

    apiClient
      .post('/users/preview-tdee', {
        weight: store.weight || 70,
        height: store.height || 170,
        gender: store.gender || 'MALE',
        activityLevel: store.activityLevel || 'SEDENTARY',
        dateOfBirth,
      })
      .then((res) => {
        setBmiData({
          bmi: res.data.bmi,
          bmiCategory: res.data.bmiCategory,
          bmiColor: res.data.bmiColor,
          bmiDescription: res.data.bmiDescription,
        });
      })
      .catch((err) => {
        console.error('Error fetching BMI preview from BE:', err);
      });
  }, [store.weight, store.height, store.gender, store.activityLevel, store.birthYear]);

  const heightM = (store.height || 170) / 100;
  const fallbackBmi = store.weight ? (store.weight / (heightM * heightM)).toFixed(1) : '24.2';

  const bmiVal = bmiData?.bmi ?? parseFloat(fallbackBmi);
  const bmiCategory = bmiData?.bmiCategory ?? 'Bình thường';
  const bmiColor = bmiData?.bmiColor ?? 'text-[#10b981]';
  const bmiDescription =
    bmiData?.bmiDescription ??
    'Mức cân nặng lý tưởng của bạn là nền tảng để chúng tôi xây dựng chương trình tập luyện phù hợp.';

  // Calculate arc percentage for visual gauge (15 BMI -> 0%, 40 BMI -> 100%)
  const gaugePercent = Math.min(100, Math.max(0, ((bmiVal - 15) / (40 - 15)) * 100));

  return (
    <div className="flex flex-col items-center flex-1 h-full">
      <h2 className="text-2xl font-bold mb-2">Kết quả BMI</h2>
      <p className="text-white/60 text-center mb-10">Tính toán trực tiếp từ Backend</p>

      <div className="relative w-64 h-36 overflow-hidden flex justify-center mb-10">
        {/* Background track */}
        <div className="absolute top-0 w-64 h-64 border-[18px] border-white/10 rounded-full border-b-transparent border-r-transparent rotate-45"></div>

        {/* Visual progress arc */}
        <div
          className="absolute top-0 w-64 h-64 border-[18px] border-[#10b981] rounded-full border-b-transparent border-r-transparent transition-all duration-700"
          style={{
            clipPath: 'polygon(50% 50%, 0 0, 50% 0)',
            transform: `rotate(${-45 + gaugePercent * 1.8}deg)`,
          }}
        ></div>

        <div className="absolute bottom-2 flex flex-col items-center">
          <span className="text-5xl font-extrabold text-white tracking-tight">{bmiVal.toFixed(1)}</span>
          <span className={`font-bold text-lg ${bmiColor} mt-1`}>{bmiCategory}</span>
        </div>
      </div>

      <div className="w-full bg-white/5 p-6 rounded-3xl border border-white/10 shadow-lg">
        <p className="text-center text-white/80 leading-relaxed text-sm">
          {bmiDescription}
        </p>
      </div>
    </div>
  );
}
