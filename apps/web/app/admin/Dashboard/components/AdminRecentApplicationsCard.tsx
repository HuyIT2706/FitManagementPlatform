'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import type { AdminRecentApplicationsCardProps } from '../../../../interface';

export default function AdminRecentApplicationsCard({
  recentApplications,
}: AdminRecentApplicationsCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-[#121a15] border border-white/10 space-y-4 shadow-xl">
      <h3 className="font-bold text-base text-white flex items-center gap-2">
        <Clock className="text-amber-400" size={18} />
        Đơn Đăng Ký HLV Gần Đây
      </h3>

      <div className="divide-y divide-white/5">
        {recentApplications.length === 0 ? (
          <p className="text-xs text-white/40 italic py-2">Chưa có đơn đăng ký gần đây</p>
        ) : (
          recentApplications.map((app) => (
            <div
              key={app.id}
              className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
            >
              <div>
                <strong className="block text-white font-bold text-xs">{app.fullName}</strong>
                <span className="text-white/40 text-[10px]">{app.email}</span>
              </div>

              <div className="text-right space-y-0.5">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold block ${
                    app.status === 'APPROVED'
                      ? 'bg-[#10b981]/20 text-[#10b981]'
                      : app.status === 'PENDING'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {app.status === 'APPROVED'
                    ? 'Đã duyệt'
                    : app.status === 'PENDING'
                      ? 'Chờ duyệt'
                      : 'Từ chối'}
                </span>
                <span className="text-white/40 text-[10px] block">
                  {new Date(app.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
