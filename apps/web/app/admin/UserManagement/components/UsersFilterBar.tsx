'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import type { AdminUsersFilterBarProps, AdminUserRoleFilter } from '../../../../interface';
import AppSearchInput from '../../../../components/ui/AppSearchInput';

const AdminUsersFilterBar = ({
  searchTerm,
  roleFilter,
  onSearchChange,
  onSearchSubmit,
  onRoleFilterChange,
  onRefresh,
}: AdminUsersFilterBarProps) => {
  const roles: Array<{ id: AdminUserRoleFilter; label: string }> = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'USER', label: 'Học Viên' },
    { id: 'PT', label: 'Huấn Luyện Viên' },
    { id: 'ADMIN', label: 'Quản Trị Viên' },
  ];

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#121a15] p-4 rounded-2xl border border-white/10" suppressHydrationWarning>
      {/* Search Bar */}
      <div className="grow max-w-md" suppressHydrationWarning>
        <AppSearchInput
          size="sm"
          value={searchTerm}
          onChange={onSearchChange}
          onSubmit={() => onSearchSubmit({ preventDefault: () => {} } as React.FormEvent)}
          placeholder="Tìm theo tên, email, SĐT..."
          variant="filled"
        />
      </div>

      {/* Role Filters */}
      <div className="flex items-center gap-2 overflow-x-auto" suppressHydrationWarning>
        {roles.map((r) => (
          <button
            key={r.id}
            type="button"
            suppressHydrationWarning
            onClick={() => onRoleFilterChange(r.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              roleFilter === r.id
                ? 'bg-[#10b981] text-[#003824] shadow-md shadow-[#10b981]/20'
                : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
            }`}
          >
            {r.label}
          </button>
        ))}

        <button
          type="button"
          suppressHydrationWarning
          onClick={onRefresh}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white cursor-pointer ml-auto shrink-0"
          title="Làm mới"
        >
          <RefreshCw size={16} />
        </button>
      </div>
    </div>
  );
};

export default AdminUsersFilterBar;
