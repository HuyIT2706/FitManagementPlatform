'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertOctagon, AlertTriangle, Info, X } from 'lucide-react';
import { toastStore } from './toastStore';
import type { ToastItem, ToastType } from '../../interface';

const toastConfig: Record<
  ToastType,
  {
    icon: React.ReactNode;
    iconBg: string;
    progressBg: string;
    borderAccent: string;
    defaultTitle: string;
  }
> = {
  success: {
    icon: <Check size={16} strokeWidth={2.6} />,
    iconBg: 'bg-emerald-500/20 text-[#10b981] border border-[#10b981]/40 shadow-[0_0_14px_rgba(16,185,129,0.3)] ring-1 ring-[#10b981]/25',
    progressBg: 'bg-gradient-to-r from-[#10b981] to-emerald-400',
    borderAccent: 'border-l-2 border-l-[#10b981]',
    defaultTitle: 'Thành công',
  },
  error: {
    icon: <AlertOctagon size={16} strokeWidth={2.4} />,
    iconBg: 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-[0_0_14px_rgba(244,63,94,0.3)] ring-1 ring-rose-500/25',
    progressBg: 'bg-gradient-to-r from-rose-500 to-pink-500',
    borderAccent: 'border-l-2 border-l-rose-500',
    defaultTitle: 'Thất bại',
  },
  warning: {
    icon: <AlertTriangle size={15} strokeWidth={2.4} />,
    iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_14px_rgba(245,158,11,0.3)] ring-1 ring-amber-500/25',
    progressBg: 'bg-gradient-to-r from-amber-500 to-orange-400',
    borderAccent: 'border-l-2 border-l-amber-500',
    defaultTitle: 'Cảnh báo',
  },
  info: {
    icon: <Info size={15} strokeWidth={2.4} />,
    iconBg: 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-[0_0_14px_rgba(14,165,233,0.3)] ring-1 ring-sky-500/25',
    progressBg: 'bg-gradient-to-r from-sky-500 to-blue-500',
    borderAccent: 'border-l-2 border-l-sky-500',
    defaultTitle: 'Thông tin',
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
      className="fixed top-4 right-3 sm:right-4 z-[9999] flex flex-col gap-2.5 w-full max-w-[360px] pointer-events-none px-3 sm:px-0"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const config = toastConfig[toast.type];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              className={`pointer-events-auto relative overflow-hidden rounded-2xl bg-white/95 dark:bg-[#121915]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 ${config.borderAccent} shadow-[0_12px_36px_-6px_rgba(0,0,0,0.12),0_0_1px_1px_rgba(0,0,0,0.04)] dark:shadow-[0_18px_42px_-8px_rgba(0,0,0,0.8),0_0_1px_1px_rgba(255,255,255,0.08)] p-3.5 sm:p-4 flex items-start gap-3 transition-colors`}
            >
              <div
                className={`w-9 h-9 rounded-full ${config.iconBg} flex items-center justify-center shrink-0 mt-0.5`}
              >
                {config.icon}
              </div>

              <div className="flex-1 min-w-0 pr-1">
                <h4 className="text-[13px] sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  {toast.title || config.defaultTitle}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5 break-words font-normal">
                  {toast.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => toastStore.remove(toast.id)}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                aria-label="Đóng thông báo"
              >
                <X size={14} />
              </button>

              {toast.duration && toast.duration > 0 ? (
                <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-slate-100 dark:bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{
                      duration: toast.duration / 1000,
                      ease: 'linear',
                    }}
                    className={`h-full ${config.progressBg}`}
                  />
                </div>
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
