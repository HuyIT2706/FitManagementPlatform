'use client';

import { useState } from 'react';
import Header from '../../components/ui/Header';
import PTBottomNavBar from '../../components/navigation/PTBottomNavBar';
import AppLoading from '../../components/ui/AppLoading';
import AccessDenied from '../../components/ui/AccessDenied';
import apiClient from '../../api/axios';
import { toast } from '../../utils/toast';

import { useCurrentUser, usePtDashboard } from '../../api/swr';
import PtPendingApproval from '../../components/ui/PtPendingApproval';
import PtWelcomeHeader from './home/components/PtWelcomeHeader';
import PtBentoStats from './home/components/PtBentoStats';
import PtPendingStudentRequests from './home/components/PtPendingStudentRequests';
import PtScheduleList from './home/components/PtScheduleList';
import PtStudentRosterQuick from './home/components/PtStudentRosterQuick';

const PTPage = () => {
  const { data: userData, isLoading: userLoading } = useCurrentUser();
  const { data: ptData, isLoading: ptLoading, mutate: mutatePt } = usePtDashboard();

  const [checkedSessions, setCheckedSessions] = useState<Record<string, boolean>>({});

  const handleCheckInSession = (sessionId: string) => {
    setCheckedSessions((prev) => ({ ...prev, [sessionId]: true }));
    apiClient
      .post<{ success: boolean; message: string; remainingSessions?: number }>(
        `/pt/check-in/${sessionId}`,
      )
      .then((res) => {
        toast.success(res.data.message || 'Đã check-in điểm danh thành công!');
        mutatePt();
      })
      .catch((err) => {
        console.error(err);
        toast.error('Check-in thất bại!');
      });
  };

  const handleApproveStudentRequest = (requestId: string) => {
    apiClient
      .post<{ success: boolean; message: string }>(`/pt/students/accept/${requestId}`)
      .then((res) => {
        toast.success(res.data.message || 'Đã chấp nhận học viên thành công!');
        mutatePt();
      })
      .catch((err) => {
        console.error(err);
        toast.error('Không thể chấp nhận yêu cầu học viên!');
      });
  };

  const handleRejectStudentRequest = (requestId: string) => {
    apiClient
      .post<{ success: boolean; message: string }>(`/pt/students/reject/${requestId}`)
      .then((res) => {
        toast.success(res.data.message || 'Đã từ chối yêu cầu học viên!');
        mutatePt();
      })
      .catch((err) => {
        console.error(err);
        toast.error('Không thể từ chối yêu cầu học viên!');
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    window.location.href = '/login';
  };

  const loading = userLoading || (userData?.role === 'PT' && userData?.isApprovedPt !== false && ptLoading && !ptData);

  if (loading) {
    return <AppLoading fullScreen size="lg" message="Đang nạp dữ liệu Huấn luyện viên..." />;
  }

  if (userData && userData.role !== 'PT') {
    return (
      <AccessDenied
        requiredRole="PT"
        currentUser={userData}
        onLogout={handleLogout}
        title="Không Có Quyền Huấn Luyện Viên"
        message="Khu vực này dành riêng cho Huấn luyện viên (PT) quản lý học viên và giáo án. Tài khoản của bạn không có quyền truy cập."
      />
    );
  }

  if (userData && userData.role === 'PT' && userData.isApprovedPt === false) {
    return <PtPendingApproval currentUser={userData} onLogout={handleLogout} />;
  }

  const coachName = ptData?.coachName || userData?.fullName || '';

  return (
    <div className="min-h-screen bg-background pb-32 pt-2 md:pt-0 dark text-on-surface">
      <Header userData={userData} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-container-padding mt-4 md:mt-8 space-y-gutter">
        {/* Section 1: Welcome Header */}
        <PtWelcomeHeader
          coachName={coachName}
          todaySessionsCount={ptData?.todaySessionsCount ?? 0}
          totalVipStudents={ptData?.totalVipStudents ?? 0}
        />

        {/* Section 2: Bento Stats Bar */}
        <PtBentoStats
          totalVipStudents={ptData?.totalVipStudents ?? 0}
          todaySessionsCount={ptData?.todaySessionsCount ?? 0}
          completedSessionsCount={ptData?.completedSessionsCount ?? 0}
          totalPackageSessionsCount={ptData?.totalPackageSessionsCount ?? 0}
          warningsCount={ptData?.warningsCount ?? 0}
        />

        {/* Section 3: Pending Student Bind Requests */}
        <PtPendingStudentRequests
          requests={ptData?.pendingStudentRequests}
          onApproveRequest={handleApproveStudentRequest}
          onRejectRequest={handleRejectStudentRequest}
        />

        {/* Main Content Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Left Column: Schedule List */}
          <div className="lg:col-span-8 space-y-gutter">
            {/* Section 4: Today's PT Schedule */}
            <PtScheduleList
              sessions={ptData?.todaySessions}
              checkedSessions={checkedSessions}
              onCheckInSession={handleCheckInSession}
            />
          </div>

          {/* Right Column: Students Quick Roster */}
          <div className="lg:col-span-4 space-y-4">
            <PtStudentRosterQuick students={ptData?.students} />
          </div>
        </div>
      </main>

      <PTBottomNavBar activeTab="home" />
    </div>
  );
};

export default PTPage;
