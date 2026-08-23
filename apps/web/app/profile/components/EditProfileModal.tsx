'use client';

import { useState } from 'react';
import {
  User,
  Mail,
  Image as ImageIcon,
  Scale,
  Ruler,
  X,
  Save,
  Activity,
  Flame,
  Dumbbell,
  Target,
} from 'lucide-react';
import apiClient from '../../../api/axios';
import { toast } from '../../../utils/toast';
import type { UserDataHome } from '../../../interface';

interface EditProfileModalProps {
  isOpen: boolean;
  userData: UserDataHome | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditProfileModal = ({
  isOpen,
  userData,
  onClose,
  onSuccess,
}: EditProfileModalProps) => {
  const [fullName, setFullName] = useState(userData?.fullName || '');
  const [avatarUrl, setAvatarUrl] = useState(userData?.avatarUrl || '');
  const [weight, setWeight] = useState<number | ''>(
    userData?.bodyMetrics?.[0]?.weight ?? userData?.weight ?? 75
  );
  const [targetWeight, setTargetWeight] = useState<number | ''>(userData?.targetWeight || 70);
  const [height, setHeight] = useState<number | ''>(userData?.height || 175);
  const [bodyFat, setBodyFat] = useState<number | ''>(
    userData?.bodyMetrics?.[0]?.bodyFat ?? 18.5
  );
  const [muscleMass, setMuscleMass] = useState<number | ''>(
    userData?.bodyMetrics?.[0]?.muscleMass ?? 32.5
  );
  const [activityLevel, setActivityLevel] = useState<string>(
    userData?.activityLevel || 'VERY_ACTIVE'
  );
  const [goal, setGoal] = useState<string>(userData?.goal || 'LOSE_WEIGHT');
  const [saving, setSaving] = useState(false);

  const numWeight = weight !== '' ? Number(weight) : 0;
  const numHeight = height !== '' ? Number(height) : 0;
  const numTargetWeight = targetWeight !== '' ? Number(targetWeight) : 0;
  const numBodyFat = bodyFat !== '' ? Number(bodyFat) : undefined;
  const numMuscleMass = muscleMass !== '' ? Number(muscleMass) : undefined;

  const isHeightValid = height === '' || (numHeight >= 100 && numHeight <= 220);
  const isWeightValid = weight === '' || (numWeight >= 30 && numWeight <= 200);
  const isTargetWeightValid = targetWeight === '' || (numTargetWeight >= 30 && numTargetWeight <= 200);
  const isBodyFatValid = bodyFat === '' || (numBodyFat !== undefined && numBodyFat >= 3 && numBodyFat <= 60);
  const isMuscleMassValid = muscleMass === '' || (numMuscleMass !== undefined && numMuscleMass >= 10 && numMuscleMass <= 120);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isHeightValid || height === '') {
      toast.error('Chiều cao không hợp lệ! Vui lòng nhập từ 100cm đến 220cm.');
      return;
    }
    if (!isWeightValid || weight === '') {
      toast.error('Cân nặng không hợp lệ! Vui lòng nhập từ 30kg đến 200kg.');
      return;
    }
    if (!isTargetWeightValid || targetWeight === '') {
      toast.error('Cân nặng mục tiêu không hợp lệ! Vui lòng nhập từ 30kg đến 200kg.');
      return;
    }
    if (!isBodyFatValid) {
      toast.error('Tỷ lệ mỡ không hợp lệ! Vui lòng nhập từ 3% đến 60%.');
      return;
    }
    if (!isMuscleMassValid) {
      toast.error('Khối lượng cơ không hợp lệ! Vui lòng nhập từ 10kg đến 120kg.');
      return;
    }

    setSaving(true);

    apiClient
      .patch('/users/me', {
        fullName,
        avatarUrl,
        weight: numWeight,
        targetWeight: numTargetWeight,
        height: numHeight,
        bodyFat: numBodyFat,
        muscleMass: numMuscleMass,
        activityLevel,
        goal,
      })
      .then(() => {
        setSaving(false);
        toast.success('Đã cập nhật và tính toán lại BMR, TDEE thành công!');
        onSuccess();
        onClose();
      })
      .catch((err: unknown) => {
        console.error(err);
        setSaving(false);
        const errMsg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Không thể cập nhật hồ sơ cá nhân!';
        toast.error(errMsg);
      });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#121620] border border-white/15 rounded-[32px] max-w-xl w-full max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-6 md:p-8 space-y-6 text-white shadow-2xl relative cursor-default animate-in zoom-in-95 duration-200"
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

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary border border-primary/40 flex items-center justify-center shrink-0">
            <Activity size={24} />
          </div>
          <div>
            <h3 className="font-extrabold text-xl text-white font-headline-md">
              Chỉnh Sửa Chỉ Số & Hồ Sơ Cá Nhân
            </h3>
            <p className="text-xs text-white/60 mt-0.5">
              Cập nhật chiều cao, cân nặng, % mỡ, cơ bắp & mục tiêu thể hình.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email (Readonly) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-white/80">
              Địa chỉ Email (Định danh):
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
              />
              <input
                type="email"
                disabled
                value={userData?.email || 'user@nutricore.com'}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white/60 outline-none cursor-not-allowed font-mono"
              />
            </div>
          </div>

