/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import {
  UserCheck,
  UserX,
  Clock,
  Award,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { CoachReviewCardProps } from '../../../../interface';

const CoachReviewCard = ({
  application,
  onApprove,
  onReject,
}: CoachReviewCardProps) => {
  const {
    fullName,
    email,
    phone,
    avatarUrl,
    experienceYears,
    specialties,
    certificateUrl,
    bio,
    status,
    adminNote,
  } = application;

  return (
    <div
      suppressHydrationWarning
      className={`p-6 rounded-2xl border transition-all bg-[#121a15] flex flex-col md:flex-row md:items-center justify-between gap-6 ${
        status === 'PENDING'
          ? 'border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.08)]'
          : status === 'APPROVED'
            ? 'border-[#10b981]/30'
            : 'border-rose-500/30 opacity-80'
      }`}
    >
      {/* Left Column: Avatar & Basic Info */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 shrink-0 bg-white/5 flex items-center justify-center font-extrabold text-2xl text-[#10b981]">
          {avatarUrl ? (
            <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
          ) : (
            fullName.charAt(0).toUpperCase()
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-white">{fullName}</h3>
            {status === 'PENDING' && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                <Clock size={12} />
                Chờ xét duyệt
              </span>
            )}
            {status === 'APPROVED' && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#10b981]/20 text-[#10b981] text-[10px] font-bold border border-[#10b981]/30 flex items-center gap-1">
                <CheckCircle2 size={12} />
                Đã duyệt PT
              </span>
            )}
            {status === 'REJECTED' && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/30 flex items-center gap-1">
                <XCircle size={12} />
                Đã từ chối
              </span>
            )}
          </div>

          <p className="text-xs text-white/60 font-medium">
            Email: <strong className="text-white">{email}</strong> {phone ? `• SĐT: ${phone}` : ''}
          </p>

          {/* Specialties & Experience */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="bg-[#10b981]/15 text-[#10b981] text-xs font-bold px-2.5 py-0.5 rounded-md border border-[#10b981]/30 flex items-center gap-1">
              <Award size={13} />
              {experienceYears} năm kinh nghiệm
            </span>
            {specialties.map((spec, idx) => (
              <span
                key={idx}
                className="bg-white/5 text-white/70 text-xs font-medium px-2.5 py-0.5 rounded-md border border-white/10"
              >
                {spec}
              </span>
            ))}
          </div>

          {bio && <p className="text-xs text-white/70 italic pt-1 max-w-2xl">&quot;{bio}&quot;</p>}

          {adminNote && (
            <div className="mt-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-amber-300">
              <strong>Ghi chú Admin:</strong> {adminNote}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Certificate Link & Action Buttons */}
      <div className="flex flex-col sm:flex-row md:flex-col items-end justify-between gap-4 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-white/10">
        {certificateUrl ? (
          <a
            href={certificateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold hover:bg-blue-500/20 transition-colors"
          >
            <ExternalLink size={14} />
            Xem Bằng Cấp / Chứng Chỉ
          </a>
        ) : (
          <span className="text-xs text-white/40 italic">Chưa tải bằng cấp</span>
        )}

        <div className="flex gap-2 w-full sm:w-auto">
          {status !== 'APPROVED' && (
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => onApprove(application)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#10b981] text-[#003824] text-xs font-extrabold hover:opacity-90 transition-opacity flex items-center justify-center gap-1 shadow-[0_0_12px_rgba(16,185,129,0.3)] cursor-pointer"
            >
              <UserCheck size={16} />
              Phê duyệt HLV
            </button>
          )}

          {status !== 'REJECTED' && (
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => onReject(application)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-bold hover:bg-rose-500/30 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <UserX size={16} />
              Từ chối
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoachReviewCard;
