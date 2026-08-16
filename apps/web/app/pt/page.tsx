'use client';

import { useEffect, useState } from 'react';
import Header from '../../components/ui/Header';
import PTBottomNavBar from '../../components/navigation/PTBottomNavBar';
import apiClient from '../../api/axios';
import type { UserDataHome, PTDashboardData } from '../../interface';

import PtWelcomeHeader from './home/components/PtWelcomeHeader';
import PtBentoStats from './home/components/PtBentoStats';
import PtScheduleList from './home/components/PtScheduleList';
import PtPendingMeals from './home/components/PtPendingMeals';
import PtStudentRosterQuick from './home/components/PtStudentRosterQuick';

export default function PTPage() {
  const [userData, setUserData] = useState<UserDataHome | null>(null);
  const [ptData, setPtData] = useState<PTDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const [feedbackTexts, setFeedbackTexts] = useState<Record<string, string>>({});
  const [checkedSessions, setCheckedSessions] = useState<Record<string, boolean>>({});
  const [approvedMeals, setApprovedMeals] = useState<Record<string, boolean>>({});

  useEffect(() => {
    Promise.all([
      apiClient.get<UserDataHome>('/users/me'),
      apiClient.get<PTDashboardData>('/pt/dashboard'),
    ])
      .then(([userRes, ptRes]) => {
        setUserData(userRes.data);
        setPtData(ptRes.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleCheckInSession = (sessionId: string) => {
    setCheckedSessions((prev) => ({ ...prev, [sessionId]: true }));
    apiClient.post(`/pt/check-in/${sessionId}`).catch(console.error);
  };

  const handleApproveMeal = (mealId: string) => {
    setApprovedMeals((prev) => ({ ...prev, [mealId]: true }));
    apiClient
      .post(`/pt/approve-meal/${mealId}`, { note: feedbackTexts[mealId] || '' })
      .catch(console.error);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const coachName = ptData?.coachName || userData?.fullName || 'Coach Bùi Văn Huy';

  return (
    <div className="min-h-screen bg-background pb-32 pt-2 md:pt-0 dark text-on-surface">
      <Header userData={userData} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-container-padding mt-4 md:mt-8 space-y-gutter">
        {/* Section 1: Welcome Header */}
        <PtWelcomeHeader
          coachName={coachName}
          todaySessionsCount={ptData?.todaySessionsCount || 4}
          pendingMealCount={ptData?.pendingMealCount || 2}
        />

        {/* Section 2: Bento Stats Bar */}
        <PtBentoStats
          totalVipStudents={ptData?.totalVipStudents || 10}
          todaySessionsCount={ptData?.todaySessionsCount || 4}
          completedSessionsCount={ptData?.completedSessionsCount || 18}
          totalPackageSessionsCount={ptData?.totalPackageSessionsCount || 24}
          warningsCount={ptData?.warningsCount || 2}
        />

        {/* Main Content Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Left Column: Schedule & Nutrition Review */}
          <div className="lg:col-span-8 space-y-gutter">
            {/* Section 3: Today's PT Schedule */}
            <PtScheduleList
              sessions={ptData?.todaySessions}
              checkedSessions={checkedSessions}
              onCheckInSession={handleCheckInSession}
            />

            {/* Section 4: Nutrition Review Pending */}
            <PtPendingMeals
              meals={ptData?.pendingMeals}
              approvedMeals={approvedMeals}
              feedbackTexts={feedbackTexts}
              onFeedbackTextChange={(mealId, text) =>
                setFeedbackTexts((prev) => ({ ...prev, [mealId]: text }))
              }
              onApproveMeal={handleApproveMeal}
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
}
