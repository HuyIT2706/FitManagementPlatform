'use client';

import { useState } from 'react';
import { Lock, X, Eye, EyeOff } from 'lucide-react';
import apiClient from '../../../../api/axios';
import { toast } from '../../../../utils/toast';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal = ({ isOpen, onClose }: ChangePasswordModalProps) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại!');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải chứa ít nhất 6 ký tự!');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu mới và xác nhận mật khẩu không trùng khớp!');
      return;
    }

    setSaving(true);
    apiClient
      .post<{ message?: string }>('/auth/change-password', {
        currentPassword,
        newPassword,
      })
      .then((res) => {
        setSaving(false);
        toast.success(res.data.message || 'Đổi mật khẩu thành công!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      })
      .catch((err: { response?: { data?: { message?: string } } }) => {
        console.error(err);
        setSaving(false);
        const errMsg = err?.response?.data?.message || 'Không thể đổi mật khẩu!';
        toast.error(errMsg);
      });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#12161f] border border-outline-variant/30 w-full max-w-md rounded-3xl p-6 md:p-8 space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.9)] relative text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary flex items-center justify-center border border-primary/30 shrink-0">
              <Lock size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">Đổi Mật Khẩu</h3>
              <p className="text-xs text-on-surface-variant">
                Bảo mật tài khoản PT với mật khẩu mới
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-on-surface-variant hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mật khẩu hiện tại */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-on-surface">
              Mật khẩu hiện tại:
            </label>
            <div className="relative">
              <input
                type={showCurrentPass ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-surface-bright/50 border border-white/10 rounded-xl pl-3.5 pr-10 py-2.5 text-sm font-bold text-white focus:border-primary outline-none transition-colors"
                placeholder="Nhập mật khẩu đang sử dụng"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white transition-colors cursor-pointer"
              >
                {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Mật khẩu mới */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-on-surface">
              Mật khẩu mới:
            </label>
            <div className="relative">
              <input
                type={showNewPass ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-surface-bright/50 border border-white/10 rounded-xl pl-3.5 pr-10 py-2.5 text-sm font-bold text-primary focus:border-primary outline-none transition-colors"
                placeholder="Tối thiểu 6 ký tự"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white transition-colors cursor-pointer"
              >
                {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Xác nhận mật khẩu mới */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-on-surface">
              Xác nhận mật khẩu mới:
            </label>
            <div className="relative">
              <input
                type={showConfirmPass ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-surface-bright/50 border border-white/10 rounded-xl pl-3.5 pr-10 py-2.5 text-sm font-bold text-primary focus:border-primary outline-none transition-colors"
                placeholder="Nhập lại mật khẩu mới"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white transition-colors cursor-pointer"
              >
                {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-on-surface-variant hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-primary text-dark-slate font-extrabold text-xs shadow-[0_0_15px_rgba(102,200,28,0.4)] hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Đang cập nhật...' : 'Xác Nhận Đổi Mật Khẩu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
