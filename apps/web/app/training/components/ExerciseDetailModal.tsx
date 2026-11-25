'use client';

import React, { useEffect, useState } from 'react';
import type { ExerciseDetailModalProps, ExerciseItem } from '../../../interface';
import { useCurrentUser, useExerciseDetail } from '../../../hooks/swr';
import ExerciseDetailView from './ExerciseDetailView';

interface ExtendedExerciseDetailModalProps extends ExerciseDetailModalProps {
  assignedSets?: number | null;
  assignedReps?: number | null;
}

const ExerciseDetailModal = ({
  activeExercise,
  exercise,
  assignedSets,
  assignedReps,
  onClose,
}: ExtendedExerciseDetailModalProps) => {
  const initialExercise = activeExercise || exercise || null;
  const [selectedOverride, setSelectedOverride] = useState<{
    sourceId: string;
    item: ExerciseItem;
  } | null>(null);

  const targetExercise =
    selectedOverride && selectedOverride.sourceId === initialExercise?.id
      ? selectedOverride.item
      : initialExercise;

  const { data: userData } = useCurrentUser();
  const { data: detailData } = useExerciseDetail(targetExercise?.id || null);

  useEffect(() => {
    if (!initialExercise) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [initialExercise, onClose]);

  if (!targetExercise) return null;

  const resolvedExercise = detailData?.exercise || targetExercise;
  const similarExercises = detailData?.similarExercises || [];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={resolvedExercise.name}
    >
      <div className="min-h-screen w-full bg-[#f5f7f6] dark:bg-[#090d0b]">
        <ExerciseDetailView
          key={resolvedExercise.id}
          exercise={resolvedExercise}
          similarExercises={similarExercises}
          userGoal={userData?.goal}
          assignedSets={assignedSets}
          assignedReps={assignedReps}
          isModal
          onBack={onClose}
          onSelectSimilar={(sim) =>
            setSelectedOverride({
              sourceId: initialExercise?.id || sim.id,
              item: sim,
            })
          }
        />
      </div>
    </div>
  );
};

export default ExerciseDetailModal;
