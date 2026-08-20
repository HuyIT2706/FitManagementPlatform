/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { UserCheck, Award, Edit3, X, Check } from 'lucide-react';
import type { UserDataHome } from '../../../../interface';
import apiClient from '../../../../api/axios';
import { toast } from '../../../../utils/toast';

interface PtProfileCardProps {
  userData: UserDataHome | null;
  totalStudents: number;
  completedHours: number;
  onProfileUpdated?: () => void;
}

export default function PtProfileCard({
  userData,
  totalStudents,
  completedHours,
  onProfileUpdated,
}: PtProfileCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [fullName, setFullName] = useState(userData?.fullName || '');
  const [bio, setBio] = useState('HLV Cá Nhân Chuyên Nghiệp 1:1 • Giúp bạn lột xác vóc dáng an toàn & khoa học');
  const [experienceYears, setExperienceYears] = useState(4);
  const [specialties, setSpecialties] = useState<string[]>([
    'Tăng cơ giảm mỡ',
    'Phục hồi chấn thương',
    'Tập luyện 1:1',
  ]);
  const [saving, setSaving] = useState(false);

  const availableSpecialties = [
    'Tăng cơ giảm mỡ',
    'Phục hồi chấn thương',
    'Tập luyện 1:1',
    'Giảm béo phì',
    'Dinh dưỡng thể thao',
    'Tăng thể lực & Sức bền',
  ];

  const toggleSpecialty = (spec: string) => {
    if (specialties.includes(spec)) {
      setSpecialties(specialties.filter((s) => s !== spec));
    } else {
      setSpecialties([...specialties, spec]);
    }
  };

  const handleSaveProfile = () => {
    setSaving(true);
    apiClient
      .patch('/pt/profile', {
        fullName,
        bio,
        experienceYears,
        specialties,
      })
      .then(() => {
        setSaving(false);
        setIsEditOpen(false);
        toast.success('Đã cập nhật thông tin hồ sơ HLV thành công!');
        if (onProfileUpdated) onProfileUpdated();
      })
      .catch((err) => {
        console.error(err);
        setSaving(false);
        toast.error('Không thể cập nhật hồ sơ HLV!');
      });
  };

  return (
    <div className="bento-card rounded-3xl p-6 md:p-8 space-y-6 border border-outline-variant/30 text-center relative overflow-hidden">
      {/* Top Action Header */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsEditOpen(true)}
          className="px-3.5 py-1.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-bold flex items-center gap-1.5 hover:bg-primary/20 transition-all cursor-pointer"
        >
          <Edit3 size={14} />
          Chỉnh sửa hồ sơ HLV
        </button>
      </div>

      <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-2 border-primary shadow-[0_0_20px_rgba(102,200,28,0.4)]">
        {userData?.avatarUrl ? (
          <img src={userData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-green-light text-dark-slate flex items-center justify-center text-3xl font-extrabold">
            {userData?.fullName?.charAt(0) || 'P'}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold font-headline-md text-on-surface">
          {fullName || userData?.fullName || 'Coach Huấn Luyện Viên'}
        </h1>
        <p className="text-xs text-on-surface-variant font-medium">
          {userData?.email || 'pt@fitmanagement.com'}
        </p>

        <p className="text-xs text-on-surface/80 italic max-w-lg mx-auto leading-relaxed pt-1">
          &quot;{bio}&quot;
        </p>

        {/* Specialization Tags */}
        <div className="flex flex-wrap justify-center gap-1.5 pt-2">
          <span className="bg-primary/15 text-primary text-[11px] font-bold px-3 py-1 rounded-full border border-primary/30 flex items-center gap-1">
            <Award size={13} />
            {experienceYears} năm kinh nghiệm
          </span>
          {specialties.map((spec) => (
            <span
              key={spec}
              className="bg-white/5 text-on-surface-variant text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/10"
            >
              {spec}
            </span>
          ))}
        </div>
      </div>

      {/* Real Backend PT Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
        <div className="bg-surface-bright/30 p-3 rounded-2xl border border-white/5">
          <span className="text-2xl font-extrabold text-primary block">{totalStudents}</span>
          <span className="text-xs font-semibold text-on-surface-variant">Học viên VIP</span>
        </div>
        <div className="bg-surface-bright/30 p-3 rounded-2xl border border-white/5">
          <span className="text-2xl font-extrabold text-on-surface block">{completedHours}+</span>
          <span className="text-xs font-semibold text-on-surface-variant">Buổi hoàn thành</span>
        </div>
        <div className="bg-surface-bright/30 p-3 rounded-2xl border border-white/5">
          <span className="text-2xl font-extrabold text-amber-400 block">4.9 ★</span>
          <span className="text-xs font-semibold text-on-surface-variant">Đánh giá cao</span>
        </div>
      </div>

      {/* Edit PT Profile Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-left">
          <div className="bg-[#121815] border border-white/10 rounded-2xl w-full max-w-lg p-6 flex flex-col gap-4 text-white shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h4 className="text-lg font-bold flex items-center gap-2 text-primary">
                <UserCheck size={20} />
                Cập nhật thông tin Hồ sơ HLV
              </h4>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="text-white/60 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Họ & Tên HLV:</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary outline-none"
                  placeholder="Ví dụ: Coach Bùi Văn Huy"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Số năm kinh nghiệm:</label>
                <input
                  type="number"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary outline-none font-bold text-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Tiểu sử HLV (Bio):</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-primary outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">Lĩnh vực Chuyên môn:</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableSpecialties.map((spec) => {
                    const selected = specialties.includes(spec);
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => toggleSpecialty(spec)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-left flex justify-between items-center transition-all ${
                          selected
                            ? 'border-primary bg-primary/15 text-primary'
                            : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                        }`}
                      >
                        <span>{spec}</span>
                        {selected && <Check size={14} className="text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/70 text-xs font-bold hover:bg-white/5"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-primary text-dark-slate text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1 shadow-[0_0_12px_rgba(102,200,28,0.4)]"
              >
                {saving ? 'Đang lưu...' : 'Lưu hồ sơ HLV'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
