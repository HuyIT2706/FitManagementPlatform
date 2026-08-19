'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '../../store/onboardingStore';
import apiClient from '../../api/axios';
import { toast } from '../../utils/toast';
import { type OnboardingFormData } from '../../interface';
import { ArrowLeft } from 'lucide-react';
import StepAge from './components/StepAge';
import StepGender from './components/StepGender';
import StepWeight from './components/StepWeight';
import StepHeight from './components/StepHeight';
import StepActivity from './components/StepActivity';
import StepBMI from './components/StepBMI';
import StepCalorieOffset from './components/StepCalorieOffset';
import StepMeal from './components/StepMeal';
import StepDiet from './components/StepDiet';
import StepHealth from './components/StepHealth';
import StepNotify from './components/StepNotify';

const steps = 11;

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isClient, setIsClient] = useState(false);
  const store = useOnboardingStore();
  const [formData, setFormData] = useState<OnboardingFormData>({
    birthYear: store.birthYear || 2000,
    gender: store.gender,
    weight: store.weight,
    targetWeight: store.targetWeight,
    height: store.height,
    activityLevel: store.activityLevel,
    caloriesOffset: store.caloriesOffset ?? -400,
    mealFrequency: store.mealFrequency,
    dietaryPreferences: store.dietaryPreferences,
    healthConditions: store.healthConditions,
    pushNotifications: store.pushNotifications,
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setFormData({
      birthYear: store.birthYear || 2002,
      gender: store.gender,
      weight: store.weight,
      targetWeight: store.targetWeight,
      height: store.height,
      activityLevel: store.activityLevel,
      caloriesOffset: store.caloriesOffset ?? -400,
      mealFrequency: store.mealFrequency,
      dietaryPreferences: store.dietaryPreferences,
      healthConditions: store.healthConditions,
      pushNotifications: store.pushNotifications,
    });
  }, [
    store.birthYear,
    store.gender,
    store.weight,
    store.targetWeight,
    store.height,
    store.activityLevel,
    store.caloriesOffset,
    store.mealFrequency,
    store.dietaryPreferences,
    store.healthConditions,
    store.pushNotifications,
  ]);

  const handleNext = async () => {
    const currentYear = new Date().getFullYear();
    const selectedYear = formData.birthYear || 2002;
    const calculatedAge = currentYear - selectedYear;

    if (currentStep === 1) {
      if (!formData.birthYear) {
        toast.error('Vui lòng chọn năm sinh của bạn.');
        return;
      }
      if (calculatedAge < 13 || calculatedAge > 65) {
        toast.error('Độ tuổi tham gia tập luyện phù hợp từ 13 đến 65 tuổi!');
        return;
      }
    }

    if (currentStep === 2) {
      if (!formData.gender) {
        toast.error('Vui lòng chọn giới tính của bạn.');
        return;
      }
    }

    if (currentStep === 3) {
      if (!formData.weight || formData.weight < 30 || formData.weight > 150) {
        toast.error('Cân nặng hiện tại phải từ 30kg đến 150kg!');
        return;
      }
      if (!formData.targetWeight || formData.targetWeight < 30 || formData.targetWeight > 150) {
        toast.error('Cân nặng mục tiêu phải từ 30kg đến 150kg!');
        return;
      }
    }

    if (currentStep === 4) {
      if (!formData.height || formData.height < 100 || formData.height > 200) {
        toast.error('Chiều cao hiện tại phải từ 100cm đến 200cm!');
        return;
      }
    }

    if (currentStep === 5) {
      if (!formData.activityLevel) {
        toast.error('Vui lòng chọn lối sống & mức độ hoạt động.');
        return;
      }
    }

    if (currentStep === 7) {
      if (formData.caloriesOffset === undefined || formData.caloriesOffset === null) {
        toast.error('Vui lòng chọn mức độ thâm hụt calo.');
        return;
      }
    }

    if (currentStep === 8) {
      if (!formData.mealFrequency || formData.mealFrequency <= 0) {
        toast.error('Vui lòng chọn tần suất bữa ăn hàng ngày.');
        return;
      }
    }

    if (currentStep === 9) {
      if (!formData.dietaryPreferences || formData.dietaryPreferences.length === 0) {
        toast.error("Vui lòng chọn hạn chế ăn uống của bạn (hoặc chọn 'Không bị dị ứng').");
        return;
      }
    }

    if (currentStep === 10) {
      if (!formData.healthConditions || formData.healthConditions.length === 0) {
        toast.error("Vui lòng chọn tình trạng sức khỏe của bạn (hoặc chọn 'Khỏe mạnh').");
        return;
      }
    }

    if (currentStep < steps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      try {
        const payload = {
          gender: formData.gender,
          weight: formData.weight,
          targetWeight: formData.targetWeight,
          height: formData.height,
          activityLevel: formData.activityLevel,
          caloriesOffset: formData.caloriesOffset ?? -400,
          mealFrequency: formData.mealFrequency,
          dietaryPreferences: formData.dietaryPreferences,
          healthConditions: formData.healthConditions,
          pushNotifications: formData.pushNotifications,
          dateOfBirth: new Date(selectedYear, 0, 1).toISOString(),
        };

        await apiClient.patch('/users/onboarding', payload);
        window.location.href = '/';
      } catch (err) {
        console.error(err);
        toast.error('Có lỗi xảy ra khi lưu thông tin');
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (!isClient) return null;

  return (
    <div className="bg-[#0e1511] text-[#dde4dd] min-h-screen flex flex-col font-sans">
      {/* Header & Progress */}
      <header className="p-4 flex items-center justify-between sticky top-0 z-10 bg-[#0e1511]/80 backdrop-blur-md">
        <button
          type="button"
          suppressHydrationWarning
          onClick={handleBack}
          className={`p-2 rounded-full hover:bg-white/10 ${currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}
        >
          <ArrowLeft size={24} />
        </button>
        <span className="font-semibold text-lg">FitManagement</span>
        <div className="w-10"></div>
      </header>

      <div className="px-6 py-2">
        <div className="flex justify-between text-ms font-semibold text-[#10b981] mb-2">
          <span>Bước {currentStep} của {steps}</span>
          <span>{Math.round((currentStep / steps) * 100)}%</span>
        </div>
        <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#10b981]"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / steps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
      {/* Main */}
      <main className="flex-1 overflow-hidden relative mt-8 px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="h-full flex flex-col"
          >
            {currentStep === 1 && <StepAge store={store} />}
            {currentStep === 2 && <StepGender store={store} />}
            {currentStep === 3 && <StepWeight store={store} />}
            {currentStep === 4 && <StepHeight store={store} />}
            {currentStep === 5 && <StepActivity store={store} />}
            {currentStep === 6 && <StepBMI store={store} />}
            {currentStep === 7 && <StepCalorieOffset store={store} />}
            {currentStep === 8 && <StepMeal store={store} />}
            {currentStep === 9 && <StepDiet store={store} />}
            {currentStep === 10 && <StepHealth store={store} />}
            {currentStep === 11 && <StepNotify store={store} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="p-6 pb-10">
        <button
          type="button"
          suppressHydrationWarning
          onClick={handleNext}
          className="w-full h-14 rounded-full bg-[#10b981] text-[#003824] font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
        >
          {currentStep === steps ? 'Hoàn tất' : 'Tiếp tục'}
        </button>
      </footer>
    </div>
  );
}
