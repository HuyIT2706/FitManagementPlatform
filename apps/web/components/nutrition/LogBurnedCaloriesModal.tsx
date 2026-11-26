'use client';

import React, { useMemo, useState } from 'react';
import { Flame, Loader2, Timer, X, Zap } from 'lucide-react';
import apiClient from '../../api/axios';
import toast from '../../utils/toast';
import { broadcastSync } from '../../utils/realtimeSync';
import { formatYYYYMMDD } from '../../utils/date';
import { estimateBurnedCalories } from '../../utils/exerciseHelpers';

interface LogBurnedCaloriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDateStr?: string;
  userWeightKg?: number | null;
  defaultActivityName?: string;
  defaultDurationMinutes?: number;
  onSaved?: () => void;
}

interface ActivityPreset {
  id: string;
  label: string;
  met: number;
}

const ACTIVITY_PRESETS: ActivityPreset[] = [
  { id: 'gym', label: 'Tập Gym / Tạ', met: 6.0 },
  { id: 'run', label: 'Chạy bộ', met: 9.5 },
  { id: 'walk', label: 'Đi bộ nhanh', met: 4.3 },
  { id: 'cycle', label: 'Đạp xe', met: 7.5 },
  { id: 'hiit', label: 'HIIT / Cardio', met: 8.5 },
  { id: 'swim', label: 'Bơi lội', met: 7.0 },
  { id: 'yoga', label: 'Yoga / Giãn cơ', met: 3.0 },
];

const INTENSITY_OPTIONS = [
  { id: 'LIGHT', label: 'Nhẹ', multiplier: 0.8 },
  { id: 'MODERATE', label: 'Vừa', multiplier: 1.0 },
  { id: 'HIGH', label: 'Cao', multiplier: 1.25 },
] as const;

const QUICK_CALORIE_CHIPS = [150, 250, 350, 500];

