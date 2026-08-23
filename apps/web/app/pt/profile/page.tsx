'use client';

import { useEffect, useState } from 'react';
import Header from '../../../components/ui/Header';
import PTBottomNavBar from '../../../components/navigation/PTBottomNavBar';
import AppLoading from '../../../components/ui/AppLoading';
import apiClient from '../../../api/axios';
import type { UserDataHome } from '../../../interface';
import type { PTCodeQrData, PTDashboardData } from '@repo/types';
import { toast } from '../../../utils/toast';

import PtProfileCard from './components/PtProfileCard';
import PtQrCodeCard from './components/PtQrCodeCard';
import PtProfileSettingsList from './components/PtProfileSettingsList';

export default function PTProfilePage() {
  const [userData, setUserData] = useState<UserDataHome | null>(null);
  const [codeQrData, setCodeQrData] = useState<PTCodeQrData | null>(null);
  const [dashboardData, setDashboardData] = useState<PTDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      apiClient.get<UserDataHome>('/users/me'),
      apiClient.get<PTCodeQrData>('/pt/code-qr'),
      apiClient.get<PTDashboardData>('/pt/dashboard'),
    ])
      .then(([userRes, qrRes, dashRes]) => {
        setUserData(userRes.data);
        setCodeQrData(qrRes.data);
        setDashboardData(dashRes.data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error('Error fetching PT profile data:', err);
        setLoading(false);
      });
  }, []);

  const handleLogout = (): void => {
    localStorage.removeItem('jwt_token');
    window.location.href = '/login';
  };

  const handleCopyPtCode = (): void => {
    const code = codeQrData?.ptCode || 'PT-HUY066';
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép Mã PT (${code}) vào bộ nhớ tạm!`);
  };

  if (loading) {
    return <AppLoading fullScreen size="lg" message="Đang nạp hồ sơ cá nhân HLV..." />;
  }

  const ptCode = codeQrData?.ptCode || 'PT-HUY066';
  const qrUrl =
    codeQrData?.qrCodeUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://nutricore.app/bind?ptCode=${ptCode}`;

  const totalStudents = dashboardData?.totalVipStudents ?? dashboardData?.students?.length ?? 0;
  const completedHours = dashboardData?.completedSessionsCount ?? 0;

  return (
    <div className="min-h-screen bg-background pb-32 pt-2 md:pt-0 dark text-on-surface">
      <Header userData={userData} onLogout={handleLogout} />

      <main className="max-w-4xl mx-auto px-container-padding mt-4 md:mt-8 space-y-6">
        {/* PT Profile Hero Card */}
        <PtProfileCard
          userData={userData}
          totalStudents={totalStudents}
          completedHours={completedHours}
          isEditOpen={isEditProfileOpen}
          setIsEditOpen={setIsEditProfileOpen}
        />

        {/* PT Unique Code & QR Code Card */}
        <PtQrCodeCard ptCode={ptCode} qrUrl={qrUrl} onCopyPtCode={handleCopyPtCode} />

        {/* Account settings */}
        <PtProfileSettingsList
          onLogout={handleLogout}
          onOpenEditProfile={() => setIsEditProfileOpen(true)}
        />
      </main>

      <PTBottomNavBar activeTab="profile" />
    </div>
  );
}
