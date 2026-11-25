'use client';

import React, { Suspense, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Dumbbell } from 'lucide-react';
import AppLoading from '../../../components/ui/AppLoading';
import { useCurrentUser, useExerciseDetail } from '../../../hooks/swr';
import ExerciseDetailView from '../components/ExerciseDetailView';

function ExerciseDetailPageContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const rawId = typeof params?.id === 'string' ? params.id : '';
  const exerciseId = useMemo(() => {
    try {
      return decodeURIComponent(rawId);
    } catch {
      return rawId;
    }
  }, [rawId]);

  const setsParam = searchParams.get('sets');
  const repsParam = searchParams.get('reps');
  const assignedSets = setsParam ? Number(setsParam) : null;
  const assignedReps = repsParam ? Number(repsParam) : null;

  useEffect(() => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
    if (!token) {
      router.replace('/login');
    }
  }, [router]);

  const { data: userData } = useCurrentUser();
  const { data, error, isLoading } = useExerciseDetail(exerciseId || null);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/training');
    }
  };

  if (isLoading) {
    return <AppLoading fullScreen message="Đang tải chi tiết bài tập..." />;
  }

  if (error || !data?.exercise) {
    return (
      <div className="min-h-screen bg-[#f5f7f6] dark:bg-[#090d0b] text-slate-900 dark:text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#121a15] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center mx-auto text-slate-500 dark:text-slate-300">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-lg font-extrabold">Không tìm thấy bài tập</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Bài tập này có thể đã thay đổi hoặc đường dẫn không hợp lệ.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/training')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#a3e635] hover:bg-[#93d626] text-slate-950 font-bold text-sm transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Quay lại Thư viện bài tập</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <ExerciseDetailView
      key={data.exercise.id}
      exercise={data.exercise}
      similarExercises={data.similarExercises}
      userGoal={userData?.goal}
      assignedSets={
        assignedSets && Number.isFinite(assignedSets) ? assignedSets : null
      }
      assignedReps={
        assignedReps && Number.isFinite(assignedReps) ? assignedReps : null
      }
      onBack={handleBack}
      onSelectSimilar={(sim) =>
        router.push(`/training/${encodeURIComponent(sim.id)}`)
      }
    />
  );
}

export default function ExerciseDetailPage() {
  return (
    <Suspense
      fallback={<AppLoading fullScreen message="Đang tải chi tiết bài tập..." />}
    >
      <ExerciseDetailPageContent />
    </Suspense>
  );
}
