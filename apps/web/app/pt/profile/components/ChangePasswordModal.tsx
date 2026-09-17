"use client";

import { useState, useMemo } from "react";
import { X, Eye, EyeOff, AlertCircle } from "lucide-react";
import apiClient from "../../../../api/axios";
import { toast } from "../../../../utils/toast";
import type { ChangePasswordModalProps } from "../../../../interface";

const ChangePasswordModal = ({ isOpen, onClose }: ChangePasswordModalProps) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [currentPasswordError, setCurrentPasswordError] = useState<
    string | null
  >(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [saving, setSaving] = useState(false);

  // Realtime validation messages
  const newPasswordError = useMemo(() => {
    if (newPassword.length > 0 && newPassword.length < 6) {
      return "Mật khẩu mới phải có tối thiểu 6 ký tự!";
    }
    if (
      newPassword.length >= 6 &&
      currentPassword &&
      newPassword === currentPassword
    ) {
      return "Mật khẩu mới phải khác mật khẩu hiện tại!";
    }
    if (isSubmitted && !newPassword) {
      return "Vui lòng nhập mật khẩu mới!";
    }
    return null;
  }, [newPassword, currentPassword, isSubmitted]);

  const confirmPasswordError = useMemo(() => {
    if (confirmPassword.length > 0 && newPassword !== confirmPassword) {
      return "Mật khẩu xác nhận không khớp với mật khẩu mới!";
    }
    if (isSubmitted && !confirmPassword) {
      return "Vui lòng xác nhận mật khẩu mới!";
    }
    return null;
  }, [confirmPassword, newPassword, isSubmitted]);

  if (!isOpen) return null;

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setCurrentPasswordError(null);
    setServerError(null);
    setIsSubmitted(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setServerError(null);

    if (!currentPassword) {
      setCurrentPasswordError("Vui lòng nhập mật khẩu hiện tại!");
      toast.error("Vui lòng nhập mật khẩu hiện tại!");
      return;
    }

    if (newPasswordError || confirmPasswordError) {
      toast.error("Vui lòng kiểm tra lại thông tin mật khẩu hợp lệ!");
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ các trường thông tin!");
      return;
    }

    setSaving(true);
    apiClient
      .post<{ message?: string }>("/auth/change-password", {
        currentPassword,
        newPassword,
      })
      .then((res) => {
        setSaving(false);
        toast.success(res.data.message || "Đổi mật khẩu thành công!");
        handleClose();
      })
      .catch((err: { response?: { data?: { message?: string } } }) => {
        console.error(err);
        setSaving(false);
        const errMsg =
          err?.response?.data?.message || "Không thể đổi mật khẩu!";
        if (
          errMsg.toLowerCase().includes("hiện tại") ||
          errMsg.toLowerCase().includes("không chính xác") ||
          errMsg.toLowerCase().includes("current")
        ) {
          setCurrentPasswordError(errMsg);
        } else {
          setServerError(errMsg);
        }
        toast.error(errMsg);
      });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#12161f] border border-slate-200 dark:border-outline-variant/30 w-full max-w-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.9)] relative text-left text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10 gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white truncate">
              Đổi Mật Khẩu
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-on-surface-variant dark:hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
          {/* Mật khẩu hiện tại */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-on-surface">
              Mật khẩu hiện tại:
            </label>
            <div className="relative">
              <input
                type={showCurrentPass ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (currentPasswordError) setCurrentPasswordError(null);
                  if (serverError) setServerError(null);
                }}
                className={`w-full bg-slate-50 dark:bg-surface-bright/50 border rounded-xl pl-3.5 pr-10 py-2.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none transition-colors ${
                  currentPasswordError
                    ? "border-rose-500/80 focus:border-rose-500 bg-rose-500/[0.04]"
                    : "border-slate-300 dark:border-white/10 focus:border-primary"
                }`}
                placeholder="Nhập mật khẩu đang sử dụng"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-on-surface-variant dark:hover:text-white transition-colors cursor-pointer"
              >
                {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {currentPasswordError && (
              <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1.5 animate-in fade-in duration-150">
                <AlertCircle size={12} className="shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{currentPasswordError}</span>
              </p>
            )}
          </div>

          {/* Mật khẩu mới */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-on-surface">
              Mật khẩu mới:
            </label>
            <div className="relative">
              <input
                type={showNewPass ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (serverError) setServerError(null);
                }}
                className={`w-full bg-slate-50 dark:bg-surface-bright/50 border rounded-xl pl-3.5 pr-10 py-2.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none transition-colors ${
                  newPasswordError
                    ? "border-rose-500/80 focus:border-rose-500 bg-rose-500/[0.04]"
                    : "border-slate-300 dark:border-white/10 focus:border-primary"
                }`}
                placeholder="Tối thiểu 6 ký tự"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-on-surface-variant dark:hover:text-white transition-colors cursor-pointer"
              >
                {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {newPasswordError && (
              <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1.5 animate-in fade-in duration-150">
                <AlertCircle size={12} className="shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{newPasswordError}</span>
              </p>
            )}
          </div>

          {/* Xác nhận mật khẩu mới */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-on-surface">
              Xác nhận mật khẩu mới:
            </label>
            <div className="relative">
              <input
                type={showConfirmPass ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (serverError) setServerError(null);
                }}
                className={`w-full bg-slate-50 dark:bg-surface-bright/50 border rounded-xl pl-3.5 pr-10 py-2.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none transition-colors ${
                  confirmPasswordError
                    ? "border-rose-500/80 focus:border-rose-500 bg-rose-500/[0.04]"
                    : "border-slate-300 dark:border-white/10 focus:border-primary"
                }`}
                placeholder="Nhập lại mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-on-surface-variant dark:hover:text-white transition-colors cursor-pointer"
              >
                {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirmPasswordError && (
              <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1.5 animate-in fade-in duration-150">
                <AlertCircle size={12} className="shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{confirmPasswordError}</span>
              </p>
            )}
          </div>

          {/* Server Error Alert Banner */}
          {serverError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2 animate-in fade-in duration-150">
              <AlertCircle size={15} className="shrink-0 text-rose-700 dark:text-rose-400" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 hover:bg-slate-200 dark:bg-transparent text-slate-700 dark:text-on-surface-variant hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-colors cursor-pointer text-center"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-dark-slate font-extrabold text-xs shadow-[0_0_15px_rgba(102,200,28,0.4)] hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50 text-center"
            >
              {saving ? "Đang cập nhật..." : "Đổi Mật Khẩu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
