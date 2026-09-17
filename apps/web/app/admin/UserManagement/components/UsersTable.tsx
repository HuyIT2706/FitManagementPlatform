/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import {
  Users,
  Shield,
  UserCheck,
  User,
  Trash2,
  Award,
} from 'lucide-react';
import type { AdminUsersTableProps } from '../../../../interface';
import { getAvatarUrl } from '../../../../utils/avatar';
import AppLoading from '../../../../components/ui/AppLoading';

const AdminUsersTable = ({
  users,
  loading,
  onChangeRole,
  onDeleteUser,
}: AdminUsersTableProps) => {
  return (
    <div className="bg-white dark:bg-[#121a15] rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs dark:shadow-xl transition-colors duration-200" suppressHydrationWarning>
      <div className="overflow-x-auto [&&::-webkit-scrollbar]:h-1.5 [&&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&&::-webkit-scrollbar-thumb]:bg-white/20 [&&::-webkit-scrollbar-thumb]:rounded-full">
        <table className="w-full text-left text-xs text-slate-900 dark:text-white min-w-[680px]">
          <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-white/60 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-white/10">
            <tr>
              <th className="px-4 sm:px-6 py-3 sm:py-4">Người Dùng</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4">Phân Quyền</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4">Gói Tập</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4">Mục Tiêu</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4">Ngày Tham Gia</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 sm:px-6 py-8 text-center text-slate-500 dark:text-white/50">
                  <AppLoading size="sm" message="Đang tải danh sách người dùng..." />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 sm:px-6 py-12 text-center text-slate-500 dark:text-white/50">
                  <Users size={32} className="mx-auto mb-2 text-slate-300 dark:text-white/20" />
                  Không tìm thấy người dùng nào
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                  {/* User Info */}
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-[160px] sm:min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 shrink-0 bg-slate-100 dark:bg-white/5 flex items-center justify-center font-bold text-slate-700 dark:text-white">
                        <img
                          src={getAvatarUrl(u.avatarUrl)}
                          alt={u.fullName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <strong className="block text-slate-900 dark:text-white font-bold text-xs sm:text-sm truncate">{u.fullName}</strong>
                        <span className="text-slate-500 dark:text-white/50 text-[10px] sm:text-[11px] block truncate">{u.email}</span>
                        {u.phone && <span className="text-slate-400 dark:text-white/40 text-[10px] block truncate">{u.phone}</span>}
                      </div>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    {u.role === 'ADMIN' && (
                      <span className="px-2.5 py-1 rounded-md bg-purple-500/15 text-purple-700 dark:text-purple-300 font-bold border border-purple-500/30 flex items-center gap-1.5 w-fit text-[11px]">
                        <Shield size={12} />
                        Admin
                      </span>
                    )}
                    {u.role === 'PT' && (
                      <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-[#10b981] font-bold border border-emerald-500/30 flex items-center gap-1.5 w-fit text-[11px]">
                        <UserCheck size={12} />
                        Coach PT
                      </span>
                    )}
                    {u.role === 'USER' && (
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white/70 font-semibold border border-slate-200 dark:border-white/10 flex items-center gap-1.5 w-fit text-[11px]">
                        <User size={12} />
                        Học Viên
                      </span>
                    )}
                  </td>

                  {/* Active Package */}
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    {u.activePackage ? (
                      <div className="space-y-0.5">
                        <span className="font-bold text-emerald-600 dark:text-[#10b981] flex items-center gap-1 text-xs">
                          <Award size={13} />
                          {u.activePackage.title}
                        </span>
                        <span className="text-slate-500 dark:text-white/50 text-[10px] block">
                          Còn {u.activePackage.remainingSessions} / {u.activePackage.totalSessions} buổi
                        </span>
                      </div>
                    ) : u.coachName ? (
                      <span className="text-slate-700 dark:text-white/70 text-xs">PT: {u.coachName}</span>
                    ) : (
                      <span className="text-slate-400 dark:text-white/30 italic text-[11px]">Chưa đăng ký gói</span>
                    )}
                  </td>

                  {/* Goal */}
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span className="text-slate-700 dark:text-white/80 font-medium text-xs">
                      {u.goal === 'LOSE_WEIGHT'
                        ? 'Giảm Mỡ'
                        : u.goal === 'BUILD_MUSCLE'
                          ? 'Tăng Cơ'
                          : u.goal === 'MAINTAIN'
                            ? 'Giữ Vóc Dáng'
                            : u.goal || 'Chưa chọn'}
                    </span>
                  </td>

                  {/* Created Date */}
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-500 dark:text-white/50 text-[11px] whitespace-nowrap">
                    {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                  </td>

                  {/* Actions */}
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {/* Change Role Button */}
                      <button
                        type="button"
                        suppressHydrationWarning
                        onClick={() => onChangeRole(u)}
                        className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 text-[11px] font-bold transition-all cursor-pointer hover:scale-105 active:scale-95"
                      >
                        Đổi Quyền
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        suppressHydrationWarning
                        onClick={() => onDeleteUser(u)}
                        className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/25 hover:border-rose-300 dark:hover:border-rose-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-xs"
                        title="Xóa người dùng"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersTable;
