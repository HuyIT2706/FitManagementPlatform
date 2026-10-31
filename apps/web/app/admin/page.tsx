'use client';

import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import apiClient from '../../api/axios';
import { toast } from '../../utils/toast';
import type { AdminAnalyticsData } from '../../interface';
import AdminAnalyticsHeader from './components/AdminAnalyticsHeader';
import AdminAnalyticsHeroMetrics from './components/AdminAnalyticsHeroMetrics';
import AdminGoalDistributionCard from './components/AdminGoalDistributionCard';
import AdminPtPerformanceCard from './components/AdminPtPerformanceCard';
import AdminRecentUsersCard from './components/AdminRecentUsersCard';
import AdminRecentApplicationsCard from './components/AdminRecentApplicationsCard';
import AppLoading from '../../components/ui/AppLoading';

const AdminAnalyticsOverview = () => {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = () => {
    setLoading(true);
    apiClient
      .get<AdminAnalyticsData>('/admin/analytics', { timeout: 15000 })
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading analytics:', err);
        setLoading(false);
        toast.error('Không thể tải dữ liệu báo cáo thống kê');
      });
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return <AppLoading message="Đang tổng hợp dữ liệu báo cáo hệ thống..." />;
  }

  if (!data) {
    return (
      <div className="py-16 text-center bg-white dark:bg-[#121a15] rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs flex flex-col items-center justify-center p-6" suppressHydrationWarning>
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4 text-amber-500">
          <Activity size={32} />
        </div>
        <p className="text-base font-bold text-slate-800 dark:text-white/90 mb-1">Không thể tải dữ liệu báo cáo</p>
        <p className="text-xs text-slate-500 dark:text-white/50 max-w-sm mb-6">
          Hệ thống gặp sự cố khi kết nối hoặc máy chủ đang phản hồi chậm. Vui lòng thử lại.
        </p>
        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
        >
          <RefreshCw size={14} />
          <span>Thử lại</span>
        </button>
      </div>
    );
  }

  const { overview, ptPerformance, goalDistribution, recentUsers, recentApplications } = data;

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8" suppressHydrationWarning>
      {/* Component 1: Header & Refresh Action */}
      <AdminAnalyticsHeader onRefresh={fetchAnalytics} />

      {/* Component 2: 8 Bento Metric Cards */}
      <AdminAnalyticsHeroMetrics overview={overview} />

      {/* Component 3 & 4: Goal Distribution & PT Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <AdminGoalDistributionCard goalDistribution={goalDistribution} />
        <AdminPtPerformanceCard ptPerformance={ptPerformance} />
      </div>

      {/* Component 5 & 6: Recent Activities Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <AdminRecentUsersCard recentUsers={recentUsers} />
        <AdminRecentApplicationsCard recentApplications={recentApplications} />
      </div>
    </div>
  );
};

export default AdminAnalyticsOverview;