const LogBurnedCaloriesModal = ({
  isOpen,
  onClose,
  selectedDateStr,
  userWeightKg,
  defaultActivityName,
  defaultDurationMinutes,
  onSaved,
}: LogBurnedCaloriesModalProps) => {
  const safeWeight =
    userWeightKg && userWeightKg > 25 && userWeightKg < 250 ? userWeightKg : 65;

  const [activityName, setActivityName] = useState<string>(
    defaultActivityName || 'Tập Gym / Tạ',
  );
  const [selectedPresetMet, setSelectedPresetMet] = useState<number>(6.0);
  const [durationInput, setDurationInput] = useState<string>(
    defaultDurationMinutes ? String(defaultDurationMinutes) : '45',
  );
  const [intensity, setIntensity] = useState<'LIGHT' | 'MODERATE' | 'HIGH'>(
    'MODERATE',
  );
  const [caloriesInput, setCaloriesInput] = useState<string>(() =>
    String(
      estimateBurnedCalories(
        6.0,
        defaultDurationMinutes || 45,
        safeWeight,
        1.0,
      ),
    ),
  );
  const [manualOverride, setManualOverride] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const intensityMultiplier = useMemo(() => {
    const found = INTENSITY_OPTIONS.find((item) => item.id === intensity);
    return found ? found.multiplier : 1.0;
  }, [intensity]);

  if (!isOpen) return null;

  const recalculateEstimate = (
    nextMet: number,
    nextDurationStr: string,
    nextMult: number,
    forceUpdate = false,
  ) => {
    if (manualOverride && !forceUpdate) return;
    const mins = parseInt(nextDurationStr, 10);
    if (!mins || isNaN(mins) || mins <= 0) return;
    setCaloriesInput(
      String(estimateBurnedCalories(nextMet, mins, safeWeight, nextMult)),
    );
  };

  const handleSelectPreset = (preset: ActivityPreset) => {
    setActivityName(preset.label);
    setSelectedPresetMet(preset.met);
    setManualOverride(false);
    recalculateEstimate(preset.met, durationInput, intensityMultiplier, true);
  };

  const handleDurationChange = (val: string) => {
    setDurationInput(val);
    recalculateEstimate(selectedPresetMet, val, intensityMultiplier);
  };

  const handleIntensityChange = (nextId: 'LIGHT' | 'MODERATE' | 'HIGH') => {
    setIntensity(nextId);
    const mult =
      INTENSITY_OPTIONS.find((item) => item.id === nextId)?.multiplier ?? 1.0;
    recalculateEstimate(selectedPresetMet, durationInput, mult);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = activityName.trim();
    const kcal = parseFloat(caloriesInput);
    const mins = durationInput.trim() ? parseInt(durationInput, 10) : undefined;

    if (!trimmedName) {
      toast.error('Vui lòng nhập tên hoạt động');
      return;
    }
    if (!kcal || isNaN(kcal) || kcal <= 0 || kcal > 10000) {
      toast.error('Vui lòng nhập số kcal tiêu hao hợp lệ (1 - 10.000)');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/nutrition/activities', {
        activityName: trimmedName,
        caloriesBurned: Math.round(kcal),
        durationMinutes:
          mins && !isNaN(mins) && mins > 0 ? mins : undefined,
        intensity,
        logDate: selectedDateStr || formatYYYYMMDD(new Date()),
      });

      broadcastSync('WORKOUT_UPDATED');
      onSaved?.();
      toast.success(`Đã ghi nhận đốt cháy ${Math.round(kcal)} kcal!`);
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Không thể lưu năng lượng tiêu hao. Vui lòng thử lại!';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Ghi nhận năng lượng tiêu hao"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-white dark:bg-[#121a15] border border-slate-200/80 dark:border-white/15 rounded-t-[28px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-900 dark:text-white space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/15 border border-orange-500/25 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                Ghi nhận năng lượng tiêu hao
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cộng trực tiếp vào ngân sách calo trong ngày
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 flex items-center justify-center text-slate-500 dark:text-slate-300 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Hoạt động nhanh
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ACTIVITY_PRESETS.map((preset) => {
                const active = activityName === preset.label;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      active
                        ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/10 hover:bg-slate-200/70 dark:hover:bg-white/10'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Activity Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="burn-activity-name"
              className="text-xs font-bold text-slate-600 dark:text-slate-300"
            >
              Tên hoạt động
            </label>
            <input
              id="burn-activity-name"
              type="text"
              maxLength={120}
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              placeholder="Ví dụ: Chạy bộ công viên, Tập ngực..."
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
            />
          </div>

          {/* Duration + Intensity */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="burn-duration"
                className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1"
              >
                <Timer className="w-3.5 h-3.5 text-slate-400" />
                <span>Thời gian (phút)</span>
              </label>
              <input
                id="burn-duration"
                type="number"
                inputMode="numeric"
                min="1"
                max="1440"
                value={durationInput}
                onChange={(e) => handleDurationChange(e.target.value)}
                placeholder="45"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-slate-400" />
                <span>Cường độ</span>
              </span>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                {INTENSITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleIntensityChange(opt.id)}
                    className={`py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      intensity === opt.id
                        ? 'bg-white dark:bg-[#1e2923] text-orange-600 dark:text-orange-400 shadow-2xs'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Calories Burned Input + Quick Chips */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-orange-50/70 dark:bg-orange-500/10 border border-orange-200/80 dark:border-orange-500/20">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="burn-kcal-input"
                className="text-xs font-bold text-orange-800 dark:text-orange-300"
              >
                Năng lượng tiêu hao (kcal)
              </label>
              <span className="text-[11px] text-orange-700/80 dark:text-orange-300/80 font-medium">
                Ước tính theo ~{Math.round(safeWeight)} kg
              </span>
            </div>

            <div className="relative">
              <input
                id="burn-kcal-input"
                type="number"
                inputMode="numeric"
                min="1"
                max="10000"
                value={caloriesInput}
                onChange={(e) => {
                  setManualOverride(true);
                  setCaloriesInput(e.target.value);
                }}
                placeholder="300"
                className="w-full px-4 py-3 pr-14 rounded-2xl bg-white dark:bg-[#0d1410] border border-orange-200 dark:border-orange-500/30 text-xl font-black text-orange-600 dark:text-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-extrabold text-slate-400 uppercase">
                kcal
              </span>
            </div>

            <div className="flex items-center gap-1.5 pt-0.5">
              {QUICK_CALORIE_CHIPS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    setManualOverride(true);
                    setCaloriesInput(String(val));
                  }}
                  className="flex-1 py-1 rounded-xl bg-white/80 dark:bg-white/10 hover:bg-orange-500 hover:text-white text-[11px] font-bold text-slate-700 dark:text-slate-200 border border-orange-200/60 dark:border-white/10 transition-colors cursor-pointer"
                >
                  {val} kcal
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-white/10 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-md shadow-orange-500/25 disabled:opacity-50 transition-all cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4" />
                  <span>Lưu tiêu hao</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogBurnedCaloriesModal;
