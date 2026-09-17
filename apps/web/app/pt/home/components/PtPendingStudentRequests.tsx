/* eslint-disable @next/next/no-img-element */
'use client';

import { UserCheck, UserX, Clock } from 'lucide-react';
import { getAvatarUrl } from '../../../../utils/avatar';
import type { PtPendingStudentRequestsProps } from '../../../../interface';

const PtPendingStudentRequests = ({
  requests = [],
  onApproveRequest,
  onRejectRequest,
}: PtPendingStudentRequestsProps) => {
  if (!requests || requests.length === 0) return null;

  return (
    <div className="bento-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-amber-500/40 bg-amber-50/70 dark:bg-[#141a16] space-y-4 shadow-[0_0_20px_rgba(245,158,11,0.12)] animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base sm:text-lg font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2">
          <Clock size={18} className="text-amber-600 dark:text-amber-400 animate-pulse shrink-0" />
          <span>Yêu cầu liên kết học viên mới ({requests.length} Chờ duyệt)</span>
        </h3>
        <span className="px-2.5 sm:px-3 py-1 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] sm:text-xs font-bold border border-amber-500/30 shrink-0">
          Cần PT duyệt
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {requests.map((req) => (
          <div
            key={req.id}
            className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-black/40 border border-amber-200/60 dark:border-white/10 flex flex-col justify-between gap-3 shadow-xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-amber-400/50 bg-slate-100 dark:bg-black/60 shrink-0">
                <img src={getAvatarUrl(req.studentAvatar)} alt={req.studentName} className="w-full h-full object-cover" />
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm truncate">{req.studentName}</h4>
                <p className="text-xs text-slate-600 dark:text-white/60 truncate">{req.studentEmail}</p>
                {req.studentPhone && <p className="text-[11px] text-slate-500 dark:text-white/50 truncate">SĐT: {req.studentPhone}</p>}
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => onApproveRequest(req.id)}
                className="flex-1 min-w-[140px] py-2 rounded-xl bg-primary text-dark-slate font-extrabold text-xs flex items-center justify-center gap-1 hover:bg-primary/90 transition-all cursor-pointer shadow-[0_0_12px_rgba(102,200,28,0.3)]"
              >
                <UserCheck size={16} />
                Chấp nhận học viên
              </button>
              <button
                type="button"
                onClick={() => onRejectRequest(req.id)}
                className="px-3 py-2 rounded-xl bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/40 font-bold text-xs flex items-center justify-center gap-1 hover:bg-rose-500/25 transition-all cursor-pointer shrink-0"
              >
                <UserX size={16} />
                Từ chối
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PtPendingStudentRequests;
