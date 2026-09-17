"use client";

import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import toast from "../../../utils/toast";
import type {
  NotificationSettingsModalProps,
  NotificationOptions,
} from "../../../interface";

const STORAGE_KEY = "fit_notification_settings";

const defaultSettings: NotificationOptions = {
  mealReminders: true,
  waterReminders: true,
  workoutSchedule: true,
  ptReviews: true,
  weeklyReport: false,
};

const NotificationSettingsModal = ({
  isOpen,
  onClose,
}: NotificationSettingsModalProps) => {
  const [settings, setSettings] =
    useState<NotificationOptions>(defaultSettings);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setSettings(JSON.parse(saved));
        }
      } catch (err) {
        console.error("Lỗi khi đọc cài đặt thông báo:", err);
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
        console.error("Lỗi khi lưu cài đặt thông báo:", err);
      }
      return updated;
    });
  };

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setIsSaved(true);
      toast.success("Đã lưu tùy chọn thông báo thành công!");
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 400);
    } catch {
      toast.error("Không thể lưu cài đặt!");
    }
  };

  const toggleItems = [
    {
      key: "mealReminders" as keyof NotificationOptions,
      title: "Nhắc nhở ghi nhận bữa ăn",
      desc: "Nhắc bạn log món ăn đúng giờ vào các bữa Sáng, Trưa, Tối và Phụ",
      badgeBg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      key: "workoutSchedule" as keyof NotificationOptions,
      title: "Lịch tập & Ca dạy cùng PT",
      desc: "Thông báo trước 30 phút khi sắp tới giờ tập hoặc có ca dạy mới",
      badgeBg: "bg-orange-500/10 border-orange-500/20",
    },
    {
      key: "ptReviews" as keyof NotificationOptions,
      title: "Nhận xét & Lời khuyên từ Coach PT",
      desc: "Nhận thông báo khi Coach nhận xét bữa ăn hoặc cập nhật giáo án",
      badgeBg: "bg-indigo-500/10 border-indigo-500/20",
    },
    {
      key: "waterReminders" as keyof NotificationOptions,
      title: "Nhắc nhở uống đủ nước",
      desc: "Nhắc bạn bổ sung nước định kỳ mỗi 2 tiếng trong ngày",
      badgeBg: "bg-sky-500/10 border-sky-500/20",
    },
    {
      key: "weeklyReport" as keyof NotificationOptions,
      title: "Báo cáo tổng kết tuần",
      desc: "Gửi bảng tổng kết Calo tiêu thụ, Macro và tiến độ cân nặng mỗi Chủ Nhật",
      badgeBg: "bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#121620] border border-slate-200 dark:border-white/15 rounded-2xl sm:rounded-[32px] max-w-xl w-full max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 text-slate-900 dark:text-white shadow-2xl relative cursor-default animate-in zoom-in-95 duration-200"
        suppressHydrationWarning
      >
        {/* Header Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng modal"
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white/70 dark:hover:text-white border border-slate-200 dark:border-white/15 flex items-center justify-center transition-all cursor-pointer z-20"
        >
          <X size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pr-8">
          <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white font-headline-md leading-tight">
            Cài Đặt Thông Báo
          </h3>
        </div>

        {/* Toggles List */}
        <div className="space-y-3 max-h-[60vh] sm:max-h-[65vh] overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {toggleItems.map((item) => {
            const isChecked = Boolean(settings[item.key]);
            return (
              <div
                key={item.key}
                onClick={() => handleToggle(item.key)}
                className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-100/70 dark:hover:bg-white/[0.06] transition-all cursor-pointer group select-none"
              >
                <div className="flex items-center gap-3.5 pr-3">
                  <div className="space-y-0.5">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-primary transition-colors">
                      {item.title}
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-white/60 font-normal leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* iOS-style Smooth Switch Toggle */}
                <div
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-all duration-300 shrink-0 cursor-pointer ${
                    isChecked
                      ? "bg-emerald-600 dark:bg-primary shadow-xs"
                      : "bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/15"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                      isChecked
                        ? "translate-x-5 bg-white dark:bg-dark-slate"
                        : "translate-x-0 bg-white dark:bg-white/70 shadow-xs"
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
            className="flex-1 py-2.5 sm:py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/15 dark:text-white/80 text-sm font-bold transition-all cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 sm:py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-primary dark:hover:bg-primary/90 text-white dark:text-dark-slate text-sm font-extrabold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isSaved ? (
              <>
                <Check size={18} />
                Đã lưu
              </>
            ) : (
              "Lưu Cài Đặt"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsModal;
