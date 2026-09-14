'use client';
 
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Header from '../../../../components/ui/Header';
import PTBottomNavBar from '../../../../components/navigation/PTBottomNavBar';
import AppLoading from '../../../../components/ui/AppLoading';
import apiClient from '../../../../api/axios';
import type { UserDataHome } from '../../../../interface';
import type {
  AssignedExerciseItem,
  InBodyHistoryPoint,
  PTStudentDetail,
} from '@repo/types';
import type { ExerciseItem } from '../../../../interface';
import { toast } from '../../../../utils/toast';

import dynamic from 'next/dynamic';
import AccessDenied from '../../../../components/ui/AccessDenied';
import PtPendingApproval from '../../../../components/ui/PtPendingApproval';
import StudentHeaderHero from './components/StudentHeaderHero';
import StudentWorkoutTab from './components/StudentWorkoutTab';
import StudentNutritionTab from './components/StudentNutritionTab';
import StudentInbodyTab from './components/StudentInbodyTab';

const EditSessionModal = dynamic(() => import('./components/EditSessionModal'), {
  ssr: false,
});
const ExerciseSelectionModal = dynamic(
  () => import('./components/ExerciseSelectionModal'),
  { ssr: false }
);

const PTStudentDetailPage = () => {
  const routeParams = useParams();
  const studentId = (routeParams?.id as string) || '';

  const [userData, setUserData] = useState<UserDataHome | null>(null);
  const [studentDetail, setStudentDetail] = useState<PTStudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'workout' | 'nutrition' | 'inbody'>('workout');

  // Workout assignment local state
  const [assignedExercises, setAssignedExercises] = useState<AssignedExerciseItem[]>([]);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [newExId, setNewExId] = useState('');
  const [newExName, setNewExName] = useState('');
  const [newExCategory, setNewExCategory] = useState('');
  const [newExImage, setNewExImage] = useState('');
  const [newExSets, setNewExSets] = useState(0);
  const [newExReps, setNewExReps] = useState(0);
  const [newExDay, setNewExDay] = useState('');

  // Nutrition assignment local state
  const [targetCalories, setTargetCalories] = useState(0);
  const [targetProtein, setTargetProtein] = useState(0);
  const [targetCarbs, setTargetCarbs] = useState(0);
  const [targetFat, setTargetFat] = useState(0);
  const [breakfastText, setBreakfastText] = useState('');
  const [lunchText, setLunchText] = useState('');
  const [dinnerText, setDinnerText] = useState('');
  const [snackText, setSnackText] = useState('');
  const [nutritionNote, setNutritionNote] = useState('');

  // InBody Edit local state
  const [isEditingInBody, setIsEditingInBody] = useState(false);
  const [inbodyWeight, setInbodyWeight] = useState(0);
  const [inbodyHeight, setInbodyHeight] = useState(0);
  const [inbodyFat, setInbodyFat] = useState(0);
  const [inbodyMuscle, setInbodyMuscle] = useState(0);
  const [chartMetric, setChartMetric] = useState<'weight' | 'fat' | 'muscle'>('weight');

  // Session Edit local state
  const [isEditSessionModalOpen, setIsEditSessionModalOpen] = useState(false);
  const [editTotalSessions, setEditTotalSessions] = useState(0);
  const [editRemainingSessions, setEditRemainingSessions] = useState(0);
  const [editPackageName, setEditPackageName] = useState('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      apiClient.get<UserDataHome>('/users/me'),
      apiClient.get<PTStudentDetail>(`/pt/students/${studentId}`),
    ])
      .then(([userRes, studentRes]) => {
        setUserData(userRes.data);
        setStudentDetail(studentRes.data);
        setAssignedExercises(studentRes.data.assignedExercises || []);
        const tCalo =
          studentRes.data.targetCalories ??
          studentRes.data.nutritionTarget?.targetCalories ??
          0;
        const tProtein =
          studentRes.data.targetProtein ??
          studentRes.data.nutritionTarget?.proteinGrams ??
          0;
        const tCarbs =
          studentRes.data.targetCarbs ??
          studentRes.data.nutritionTarget?.carbsGrams ??
          0;
        const tFat =
          studentRes.data.targetFat ??
          studentRes.data.nutritionTarget?.fatGrams ??
          0;

        setTargetCalories(tCalo);
        setTargetProtein(tProtein);
        setTargetCarbs(tCarbs);
        setTargetFat(tFat);

        setEditTotalSessions(studentRes.data.totalSessions ?? 0);
        setEditRemainingSessions(studentRes.data.remainingSessions ?? 0);
        setEditPackageName(studentRes.data.packageName || '');

        if (studentRes.data.bodyMetrics) {
          setInbodyWeight(studentRes.data.bodyMetrics.weightKg ?? 0);
          setInbodyHeight(studentRes.data.bodyMetrics.heightCm ?? 0);
          setInbodyFat(studentRes.data.bodyMetrics.bodyFatPercent ?? 0);
          setInbodyMuscle(studentRes.data.bodyMetrics.muscleMassKg ?? 0);
        }

        if (studentRes.data.prescribedMealPlan) {
          setBreakfastText(studentRes.data.prescribedMealPlan.breakfast || '');
          setLunchText(studentRes.data.prescribedMealPlan.lunch || '');
          setDinnerText(studentRes.data.prescribedMealPlan.dinner || '');
          setSnackText(studentRes.data.prescribedMealPlan.snack || '');
          setNutritionNote(studentRes.data.prescribedMealPlan.note || '');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Không tìm thấy thông tin hoặc bạn chưa được liên kết với học viên này.');
        setLoading(false);
      });
  }, [studentId]);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    window.location.href = '/login';
  };

  const handleSelectExerciseFromModal = (ex: ExerciseItem) => {
    setNewExId(ex.id);
    setNewExName(ex.name);
    setNewExCategory(ex.category || 'LEGS');
    setNewExImage(ex.setupImageUrl || ex.startImageUrl || '');
    setNewExSets(4);
    setNewExReps(10);
    toast.success(`Đã chọn bài tập: ${ex.name}`);
  };

  const handleAddExerciseToPlan = () => {
    if (!newExName) {
      toast.error('Vui lòng chọn bài tập từ danh sách!');
      return;
    }
    const newItem: AssignedExerciseItem = {
      id: `ae-${Date.now()}`,
      exerciseId: newExId || `ex-${Date.now()}`,
      name: newExName,
      category: newExCategory,
      imageUrl: newExImage,
      setupImageUrl: newExImage,
      sets: Number(newExSets) || 3,
      reps: Number(newExReps) || 12,
      weightInKg: 0,
      dayOfWeek: newExDay,
    };
    setAssignedExercises((prev) => [...prev, newItem]);
    setNewExId('');
    setNewExName('');
    setNewExCategory('');
    setNewExImage('');
    setNewExSets(0);
    setNewExReps(0);
    setNewExDay('');
    toast.info('Đã thêm bài tập vào danh sách giáo án!');
  };

  const handleRemoveExerciseFromPlan = (id: string) => {
    setAssignedExercises((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveWorkoutAssignment = () => {
    setSaving(true);
    apiClient
      .post(`/pt/students/${studentId}/assign-workout`, {
        studentId,
        exercises: assignedExercises,
      })
      .then(() => {
        setSaving(false);
        if (studentDetail) {
          setStudentDetail({
            ...studentDetail,
            assignedExercises,
          });
        }
        toast.success('Lưu & Giao giáo án tập luyện thành công!');
      })
      .catch((err) => {
        console.error(err);
        setSaving(false);
        toast.error('Không thể lưu giáo án. Vui lòng thử lại!');
      });
  };

  const handleSaveNutritionAssignment = () => {
    setSaving(true);
    apiClient
      .post(`/pt/students/${studentId}/assign-nutrition`, {
        studentId,
        targetCalories,
        targetProtein,
        proteinGrams: targetProtein,
        targetCarbs,
        carbsGrams: targetCarbs,
        targetFat,
        fatGrams: targetFat,
        prescribedMealPlan: {
          breakfast: breakfastText,
          lunch: lunchText,
          dinner: dinnerText,
          snack: snackText,
          note: nutritionNote,
        },
      })
      .then(() => {
        setSaving(false);
        if (studentDetail) {
          setStudentDetail({
            ...studentDetail,
            targetCalories,
            targetProtein,
            targetCarbs,
            targetFat,
            nutritionTarget: {
              targetCalories,
              proteinGrams: targetProtein,
              carbsGrams: targetCarbs,
              fatGrams: targetFat,
            },
            prescribedMealPlan: {
              breakfast: breakfastText,
              lunch: lunchText,
              dinner: dinnerText,
              snack: snackText,
              note: nutritionNote,
            },
          });
        }
        toast.success('Lưu thực đơn & mục tiêu dinh dưỡng thành công!');
      })
      .catch((err) => {
        console.error(err);
        setSaving(false);
        toast.error('Không thể lưu mục tiêu dinh dưỡng!');
      });
  };

  const handleSaveInBody = () => {
    setSaving(true);
    const updatedDate = new Date().toLocaleDateString('vi-VN');

    apiClient
      .post(`/pt/students/${studentId}/inbody`, {
        studentId,
        weightKg: inbodyWeight,
        heightCm: inbodyHeight,
        bodyFatPercent: inbodyFat,
        muscleMassKg: inbodyMuscle,
        date: updatedDate,
      })
      .then(() => {
        setSaving(false);
        setIsEditingInBody(false);
        if (studentDetail) {
          const newHistoryPoint: InBodyHistoryPoint = {
            date: `T${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
            weightKg: inbodyWeight,
            bodyFatPercent: inbodyFat,
            muscleMassKg: inbodyMuscle,
          };
          const updatedHistory = [...(studentDetail.bodyMetricsHistory || []), newHistoryPoint];

          setStudentDetail({
            ...studentDetail,
            bodyMetrics: {
              weightKg: inbodyWeight,
              heightCm: inbodyHeight,
              bodyFatPercent: inbodyFat,
              muscleMassKg: inbodyMuscle,
              updatedAt: updatedDate,
            },
            bodyMetricsHistory: updatedHistory,
          });
        }
        toast.success('Đã cập nhật chỉ số InBody mới thành công!');
      })
      .catch((err) => {
        console.error(err);
        setSaving(false);
        toast.error('Không thể cập nhật chỉ số InBody!');
      });
  };

  const handleSaveStudentSessions = () => {
    setSaving(true);
    apiClient
      .patch(`/pt/students/${studentId}`, {
        totalSessions: editTotalSessions,
        remainingSessions: editRemainingSessions,
        packageName: editPackageName,
      })
      .then(() => {
        setSaving(false);
        setIsEditSessionModalOpen(false);
        if (studentDetail) {
          setStudentDetail({
            ...studentDetail,
            totalSessions: editTotalSessions,
            remainingSessions: editRemainingSessions,
            packageName: editPackageName,
          });
        }
        toast.success('Đã cập nhật số buổi & gói tập cho học viên thành công!');
      })
      .catch((err) => {
        console.error(err);
        setSaving(false);
        toast.error('Không thể cập nhật số buổi học viên!');
      });
  };

  if (loading) {
    return <AppLoading fullScreen size="lg" message="Đang nạp hồ sơ học viên..." />;
  }

  if (userData && userData.role !== 'PT') {
    return (
      <AccessDenied
        requiredRole="PT"
        currentUser={userData}
        onLogout={handleLogout}
        title="Không Có Quyền Huấn Luyện Viên"
        message="Khu vực này dành riêng cho Huấn luyện viên (PT) quản lý học viên và giáo án. Tài khoản của bạn không có quyền truy cập."
      />
    );
  }

  if (userData && userData.role === 'PT' && userData.isApprovedPt === false) {
    return <PtPendingApproval currentUser={userData} onLogout={handleLogout} />;
  }

  if (error || !studentDetail) {
    return (
      <div className="min-h-screen bg-background pb-32 pt-2 md:pt-0 dark text-on-surface">
        <Header userData={userData} onLogout={handleLogout} />
        <main className="max-w-xl mx-auto px-container-padding mt-12 space-y-6 text-center">
          <div className="bento-card p-8 rounded-3xl border border-white/10 space-y-4">
            <span className="material-symbols-outlined text-amber-400 text-5xl">person_off</span>
            <h3 className="text-xl font-bold text-white">Không tìm thấy học viên</h3>
            <p className="text-sm text-on-surface-variant">
              {error || 'Học viên này có thể không tồn tại hoặc đã bị hủy liên kết.'}
            </p>
            <div className="pt-3 flex justify-center">
              <Link
                href="/pt/students"
                aria-label="Quay lại danh sách học viên"
                title="Quay lại danh sách học viên"
                className="w-11 h-11 rounded-full border border-white/15 bg-surface-dark/80 hover:bg-white/10 hover:border-primary/60 text-white flex items-center justify-center transition-all duration-200 shadow-sm group active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
              </Link>
            </div>
          </div>
        </main>
        <PTBottomNavBar activeTab="students" />
      </div>
    );
  }

  const historyPoints = studentDetail.bodyMetricsHistory || [];

  return (
    <div className="min-h-screen bg-background pb-32 pt-2 md:pt-0 dark text-on-surface">
      <Header userData={userData} onLogout={handleLogout} />

      <main className="max-w-6xl mx-auto px-container-padding mt-4 md:mt-8 space-y-6">
        {/* Back Button */}
        <div>
          <Link
            href="/pt/students"
            aria-label="Quay lại danh sách học viên"
            title="Quay lại danh sách học viên"
            className="w-10 h-10 rounded-full border border-white/15 bg-surface-dark/80 hover:bg-white/10 hover:border-primary/60 text-white flex items-center justify-center transition-all duration-200 shadow-sm group active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
          </Link>
        </div>

        {/* Component 1: Hero Header Profile */}
        <StudentHeaderHero
          fullName={studentDetail.fullName}
          avatarUrl={studentDetail.avatarUrl}
          email={studentDetail.email}
          phone={studentDetail.phone}
          packageName={studentDetail.packageName}
          remainingSessions={studentDetail.remainingSessions}
          totalSessions={studentDetail.totalSessions}
          onOpenEditSessionModal={() => setIsEditSessionModalOpen(true)}
        />

        {/* Sub-Tabs Switcher */}
        <section className="flex items-center gap-1.5 sm:gap-2 p-1.5 bg-surface-bright/40 rounded-2xl border border-white/10 overflow-x-auto [&&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          <button
            type="button"
            onClick={() => setActiveSubTab('workout')}
            className={`flex-1 min-w-[100px] sm:min-w-[130px] py-2.5 sm:py-3 rounded-3xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'workout'
                ? 'bg-primary text-dark-slate shadow-[0_0_15px_rgba(102,200,28,0.4)]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/50'
            }`}
          >
            Giao Bài Tập
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('nutrition')}
            className={`flex-1 min-w-[100px] sm:min-w-[130px] py-2.5 sm:py-3 rounded-3xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'nutrition'
                ? 'bg-primary text-dark-slate shadow-[0_0_15px_rgba(102,200,28,0.4)]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/50'
            }`}
          >
            Thực Đơn
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('inbody')}
            className={`flex-1 min-w-[100px] sm:min-w-[130px] py-2.5 sm:py-3 rounded-3xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'inbody'
                ? 'bg-primary text-dark-slate shadow-[0_0_15px_rgba(102,200,28,0.4)]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/50'
            }`}
          >
            InBody
          </button>
        </section>

        {/* Component 2: Tab 1 Giao Bài Tập */}
        {activeSubTab === 'workout' && (
          <StudentWorkoutTab
            assignedExercises={assignedExercises}
            newExName={newExName}
            newExCategory={newExCategory}
            newExSets={newExSets}
            newExReps={newExReps}
            newExDay={newExDay}
            saving={saving}
            onOpenExerciseModal={() => setIsExerciseModalOpen(true)}
            onExSetsChange={setNewExSets}
            onExRepsChange={setNewExReps}
            onExDayChange={setNewExDay}
            onAddExercise={handleAddExerciseToPlan}
            onRemoveExercise={handleRemoveExerciseFromPlan}
            onSaveWorkout={handleSaveWorkoutAssignment}
          />
        )}

        {/* Component 3: Tab 2 Dinh Dưỡng & Thực Đơn 4 Bữa */}
        {activeSubTab === 'nutrition' && (
          <StudentNutritionTab
            targetCalories={targetCalories}
            targetProtein={targetProtein}
            targetCarbs={targetCarbs}
            targetFat={targetFat}
            breakfastText={breakfastText}
            lunchText={lunchText}
            dinnerText={dinnerText}
            snackText={snackText}
            nutritionNote={nutritionNote}
            saving={saving}
            onTargetCaloriesChange={setTargetCalories}
            onTargetProteinChange={setTargetProtein}
            onTargetCarbsChange={setTargetCarbs}
            onTargetFatChange={setTargetFat}
            onBreakfastTextChange={setBreakfastText}
            onLunchTextChange={setLunchText}
            onDinnerTextChange={setDinnerText}
            onSnackTextChange={setSnackText}
            onNutritionNoteChange={setNutritionNote}
            onSaveNutrition={handleSaveNutritionAssignment}
          />
        )}

        {/* Component 4: Tab 3 InBody & Tiến Độ */}
        {activeSubTab === 'inbody' && (
          <StudentInbodyTab
            studentId={studentId}
            inbodyWeight={inbodyWeight}
            inbodyHeight={inbodyHeight}
            inbodyFat={inbodyFat}
            inbodyMuscle={inbodyMuscle}
            chartMetric={chartMetric}
            isEditingInBody={isEditingInBody}
            historyPoints={historyPoints}
            saving={saving}
            onChartMetricChange={setChartMetric}
            onToggleEditInBody={setIsEditingInBody}
            onInbodyWeightChange={setInbodyWeight}
            onInbodyHeightChange={setInbodyHeight}
            onInbodyFatChange={setInbodyFat}
            onInbodyMuscleChange={setInbodyMuscle}
            onSaveInBody={handleSaveInBody}
          />
        )}

        {/* Component 5: Modal Sửa Số Buổi & Gói Tập */}
        <EditSessionModal
          isOpen={isEditSessionModalOpen}
          packageName={editPackageName}
          totalSessions={editTotalSessions}
          remainingSessions={editRemainingSessions}
          saving={saving}
          onClose={() => setIsEditSessionModalOpen(false)}
          onPackageNameChange={setEditPackageName}
          onTotalSessionsChange={setEditTotalSessions}
          onRemainingSessionsChange={setEditRemainingSessions}
          onSaveSessions={handleSaveStudentSessions}
        />

        {/* Modal Chọn Bài Tập Từ Thư Viện CSDL Chung */}
        <ExerciseSelectionModal
          isOpen={isExerciseModalOpen}
          onClose={() => setIsExerciseModalOpen(false)}
          onSelectExercise={handleSelectExerciseFromModal}
          currentSelectedName={newExName}
        />
      </main>

      <PTBottomNavBar activeTab="students" />
    </div>
  );
};

export default PTStudentDetailPage;
