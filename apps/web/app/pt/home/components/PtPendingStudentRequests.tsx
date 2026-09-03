/* eslint-disable @next/next/no-img-element */
'use client';

import { UserCheck, UserX, Clock } from 'lucide-react';
import type { PTPendingStudentRequest } from '@repo/types';
import { getAvatarUrl } from '../../../../utils/avatar';

interface PtPendingStudentRequestsProps {
  requests?: PTPendingStudentRequest[];
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
}

const PtPendingStudentRequests = ({
  requests = [],
  onApproveRequest,
  onRejectRequest,
}: PtPendingStudentRequestsProps) => {
  if (!requests || requests.length === 0) return null;

  return (
    <div className="bento-card rounded-3xl p-6 md:p-8 border border-amber-500/40 bg-[#141a16] space-y-4 shadow-[0_0_20px_rgba(245,158,11,0.12)] animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
          <Clock size={20} className="text-amber-400 animate-pulse" />
          Yêu cầu liên kết học viên mới ({requests.length} Chờ duyệt)
        </h3>
        <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
          Cần PT duyệt
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requests.map((req) => (
          <div
            key={req.id}
            className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-amber-400/50 bg-black/60 shrink-0">
                <img src={getAvatarUrl(req.studentAvatar)} alt={req.studentName} className="w-full h-full object-cover" />
              </div>

              <div>
                <h4 className="font-extrabold text-white text-sm">{req.studentName}</h4>
                <p className="text-xs text-white/60">{req.studentEmail}</p>
                {req.studentPhone && <p className="text-[11px] text-white/50">SĐT: {req.studentPhone}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => onApproveRequest(req.id)}
                className="flex-1 py-2 rounded-xl bg-primary text-dark-slate font-extrabold text-xs flex items-center justify-center gap-1 hover:bg-primary/90 transition-all cursor-pointer shadow-[0_0_12px_rgba(102,200,28,0.3)]"
              >
                <UserCheck size={16} />
                Chấp nhận học viên
              </button>
              <button
                type="button"
                onClick={() => onRejectRequest(req.id)}
                className="px-3 py-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold text-xs flex items-center justify-center gap-1 hover:bg-rose-500/30 transition-all cursor-pointer"
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
