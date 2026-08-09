'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '../../store/onboardingStore';
import { ArrowLeft, Check } from 'lucide-react';

const steps = 10;

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isClient, setIsClient] = useState(false);
  const store = useOnboardingStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleNext = async () => {
    if (currentStep < steps) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Final Submit
      try {
        const token = localStorage.getItem('jwt_token');
        const response = await fetch('http://localhost:3100/users/onboarding', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            gender: store.gender,
            weight: store.weight,
            targetWeight: store.targetWeight,
            height: store.height,
            activityLevel: store.activityLevel,
            mealFrequency: store.mealFrequency,
            dietaryPreferences: store.dietaryPreferences,
            healthConditions: store.healthConditions,
            pushNotifications: store.pushNotifications,
            // Calculate date of birth approx from age
            dateOfBirth: store.age ? new Date(new Date().getFullYear() - store.age, 0, 1).toISOString() : undefined
          })
        });

        if (response.ok) {
          window.location.href = '/';
        } else {
          alert('Có lỗi xảy ra khi lưu thông tin');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!isClient) return null;

  return (
    <div className="bg-[#0e1511] text-[#dde4dd] min-h-screen flex flex-col font-sans">
      {/* Header & Progress */}
      <header className="p-4 flex items-center justify-between sticky top-0 z-10 bg-[#0e1511]/80 backdrop-blur-md">
        <button onClick={handleBack} className={`p-2 rounded-full hover:bg-white/10 ${currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}>
          <ArrowLeft size={24} />
        </button>
        <span className="font-semibold text-lg">FitManagement</span>
        <div className="w-10"></div> {/* Spacer */}
      </header>
      
      <div className="px-6 py-2">
        <div className="flex justify-between text-xs font-semibold text-[#10b981] mb-2">
          <span>Bước {currentStep} của {steps}</span>
          <span>{Math.round((currentStep / steps) * 100)}%</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-[#10b981]"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / steps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Content Area */}
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
            {currentStep === 7 && <StepMeal store={store} />}
            {currentStep === 8 && <StepDiet store={store} />}
            {currentStep === 9 && <StepHealth store={store} />}
            {currentStep === 10 && <StepNotify store={store} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer / CTA */}
      <footer className="p-6 pb-10">
        <button 
          onClick={handleNext}
          className="w-full h-14 rounded-full bg-[#10b981] text-[#003824] font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]"
        >
          {currentStep === steps ? 'Hoàn tất' : 'Tiếp tục'}
        </button>
      </footer>
    </div>
  );
}

// ------------------------------------------------------------------
// STEP COMPONENTS
// ------------------------------------------------------------------

function StepAge({ store }: { store: any }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 h-full pb-20">
      <h2 className="text-3xl font-bold mb-4 text-center">Bạn bao nhiêu tuổi?</h2>
      <p className="text-white/60 text-center mb-16 px-4">Điều này giúp chúng tôi tính toán lượng calo mục tiêu cho bạn.</p>
      
      <div className="flex items-end justify-center space-x-2 text-[#10b981]">
        <input 
          type="number" 
          value={store.age || ''} 
          onChange={(e) => store.setAge(parseInt(e.target.value) || 24)}
          className="bg-transparent text-7xl font-bold w-32 text-center outline-none border-b-2 border-[#10b981] pb-2"
        />
        <span className="text-2xl pb-4 font-semibold">năm</span>
      </div>
    </div>
  );
}

function StepGender({ store }: { store: any }) {
  const options = [
    { id: 'MALE', label: 'Nam', icon: '♂️' },
    { id: 'FEMALE', label: 'Nữ', icon: '♀️' }
  ];
  return (
    <div className="flex flex-col flex-1 h-full">
      <h2 className="text-3xl font-bold mb-4">Giới tính của bạn</h2>
      <p className="text-white/60 mb-12">Để chúng tôi biết cá nhân hóa chương trình tập luyện.</p>
      
      <div className="flex space-x-4">
        {options.map(opt => (
          <button 
            key={opt.id}
            onClick={() => store.setGender(opt.id)}
            className={`flex-1 flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all ${store.gender === opt.id ? 'border-[#10b981] bg-[#10b981]/10 text-[#10b981]' : 'border-white/10 bg-white/5 text-white'}`}
          >
            <span className="text-4xl mb-4">{opt.icon}</span>
            <span className="font-semibold text-lg">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepWeight({ store }: { store: any }) {
  return (
    <div className="flex flex-col flex-1 h-full space-y-12">
      <div>
        <h2 className="text-3xl font-bold mb-4">Chỉ số cơ thể</h2>
        <p className="text-white/60">Xác định điểm xuất phát và đích đến của bạn.</p>
      </div>

      <div className="space-y-8">
        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col items-center">
          <span className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-2">Hiện tại</span>
          <div className="flex items-end text-[#10b981]">
            <input 
              type="number" 
              value={store.weight || ''} 
              onChange={(e) => store.setWeight(parseFloat(e.target.value))}
              placeholder="0"
              className="bg-transparent text-5xl font-bold w-28 text-center outline-none border-b-2 border-[#10b981]"
            />
            <span className="text-lg pb-2 ml-1">kg</span>
          </div>
        </div>

        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col items-center">
          <span className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-2">Mục tiêu</span>
          <div className="flex items-end text-[#10b981]">
            <input 
              type="number" 
              value={store.targetWeight || ''} 
              onChange={(e) => store.setTargetWeight(parseFloat(e.target.value))}
              placeholder="0"
              className="bg-transparent text-5xl font-bold w-28 text-center outline-none border-b-2 border-[#10b981]"
            />
            <span className="text-lg pb-2 ml-1">kg</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepHeight({ store }: { store: any }) {
  return (
    <div className="flex flex-col items-center flex-1 h-full">
      <h2 className="text-3xl font-bold mb-4 text-center w-full text-left">Chiều cao hiện tại</h2>
      <p className="text-white/60 mb-16 w-full text-left">Thông tin này giúp chúng tôi tính chỉ số BMI và mục tiêu calo.</p>
      
      <div className="flex items-end justify-center text-[#10b981] mt-10">
        <input 
          type="number" 
          value={store.height || ''} 
          onChange={(e) => store.setHeight(parseFloat(e.target.value))}
          placeholder="170"
          className="bg-transparent text-7xl font-bold w-36 text-center outline-none border-b-2 border-[#10b981]"
        />
        <span className="text-2xl pb-4 ml-2 font-semibold">cm</span>
      </div>
    </div>
  );
}

function StepActivity({ store }: { store: any }) {
  const options = [
    { id: 'SEDENTARY', label: 'Ít vận động', desc: 'Làm việc văn phòng, ít đi lại, không tập thể dục thường xuyên' },
    { id: 'LIGHTLY_ACTIVE', label: 'Vận động nhẹ', desc: 'Tập thể dục nhẹ nhàng 1-3 ngày/tuần hoặc công việc đi lại nhiều' },
    { id: 'MODERATELY_ACTIVE', label: 'Vừa phải', desc: 'Tập thể dục vừa sức 3-5 ngày/tuần hoặc làm việc vất vả' },
    { id: 'VERY_ACTIVE', label: 'Rất năng động', desc: 'Tập thể dục nặng 6-7 ngày/tuần hoặc làm công việc chân tay nặng' }
  ];

  return (
    <div className="flex flex-col flex-1 h-full">
      <h2 className="text-3xl font-bold mb-4">Lối sống & Mức độ hoạt động</h2>
      <p className="text-white/60 mb-8">Chọn mức mô tả đúng nhất hoạt động của bạn hàng ngày.</p>
      
      <div className="space-y-4 overflow-y-auto pb-4">
        {options.map(opt => (
          <button 
            key={opt.id}
            onClick={() => store.setActivityLevel(opt.id)}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${store.activityLevel === opt.id ? 'border-[#10b981] bg-[#10b981]/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
          >
            <h3 className={`text-lg font-bold mb-1 ${store.activityLevel === opt.id ? 'text-[#10b981]' : 'text-white'}`}>{opt.label}</h3>
            <p className="text-sm text-white/60 leading-relaxed">{opt.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepBMI({ store }: { store: any }) {
  const heightM = (store.height || 170) / 100;
  const bmi = store.weight ? (store.weight / (heightM * heightM)).toFixed(1) : '24.2';
  
  return (
    <div className="flex flex-col items-center flex-1 h-full">
      <h2 className="text-2xl font-bold mb-2">Kết quả BMI</h2>
      <p className="text-white/60 text-center mb-10">Dựa vào thông tin của bạn</p>
      
      <div className="relative w-64 h-32 overflow-hidden flex justify-center mb-12">
        <div className="absolute top-0 w-64 h-64 border-[16px] border-[#10b981] rounded-full border-b-transparent border-r-transparent rotate-45 opacity-20"></div>
        <div className="absolute top-0 w-64 h-64 border-[16px] border-[#10b981] rounded-full border-b-transparent border-r-transparent -rotate-45" style={{ clipPath: 'polygon(50% 50%, 0 0, 50% 0)' }}></div>
        <div className="absolute bottom-4 flex flex-col items-center">
          <span className="text-5xl font-bold text-white">{bmi}</span>
          <span className="text-[#10b981] font-semibold">Bình thường</span>
        </div>
      </div>

      <div className="w-full bg-white/5 p-6 rounded-3xl border border-white/10">
        <p className="text-center text-white/80 leading-relaxed">
          Mức cân nặng lý tưởng của bạn là nền tảng để chúng tôi xây dựng chương trình tập luyện phù hợp.
        </p>
      </div>
    </div>
  );
}

function StepMeal({ store }: { store: any }) {
  const options = [2, 3, 4, 5];
  return (
    <div className="flex flex-col flex-1 h-full">
      <h2 className="text-3xl font-bold mb-4">Tần suất bữa ăn hàng ngày</h2>
      <p className="text-white/60 mb-10">Chia nhỏ lượng calo sẽ giúp tối ưu hóa việc tiêu hóa và hấp thụ.</p>
      
      <div className="space-y-4">
        {options.map(num => (
          <button 
            key={num}
            onClick={() => store.setMealFrequency(num)}
            className={`w-full flex items-center p-5 rounded-2xl border-2 transition-all ${store.mealFrequency === num ? 'border-[#10b981] bg-[#10b981]/10' : 'border-white/10 bg-white/5'}`}
          >
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center mr-4 ${store.mealFrequency === num ? 'border-[#10b981] bg-[#10b981]' : 'border-white/30'}`}>
              {store.mealFrequency === num && <Check size={16} className="text-[#003824]" />}
            </div>
            <span className="text-xl font-semibold">{num} bữa / ngày</span>
            {num === 5 && <span className="ml-auto text-xs bg-white/10 px-2 py-1 rounded-md text-white/60">Khuyên dùng</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepDiet({ store }: { store: any }) {
  const options = [
    { id: 'NONE', label: 'Không bị dị ứng', icon: '✅' },
    { id: 'SEAFOOD', label: 'Hải sản', icon: '🦐' },
    { id: 'MILK', label: 'Sữa', icon: '🥛' },
    { id: 'EGG', label: 'Trứng', icon: '🥚' },
    { id: 'PEANUT', label: 'Đậu phộng', icon: '🥜' },
  ];

  return (
    <div className="flex flex-col flex-1 h-full">
      <h2 className="text-3xl font-bold mb-4">Hạn chế ăn uống hoặc Dị ứng?</h2>
      <p className="text-white/60 mb-8">Điều này giúp chúng tôi loại trừ các món ăn gây dị ứng ra khỏi thực đơn.</p>
      
      <div className="grid grid-cols-2 gap-4">
        {options.map(opt => {
          const isSelected = store.dietaryPreferences.includes(opt.id);
          return (
            <button 
              key={opt.id}
              onClick={() => store.toggleDietaryPreference(opt.id)}
              className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${isSelected ? 'border-[#10b981] bg-[#10b981]/10 text-[#10b981]' : 'border-white/10 bg-white/5 text-white'}`}
            >
              <span className="text-3xl mb-3">{opt.icon}</span>
              <span className="font-semibold text-sm text-center">{opt.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  );
}

function StepHealth({ store }: { store: any }) {
  const options = [
    { id: 'HEALTHY', label: 'Khỏe mạnh', desc: 'Không có vấn đề sức khỏe' },
    { id: 'DIABETES', label: 'Tiểu đường', desc: 'Đường huyết cao' },
    { id: 'BLOOD_PRESSURE', label: 'Huyết áp cao', desc: 'Hoặc các vấn đề tim mạch' },
    { id: 'STOMACH', label: 'Dạ dày', desc: 'Khó tiêu, viêm loét dạ dày' }
  ];

  return (
    <div className="flex flex-col flex-1 h-full">
      <h2 className="text-3xl font-bold mb-4">Tình trạng sức khỏe</h2>
      <p className="text-white/60 mb-8">Vui lòng chọn để thiết lập các bài tập và dinh dưỡng an toàn.</p>
      
      <div className="space-y-4 overflow-y-auto pb-4">
        {options.map(opt => {
          const isSelected = store.healthConditions.includes(opt.id);
          return (
            <button 
              key={opt.id}
              onClick={() => store.toggleHealthCondition(opt.id)}
              className={`w-full flex flex-col p-5 rounded-2xl border-2 transition-all text-left ${isSelected ? 'border-[#10b981] bg-[#10b981]/10' : 'border-white/10 bg-white/5'}`}
            >
              <span className={`text-lg font-bold mb-1 ${isSelected ? 'text-[#10b981]' : 'text-white'}`}>{opt.label}</span>
              <span className="text-sm text-white/60">{opt.desc}</span>
            </button>
          )
        })}
      </div>
    </div>
  );
}

function StepNotify({ store }: { store: any }) {
  return (
    <div className="flex flex-col items-center flex-1 h-full pb-20">
      <div className="w-24 h-24 bg-[#10b981]/20 rounded-full flex items-center justify-center mb-8 mt-10">
        <span className="text-5xl">🔔</span>
      </div>
      <h2 className="text-3xl font-bold mb-4 text-center">Không bỏ lỡ nhịp độ</h2>
      <p className="text-white/60 text-center mb-12 px-4 leading-relaxed">
        Cho phép FitManagement gửi thông báo nhắc nhở uống nước, theo dõi lịch tập và dinh dưỡng mỗi ngày.
      </p>
      
      <div className="w-full bg-white/5 p-6 rounded-3xl border border-white/10 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg mb-1">Nhận thông báo</h3>
          <p className="text-sm text-white/50">Cho phép đẩy thông báo</p>
        </div>
        <button 
          onClick={() => store.setPushNotifications(!store.pushNotifications)}
          className={`w-14 h-8 rounded-full p-1 transition-colors ${store.pushNotifications ? 'bg-[#10b981]' : 'bg-white/20'}`}
        >
          <motion.div 
            className="w-6 h-6 bg-white rounded-full shadow-md"
            animate={{ x: store.pushNotifications ? 24 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </button>
      </div>
    </div>
  );
}
