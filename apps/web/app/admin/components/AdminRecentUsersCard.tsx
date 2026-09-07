/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { Users } from 'lucide-react';
import type { AdminRecentUsersCardProps } from '../../../interface';
import { getAvatarUrl } from '../../../utils/avatar';

const AdminRecentUsersCard = ({
  recentUsers,
}: AdminRecentUsersCardProps) => {
  return (
    <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-[#121a15] border border-white/10 space-y-3 sm:space-y-4 shadow-xl" suppressHydrationWarning>
      <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
        <Users className="text-blue-400 shrink-0" size={18} />
        Người dùng mới Đăng Ký
      </h3>

      <div className="divide-y divide-white/5">
        {recentUsers.length === 0 ? (
          <p className="text-xs text-white/40 italic py-2">Chưa có người dùng mới</p>
        ) : (
          recentUsers.map((u) => (
            <div
              key={u.id}
              className="py-2.5 sm:py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-white shrink-0">
                  <img
                    src={getAvatarUrl(u.avatarUrl)}
                    alt={u.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <strong className="block text-white font-bold text-xs truncate">
                    {u.fullName}
                  </strong>
                  <span className="text-white/40 text-[10px] block truncate">{u.email}</span>
                </div>
              </div>

              <span className="text-white/40 text-[10px] shrink-0">
                {new Date(u.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminRecentUsersCard;
