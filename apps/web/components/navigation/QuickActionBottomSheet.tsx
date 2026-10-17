'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  X,
  Search,
  Keyboard,
  Mic,
  Apple,
  ChefHat,
  ClipboardList,
  Droplets,
  Plus,
  Check,
} from 'lucide-react';
import { toast } from '../../utils/toast';

interface QuickActionBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickActionBottomSheet = ({
  isOpen,
  onClose,
}: QuickActionBottomSheetProps) => {
  const router = useRouter();
  const [waterAmount, setWaterAmount] = useState<number>(0);
  const [showWaterSuccess, setShowWaterSuccess] = useState<boolean>(false);

  const handleActionClick = (path?: string, label?: string) => {
    if (path) {
      onClose();
      router.push(path);
    } else {
      toast.info(`Tính năng "${label}" đang được phát triển.`);
    }
  };

  const handleQuickWater = (ml: number) => {
    setWaterAmount((prev) => prev + ml);
    setShowWaterSuccess(true);
    toast.success(`Đã ghi nhận uống thêm ${ml}ml nước! Cố gắng đạt 2000ml hôm nay nhé.`);
    setTimeout(() => {
      setShowWaterSuccess(false);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity"
          />

          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-surface-container-high dark:bg-[#141b17] border-t border-slate-200 dark:border-white/15 rounded-t-[32px] p-5 sm:p-6 z-50 shadow-2xl text-on-surface"
          >
            {/* Drag Handle Bar */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-white/20 rounded-full mx-auto mb-4" />

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-extrabold font-heading text-slate-900 dark:text-white">
                Hôm nay bạn ăn gì?
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 flex items-center justify-center transition-colors text-slate-600 dark:text-white/80"
              >
                <X size={18} />
              </button>
            </div>

            {/* Top Row: Primary Input Methods (3 Cards, omitting scanning) */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {/* 1. Nhập món ăn */}
              <button
                type="button"
                onClick={() => handleActionClick('/add-meal', 'Nhập món ăn')}
                className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/25 hover:scale-[1.03] transition-all text-center cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-2.5 shadow-sm group-hover:scale-110 transition-transform">
                  <Search size={22} />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white leading-tight">
                  Nhập món ăn
                </span>
              </button>

              {/* 2. Nhập nhiều món */}
              <button
                type="button"
                onClick={() => handleActionClick('/add-meal', 'Nhập nhiều món')}
                className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/25 hover:scale-[1.03] transition-all text-center cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-2xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2.5 shadow-sm group-hover:scale-110 transition-transform">
                  <Keyboard size={22} />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white leading-tight">
                  Nhập nhiều món
                </span>
              </button>

              {/* 3. Nhập bằng giọng nói */}
              <button
                type="button"
                onClick={() => handleActionClick(undefined, 'Nhập bằng giọng nói')}
                className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/25 hover:scale-[1.03] transition-all text-center cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-2xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2.5 shadow-sm group-hover:scale-110 transition-transform">
                  <Mic size={22} />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white leading-tight">
                  Nhập bằng giọng nói
                </span>
              </button>
            </div>

            {/* Other Tools Section */}
            <div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-white/80 mb-3 px-1">
                Công cụ khác
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Tạo thực phẩm */}
                <button
                  type="button"
                  onClick={() => handleActionClick('/add-meal', 'Tạo thực phẩm')}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-all text-left cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                    <Apple size={18} />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate">
                    Tạo thực phẩm
                  </span>
                </button>

                {/* Tạo công thức */}
                <button
                  type="button"
                  onClick={() => handleActionClick(undefined, 'Tạo công thức')}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-all text-left cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                    <ChefHat size={18} />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate">
                    Tạo công thức
                  </span>
                </button>

                {/* Tạo thực đơn */}
                <button
                  type="button"
                  onClick={() => handleActionClick(undefined, 'Tạo thực đơn')}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-all text-left cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center shrink-0">
                    <ClipboardList size={18} />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate">
                    Tạo thực đơn
                  </span>
                </button>

                {/* Uống nước */}
                <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-left">
                  <div className="flex items-center gap-2.5 min-w-0 pr-1">
                    <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0">
                      <Droplets size={18} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white block truncate">
                        Uống nước
                      </span>
                      {waterAmount > 0 && (
                        <span className="text-[10px] text-sky-400 font-bold block">
                          +{waterAmount}ml
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleQuickWater(250)}
                      className="px-2 py-1 rounded-lg bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 text-[11px] font-extrabold transition-all"
                      title="Uống thêm 250ml"
                    >
                      +250
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickWater(500)}
                      className="px-2 py-1 rounded-lg bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 text-[11px] font-extrabold transition-all"
                      title="Uống thêm 500ml"
                    >
                      +500
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Safe Spacing */}
            <div className="h-4" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
