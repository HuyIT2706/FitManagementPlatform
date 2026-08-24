'use client';

import { useState } from 'react';
import { KeyRound, Bell, LogOut, ChevronRight, User, HeartPulse, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

interface ProfileSettingsListProps {
  onLogout: () => void;
  onEditProfile?: () => void;
}

const ProfileSettingsList = ({
  onLogout,
  onEditProfile,
}: ProfileSettingsListProps) => {
  const [isParqOpen, setIsParqOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const parqQuestions = [
    '1. Bác sĩ từng chẩn đoán bạn mắc bệnh tim và khuyên chỉ vận động theo chỉ định?',
    '2. Bạn có hay bị đau ngực trong khi thực hiện các hoạt động thể chất?',
    '3. Trong tháng qua, bạn có bị đau ngực khi KHÔNG vận động thể chất không?',
    '4. Bạn có hay mất thăng bằng do chóng mặt hoặc từng bị ngất xỉu không?',
    '5. Bạn có vấn đề xương khớp (lưng, gối, hông) trở nên xấu đi khi vận động không?',
    '6. Bác sĩ có đang kê đơn thuốc huyết áp hoặc tim mạch cho bạn không?',
    '7. Bạn có biết bất kỳ lý do sức khỏe nào khác khiến bạn không nên tập luyện không?',
  ];

  return (
    <section className="bento-card rounded-2xl flex flex-col p-2 border border-outline-variant/30 mt-4">
      {/* Edit Profile */}
      <button
        type="button"
        suppressHydrationWarning
        onClick={onEditProfile}
        className="flex items-center justify-between p-4 hover:bg-surface-bright/40 rounded-xl transition-colors cursor-pointer group text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-surface-bright/50 flex items-center justify-center border border-white/5 group-hover:bg-green-light/10 transition-colors shrink-0">
            <User
              size={20}
              className="text-on-surface group-hover:text-green-light transition-colors"
            />
          </div>
          <div>
            <div className="text-sm font-bold text-on-surface">Thông tin cá nhân</div>
            <div className="text-xs font-medium text-on-surface-variant mt-0.5">
              Chỉnh sửa tên, ảnh đại diện, chiều cao, cân nặng
            </div>
          </div>
        </div>
        <ChevronRight size={18} className="text-on-surface-variant" />
      </button>

      <div className="w-full h-px bg-white/5"></div>

      {/* PAR-Q+ Health Screening */}
      <button
        type="button"
        suppressHydrationWarning
        onClick={() => setIsParqOpen(true)}
        className="flex items-center justify-between p-4 hover:bg-surface-bright/40 rounded-xl transition-colors cursor-pointer group text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-surface-bright/50 flex items-center justify-center border border-white/5 group-hover:bg-green-light/10 transition-colors shrink-0">
            <HeartPulse
              size={20}
              className="text-on-surface group-hover:text-green-light transition-colors"
            />
          </div>
          <div>
            <div className="text-sm font-bold text-on-surface flex items-center gap-2">
              Hồ sơ Tầm soát Sức khỏe
              <span className="px-2 py-0.5 rounded-full bg-green-light/10 text-green-light text-[10px] font-bold border border-green-light/30">
                Đã kiểm tra
              </span>
            </div>
            <div className="text-xs font-medium text-on-surface-variant mt-0.5">
              Đủ điều kiện tham gia các chương trình tập luyện thể lực
            </div>
          </div>
        </div>
        <ChevronRight size={18} className="text-on-surface-variant" />
      </button>

      <div className="w-full h-px bg-white/5"></div>

      {/* Change Password */}
      <button
        type="button"
        suppressHydrationWarning
        onClick={() => setIsChangePasswordOpen(true)}
        className="flex items-center justify-between p-4 hover:bg-surface-bright/40 rounded-xl transition-colors cursor-pointer group text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-surface-bright/50 flex items-center justify-center border border-white/5 group-hover:bg-green-light/10 transition-colors shrink-0">
            <KeyRound
              size={20}
              className="text-on-surface group-hover:text-green-light transition-colors"
            />
          </div>
          <div>
            <div className="text-sm font-bold text-on-surface">Đổi mật khẩu tài khoản</div>
            <div className="text-xs font-medium text-on-surface-variant mt-0.5">
              Cập nhật mật khẩu bảo vệ tài khoản
            </div>
          </div>
        </div>
        <ChevronRight size={18} className="text-on-surface-variant" />
      </button>

      <div className="w-full h-px bg-white/5"></div>

      {/* Notifications Settings */}
      <button
        type="button"
        suppressHydrationWarning
        className="flex items-center justify-between p-4 hover:bg-surface-bright/40 rounded-xl transition-colors cursor-pointer group text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-surface-bright/50 flex items-center justify-center border border-white/5 group-hover:bg-green-light/10 transition-colors shrink-0">
            <Bell
              size={20}
              className="text-on-surface group-hover:text-green-light transition-colors"
            />
          </div>
          <div className="text-sm font-bold text-on-surface">Cài đặt thông báo</div>
        </div>
        <ChevronRight size={18} className="text-on-surface-variant" />
      </button>

      <div className="w-full h-px bg-white/5"></div>

      {/* Logout */}
      <button
        type="button"
        suppressHydrationWarning
        onClick={onLogout}
        className="flex items-center justify-between p-4 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer w-full text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shrink-0">
            <LogOut size={20} className="text-red-400" />
          </div>
          <div className="text-sm font-bold text-red-400">Đăng xuất</div>
        </div>
        <ChevronRight size={18} className="text-red-400" />
      </button>

      {/* PAR-Q+ Modal */}
      {isParqOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121815] border border-white/10 rounded-2xl w-full max-w-lg p-6 flex flex-col gap-4 text-white shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h4 className="text-lg font-bold flex items-center gap-2">
                <ShieldCheck className="text-green-light" size={20} />
                Kết quả Tầm soát Sức khỏe PAR-Q+
              </h4>
              <button
                type="button"
                onClick={() => setIsParqOpen(false)}
                className="text-white/60 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-3 bg-green-light/10 border border-green-light/30 rounded-xl flex items-center gap-3">
              <CheckCircle2 size={24} className="text-green-light shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-green-light text-sm">PAR-Q Cleared (An toàn tập luyện)</p>
                <p className="text-white/70">
                  Hồ sơ sức khỏe của bạn hoàn toàn không có chống chỉ định y tế nào.
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 no-scrollbar">
              <p className="text-xs font-semibold text-white/60">Chi tiết 7 tiêu chí đánh giá PAR-Q+:</p>
              {parqQuestions.map((q, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs flex justify-between items-center">
                  <span className="text-white/80 pr-2">{q}</span>
                  <span className="px-2 py-0.5 rounded bg-green-light/20 text-green-light font-bold shrink-0">Không</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsParqOpen(false)}
              className="w-full py-2.5 rounded-lg bg-green-light text-[#003824] text-xs font-bold hover:opacity-90 transition-opacity"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </section>
  );
};

export default ProfileSettingsList;
