/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Shield,
  UserCheck,
  User,
  Trash2,
  AlertTriangle,
  Award,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import apiClient from '../../../api/axios';
import { toast } from '../../../utils/toast';

interface UserItem {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: 'USER' | 'PT' | 'ADMIN';
  goal?: string;
  gender?: string;
  createdAt: string;
  coachName?: string;
  activePackage?: {
    title: string;
    remainingSessions: number;
    totalSessions: number;
  };
}

interface UsersResponse {
  data: UserItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminUsersManagement() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'PT' | 'ADMIN'>('ALL');

  // Change Role Modal
  const [userToChangeRole, setUserToChangeRole] = useState<UserItem | null>(null);
  const [targetRole, setTargetRole] = useState<'USER' | 'PT' | 'ADMIN'>('USER');

  // Delete Modal
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = (pageNumber = page) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(pageNumber));
    params.set('limit', '10');
    if (roleFilter !== 'ALL') params.set('role', roleFilter);
    if (searchTerm.trim()) params.set('search', searchTerm.trim());

    apiClient
      .get<UsersResponse>(`/admin/users?${params.toString()}`)
      .then((res) => {
        setUsers(res.data.data);
        setTotal(res.data.total);
        setPage(res.data.page);
        setTotalPages(res.data.totalPages || 1);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching users:', err);
        setLoading(false);
        toast.error('Không thể tải danh sách người dùng');
      });
  };

  useEffect(() => {
    fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleUpdateRole = () => {
    if (!userToChangeRole) return;
    setSubmitting(true);
    apiClient
      .patch(`/admin/users/${userToChangeRole.id}/role`, { role: targetRole })
      .then((res) => {
        toast.success(res.data.message || 'Cập nhật phân quyền thành công!');
        setUserToChangeRole(null);
        fetchUsers(page);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Không thể đổi phân quyền!');
      })
      .finally(() => setSubmitting(false));
  };

  const handleDeleteUser = () => {
    if (!userToDelete) return;
    setSubmitting(true);
    apiClient
      .delete(`/admin/users/${userToDelete.id}`)
      .then((res) => {
        toast.success(res.data.message || 'Xóa tài khoản thành công!');
        setUserToDelete(null);
        fetchUsers(page);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Không thể xóa tài khoản này!');
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#121a15] p-4 rounded-2xl border border-white/10">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative grow max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên, email, SĐT..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/40 focus:border-[#10b981] outline-none"
          />
        </form>

        {/* Role Filters */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {(['ALL', 'USER', 'PT', 'ADMIN'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                roleFilter === r
                  ? 'bg-[#10b981] text-[#003824] shadow-md shadow-[#10b981]/20'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              {r === 'ALL'
                ? 'Tất cả'
                : r === 'USER'
                  ? 'Học Viên'
                  : r === 'PT'
                    ? 'Huấn Luyện Viên'
                    : 'Quản Trị Viên'}
            </button>
          ))}

          <button
            type="button"
            onClick={() => fetchUsers(page)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white cursor-pointer ml-auto shrink-0"
            title="Làm mới"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#121a15] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
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
                  <td colSpan={6} className="px-6 py-12 text-center text-white/50">
                    <div className="w-6 h-6 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Đang tải danh sách người dùng...
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
                          <span className="font-bold text-primary flex items-center gap-1">
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
                          onClick={() => {
                            setUserToChangeRole(u);
                            setTargetRole(u.role);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          Đổi Quyền
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setUserToDelete(u)}
                          className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                          title="Xóa người dùng"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
          <span>
            Hiển thị <strong>{users.length}</strong> / <strong>{total}</strong> tài khoản (Trang {page}/{totalPages})
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => fetchUsers(page - 1)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => fetchUsers(page + 1)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Change Role Modal */}
      {userToChangeRole && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#121a15] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 text-white shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Shield className="text-[#10b981]" size={20} />
              Thay Đổi Phân Quyền Người Dùng
            </h3>

            <p className="text-xs text-white/70">
              Bạn đang thay đổi vai trò cho tài khoản: <strong className="text-white">{userToChangeRole.fullName}</strong> ({userToChangeRole.email})
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-white/80">Chọn phân quyền mới:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['USER', 'PT', 'ADMIN'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setTargetRole(r)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      targetRole === r
                        ? 'bg-[#10b981] border-[#10b981] text-[#003824] shadow-md shadow-[#10b981]/20'
                        : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    {r === 'USER' ? 'Học Viên' : r === 'PT' ? 'HLV PT' : 'Admin'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setUserToChangeRole(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/70 text-xs font-bold hover:bg-white/5 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleUpdateRole}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-[#10b981] text-[#003824] text-xs font-extrabold shadow-[0_0_12px_rgba(16,185,129,0.4)] hover:opacity-90 transition-opacity cursor-pointer"
              >
                {submitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#121a15] border border-rose-500/30 rounded-2xl w-full max-w-md p-6 space-y-4 text-white shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-rose-400 flex items-center gap-2">
              <AlertTriangle size={22} />
              Xác Nhận Xóa Tài Khoản
            </h3>

            <p className="text-xs text-white/70 leading-relaxed">
              Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản <strong className="text-white">{userToDelete.fullName}</strong> ({userToDelete.email})? Toàn bộ nhật ký bài tập và dữ liệu liên quan sẽ bị xóa khỏi hệ thống.
            </p>

            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/70 text-xs font-bold hover:bg-white/5 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-[0_0_12px_rgba(244,63,94,0.4)] hover:opacity-90 transition-opacity cursor-pointer"
              >
                {submitting ? 'Đang xóa...' : 'Xác Nhận Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
