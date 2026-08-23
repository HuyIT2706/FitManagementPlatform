"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    iconColor: "text-[#66C81C]",
    borderColor: "border-[#66C81C]/30",
    badgeBg: "bg-[#66C81C]/15 text-[#66C81C]",
    progressBg: "bg-[#66C81C]",
    defaultTitle: "Thành công",
  },
  error: {
    icon: "error",
    iconColor: "text-[#F63D68]",
    borderColor: "border-[#F63D68]/30",
    badgeBg: "bg-[#F63D68]/15 text-[#F63D68]",
    progressBg: "bg-[#F63D68]",
    defaultTitle: "Thất bại",
  },
  warning: {
    icon: "warning",
    iconColor: "text-[#EF6820]",
    borderColor: "border-[#EF6820]/30",
    badgeBg: "bg-[#EF6820]/15 text-[#EF6820]",
    progressBg: "bg-[#EF6820]",
    defaultTitle: "Cảnh báo",
  },
  info: {
    icon: "info",
    iconColor: "text-[#0086C9]",
    borderColor: "border-[#0086C9]/30",
    badgeBg: "bg-[#0086C9]/15 text-[#0086C9]",
    progressBg: "bg-[#0086C9]",
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
              className={`pointer-events-auto relative overflow-hidden rounded-2xl bg-[#121926]/95 backdrop-blur-xl border ${config.borderColor} shadow-2xl shadow-black/50 p-4 text-on-surface flex items-start gap-3`}
            >
              {/* Icon Badge */}
              <div
                className={`w-10 h-10 rounded-xl ${config.badgeBg} flex items-center justify-center shrink-0 mt-0.5`}
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
                <h4 className="font-headline-md text-sm font-bold text-on-surface tracking-tight">
                  {toast.title || config.defaultTitle}
                </h4>
                <p className="font-body-md text-xs text-on-surface-variant/90 leading-relaxed mt-0.5 break-words">
                  {toast.message}
                </p>
              </div>

              {/* Bottom Countdown Progress Line (No Colored Shadow) */}
              {toast.duration && toast.duration > 0 ? (
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{
                    duration: toast.duration / 1000,
                    ease: "linear",
                  }}
                  className={`absolute bottom-0 left-0 h-[2px] ${config.progressBg} opacity-80`}
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
