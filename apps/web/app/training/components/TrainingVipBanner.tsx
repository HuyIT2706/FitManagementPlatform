'use client';

import { UserCheck, Dumbbell, Clock, AlertCircle, Info } from 'lucide-react';
import type { TrainingVipBannerProps } from '../../../interface';

const TrainingVipBanner = ({
  userData,
  assignedWorkoutPlan,
}: TrainingVipBannerProps) => {
  const fallbackCoachName = assignedWorkoutPlan?.coachName;
  const isSystemDefaultCoach = fallbackCoachName === 'Hệ Thống NutriCore';
  const hasValidCoachName = Boolean(fallbackCoachName && !isSystemDefaultCoach);

  const isApprovedPt = Boolean(
    (userData?.assignedPt &&
      (userData.assignedPt.status === 'APPROVED' || userData.assignedPt.isApproved)) ||
    hasValidCoachName
  );
  const isPendingPt = Boolean(
    !isApprovedPt &&
    userData?.assignedPt &&
      (userData.assignedPt.status === 'PENDING' || userData.assignedPt.isPending)
  );
  const ptName = isApprovedPt
    ? (userData?.assignedPt?.fullName || (hasValidCoachName ? fallbackCoachName : '') || 'Huấn luyện viên')
    : '';

  const activePkg = userData?.activePackage;
  const hasPackage = Boolean(
    activePkg &&
      typeof activePkg.totalSessions === 'number' &&
      activePkg.totalSessions > 0
  );
  const remainingSessions = activePkg?.remainingSessions ?? 0;
  const totalSessions = activePkg?.totalSessions ?? 0;
  const sessionsPercentage =
    totalSessions > 0
      ? Math.min(100, Math.round((remainingSessions / totalSessions) * 100))
      : 0;

  return (
    <section className="bento-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-6 relative overflow-hidden border border-outline-variant/30">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 z-10">
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span
              className="bg-green-light/20 text-green-light px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold tracking-wider uppercase flex items-center gap-1.5"
              style={{
                boxShadow: '0 0 15px rgba(102, 200, 28, 0.4)',
                border: '1px solid rgba(102, 200, 28, 0.5)',
              }}
            >
              Xin chào
            </span>
            <h1 className="font-headline-md text-lg sm:text-xl md:text-2xl text-on-surface font-bold">
              {userData?.fullName || 'Thành viên'}
            </h1>
          </div>

          {/* PT Assignment Subtitle */}
          {isApprovedPt ? (
            <div className="flex items-center gap-2 text-on-surface-variant">
              <UserCheck size={16} className="text-primary shrink-0 sm:w-[18px] sm:h-[18px]" />
              <span className="font-label-lg text-sm sm:text-base">
                PT Phụ trách: <strong className="text-on-surface">{ptName}</strong>
              </span>
            </div>
          ) : isPendingPt ? (
            <div className="flex items-center gap-2 text-amber-400">
              <Clock size={16} className="shrink-0 sm:w-[18px] sm:h-[18px]" />
              <span className="font-label-lg text-sm sm:text-base">
                Đang chờ duyệt PT: <strong className="text-on-surface">{userData?.assignedPt?.fullName}</strong>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-on-surface-variant">
              <Dumbbell size={16} className="text-primary/90 shrink-0 sm:w-[18px] sm:h-[18px]" />
              <span className="font-label-lg text-sm sm:text-base">
                Chế độ: <strong className="text-on-surface">Tự luyện tập</strong> (Bạn đang chưa tập với PT)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* PT Sessions Section */}
      {isApprovedPt && hasPackage ? (
        <div className="space-y-2 z-10 mt-1">
          <div className="flex justify-between font-label-sm text-sm sm:text-base">
            <span className="text-on-surface-variant">Số buổi tập còn lại</span>
            <span
              className={`font-bold ${
                remainingSessions > 0 ? 'text-green-light' : 'text-amber-400'
              }`}
            >
              {remainingSessions} / {totalSessions} Buổi
            </span>
          </div>
          <div className="h-2.5 w-full bg-surface-bright rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                remainingSessions > 0
                  ? 'bg-green-light shadow-[0_0_8px_rgba(102,200,28,0.5)]'
                  : 'bg-amber-400/50'
              }`}
              style={{ width: `${sessionsPercentage}%` }}
            ></div>
          </div>
          {remainingSessions === 0 && (
            <p className="text-xs text-amber-400/90 italic">
              * Bạn đã hoàn thành hết số buổi tập cùng PT. Hãy liên hệ Coach để gia hạn gói mới nhé.
            </p>
          )}
        </div>
      ) : isApprovedPt && !hasPackage ? (
        <div className="z-10 mt-1 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-surface-bright/40 border border-outline-variant/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0 text-amber-400">
              <AlertCircle size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-on-surface">
                Chưa kích hoạt gói buổi tập với PT
              </p>
              <p className="text-[11px] sm:text-xs text-on-surface-variant truncate">
                Bạn đã kết nối cùng Coach {ptName}. Vui lòng liên hệ PT để kích hoạt số buổi tập.
              </p>
            </div>
          </div>
          <span className="text-[11px] sm:text-xs px-2.5 py-1 rounded-full bg-amber-400/15 text-amber-400 font-bold shrink-0 border border-amber-400/30">
            0 Buổi
          </span>
        </div>
      ) : isPendingPt ? (
        <div className="z-10 mt-1 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-surface-bright/40 border border-outline-variant/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0 text-amber-400">
              <Clock size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-on-surface">
                Chưa có buổi với PT
              </p>
              <p className="text-[11px] sm:text-xs text-on-surface-variant truncate">
                Yêu cầu ghép lớp của bạn đang đợi Huấn luyện viên xác nhận.
              </p>
            </div>
          </div>
          <span className="text-[11px] sm:text-xs px-2.5 py-1 rounded-full bg-amber-400/15 text-amber-400 font-bold shrink-0 border border-amber-400/30">
            Đang duyệt
          </span>
        </div>
      ) : (
        <div className="z-10 mt-1 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-surface-bright/30 border border-outline-variant/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
              <Info size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-on-surface">
                Chưa có buổi tập với PT
              </p>
              <p className="text-[11px] sm:text-xs text-on-surface-variant leading-relaxed">
                Bạn hiện chưa đăng ký tập cùng Huấn luyện viên cá nhân (PT). Bạn có thể theo dõi và tự tập theo thư viện bài tập bên dưới.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <span className="text-[11px] sm:text-xs px-3 py-1 rounded-full bg-surface-bright text-on-surface-variant font-semibold border border-white/5">
              Chưa có PT
            </span>
          </div>
        </div>
      )}

      <div className="absolute -right-10 -top-10 w-48 h-48 bg-green-light/10 blur-[60px] rounded-full pointer-events-none"></div>
    </section>
  );
};

export default TrainingVipBanner;
