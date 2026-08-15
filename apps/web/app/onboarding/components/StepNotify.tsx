'use client';

import { motion } from 'framer-motion';
import { type OnboardingState } from '../../../store/onboardingStore';

interface StepNotifyProps {
  store: OnboardingState;
}

export default function StepNotify({ store }: StepNotifyProps) {
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
          type="button"
          suppressHydrationWarning
          onClick={() => store.setPushNotifications(!store.pushNotifications)}
          className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer ${store.pushNotifications ? 'bg-[#10b981]' : 'bg-white/20'}`}
        >
          <motion.div
            className="w-6 h-6 bg-white rounded-full shadow-md"
            animate={{ x: store.pushNotifications ? 24 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>
    </div>
  );
}
