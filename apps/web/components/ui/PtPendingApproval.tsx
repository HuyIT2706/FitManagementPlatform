'use client';

import React from 'react';
import Image from 'next/image';
import { Clock, RotateCcw, LogOut, ShieldAlert, CheckCircle } from 'lucide-react';
import LogoApp from '../../assets/imgs/logoApp.jpg';
import type { UserData } from '../../interface';

export interface PtPendingApprovalProps {
  currentUser?: UserData | null;
  onLogout?: () => void;
}

const PtPendingApproval = ({
  currentUser,
  onLogout,
}: PtPendingApprovalProps) => {
  const isRejected = currentUser?.ptApplicationStatus === 'REJECTED';

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('jwt_token');
      window.location.href = '/login';
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div
      className="min-h-screen bg-[#090d0b] text-[#dde4dd] flex flex-col items-center justify-center p-4 relative overflow-hidden"
      suppressHydrationWarning
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: isRejected
            ? 'radial-gradient(circle at 50% 50%, rgba(244, 63, 94, 0.2) 0%, transparent 70%)'
            : 'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.2) 0%, transparent 70%)',
        }}
      />

      <div
        className={`bg-[#121a15] border rounded-3xl p-8 max-w-lg w-full text-center space-y-6 shadow-2xl relative z-10 backdrop-blur-xl animate-in fade-in zoom-in duration-200 ${
          isRejected ? 'border-rose-500/30' : 'border-amber-500/30'
        }`}
      >
        {/* Logo & Status Badge */}
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-3xl overflow-hidden border border-white/15 bg-white/5 flex items-center justify-center shadow-lg shrink-0">
            <Image
              src={LogoApp}
              alt="NutriCore Logo"
              className="w-full h-full object-cover"
              priority
            />
          </div>

          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
              isRejected
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
            }`}
          >
            {isRejected ? <ShieldAlert size={14} /> : <Clock size={14} />}
            {isRejected ? 'Đơn đăng ký bị từ chối' : 'Đang chờ Admin phê duyệt'}
          </div>
        </div>

        {/* Title & Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white tracking-tight">
            {isRejected
              ? 'Hồ Sơ HLV Chưa Được Duyệt'
              : 'Hồ Sơ HLV Đang Chờ Phê Duyệt'}
          </h2>
          <p className="text-xs text-on-surface-variant leading-relaxed px-2">
            {isRejected
              ? 'Rất tiếc, đơn đăng ký làm Huấn luyện viên PT của bạn chưa được phê duyệt. Vui lòng liên hệ ban quản trị để biết thêm chi tiết.'
              : 'Đơn đăng ký làm Huấn luyện viên PT của bạn đã được gửi thành công. Quản trị viên (Admin) đang tiến hành thẩm định thông tin chuyên môn. Sau khi được duyệt, bạn sẽ có toàn quyền truy cập giao diện PT.'}
          </p>
        </div>

        {/* User Card */}
        {currentUser && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left space-y-2.5 text-xs">
            <div className="flex justify-between items-center text-white/70">
              <span>Họ tên HLV:</span>
              <strong className="text-white font-bold">
                {currentUser.fullName || 'Huấn luyện viên'}
              </strong>
            </div>
            <div className="flex justify-between items-center text-white/70">
              <span>Email:</span>
              <strong className="text-white font-mono">{currentUser.email}</strong>
            </div>
            <div className="flex justify-between items-center text-white/70">
              <span>Trạng thái hồ sơ:</span>
              <span
                className={`px-2.5 py-0.5 rounded-md font-extrabold text-[11px] border ${
                  isRejected
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
              >
                {isRejected ? 'REJECTED' : 'PENDING APPROVAL'}
              </span>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!isRejected && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3.5 text-left text-xs text-primary/90 space-y-1.5 font-medium">
            <div className="flex items-center gap-1.5 font-bold text-primary">
              <CheckCircle size={14} />
              Quy trình kích hoạt tài khoản:
            </div>
            <p className="text-[11px] text-white/70 leading-relaxed pl-5">
              Admin hệ thống sẽ kiểm duyệt hồ sơ trong trang quản trị. Ngay khi Admin nhấn nút Duyệt, bạn chỉ cần nhấn <strong>Kiểm tra duyệt</strong> bên dưới để vào hệ thống.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleRefresh}
            className="flex-1 py-3 rounded-xl bg-primary text-dark-slate text-xs font-black shadow-[0_0_15px_rgba(102,200,28,0.4)] hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw size={15} />
            Kiểm tra duyệt
          </button>

          <button
            type="button"
            onClick={handleLogoutClick}
            className="flex-1 py-3 rounded-xl bg-surface-bright border border-white/10 text-on-surface-variant hover:text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut size={15} />
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

export default PtPendingApproval;
