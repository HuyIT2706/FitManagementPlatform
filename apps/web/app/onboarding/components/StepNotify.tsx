'use client';

import { motion } from 'framer-motion';
import { type OnboardingState } from '../../../store/onboardingStore';
import { Bell } from 'lucide-react';

interface StepNotifyProps {
  store: OnboardingState;
}

export default function StepNotify({ store }: StepNotifyProps) {
  return (
    <div className="flex flex-col flex-1 h-full pb-20">
      <div className="flex items-center gap-2 mb-2">
        <Bell className="text-[#10b981]" size={28} />
        <h2 className="text-3xl font-bold">Không bỏ lỡ nhịp độ</h2>
      </div>
      <p className="text-white/60 text-base mb-10 leading-relaxed">
        Cho phép FitManagement gửi thông báo nhắc nhở uống nước, theo dõi lịch tập và dinh dưỡng mỗi ngày.
      </p>

      <div className="w-full bg-white/5 p-6 rounded-3xl border border-white/10 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg mb-1">Nhận thông báo</h3>
          <p className="text-sm text-white/50">Cho phép đẩy thông báo ứng dụng</p>
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
