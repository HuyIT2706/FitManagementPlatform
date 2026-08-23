'use client';

import { Flame } from 'lucide-react';
import type { HistoryStreakHeroCardProps } from '../../../interface';

const HistoryStreakHeroCard = ({
  streakDays,
  calorieComplianceDays,
  totalTrackingDays,
  hasPt,
  checkedInPtSessions,
  totalPtSessions,
  ptAttendancePercent,
}: HistoryStreakHeroCardProps) => {
  const compliancePercentage = Math.round((calorieComplianceDays / totalTrackingDays) * 100);

  return (
    <section className="md:col-span-8 bento-card rounded-3xl p-6 md:p-8 relative overflow-hidden border border-outline-variant/30">
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-green-light/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xs font-headline-md uppercase tracking-wider text-on-surface-variant mb-1 font-semibold">
            Chuỗi Kỷ Luật & Tuân Thủ
          </h2>
          <div className="flex items-center gap-3">
            <Flame
              size={38}
              className="text-orange-400 animate-pulse fill-orange-400/20 shrink-0"
            />
            <h1
              className="text-2xl md:text-4xl font-headline-md text-on-surface font-extrabold"
              style={{ textShadow: '0 0 10px rgba(255, 185, 95, 0.4)' }}
            >
              {streakDays} Ngày Liên Tục
            </h1>
          </div>
          <p className="text-sm text-on-surface-variant mt-2 max-w-md leading-relaxed">
            Bạn đang giữ chuỗi kỷ luật rất tuyệt vời! Hãy tiếp tục duy trì thói quen ghi nhận dinh
            dưỡng mỗi ngày.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {/* Calorie Compliance Card */}
        <div className="bg-surface-bright/40 border border-white/5 p-4 rounded-2xl">
          <span className="text-xs text-on-surface-variant block mb-1 font-medium">
            Tuân thủ Calo
          </span>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-headline-md font-bold text-green-light">
              {calorieComplianceDays}/{totalTrackingDays}
            </span>
            <span className="text-xs text-on-surface-variant mb-1">Ngày đạt chỉ tiêu</span>
          </div>
          <div className="w-full h-2 bg-surface-dim rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-green-light rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(102,200,28,0.5)]"
              style={{ width: `${compliancePercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Conditional PT Check-in Card (Only shown if student has a PT) */}
        {hasPt ? (
          <div className="bg-surface-bright/40 border border-white/5 p-4 rounded-2xl">
            <span className="text-xs text-on-surface-variant block mb-1 font-medium">
              Check-in PT
            </span>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-headline-md font-bold text-blue-400">
                {checkedInPtSessions}
              </span>
              <span className="text-xs text-on-surface-variant mb-1">
                /{totalPtSessions} Buổi đã check-in
              </span>
            </div>
            <div className="w-full h-2 bg-surface-dim rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-blue-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(96,165,250,0.5)]"
                style={{ width: `${ptAttendancePercent}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="bg-surface-bright/40 border border-white/5 p-4 rounded-2xl">
            <span className="text-xs text-on-surface-variant block mb-1 font-medium">
              Tự tập luyện
            </span>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-headline-md font-bold text-green-light">
                {streakDays}
              </span>
              <span className="text-xs text-on-surface-variant mb-1">Ngày kiên trì</span>
            </div>
            <div className="w-full h-2 bg-surface-dim rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-green-light rounded-full shadow-[0_0_8px_rgba(102,200,28,0.5)]"
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HistoryStreakHeroCard;
