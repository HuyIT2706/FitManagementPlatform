'use client';

import { useEffect, useState } from 'react';
import Header from '../../components/ui/Header';
import BottomNavBar from '../../components/navigation/BottomNavBar';
import apiClient from '../../api/axios';
import type { UserDataHome } from '../../interface';

import ProfileHeaderCard from './components/ProfileHeaderCard';
import PtCoachBindCard from './components/PtCoachBindCard';
import ProfileBiometricsGrid from './components/ProfileBiometricsGrid';
import TransformationJourneySlider from './components/TransformationJourneySlider';
import DailyMacroTargetMaster from './components/DailyMacroTargetMaster';
import ProfileSettingsList from './components/ProfileSettingsList';
import EditProfileModal from './components/EditProfileModal';

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserDataHome | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const fetchUserData = () => {
    apiClient
      .get<UserDataHome>('/users/me')
      .then((res) => {
        setUserData(res.data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error('Error fetching user profile data:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleLogout = (): void => {
    localStorage.removeItem('jwt_token');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Pure View: Display metrics directly from Backend response
  const heightCm: number = userData?.height ?? 175;
  const weightKg: number = userData?.bodyMetrics?.[0]?.weight ?? userData?.weight ?? 80;
  const targetWeightKg: number = userData?.targetWeight ?? 70;

  const ageYears: number = userData?.dateOfBirth
    ? new Date().getFullYear() - new Date(userData.dateOfBirth).getFullYear()
    : (userData?.age ?? 24);

  // Values calculated directly on Backend (/users/me)
  const bmr = userData?.bmr ?? 1790;
  const tdee = userData?.tdee ?? 3088;
  const bmi = userData?.bmi ?? 24.5;
  const goal = userData?.goal ?? 'LOSE_WEIGHT';
  const suggestedOffset = userData?.suggestedOffset ?? -400;

  // Target Intake Calories (From PT / NutritionTarget DB or deficit fallback)
  const target = userData?.nutritionTargets?.[0];
  const targetCalo = target?.targetCalo ?? tdee + suggestedOffset;
  const targetProtein = target?.targetProtein ?? Math.round((targetCalo * 0.3) / 4);
  const targetCarbs = target?.targetCarbs ?? Math.round((targetCalo * 0.4) / 4);
  const targetFat = target?.targetFat ?? Math.round((targetCalo * 0.3) / 9);

  // Activity level formatting
  const activityLevelLabelMap: Record<string, string> = {
    SEDENTARY: 'Ít vận động',
    LIGHTLY_ACTIVE: 'Vận động nhẹ',
    MODERATELY_ACTIVE: 'Vận động vừa phải',
    VERY_ACTIVE: 'Vận động cao (TDEE x1.725)',
    EXTRA_ACTIVE: 'Vận động rất cao',
  };
  const activityLabel = userData?.activityLevel
    ? activityLevelLabelMap[userData.activityLevel] || userData.activityLevel
    : 'Vận động cao (TDEE x1.725)';

  const goalTextMap: Record<string, string> = {
    LOSE_WEIGHT: 'Mục tiêu Giảm cân (Thâm hụt Calo)',
    GAIN_WEIGHT: 'Mục tiêu Tăng cân (Thặng dư Calo)',
    MAINTAIN: 'Mục tiêu Giữ cân (Cân bằng Calo)',
  };

  return (
    <div className="min-h-screen bg-background pb-32 pt-2 md:pt-0 dark text-on-surface">
      <Header userData={userData} onLogout={handleLogout} />

      <main className="px-4 md:px-10 pt-4 max-w-7xl mx-auto flex flex-col gap-4">
        {/* 1. Profile Header Hero */}
        <ProfileHeaderCard
          userData={userData}
          onEditProfile={() => setIsEditProfileOpen(true)}
        />

        {/* 2. PT Coach Code & QR Binding Card */}
        <PtCoachBindCard onBindSuccess={fetchUserData} />

        {/* 3. Biometrics Grid */}
        <ProfileBiometricsGrid
          ageYears={ageYears}
          heightCm={heightCm}
          weightKg={weightKg}
          targetWeightKg={targetWeightKg}
          bmi={bmi}
          bmr={bmr}
          tdee={tdee}
          activityLabel={activityLabel}
        />

        {/* 4. Transformation Journey Slider */}
        <TransformationJourneySlider
          goal={goal}
          weightKg={weightKg}
          targetWeightKg={targetWeightKg}
          goalTextMap={goalTextMap}
        />

        {/* 5. Daily Macro Target Master Card */}
        <DailyMacroTargetMaster
          targetCalo={targetCalo}
          targetProtein={targetProtein}
          targetCarbs={targetCarbs}
          targetFat={targetFat}
          suggestedOffset={suggestedOffset}
        />

        {/* 6. Settings Bento List */}
        <ProfileSettingsList
          onLogout={handleLogout}
          onEditProfile={() => setIsEditProfileOpen(true)}
        />

        {/* 7. Edit Profile Modal */}
        <EditProfileModal
          isOpen={isEditProfileOpen}
          userData={userData}
          onClose={() => setIsEditProfileOpen(false)}
          onSuccess={fetchUserData}
        />
      </main>

      <BottomNavBar activeTab="profile" />
    </div>
  );
}
