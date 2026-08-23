'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
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

import StudentHeaderHero from './components/StudentHeaderHero';
import StudentWorkoutTab from './components/StudentWorkoutTab';
import StudentNutritionTab from './components/StudentNutritionTab';
import StudentInbodyTab from './components/StudentInbodyTab';
import EditSessionModal from './components/EditSessionModal';
import ExerciseSelectionModal from './components/ExerciseSelectionModal';

const PTStudentDetailPage = ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const resolvedParams = use(params);
  const studentId = resolvedParams.id;

  const [userData, setUserData] = useState<UserDataHome | null>(null);
  const [studentDetail, setStudentDetail] = useState<PTStudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
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
        setTargetCalories(studentRes.data.targetCalories ?? 0);
        setTargetProtein(studentRes.data.targetProtein ?? 0);
        setTargetCarbs(studentRes.data.targetCarbs ?? 0);
        setTargetFat(studentRes.data.targetFat ?? 0);

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
        targetCarbs,
        targetFat,
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

  if (loading || !studentDetail) {
    return <AppLoading fullScreen size="lg" message="Đang nạp hồ sơ học viên..." />;
  }

  const historyPoints = studentDetail.bodyMetricsHistory || [];

  return (
    <div className="min-h-screen bg-background pb-32 pt-2 md:pt-0 dark text-on-surface">
      <Header userData={userData} onLogout={handleLogout} />

      <main className="max-w-6xl mx-auto px-container-padding mt-4 md:mt-8 space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/pt/students"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Quay lại Danh sách Học viên
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
        <section className="flex items-center gap-2 p-1.5 bg-surface-bright/40 rounded-2xl border border-white/10 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('workout')}
            className={`flex-1 min-w-[130px] py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
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
            className={`flex-1 min-w-[130px] py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'nutrition'
                ? 'bg-primary text-dark-slate shadow-[0_0_15px_rgba(102,200,28,0.4)]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/50'
            }`}
          >
            Mục Tiêu & Thực Đơn
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('inbody')}
            className={`flex-1 min-w-[130px] py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'inbody'
                ? 'bg-primary text-dark-slate shadow-[0_0_15px_rgba(102,200,28,0.4)]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/50'
            }`}
          >
            InBody & Tiến Độ
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
