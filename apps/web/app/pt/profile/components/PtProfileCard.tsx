/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Award, Edit3 } from 'lucide-react';
import type { UserDataHome } from '../../../../interface';
import apiClient from '../../../../api/axios';
import { toast } from '../../../../utils/toast';
import { getAvatarUrl } from '../../../../utils/avatar';

const EditPtProfileModal = dynamic(() => import('./EditPtProfileModal'), {
  ssr: false,
});

interface PtProfileCardProps {
  userData: UserDataHome | null;
  totalStudents: number;
  completedHours: number;
  onProfileUpdated?: () => void;
  isEditOpen?: boolean;
  setIsEditOpen?: (val: boolean) => void;
}

const PtProfileCard = ({
  userData,
  totalStudents,
  completedHours,
  onProfileUpdated,
  isEditOpen: externalEditOpen,
  setIsEditOpen: externalSetIsEditOpen,
}: PtProfileCardProps) => {
  const [internalEditOpen, setInternalEditOpen] = useState(false);

  const isEditOpen = externalEditOpen !== undefined ? externalEditOpen : internalEditOpen;
  const setIsEditOpen = externalSetIsEditOpen || setInternalEditOpen;

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
    <>
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

        <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-2 border-primary shadow-[0_0_20px_rgba(102,200,28,0.4)] bg-surface-bright">
          <img
            src={getAvatarUrl(userData?.avatarUrl)}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold font-headline-md text-on-surface">
            {fullName || userData?.fullName || 'Coach Huấn Luyện Viên'}
          </h1>
          <p className="text-xs text-on-surface-variant font-medium">
            {userData?.email || 'pt@nutricore.com'}
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
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 max-w-md mx-auto">
          <div className="bg-surface-bright/30 p-3.5 rounded-2xl border border-white/5">
            <span className="text-2xl font-extrabold text-primary block">{totalStudents}</span>
            <span className="text-xs font-semibold text-on-surface-variant">Học viên VIP</span>
          </div>
          <div className="bg-surface-bright/30 p-3.5 rounded-2xl border border-white/5">
            <span className="text-2xl font-extrabold text-on-surface block">{completedHours}+</span>
            <span className="text-xs font-semibold text-on-surface-variant">Buổi hoàn thành</span>
          </div>
        </div>
      </div>

      {/* Standalone Floating Modal for Editing PT Profile */}
      <EditPtProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        userData={userData}
        fullName={fullName}
        setFullName={setFullName}
        bio={bio}
        setBio={setBio}
        experienceYears={experienceYears}
        setExperienceYears={setExperienceYears}
        specialties={specialties}
        setSpecialties={setSpecialties}
        availableSpecialties={availableSpecialties}
        saving={saving}
        onSave={handleSaveProfile}
      />
    </>
  );
};

export default PtProfileCard;
