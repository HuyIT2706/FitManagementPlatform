'use client';

import { useState } from 'react';
import { KeyRound, Bell, LogOut, ChevronRight, User, HeartPulse, X, ShieldCheck } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';
import NotificationSettingsModal from './NotificationSettingsModal';

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
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = useState(false);

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
    <>
      <section className="bento-card rounded-2xl flex flex-col p-1.5 sm:p-2 border border-outline-variant/30 mt-4">
      {/* Edit Profile */}
      <button
        type="button"
        suppressHydrationWarning
        onClick={onEditProfile}
        className="flex items-center justify-between p-3 sm:p-4 hover:bg-surface-bright/40 rounded-xl transition-colors cursor-pointer group text-left gap-3"
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface-bright/50 flex items-center justify-center border border-white/5 group-hover:bg-green-light/10 transition-colors shrink-0">
            <User
              size={18}
              className="text-on-surface group-hover:text-green-light transition-colors sm:w-5 sm:h-5"
            />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold text-on-surface truncate">Thông tin cá nhân</div>
            <div className="text-[11px] sm:text-xs font-medium text-on-surface-variant mt-0.5 truncate">
              Chỉnh sửa tên, ảnh đại diện, chiều cao, cân nặng
            </div>
          </div>
        </div>
        <ChevronRight size={18} className="text-on-surface-variant shrink-0" />
      </button>

      <div className="w-full h-px bg-white/5"></div>

      {/* PAR-Q+ Health Screening */}
      <button
        type="button"
        suppressHydrationWarning
        onClick={() => setIsParqOpen(true)}
        className="flex items-center justify-between p-3 sm:p-4 hover:bg-surface-bright/40 rounded-xl transition-colors cursor-pointer group text-left gap-3"
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface-bright/50 flex items-center justify-center border border-white/5 group-hover:bg-green-light/10 transition-colors shrink-0">
            <HeartPulse
              size={18}
              className="text-on-surface group-hover:text-green-light transition-colors sm:w-5 sm:h-5"
            />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold text-on-surface flex items-center gap-2 flex-wrap">
              <span>Hồ sơ Tầm soát Sức khỏe</span>
              <span className="px-2 py-0.5 rounded-full bg-green-light/10 text-green-light text-[9px] sm:text-[10px] font-bold border border-green-light/30">
                Đã kiểm tra
              </span>
            </div>
            <div className="text-[11px] sm:text-xs font-medium text-on-surface-variant mt-0.5 truncate">
              Đủ điều kiện tham gia các chương trình tập luyện thể lực
            </div>
          </div>
        </div>
        <ChevronRight size={18} className="text-on-surface-variant shrink-0" />
      </button>

      <div className="w-full h-px bg-white/5"></div>

      {/* Change Password */}
      <button
        type="button"
        suppressHydrationWarning
        onClick={() => setIsChangePasswordOpen(true)}
        className="flex items-center justify-between p-3 sm:p-4 hover:bg-surface-bright/40 rounded-xl transition-colors cursor-pointer group text-left gap-3"
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface-bright/50 flex items-center justify-center border border-white/5 group-hover:bg-green-light/10 transition-colors shrink-0">
            <KeyRound
              size={18}
              className="text-on-surface group-hover:text-green-light transition-colors sm:w-5 sm:h-5"
            />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold text-on-surface truncate">Đổi mật khẩu tài khoản</div>
            <div className="text-[11px] sm:text-xs font-medium text-on-surface-variant mt-0.5 truncate">
              Cập nhật mật khẩu bảo vệ tài khoản
            </div>
          </div>
        </div>
        <ChevronRight size={18} className="text-on-surface-variant shrink-0" />
      </button>

      <div className="w-full h-px bg-white/5"></div>

      {/* Notifications Settings */}
      <button
        type="button"
        suppressHydrationWarning
        onClick={() => setIsNotificationSettingsOpen(true)}
        className="flex items-center justify-between p-3 sm:p-4 hover:bg-surface-bright/40 rounded-xl transition-colors cursor-pointer group text-left gap-3"
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface-bright/50 flex items-center justify-center border border-white/5 group-hover:bg-green-light/10 transition-colors shrink-0">
            <Bell
              size={18}
              className="text-on-surface group-hover:text-green-light transition-colors sm:w-5 sm:h-5"
            />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold text-on-surface truncate">Cài đặt thông báo</div>
            <div className="text-[11px] sm:text-xs font-medium text-on-surface-variant mt-0.5 truncate">
              Tùy chỉnh lịch nhắc nhở bữa ăn, uống nước, ca tập cùng PT
            </div>
          </div>
        </div>
        <ChevronRight size={18} className="text-on-surface-variant shrink-0" />
      </button>

      <div className="w-full h-px bg-white/5"></div>

      {/* Logout */}
      <button
        type="button"
        suppressHydrationWarning
        onClick={onLogout}
        className="flex items-center justify-between p-3 sm:p-4 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer w-full text-left gap-3"
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shrink-0">
            <LogOut size={18} className="text-red-400 sm:w-5 sm:h-5" />
          </div>
          <div className="text-xs sm:text-sm font-bold text-red-400 truncate">Đăng xuất</div>
        </div>
        <ChevronRight size={18} className="text-red-400 shrink-0" />
      </button>
    </section>

    {/* PAR-Q+ Modal */}
    {isParqOpen && (
      <div
        onClick={() => setIsParqOpen(false)}
        className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-[#121620] border border-white/15 rounded-2xl sm:rounded-[32px] max-w-xl w-full max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 text-white shadow-2xl relative cursor-default animate-in zoom-in-95 duration-200"
          suppressHydrationWarning
        >
          {/* Header Close Button */}
          <button
            type="button"
            onClick={() => setIsParqOpen(false)}
            aria-label="Đóng modal"
            className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white border border-white/15 flex items-center justify-center transition-all cursor-pointer z-20"
          >
            <X size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3 pr-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/20 text-primary border border-primary/40 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl text-white font-headline-md leading-tight">
                Kết Quả Tầm Soát PAR-Q+
              </h3>
              <p className="text-xs text-white/60 mt-0.5">
                Đánh giá an toàn thể lực trước khi tham gia tập luyện.
              </p>
            </div>
          </div>

          {/* Criteria List */}
          <div className="space-y-2 sm:space-y-2.5 max-h-[45vh] overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[11px] sm:text-xs font-bold text-primary uppercase tracking-wider">
                7 tiêu chí đánh giá y tế:
              </span>
              <span className="text-[10px] sm:text-[11px] text-white/50 font-medium">7/7 Đạt</span>
            </div>
            {parqQuestions.map((q, idx) => (
              <div
                key={idx}
                className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/10 text-xs flex justify-between items-center gap-3 hover:border-white/15 transition-all"
              >
                <span className="text-white/80 leading-relaxed text-[11px] sm:text-xs">{q}</span>
                <span className="px-2.5 sm:px-3 py-1 rounded-lg bg-primary/15 text-primary text-[11px] sm:text-xs font-extrabold border border-primary/30 shrink-0">
                  Không
                </span>
              </div>
            ))}
          </div>

          {/* Bottom Button */}
          <button
            type="button"
            onClick={() => setIsParqOpen(false)}
            className="w-full py-3 sm:py-3.5 rounded-xl bg-primary text-dark-slate font-extrabold text-xs sm:text-sm shadow-[0_0_15px_rgba(102,200,28,0.4)] hover:bg-primary/90 transition-all cursor-pointer flex items-center justify-center"
          >
            Đã Hiểu & Đóng
          </button>
        </div>
      </div>
    )}

    {/* Change Password Modal */}
    <ChangePasswordModal
      isOpen={isChangePasswordOpen}
      onClose={() => setIsChangePasswordOpen(false)}
    />

    {/* Notification Settings Modal */}
    <NotificationSettingsModal
      isOpen={isNotificationSettingsOpen}
      onClose={() => setIsNotificationSettingsOpen(false)}
    />
  </>
);
};

export default ProfileSettingsList;
