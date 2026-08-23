'use client';

import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import apiClient from '../../api/axios';
import { toast } from '../../utils/toast';
import type { AdminAnalyticsData } from '../../interface';
import AdminAnalyticsHeader from './components/AdminAnalyticsHeader';
import AdminAnalyticsHeroMetrics from './components/AdminAnalyticsHeroMetrics';
import AdminGoalDistributionCard from './components/AdminGoalDistributionCard';
import AdminRecentUsersCard from './components/AdminRecentUsersCard';
import AdminRecentApplicationsCard from './components/AdminRecentApplicationsCard';
import AppLoading from '../../components/ui/AppLoading';

const AdminAnalyticsOverview = () => {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = () => {
    setLoading(true);
    apiClient
      .get<AdminAnalyticsData>('/admin/analytics')
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
      <div className="py-16 text-center bg-[#121a15] rounded-2xl border border-white/10" suppressHydrationWarning>
        <Activity size={40} className="mx-auto text-white/30 mb-3" />
        <p className="text-sm font-bold text-white/80">Không có dữ liệu báo cáo</p>
      </div>
    );
  }

  const { overview, goalDistribution, recentUsers, recentApplications } = data;

  return (
    <div className="space-y-8" suppressHydrationWarning>
      {/* Component 1: Header & Refresh Action */}
      <AdminAnalyticsHeader onRefresh={fetchAnalytics} />

      {/* Component 2: 8 Bento Metric Cards */}
      <AdminAnalyticsHeroMetrics overview={overview} />

      {/* Component 3: Goal Distribution Breakdown */}
      <AdminGoalDistributionCard goalDistribution={goalDistribution} />

      {/* Component 4 & 5: Recent Activities Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AdminRecentUsersCard recentUsers={recentUsers} />
        <AdminRecentApplicationsCard recentApplications={recentApplications} />
      </div>
    </div>
  );
};

export default AdminAnalyticsOverview;
