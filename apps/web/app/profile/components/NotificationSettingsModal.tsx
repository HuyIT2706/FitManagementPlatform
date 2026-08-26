'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Utensils, Droplets, Dumbbell, MessageSquare, LineChart, Check } from 'lucide-react';
import toast from '../../../utils/toast';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationOptions {
  mealReminders: boolean;
  waterReminders: boolean;
  workoutSchedule: boolean;
  ptReviews: boolean;
  weeklyReport: boolean;
}

const STORAGE_KEY = 'fit_notification_settings';

const defaultSettings: NotificationOptions = {
  mealReminders: true,
  waterReminders: true,
  workoutSchedule: true,
  ptReviews: true,
  weeklyReport: false,
};

const NotificationSettingsModal = ({ isOpen, onClose }: NotificationSettingsModalProps) => {
  const [settings, setSettings] = useState<NotificationOptions>(defaultSettings);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setSettings(JSON.parse(saved));
        }
      } catch (err) {
        console.error('Lỗi khi đọc cài đặt thông báo:', err);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = (key: keyof NotificationOptions) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Lỗi khi lưu cài đặt thông báo:', err);
      }
      return updated;
    });
  };

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setIsSaved(true);
      toast.success('Đã lưu tùy chọn thông báo thành công!');
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 400);
    } catch {
      toast.error('Không thể lưu cài đặt!');
    }
  };

  const toggleItems = [
    {
      key: 'mealReminders' as keyof NotificationOptions,
      title: 'Nhắc nhở ghi nhận bữa ăn',
      desc: 'Nhắc bạn log món ăn đúng giờ vào các bữa Sáng, Trưa, Tối và Phụ',
      icon: <Utensils size={18} className="text-amber-400" />,
      badgeBg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      key: 'workoutSchedule' as keyof NotificationOptions,
      title: 'Lịch tập & Ca dạy cùng PT',
      desc: 'Thông báo trước 30 phút khi sắp tới giờ tập hoặc có ca dạy mới',
      icon: <Dumbbell size={18} className="text-orange-400" />,
      badgeBg: 'bg-orange-500/10 border-orange-500/20',
    },
    {
      key: 'ptReviews' as keyof NotificationOptions,
      title: 'Nhận xét & Lời khuyên từ Coach PT',
      desc: 'Nhận thông báo khi Coach nhận xét bữa ăn hoặc cập nhật giáo án',
      icon: <MessageSquare size={18} className="text-indigo-400" />,
      badgeBg: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      key: 'waterReminders' as keyof NotificationOptions,
      title: 'Nhắc nhở uống đủ nước',
      desc: 'Nhắc bạn bổ sung nước định kỳ mỗi 2 tiếng trong ngày',
      icon: <Droplets size={18} className="text-sky-400" />,
      badgeBg: 'bg-sky-500/10 border-sky-500/20',
    },
    {
      key: 'weeklyReport' as keyof NotificationOptions,
      title: 'Báo cáo tổng kết tuần',
      desc: 'Gửi bảng tổng kết Calo tiêu thụ, Macro và tiến độ cân nặng mỗi Chủ Nhật',
      icon: <LineChart size={18} className="text-emerald-400" />,
      badgeBg: 'bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#121620] border border-white/15 rounded-[32px] max-w-xl w-full max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-6 md:p-8 space-y-6 text-white shadow-2xl relative cursor-default animate-in zoom-in-95 duration-200"
        suppressHydrationWarning
      >
        {/* Header Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng modal"
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white border border-white/15 flex items-center justify-center transition-all cursor-pointer z-20"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary border border-primary/40 flex items-center justify-center shrink-0">
            <Bell size={24} />
          </div>
          <div>
            <h3 className="font-extrabold text-xl text-white font-headline-md">
              Cài Đặt Thông Báo
            </h3>
            <p className="text-xs text-white/60 mt-0.5">
              Tùy chỉnh các thông báo nhắc nhở bữa ăn, uống nước, ca tập và báo cáo tuần.
            </p>
          </div>
        </div>

        {/* Toggles List */}
        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {toggleItems.map((item) => {
            const isChecked = Boolean(settings[item.key]);
            return (
              <div
                key={item.key}
                onClick={() => handleToggle(item.key)}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.06] transition-all cursor-pointer group select-none"
              >
                <div className="flex items-center gap-3.5 pr-3">
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${item.badgeBg}`}
                  >
                    {item.icon}
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                      {item.title}
                    </div>
                    <p className="text-xs text-white/60 font-normal leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* iOS-style Smooth Switch Toggle */}
                <div
                  className={`w-12 h-6.5 flex items-center rounded-full p-1 transition-all duration-300 shrink-0 cursor-pointer ${
                    isChecked
                      ? 'bg-primary shadow-[0_0_14px_rgba(102,200,28,0.45)]'
                      : 'bg-white/10 border border-white/15'
                  }`}
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-300 ${
                      isChecked ? 'translate-x-5.5 bg-dark-slate' : 'translate-x-0 bg-white/70'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/5 border border-white/15 text-white/80 text-sm font-bold hover:bg-white/10 hover:text-white transition-all cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-primary text-dark-slate text-sm font-extrabold shadow-[0_0_15px_rgba(102,200,28,0.4)] hover:bg-primary/90 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isSaved ? (
              <>
                <Check size={18} />
                Đã lưu
              </>
            ) : (
              'Lưu Cài Đặt'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsModal;
