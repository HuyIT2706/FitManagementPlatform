'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import type { AdminAnalyticsHeaderProps } from '../../../interface';

const AdminAnalyticsHeader = ({ onRefresh }: AdminAnalyticsHeaderProps) => {
  return (
    <div className="flex items-center justify-between" suppressHydrationWarning>
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide">Tổng Quan Hoạt Động Hệ Thống</h2>
      </div>

      <button
        type="button"
        suppressHydrationWarning
        onClick={onRefresh}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 text-xs font-bold transition-colors cursor-pointer"
      >
        <RefreshCw size={15} />
        Làm Mới
      </button>
    </div>
  );
};

export default AdminAnalyticsHeader;
