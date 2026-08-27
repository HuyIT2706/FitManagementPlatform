'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import Header from '../../../components/ui/Header';
import PTBottomNavBar from '../../../components/navigation/PTBottomNavBar';
import AppLoading from '../../../components/ui/AppLoading';
import apiClient from '../../../api/axios';
import { toast } from '../../../utils/toast';

import dynamic from 'next/dynamic';
import PtStudentCard, { type StudentListItem } from './components/PtStudentCard';
import AccessDenied from '../../../components/ui/AccessDenied';
import { useCurrentUser, usePtDashboard } from '../../../hooks/swr';
import PtPendingApproval from '../../../components/ui/PtPendingApproval';

const PtInviteStudentModal = dynamic(() => import('./components/PtInviteStudentModal'), {
  ssr: false,
});

const PTStudentsPage = () => {
  const { data: userData, isLoading: userLoading } = useCurrentUser();
  const { data: ptData, isLoading: ptLoading } = usePtDashboard();

  // Invite Student Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [packageName, setPackageName] = useState('Gói PT 1:1 VIP (3 Tháng)');
  const [totalSessions, setTotalSessions] = useState<number | ''>(12);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    window.location.href = '/login';
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentEmail) {
      toast.error('Vui lòng nhập Email học viên!');
      return;
    }

    setSendingInvite(true);
    apiClient
      .post<{ inviteUrl: string; inviteCode: string }>('/pt/students/invite', {
        studentEmail,
        packageName,
        totalSessions,
        remainingSessions: totalSessions,
      })
      .then((res) => {
        setSendingInvite(false);
        const url = res.data.inviteUrl || 'https://nutricore.app/invite?code=INV-9921';
        setGeneratedInviteUrl(url);
        toast.success('Đã khởi tạo Link mời liên kết học viên thành công!');
      })
      .catch((err) => {
        console.error(err);
        setSendingInvite(false);
        toast.error('Không thể tạo link mời học viên!');
      });
  };

  const handleCopyInviteUrl = () => {
    if (!generatedInviteUrl) return;
    navigator.clipboard.writeText(generatedInviteUrl);
    toast.success('Đã sao chép Link Mời vào bộ nhớ tạm!');
  };

  const loading = userLoading || (userData?.role === 'PT' && userData?.isApprovedPt !== false && ptLoading && !ptData);

  if (loading) {
    return <AppLoading fullScreen size="lg" message="Đang tải danh sách học viên..." />;
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

  const rawStudents = ptData?.students || [];

  const studentsList: StudentListItem[] = rawStudents.map((s) => ({
    id: s.id,
    name: s.fullName,
    pkg: s.packageName || 'Gói PT VIP 1-1',
    remaining: s.remainingSessions,
    total: s.totalSessions,
    avatar:
      s.avatarUrl ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  }));

  return (
    <div className="min-h-screen bg-background pb-32 pt-2 md:pt-0 dark text-on-surface">
      <Header userData={userData} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-container-padding mt-4 md:mt-8 space-y-6">
        {/* Header Summary & Add Student Action */}
        <div className="bento-card rounded-3xl p-6 md:p-8 space-y-4 border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold font-headline-md text-on-surface">
              Danh sách Học viên phụ trách
            </h1>
            <p className="text-sm text-on-surface-variant font-medium mt-1">
              Quản lý danh sách học viên kèm PT, gửi link mời Gmail/QR Code, giao giáo án và thực
              đơn.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setGeneratedInviteUrl(null);
              setIsInviteModalOpen(true);
            }}
            className="px-5 py-3 bg-primary text-dark-slate font-extrabold text-xs rounded-2xl shadow-[0_0_15px_rgba(102,200,28,0.4)] hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <UserPlus size={18} />+ Thêm Học Viên Mới
          </button>
        </div>

        {/* Student Roster Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {studentsList.map((student) => (
            <PtStudentCard key={student.id} student={student} />
          ))}
        </div>

        {/* Invite Student Modal */}
        <PtInviteStudentModal
          isOpen={isInviteModalOpen}
          studentEmail={studentEmail}
          packageName={packageName}
          totalSessions={totalSessions}
          sendingInvite={sendingInvite}
          generatedInviteUrl={generatedInviteUrl}
          onClose={() => setIsInviteModalOpen(false)}
          onStudentEmailChange={(email) => setStudentEmail(email)}
          onPackageNameChange={(pkg) => setPackageName(pkg)}
          onTotalSessionsChange={(sessions) => setTotalSessions(sessions)}
          onSendInvite={handleSendInvite}
          onCopyInviteUrl={handleCopyInviteUrl}
        />
      </main>

      <PTBottomNavBar activeTab="students" />
    </div>
  );
};

export default PTStudentsPage;
