'use client';

import { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import Header from '../../../components/ui/Header';
import PTBottomNavBar from '../../../components/navigation/PTBottomNavBar';
import apiClient from '../../../api/axios';
import type { UserDataHome, PTDashboardData } from '../../../interface';
import { toast } from '../../../utils/toast';

import PtStudentCard, { type StudentListItem } from './components/PtStudentCard';
import PtInviteStudentModal from './components/PtInviteStudentModal';

export default function PTStudentsPage() {
  const [userData, setUserData] = useState<UserDataHome | null>(null);
  const [ptData, setPtData] = useState<PTDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Invite Student Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [packageName, setPackageName] = useState('Gói PT VIP 1-1');
  const [totalSessions, setTotalSessions] = useState(12);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState<string | null>(null);

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
        const url = res.data.inviteUrl || 'https://fitmanagement.app/invite?code=INV-9921';
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
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
}
