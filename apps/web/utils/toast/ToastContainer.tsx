"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { toastStore } from "./toastStore";
import type { ToastItem, ToastType } from "../../interface";

const toastConfig: Record<
  ToastType,
  {
    icon: string;
    iconColor: string;
    borderColor: string;
    badgeBg: string;
    progressBg: string;
    defaultTitle: string;
  }
> = {
  success: {
    icon: "check_circle",
    iconColor: "text-emerald-600 dark:text-[#66C81C]",
    borderColor: "border-emerald-400/40 dark:border-[#66C81C]/40",
    badgeBg: "bg-emerald-50 dark:bg-[#66C81C]/15 border border-emerald-200 dark:border-[#66C81C]/30",
    progressBg: "bg-emerald-500 dark:bg-[#66C81C]",
    defaultTitle: "Thành công",
  },
  error: {
    icon: "error",
    iconColor: "text-rose-600 dark:text-[#F63D68]",
    borderColor: "border-rose-400/40 dark:border-[#F63D68]/40",
    badgeBg: "bg-rose-50 dark:bg-[#F63D68]/15 border border-rose-200 dark:border-[#F63D68]/30",
    progressBg: "bg-rose-500 dark:bg-[#F63D68]",
    defaultTitle: "Thất bại",
  },
  warning: {
    icon: "warning",
    iconColor: "text-amber-600 dark:text-[#EF6820]",
    borderColor: "border-amber-400/40 dark:border-[#EF6820]/40",
    badgeBg: "bg-amber-50 dark:bg-[#EF6820]/15 border border-amber-200 dark:border-[#EF6820]/30",
    progressBg: "bg-amber-500 dark:bg-[#EF6820]",
    defaultTitle: "Cảnh báo",
  },
  info: {
    icon: "info",
    iconColor: "text-sky-600 dark:text-[#0086C9]",
    borderColor: "border-sky-400/40 dark:border-[#0086C9]/40",
    badgeBg: "bg-sky-50 dark:bg-[#0086C9]/15 border border-sky-200 dark:border-[#0086C9]/30",
    progressBg: "bg-sky-500 dark:bg-[#0086C9]",
    defaultTitle: "Thông tin",
  },
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    setToasts(toastStore.getToasts());
    const unsubscribe = toastStore.subscribe((newToasts) => {
      setToasts(newToasts);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-2.5 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none px-4 sm:px-0"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const config = toastConfig[toast.type];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`pointer-events-auto relative overflow-hidden rounded-2xl bg-white/95 dark:bg-[#121926]/95 backdrop-blur-xl border ${config.borderColor} shadow-xl shadow-slate-300/40 dark:shadow-2xl dark:shadow-black/70 p-4 flex items-start gap-3 transition-colors`}
            >
              {/* Icon Badge */}
              <div
                className={`w-10 h-10 rounded-xl ${config.badgeBg} flex items-center justify-center shrink-0 mt-0.5 shadow-xs`}
              >
                <span
                  className={`material-symbols-outlined text-[22px] ${config.iconColor}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {config.icon}
                </span>
              </div>

              {/* Toast Text Content */}
              <div className="flex-1 min-w-0 pr-1">
                <h4 className="font-headline-md text-[15px] sm:text-[16px] font-bold text-slate-900 dark:text-white tracking-tight">
                  {toast.title || config.defaultTitle}
                </h4>
                <p className="font-body-md text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5 break-words">
                  {toast.message}
                </p>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => toastStore.remove(toast.id)}
                className="text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                aria-label="Đóng thông báo"
              >
                <X size={16} />
              </button>

              {/* Bottom Countdown Progress Line */}
              {toast.duration && toast.duration > 0 ? (
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{
                    duration: toast.duration / 1000,
                    ease: "linear",
                  }}
                  className={`absolute bottom-0 left-0 h-[2.5px] ${config.progressBg} opacity-80`}
                />
              ) : null}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export { ToastContainer };
export default ToastContainer;
