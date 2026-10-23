/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Clock,
  RotateCcw,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  Upload,
  Check,
  Loader2,
  Edit3,
  X,
  User,
  Briefcase,
} from 'lucide-react';
import LogoApp from '../../assets/imgs/logoApp.jpg';
import type { PtPendingApprovalProps, UserDataHome } from '../../interface';
import { performLogout } from '../../utils/logout';
import { getAvatarUrl } from '../../utils/avatar';
import apiClient from '../../api/axios';
import { toast } from '../../utils/toast';
import { broadcastSync, subscribeSync } from '../../utils/realtimeSync';

const PtPendingApproval = ({
  currentUser,
  onLogout,
}: PtPendingApprovalProps) => {
  const router = useRouter();
  const isRejected = currentUser?.ptApplicationStatus === 'REJECTED';
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Edit form state
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [experienceYears, setExperienceYears] = useState<number>(
    currentUser?.ptApplication?.experienceYears || 2
  );
  const [specialties, setSpecialties] = useState<string>(
    currentUser?.ptApplication?.specialties?.join(', ') ||
      'Tăng cơ, Giảm mỡ, Calisthenics'
  );
  const [bio, setBio] = useState(
    currentUser?.ptApplication?.bio ||
      'HLV Cá Nhân Chuyên Nghiệp 1:1 • Giúp bạn lột xác vóc dáng an toàn & khoa học'
  );

  const [isProcessingAvatar, setIsProcessingAvatar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      performLogout();
    }
  };

  const handleRefresh = () => {
    broadcastSync('PT_APPLICATION_UPDATED');
  };

  // Realtime automatic redirect when admin approves the PT
  useEffect(() => {
    if (currentUser?.ptApplicationStatus === 'APPROVED' || currentUser?.isApprovedPt === true) {
      toast.success('Hồ sơ Huấn luyện viên đã được phê duyệt thành công!', 'Chúc mừng!');
      router.replace('/pt');
    }
  }, [currentUser, router]);

  useEffect(() => {
    const unsubscribe = subscribeSync((type) => {
      if (type === 'PT_APPLICATION_UPDATED') {
        apiClient
          .get<UserDataHome>('/users/me')
          .then((res) => {
            if (
              res.data?.isApprovedPt === true ||
              res.data?.ptApplicationStatus === 'APPROVED'
            ) {
              toast.success('Hồ sơ Huấn luyện viên đã được phê duyệt!', 'Chúc mừng!');
              router.replace('/pt');
            }
          })
          .catch(() => {});
      }
    });
    return () => unsubscribe();
  }, [router]);

  const processImageFile = (
    file: File,
    maxDimension: number,
    quality = 0.85
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        return reject(
          new Error('Vui lòng chọn tệp định dạng hình ảnh (.jpg, .jpeg, .png, .webp)')
        );
      }
      if (file.size > 15 * 1024 * 1024) {
        return reject(new Error('Kích thước ảnh tối đa là 15MB'));
      }

      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Không thể đọc tệp hình ảnh'));
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (!result) return reject(new Error('Tệp hình ảnh rỗng'));

        const img = new window.Image();
        img.onerror = () => {
          if (result.length < 2 * 1024 * 1024) {
            resolve(result);
          } else {
            reject(new Error('Định dạng ảnh không hỗ trợ hoặc tệp bị lỗi'));
          }
        };
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxDimension) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              }
            } else {
              if (height > maxDimension) {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
              }
            }

            canvas.width = Math.max(1, width);
            canvas.height = Math.max(1, height);
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              return resolve(result);
            }
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', quality);
            resolve(compressed);
          } catch {
            resolve(result);
          }
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingAvatar(true);
    try {
      const compressed = await processImageFile(file, 400, 0.85);
      setAvatarUrl(compressed);
      toast.success('Đã tải ảnh đại diện thành công!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi tải ảnh đại diện';
      toast.error(msg);
    } finally {
      setIsProcessingAvatar(false);
      e.target.value = '';
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessingAvatar) {
      toast.warning('Ảnh đang được xử lý nén, vui lòng chờ trong giây lát...');
      return;
    }

    setIsSubmitting(true);
    try {
      const specs = specialties
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await apiClient.patch('/pt/profile', {
        fullName: fullName.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        bio: bio.trim() || undefined,
        experienceYears: Number(experienceYears) || 1,
        specialties: specs.length > 0 ? specs : ['Fitness', 'Tăng cơ'],
      });

      toast.success(
        'Đã cập nhật hồ sơ & gửi lại đơn đăng ký HLV thành công! Vui lòng chờ Admin duyệt.'
      );
      setIsModalOpen(false);
      broadcastSync('PT_APPLICATION_UPDATED');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
            'Không thể cập nhật hồ sơ HLV'
          : 'Đã có lỗi xảy ra';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#090d0b] text-[#dde4dd] flex flex-col items-center justify-center p-3 sm:p-4 relative overflow-hidden"
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
        className={`bg-[#121a15] border rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 max-w-lg w-full text-center space-y-4 sm:space-y-6 shadow-2xl relative z-10 backdrop-blur-xl animate-in fade-in zoom-in duration-200 ${
          isRejected ? 'border-rose-500/30' : 'border-amber-500/30'
        }`}
      >
        {/* Logo & Status Badge */}
        <div className="flex flex-col items-center justify-center gap-2.5 sm:gap-3">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl overflow-hidden border border-white/15 bg-white/5 flex items-center justify-center shadow-lg shrink-0">
            <Image
              src={LogoApp}
              alt="NutriCore Logo"
              className="w-full h-full object-cover"
              priority
            />
          </div>

          <div
            className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full text-[11px] sm:text-xs font-extrabold uppercase tracking-wider border ${
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
        <div className="space-y-1.5 sm:space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {isRejected
              ? 'Hồ Sơ HLV Chưa Được Duyệt'
              : 'Hồ Sơ HLV Đang Chờ Phê Duyệt'}
          </h2>
          <p className="text-xs text-on-surface-variant leading-relaxed px-1 sm:px-2">
            {isRejected
              ? 'Rất tiếc, đơn đăng ký làm Huấn luyện viên PT của bạn chưa được phê duyệt. Vui lòng kiểm tra ghi chú của Admin bên dưới và cập nhật lại hồ sơ/chứng chỉ.'
              : 'Đơn đăng ký làm Huấn luyện viên PT của bạn đã được gửi thành công. Quản trị viên (Admin) đang tiến hành thẩm định thông tin chuyên môn. Sau khi được duyệt, bạn sẽ có toàn quyền truy cập giao diện PT.'}
          </p>
        </div>

        {/* User Card */}
        {currentUser && (
          <div className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 text-left space-y-3 text-xs">
            {/* Coach info row */}
            <div className="flex items-center gap-3 pb-2.5 border-b border-white/10">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/50 bg-black/40 shrink-0">
                <img
                  src={getAvatarUrl(currentUser.avatarUrl)}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-white font-bold text-sm truncate">
                  {currentUser.fullName || 'Huấn luyện viên'}
                </div>
                <div className="text-white/60 font-mono text-[11px] truncate">
                  {currentUser.email}
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] shrink-0 border ${
                  isRejected
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
              >
                {isRejected ? 'REJECTED' : 'PENDING'}
              </span>
            </div>

            {/* Coach Category row */}
            <div className="flex items-center justify-between text-white/70 pt-0.5">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-primary" /> Phân loại HLV:
              </span>
              <span className="text-primary font-bold text-[11px]">
                PT Freelance / Tự Do
              </span>
            </div>

            {/* Admin Note if present */}
            {currentUser.ptApplication?.adminNote && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 space-y-1">
                <strong className="text-rose-400 font-bold block">
                  Lý do từ chối từ Ban Quản Trị:
                </strong>
                <p className="italic leading-relaxed">
                  &quot;{currentUser.ptApplication.adminNote}&quot;
                </p>
              </div>
            )}
          </div>
        )}

        {/* Re-upload / Update button */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-primary/15 border border-primary/40 text-primary hover:bg-primary/25 transition-all text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Edit3 size={15} />
            {isRejected
              ? 'Bổ sung hồ sơ & Tải lại ảnh bằng cấp'
              : 'Cập nhật lại ảnh bằng cấp / hồ sơ'}
          </button>
        </div>

        {/* Instructions */}
        {!isRejected && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 text-left text-xs text-primary/90 space-y-1 sm:space-y-1.5 font-medium">
            <div className="flex items-center gap-1.5 font-bold text-primary">
              <CheckCircle size={14} className="shrink-0" />
              Quy trình kích hoạt tài khoản:
            </div>
            <p className="text-[11px] text-white/70 leading-relaxed pl-5">
              Admin hệ thống sẽ kiểm duyệt hồ sơ trong trang quản trị. Ngay khi Admin nhấn nút Duyệt, bạn chỉ cần nhấn <strong>Kiểm tra duyệt</strong> bên dưới để vào hệ thống.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleRefresh}
            className="w-full sm:flex-1 py-2.5 sm:py-3 rounded-xl bg-primary text-dark-slate text-xs font-black shadow-[0_0_15px_rgba(102,200,28,0.4)] hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw size={15} />
            Kiểm tra duyệt
          </button>

          <button
            type="button"
            onClick={handleLogoutClick}
            className="w-full sm:flex-1 py-2.5 sm:py-3 rounded-xl bg-surface-bright border border-white/10 text-on-surface-variant hover:text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut size={15} />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Modal: Update PT Profile & Certificate */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#12161f] border border-white/15 w-full max-w-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto text-left">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Edit3 className="text-primary w-5 h-5" />
                <h3 className="font-extrabold text-base text-white">
                  Cập nhật Hồ Sơ Huấn Luyện Viên
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-white/80">
                  Họ và Tên:
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/15 text-xs text-white outline-none focus:border-primary"
                />
              </div>

              {/* Avatar Upload */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-white/80">
                  Ảnh đại diện HLV:
                </label>
                <div className="flex items-center gap-3 bg-black/40 p-2.5 rounded-xl border border-white/10">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-primary/50 bg-black/60 flex items-center justify-center shrink-0">
                    {isProcessingAvatar ? (
                      <Loader2 size={16} className="text-primary animate-spin" />
                    ) : avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={20} className="text-white/40" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/15 border border-primary/40 text-primary text-xs font-bold hover:bg-primary/25 transition-all">
                      {isProcessingAvatar ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          Đang nén ảnh...
                        </>
                      ) : (
                        <>
                          <Upload size={13} />
                          {avatarUrl ? 'Đổi ảnh đại diện' : 'Chọn ảnh đại diện'}
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isProcessingAvatar}
                        onChange={handleAvatarFile}
                        className="hidden"
                      />
                    </label>
                    {avatarUrl && !isProcessingAvatar && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="ml-2 text-[11px] text-rose-400 hover:underline font-semibold"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Experience Years */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-white/80">
                  Số năm kinh nghiệm:
                </label>
                <div className="relative">
                  <Briefcase
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                  />
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Math.max(0, Number(e.target.value)))}
                    className="w-full h-9 pl-9 pr-3 rounded-lg bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Specialties */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-white/80">
                  Chuyên môn chính:
                </label>
                <input
                  type="text"
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                  placeholder="Tăng cơ, Giảm mỡ, Calisthenics"
                  className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-primary"
                />
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-white/80">
                  Giới thiệu ngắn (Bio):
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white outline-none resize-none focus:border-primary"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-bold transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isProcessingAvatar}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-dark-slate text-xs font-extrabold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-[0_0_12px_rgba(102,200,28,0.3)]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      Gửi Lại Hồ Sơ Xét Duyệt
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PtPendingApproval;
