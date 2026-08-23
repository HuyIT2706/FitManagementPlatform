'use client';

import { ShieldCheck, UserCheck } from 'lucide-react';
import type { TrainingVipBannerProps } from '../../../interface';

export default function TrainingVipBanner({
  userData,
  assignedMealPlan,
}: TrainingVipBannerProps) {
  const hasPt = Boolean(userData?.assignedPt || assignedMealPlan);
  const ptName =
    userData?.assignedPt?.fullName || assignedMealPlan?.coachName || '';
  const activePkg = userData?.activePackage;
  const remainingSessions = activePkg?.remainingSessions ?? 8;
  const totalSessions = activePkg?.totalSessions ?? 12;
  const sessionsPercentage = totalSessions
    ? Math.min(100, Math.round((remainingSessions / totalSessions) * 100))
    : 66;

  return (
    <section className="bento-card rounded-3xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden border border-outline-variant/30">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span
              className="bg-green-light/20 text-green-light px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-1.5"
              style={{
                boxShadow: '0 0 15px rgba(102, 200, 28, 0.4)',
                border: '1px solid rgba(102, 200, 28, 0.5)',
              }}
            >
              <ShieldCheck size={14} />
              VIP MEMBER
            </span>
            <h1 className="font-headline-md text-xl md:text-2xl text-on-surface font-bold">
              Xin chào, {userData?.fullName || 'Thành viên'}
            </h1>
          </div>

          {hasPt && (
            <div className="flex items-center gap-2 text-on-surface-variant">
              <UserCheck size={18} className="text-primary shrink-0" />
              <span className="font-label-lg text-base">
                PT Phụ trách: <strong className="text-on-surface">{ptName}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {hasPt && (
        <div className="space-y-2 z-10 mt-1">
          <div className="flex justify-between font-label-sm text-base">
            <span className="text-on-surface-variant">Số buổi tập còn lại</span>
            <span className="text-green-light font-bold">
              {remainingSessions} / {totalSessions} Buổi
            </span>
          </div>
          <div className="h-2.5 w-full bg-surface-bright rounded-full overflow-hidden">
            <div
              className="h-full bg-green-light shadow-[0_0_8px_rgba(102,200,28,0.5)] transition-all duration-500"
              style={{ width: `${sessionsPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="absolute -right-10 -top-10 w-48 h-48 bg-green-light/10 blur-[60px] rounded-full pointer-events-none"></div>
    </section>
  );
}
