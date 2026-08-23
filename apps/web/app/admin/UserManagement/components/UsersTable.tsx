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

import AppLoading from '../../../../components/ui/AppLoading';

const AdminUsersTable = ({
  users,
  loading,
  onChangeRole,
  onDeleteUser,
}: AdminUsersTableProps) => {
  return (
    <div className="bg-[#121a15] rounded-2xl border border-white/10 overflow-hidden shadow-xl" suppressHydrationWarning>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-white">
          <thead className="bg-white/5 text-white/60 uppercase font-semibold text-[10px] tracking-wider border-b border-white/10">
            <tr>
              <th className="px-6 py-4">Người Dùng</th>
              <th className="px-6 py-4">Phân Quyền (Role)</th>
              <th className="px-6 py-4">Gói Tập / HLV Kèm</th>
              <th className="px-6 py-4">Mục Tiêu</th>
              <th className="px-6 py-4">Ngày Tham Gia</th>
              <th className="px-6 py-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-white/50">
                  <AppLoading size="sm" message="Đang tải danh sách người dùng..." />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-white/50">
                  <Users size={32} className="mx-auto mb-2 text-white/20" />
                  Không tìm thấy người dùng nào
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                  {/* User Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0 bg-white/5 flex items-center justify-center font-bold text-white">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt={u.fullName} className="w-full h-full object-cover" />
                        ) : (
                          u.fullName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <strong className="block text-white font-bold text-sm">{u.fullName}</strong>
                        <span className="text-white/50 text-[11px] block">{u.email}</span>
                        {u.phone && <span className="text-white/40 text-[10px]">{u.phone}</span>}
                      </div>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="px-6 py-4">
                    {u.role === 'ADMIN' && (
                      <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 flex items-center gap-1.5 w-fit text-[11px]">
                        <Shield size={12} />
                        Admin
                      </span>
                    )}
                    {u.role === 'PT' && (
                      <span className="px-2.5 py-1 rounded-md bg-[#10b981]/20 text-[#10b981] font-bold border border-[#10b981]/30 flex items-center gap-1.5 w-fit text-[11px]">
                        <UserCheck size={12} />
                        Coach PT
                      </span>
                    )}
                    {u.role === 'USER' && (
                      <span className="px-2.5 py-1 rounded-md bg-white/10 text-white/70 font-semibold border border-white/10 flex items-center gap-1.5 w-fit text-[11px]">
                        <User size={12} />
                        Học Viên
                      </span>
                    )}
                  </td>

                  {/* Active Package */}
                  <td className="px-6 py-4">
                    {u.activePackage ? (
                      <div className="space-y-0.5">
                        <span className="font-bold text-[#10b981] flex items-center gap-1">
                          <Award size={13} />
                          {u.activePackage.title}
                        </span>
                        <span className="text-white/50 text-[10px] block">
                          Còn {u.activePackage.remainingSessions} / {u.activePackage.totalSessions} buổi
                        </span>
                      </div>
                    ) : u.coachName ? (
                      <span className="text-white/70 text-xs">PT: {u.coachName}</span>
                    ) : (
                      <span className="text-white/30 italic text-[11px]">Chưa đăng ký gói</span>
                    )}
                  </td>

                  {/* Goal */}
                  <td className="px-6 py-4">
                    <span className="text-white/80 font-medium">
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
                  <td className="px-6 py-4 text-white/50 text-[11px]">
                    {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Change Role Button */}
                      <button
                        type="button"
                        suppressHydrationWarning
                        onClick={() => onChangeRole(u)}
                        className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 text-[11px] font-bold transition-all cursor-pointer hover:scale-105 active:scale-95"
                      >
                        Đổi Quyền
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        suppressHydrationWarning
                        onClick={() => onDeleteUser(u)}
                        className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/25 hover:border-rose-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-sm"
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
