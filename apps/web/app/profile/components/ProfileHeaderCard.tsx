/* eslint-disable @next/next/no-img-element */
'use client';

import { UserCheck, Edit3 } from 'lucide-react';
import type { ProfileHeaderCardProps } from '../../../interface';
import { getAvatarUrl } from '../../../utils/avatar';

const ProfileHeaderCard = ({ userData, onEditProfile }: ProfileHeaderCardProps) => {
  const isApprovedPt =
    userData?.assignedPt?.status === 'APPROVED' || userData?.assignedPt?.isApproved;
  const ptName = isApprovedPt ? `PT Phụ trách: ${userData?.assignedPt?.fullName}` : '';

  return (
    <section className="bento-card rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden border border-outline-variant/30">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-light/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative">
        <img
          className="w-24 h-24 rounded-full object-cover border-2 border-surface shadow-lg bg-surface-bright"
          alt="Profile Avatar"
          src={getAvatarUrl(userData?.avatarUrl)}
        />
        <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-light rounded-full border-2 border-surface-bright shadow-[0_0_8px_rgba(102,200,28,0.6)]"></div>
      </div>

      <div className="flex flex-col items-center md:items-start flex-1 text-center md:text-left z-10">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-2xl font-headline-md font-bold text-on-surface">
            {userData?.fullName || 'Học Viên VIP'}
          </h2>
        </div>
        <p className="text-sm font-body-md text-on-surface-variant mb-3">
          {userData?.email || 'user@example.com'}
        </p>
        <div className="flex items-center gap-2 text-xs text-on-surface-variant bg-surface-bright/40 px-3 py-2 rounded-lg border border-white/5">
          <UserCheck size={16} className="text-primary shrink-0" />
          <span className="font-semibold">{ptName || 'Chưa liên kết PT'}</span>
        </div>
      </div>

      <button
        type="button"
        suppressHydrationWarning
        onClick={onEditProfile}
        className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant text-green-light font-bold text-xs hover:bg-green-light/10 transition-colors z-10 cursor-pointer"
      >
        <Edit3 size={14} />
        Chỉnh sửa hồ sơ
      </button>
    </section>
  );
};

export default ProfileHeaderCard;
