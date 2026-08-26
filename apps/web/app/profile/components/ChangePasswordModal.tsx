'use client';

import React, { useState } from 'react';
import { KeyRound, Lock, Eye, EyeOff, X, CheckCircle2, ShieldAlert } from 'lucide-react';
import apiClient from '../../../api/axios';
import { toast } from '../../../utils/toast';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal = ({ isOpen, onClose }: ChangePasswordModalProps) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Vui lòng nhập đầy đủ các trường thông tin!');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có tối thiểu 6 ký tự!');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp nhau!');
      return;
    }

    if (currentPassword === newPassword) {
      toast.error('Mật khẩu mới phải khác mật khẩu hiện tại!');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post<{ message: string }>('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      toast.success(res.data.message || 'Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Đổi mật khẩu thất bại, vui lòng kiểm tra lại mật khẩu hiện tại!';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#121620] border border-white/15 rounded-[32px] max-w-lg w-full max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-6 md:p-8 space-y-6 text-white shadow-2xl relative cursor-default animate-in zoom-in-95 duration-200"
        suppressHydrationWarning
      >
        {/* Header Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng modal"
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white border border-white/15 flex items-center justify-center transition-all cursor-pointer z-20"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary border border-primary/40 flex items-center justify-center shrink-0">
            <KeyRound size={24} />
          </div>
          <div>
            <h3 className="font-extrabold text-xl text-white font-headline-md">
              Đổi Mật Khẩu Tài Khoản
            </h3>
            <p className="text-xs text-white/60 mt-0.5">
              Cập nhật mật khẩu bảo vệ tài khoản và dữ liệu tập luyện của bạn.
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-white/80">
              Mật khẩu hiện tại (*):
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
              />
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                required
                suppressHydrationWarning
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại..."
                className="w-full bg-white/[0.05] border border-white/15 rounded-xl pl-10 pr-11 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-primary outline-none transition-colors"
              />
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-white/80">
              Mật khẩu mới (Tối thiểu 6 ký tự) (*):
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary pointer-events-none"
              />
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                suppressHydrationWarning
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới..."
                className="w-full bg-white/[0.05] border border-white/15 rounded-xl pl-10 pr-11 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-primary outline-none transition-colors"
              />
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-white/80">
              Xác nhận mật khẩu mới (*):
            </label>
            <div className="relative">
              <CheckCircle2
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary pointer-events-none"
              />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                suppressHydrationWarning
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới..."
                className="w-full bg-white/[0.05] border border-white/15 rounded-xl pl-10 pr-11 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-primary outline-none transition-colors"
              />
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <ShieldAlert size={18} />
            </div>
            <div className="text-xs text-white/70">
              Mật khẩu mới nên kết hợp chữ cái, số và ký tự đặc biệt để đảm bảo tính an toàn cao nhất.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              suppressHydrationWarning
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-white/5 border border-white/15 text-white/80 text-sm font-bold hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              suppressHydrationWarning
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-primary text-dark-slate text-sm font-extrabold shadow-[0_0_15px_rgba(102,200,28,0.4)] hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {loading ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
