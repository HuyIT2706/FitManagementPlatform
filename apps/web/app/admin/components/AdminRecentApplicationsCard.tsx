'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import type { AdminRecentApplicationsCardProps } from '../../../interface';

const AdminRecentApplicationsCard = ({
  recentApplications,
}: AdminRecentApplicationsCardProps) => {
  return (
    <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white dark:bg-[#121a15] border border-slate-200 dark:border-white/10 space-y-3 sm:space-y-4 shadow-xs dark:shadow-xl transition-colors duration-200" suppressHydrationWarning>
      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
        <Clock className="text-amber-500 dark:text-amber-400 shrink-0" size={18} />
        Đơn Đăng Ký HLV Gần Đây
      </h3>

      <div className="divide-y divide-slate-100 dark:divide-white/5">
        {recentApplications.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-white/40 italic py-2">Chưa có đơn đăng ký gần đây</p>
        ) : (
          recentApplications.map((app) => (
            <div
              key={app.id}
              className="py-2.5 sm:py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0 flex-1">
                <strong className="block text-slate-900 dark:text-white font-bold text-xs truncate">{app.fullName}</strong>
                <span className="text-slate-500 dark:text-white/40 text-[10px] block truncate">{app.email}</span>
              </div>

              <div className="text-right space-y-0.5">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold block ${
                    app.status === 'APPROVED'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:bg-[#10b981]/20 dark:text-[#10b981]'
                      : app.status === 'PENDING'
                        ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300'
                        : 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                  }`}
                >
                  {app.status === 'APPROVED'
                    ? 'Đã duyệt'
                    : app.status === 'PENDING'
                      ? 'Chờ duyệt'
                      : 'Từ chối'}
                </span>
                <span className="text-slate-400 dark:text-white/40 text-[10px] block font-medium">
                  {new Date(app.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminRecentApplicationsCard;
