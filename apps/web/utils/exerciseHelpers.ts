import type { ExerciseItem } from '../interface';

const MUSCLE_DISPLAY_MAP: Record<string, string> = {
  'cơ ngực': 'Ngực',
  'cơ vai': 'Vai',
  'cơ tay trước': 'Tay trước',
  'cơ tay sau': 'Tay sau',
  'cẳng tay': 'Cẳng tay',
  'cơ bụng': 'Bụng',
  'cơ xô': 'Xô (Lats)',
  'cơ lưng giữa': 'Lưng giữa',
  'cơ lưng dưới': 'Lưng dưới',
  'cơ cầu vai': 'Cầu vai',
  'cơ mông': 'Mông',
  'cơ đùi trước': 'Đùi trước',
  'cơ đùi sau': 'Đùi sau',
  'cơ khép (đùi trong)': 'Đùi trong',
  'cơ dang (hông ngoài)': 'Hông ngoài',
  'bắp chân': 'Bắp chân',
  'cơ cổ': 'Cổ',
};

export function formatMuscleLabel(muscle: string): string {
  const normalized = muscle.trim().toLowerCase();
  if (MUSCLE_DISPLAY_MAP[normalized]) {
    return MUSCLE_DISPLAY_MAP[normalized];
  }
  const clean = muscle.trim();
  return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : '';
}

export function formatMuscleList(muscles?: string[]): string {
  if (!muscles || muscles.length === 0) return '';
  return muscles.map(formatMuscleLabel).filter(Boolean).join(', ');
}

export function formatMechanicLabel(mechanic?: string | null): string | null {
  if (!mechanic) return null;
  const lower = mechanic.toLowerCase();
  if (lower.includes('compound') || lower.includes('phức hợp')) return 'Đa khớp';
  if (lower.includes('isolation') || lower.includes('cô lập')) return 'Cô lập';
  return mechanic.charAt(0).toUpperCase() + mechanic.slice(1);
}

export function formatLevelLabel(level?: string | null): string | null {
  if (!level) return null;
  const lower = level.toLowerCase();
  if (lower.includes('mới bắt đầu') || lower.includes('beginner')) return 'Người mới';
  if (lower.includes('trung cấp') || lower.includes('intermediate')) return 'Trung bình';
  if (lower.includes('nâng cao') || lower.includes('expert') || lower.includes('advanced')) {
    return 'Nâng cao';
  }
  return level.charAt(0).toUpperCase() + level.slice(1);
}

export function formatEquipmentLabel(equipment?: string | null): string {
  if (!equipment || !equipment.trim()) return 'Trọng lượng cơ thể';
  const clean = equipment.trim();
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export interface GoalPrescription {
  setsReps: string;
  restLabel: string;
  goalCaption: string;
}

export function getGoalPrescription(
  exercise: Pick<ExerciseItem, 'category' | 'mechanic' | 'level'>,
  userGoal?: string | null,
  assignedSets?: number | null,
  assignedReps?: number | null,
): GoalPrescription {
  const isCompound =
    exercise.mechanic?.toLowerCase().includes('compound') ||
    exercise.mechanic?.toLowerCase().includes('phức hợp');
  const isStretch =
    exercise.category?.toLowerCase().includes('giãn cơ') ||
    exercise.category?.toLowerCase().includes('stretch');
  const levelLabel = formatLevelLabel(exercise.level) || 'Phù hợp';

  if (assignedSets && assignedSets > 0 && assignedReps && assignedReps > 0) {
    return {
      setsReps: `${assignedSets} × ${assignedReps}`,
      restLabel: isCompound ? '90–120 giây' : '60 giây',
      goalCaption: `Theo giáo án PT của bạn • ${levelLabel}`,
    };
  }

  if (isStretch) {
    return {
      setsReps: '2–3 × 30 giây',
      restLabel: '30 giây',
      goalCaption: `Giãn cơ & phục hồi • ${levelLabel}`,
    };
  }

  const normalizedGoal = (userGoal || '').toUpperCase();
  if (normalizedGoal === 'LOSE_WEIGHT') {
    return {
      setsReps: isCompound ? '4 × 10–12' : '3 × 12–15',
      restLabel: isCompound ? '60–90 giây' : '45–60 giây',
      goalCaption: `Theo mục tiêu của bạn: Giảm mỡ & săn chắc • ${levelLabel}`,
    };
  }

  if (normalizedGoal === 'GAIN_WEIGHT' || normalizedGoal === 'GAIN_MUSCLE') {
    return {
      setsReps: isCompound ? '4 × 6–10' : '3–4 × 8–12',
      restLabel: isCompound ? '2 phút' : '90 giây',
      goalCaption: `Theo mục tiêu của bạn: Tăng cơ & sức mạnh • ${levelLabel}`,
    };
  }

  return {
    setsReps: isCompound ? '4 × 8–12' : '3 × 10–12',
    restLabel: isCompound ? '90 giây' : '60 giây',
    goalCaption: `Theo mục tiêu của bạn: Duy trì & phát triển • ${levelLabel}`,
  };
}

export function buildExerciseOverview(exercise: ExerciseItem): string {
  const primary = formatMuscleList(exercise.primaryMuscles);
  const secondary = formatMuscleList(exercise.secondaryMuscles);
  const mech = formatMechanicLabel(exercise.mechanic);
  const equip = formatEquipmentLabel(exercise.equipment).toLowerCase();

  if (primary && secondary) {
    return `Bài tập ${mech ? mech.toLowerCase() + ' ' : ''}với ${equip} giúp phát triển nhóm cơ ${primary.toLowerCase()}, đồng thời tác động hỗ trợ lên ${secondary.toLowerCase()}.`;
  }
  if (primary) {
    return `Bài tập ${mech ? mech.toLowerCase() + ' ' : ''}với ${equip} tập trung phát triển nhóm cơ ${primary.toLowerCase()}.`;
  }
  return `Bài tập ${exercise.category || 'thể hình'} thực hiện với ${equip}.`;
}

export function cleanInstructionSteps(instructions?: string[]): string[] {
  if (!instructions || instructions.length === 0) return [];
  const filtered = instructions.filter(
    (step) =>
      step &&
      step.trim() !== '' &&
      !step.toLowerCase().includes('lặp lại số lần lặp lại được đề xuất') &&
      !step.toLowerCase().includes('lặp lại số lần lặp lại quy định') &&
      !step.toLowerCase().includes('lặp lại động tác với số lần lặp lại quy định'),
  );
  return filtered.length > 0 ? filtered : instructions.filter((s) => Boolean(s?.trim()));
}

export function estimateBurnedCalories(
  met: number,
  durationMinutes: number,
  weightKg: number,
  intensityMultiplier = 1.0,
): number {
  if (!met || durationMinutes <= 0 || weightKg <= 0 || intensityMultiplier <= 0) {
    return 0;
  }
  return Math.max(
    1,
    Math.round(met * intensityMultiplier * weightKg * (durationMinutes / 60)),
  );
}
