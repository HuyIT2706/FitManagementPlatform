'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '../../../api/axios';
import { toast } from '../../../utils/toast';
import type {
  AdminUserItem,
  AdminUsersResponse,
  AdminUserRole,
  AdminUserRoleFilter,
} from '../../../interface';
import AdminUsersFilterBar from './components/UsersFilterBar';
import AdminUsersTable from './components/UsersTable';
import AdminChangeRoleModal from './components/ChangeRoleModal';
import AdminDeleteUserModal from './components/DeleteUserModal';
import AdminUsersPagination from './components/UsersPagination';

export default function AdminUsersManagement() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<AdminUserRoleFilter>('ALL');

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Change Role Modal
  const [userToChangeRole, setUserToChangeRole] = useState<AdminUserItem | null>(null);
  const [targetRole, setTargetRole] = useState<AdminUserRole>('USER');

  // Delete Modal
  const [userToDelete, setUserToDelete] = useState<AdminUserItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = (pageNumber = page, searchVal = debouncedSearchTerm) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(pageNumber));
    params.set('limit', '10');
    if (roleFilter !== 'ALL') params.set('role', roleFilter);
    if (searchVal.trim()) params.set('search', searchVal.trim());

    apiClient
      .get<AdminUsersResponse>(`/admin/users?${params.toString()}`)
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
    fetchUsers(1, debouncedSearchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, debouncedSearchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleOpenChangeRoleModal = (user: AdminUserItem) => {
    setUserToChangeRole(user);
    setTargetRole(user.role);
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
      {/* Component 1: Search & Role Filter Bar */}
      <AdminUsersFilterBar
        searchTerm={searchTerm}
        roleFilter={roleFilter}
        onSearchChange={setSearchTerm}
        onSearchSubmit={handleSearch}
        onRoleFilterChange={setRoleFilter}
        onRefresh={() => fetchUsers(page)}
      />

      {/* Component 2: Users Data Table */}
      <AdminUsersTable
        users={users}
        loading={loading}
        onChangeRole={handleOpenChangeRoleModal}
        onDeleteUser={setUserToDelete}
      />

      {/* Component 3: Pagination Footer */}
      <AdminUsersPagination
        total={total}
        currentCount={users.length}
        page={page}
        totalPages={totalPages}
        onPageChange={fetchUsers}
      />

      {/* Modal 1: Change Role */}
      <AdminChangeRoleModal
        isOpen={Boolean(userToChangeRole)}
        user={userToChangeRole}
        targetRole={targetRole}
        submitting={submitting}
        onRoleSelect={setTargetRole}
        onClose={() => setUserToChangeRole(null)}
        onSubmit={handleUpdateRole}
      />

      {/* Modal 2: Delete Confirmation */}
      <AdminDeleteUserModal
        isOpen={Boolean(userToDelete)}
        user={userToDelete}
        submitting={submitting}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteUser}
      />
    </div>
  );
}
