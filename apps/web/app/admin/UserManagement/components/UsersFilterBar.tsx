'use client';

import React from 'react';
import { Search, RefreshCw } from 'lucide-react';
import type { AdminUsersFilterBarProps, AdminUserRoleFilter } from '../../../../interface';

export default function AdminUsersFilterBar({
  searchTerm,
  roleFilter,
  onSearchChange,
  onSearchSubmit,
  onRoleFilterChange,
  onRefresh,
}: AdminUsersFilterBarProps) {
  const roles: Array<{ id: AdminUserRoleFilter; label: string }> = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'USER', label: 'Học Viên' },
    { id: 'PT', label: 'Huấn Luyện Viên' },
    { id: 'ADMIN', label: 'Quản Trị Viên' },
  ];

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#121a15] p-4 rounded-2xl border border-white/10">
      {/* Search Bar */}
      <form onSubmit={onSearchSubmit} className="relative grow max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm theo tên, email, SĐT..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/40 focus:border-[#10b981] outline-none"
        />
      </form>

      {/* Role Filters */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {roles.map((r) => (
          <button
            key={r.id}
            type="button"
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
          onClick={onRefresh}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white cursor-pointer ml-auto shrink-0"
          title="Làm mới"
        >
          <RefreshCw size={16} />
        </button>
      </div>
    </div>
  );
}
