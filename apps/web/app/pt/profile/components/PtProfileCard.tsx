/* eslint-disable @next/next/no-img-element */
'use client';

import type { UserDataHome } from '../../../../interface';

interface PtProfileCardProps {
  userData: UserDataHome | null;
  totalStudents: number;
  completedHours: number;
}

export default function PtProfileCard({
  userData,
  totalStudents,
  completedHours,
}: PtProfileCardProps) {
  return (
    <div className="bento-card rounded-3xl p-6 md:p-8 space-y-6 border border-outline-variant/30 text-center relative overflow-hidden">
      <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-2 border-primary shadow-[0_0_20px_rgba(102,200,28,0.4)]">
        {userData?.avatarUrl ? (
          <img src={userData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-green-light text-dark-slate flex items-center justify-center text-3xl font-extrabold">
            {userData?.fullName?.charAt(0) || 'P'}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold font-headline-md text-on-surface">
          {userData?.fullName || 'Coach Huấn Luyện Viên'}
        </h1>
        <p className="text-xs text-on-surface-variant font-medium">
          {userData?.email || 'pt@fitmanagement.com'}
        </p>
        <div className="pt-1">
          <span className="bg-primary/10 text-primary text-xs font-bold px-3.5 py-1 rounded-full border border-primary/30 inline-block uppercase tracking-wider">
            Senior Personal Trainer
          </span>
        </div>
      </div>

      {/* Real Backend PT Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
        <div className="bg-surface-bright/30 p-3 rounded-2xl border border-white/5">
          <span className="text-2xl font-extrabold text-primary block">{totalStudents}</span>
          <span className="text-xs font-semibold text-on-surface-variant">Học viên VIP</span>
        </div>
        <div className="bg-surface-bright/30 p-3 rounded-2xl border border-white/5">
          <span className="text-2xl font-extrabold text-on-surface block">{completedHours}+</span>
          <span className="text-xs font-semibold text-on-surface-variant">Buổi hoàn thành</span>
        </div>
        <div className="bg-surface-bright/30 p-3 rounded-2xl border border-white/5">
          <span className="text-2xl font-extrabold text-orange-400 block">4.9 ★</span>
          <span className="text-xs font-semibold text-on-surface-variant">Đánh giá cao</span>
        </div>
      </div>
    </div>
  );
}