          {/* Full Name & Avatar Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-white/80">Họ và Tên (*):</label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-white/[0.05] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-primary outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-white/80">URL Ảnh Đại Diện:</label>
              <div className="relative">
                <ImageIcon
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                />
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-white/[0.05] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-primary outline-none"
                />
              </div>
            </div>
          </div>

          {/* Core Body Biometrics Grid (Height, Weight, Target Weight, Fat %, Muscle kg) */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-primary uppercase tracking-wider block">
              📊 Bảng Chỉ Số Hình Thể & Sinh Học:
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-white/80">
                  Chiều cao (100 - 220cm):
                </label>
                <div className="relative">
                  <Ruler
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                  />
                  <input
                    type="number"
                    min="100"
                    max="220"
                    placeholder="170"
                    value={height}
                    onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : '')}
                    className={`w-full bg-white/[0.05] border rounded-xl pl-8 pr-2 py-2 text-xs text-white focus:border-primary outline-none font-bold ${
                      !isHeightValid ? 'border-rose-500 text-rose-400' : 'border-white/15'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-white/80">
                  Cân nặng (30 - 200kg):
                </label>
                <div className="relative">
                  <Scale
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                  />
                  <input
                    type="number"
                    min="30"
                    max="200"
                    step="0.5"
                    placeholder="70"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')}
                    className={`w-full bg-white/[0.05] border rounded-xl pl-8 pr-2 py-2 text-xs focus:border-primary outline-none font-bold ${
                      !isWeightValid ? 'border-rose-500 text-rose-400' : 'border-white/15 text-primary'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-white/80">
                  Mục tiêu (30 - 200kg):
                </label>
                <div className="relative">
                  <Scale
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                  />
                  <input
                    type="number"
                    min="30"
                    max="200"
                    step="0.5"
                    placeholder="65"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value ? Number(e.target.value) : '')}
                    className={`w-full bg-white/[0.05] border rounded-xl pl-8 pr-2 py-2 text-xs focus:border-primary outline-none font-bold ${
                      !isTargetWeightValid ? 'border-rose-500 text-rose-400' : 'border-white/15 text-green-light'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-white/80">
                  Tỷ lệ Mỡ (3 - 60%):
                </label>
                <div className="relative">
                  <Flame
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 pointer-events-none"
                  />
                  <input
                    type="number"
                    min="3"
                    max="60"
                    step="0.1"
                    placeholder="18.5"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value ? Number(e.target.value) : '')}
                    className={`w-full bg-white/[0.05] border rounded-xl pl-8 pr-2 py-2 text-xs focus:border-primary outline-none font-bold ${
                      !isBodyFatValid ? 'border-rose-500 text-rose-400' : 'border-white/15 text-orange-400'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-white/80">
                  Cơ bắp (10 - 120kg):
                </label>
                <div className="relative">
                  <Dumbbell
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none"
                  />
                  <input
                    type="number"
                    min="10"
                    max="120"
                    step="0.1"
                    placeholder="32.5"
                    value={muscleMass}
                    onChange={(e) => setMuscleMass(e.target.value ? Number(e.target.value) : '')}
                    className={`w-full bg-white/[0.05] border rounded-xl pl-8 pr-2 py-2 text-xs focus:border-primary outline-none font-bold ${
                      !isMuscleMassValid ? 'border-rose-500 text-rose-400' : 'border-white/15 text-blue-400'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Goal & Activity Level Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-white/80">
                Mục tiêu Thể hình:
              </label>
              <div className="relative">
                <Target
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                />
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-[#1c2230] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:border-primary outline-none cursor-pointer"
                >
                  <option value="LOSE_WEIGHT">Mục tiêu Giảm cân (Thâm hụt Calo)</option>
                  <option value="GAIN_WEIGHT">Mục tiêu Tăng cân (Thặng dư Calo)</option>
                  <option value="MAINTAIN">Mục tiêu Giữ cân (Cân bằng Calo)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-white/80">
                Mức độ Vận động (TDEE):
              </label>
              <div className="relative">
                <Activity
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                />
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full bg-[#1c2230] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:border-primary outline-none cursor-pointer"
                >
                  <option value="SEDENTARY">Ít vận động (Ngồi văn phòng)</option>
                  <option value="LIGHTLY_ACTIVE">Vận động nhẹ (Tập 1-3 buổi/tuần)</option>
                  <option value="MODERATELY_ACTIVE">Vận động vừa (Tập 3-5 buổi/tuần)</option>
                  <option value="VERY_ACTIVE">Vận động cao (Tập 6-7 buổi/tuần)</option>
                  <option value="EXTRA_ACTIVE">Vận động rất cao (Lao động nặng/VĐV)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Automatic Recalculation Badge */}
          <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <Flame size={18} />
            </div>
            <div className="text-xs text-white/70">
              Chỉ số <strong className="text-primary font-bold">BMR, TDEE và Calo mục tiêu</strong> sẽ được hệ thống tự động tính toán lại ngay khi bạn bấm Lưu.
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary text-dark-slate font-extrabold py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(102,200,28,0.4)] cursor-pointer disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
          >
            <Save size={18} />
            {saving ? 'Đang lưu...' : 'Lưu Thay Đổi Chỉ Số Hồ Sơ'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
