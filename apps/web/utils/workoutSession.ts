import type { ExerciseItem } from '../interface';

const FAVORITES_KEY = 'nutricore_favorite_exercises_v1';
const TODAY_SESSION_KEY = 'nutricore_today_workout_v1';
export const WORKOUT_SESSION_UPDATED_EVENT = 'nutricore:workout-session-updated';

export interface TodayWorkoutSession {
  date: string;
  exercises: ExerciseItem[];
  checkedIds: Record<string, boolean>;
}

function getLocalTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function dispatchSessionUpdate(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(WORKOUT_SESSION_UPDATED_EVENT));
  }
}

export function getFavoriteExercisesMap(): Record<string, ExerciseItem> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, ExerciseItem>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function isFavoriteExercise(id: string): boolean {
  const map = getFavoriteExercisesMap();
  return Boolean(map[id]);
}

export function toggleFavoriteExercise(exercise: ExerciseItem): boolean {
  if (typeof window === 'undefined') return false;
  const map = getFavoriteExercisesMap();
  const nextValue = !map[exercise.id];
  if (nextValue) {
    map[exercise.id] = exercise;
  } else {
    delete map[exercise.id];
  }
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(map));
    dispatchSessionUpdate();
  } catch {
    // Ignore quota errors
  }
  return nextValue;
}

export function getTodayWorkoutSession(): TodayWorkoutSession {
  const today = getLocalTodayString();
  if (typeof window === 'undefined') {
    return { date: today, exercises: [], checkedIds: {} };
  }
  try {
    const raw = localStorage.getItem(TODAY_SESSION_KEY);
    if (!raw) return { date: today, exercises: [], checkedIds: {} };
    const parsed = JSON.parse(raw) as TodayWorkoutSession;
    if (!parsed || parsed.date !== today) {
      return { date: today, exercises: [], checkedIds: {} };
    }
    return {
      date: today,
      exercises: Array.isArray(parsed.exercises) ? parsed.exercises : [],
      checkedIds:
        parsed.checkedIds && typeof parsed.checkedIds === 'object'
          ? parsed.checkedIds
          : {},
    };
  } catch {
    return { date: today, exercises: [], checkedIds: {} };
  }
}

function saveTodayWorkoutSession(session: TodayWorkoutSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TODAY_SESSION_KEY, JSON.stringify(session));
    dispatchSessionUpdate();
  } catch {
    // Ignore quota errors
  }
}

export function isExerciseInTodaySession(id: string): boolean {
  const session = getTodayWorkoutSession();
  return session.exercises.some((e) => e.id === id);
}

export function toggleExerciseInTodaySession(exercise: ExerciseItem): {
  added: boolean;
  session: TodayWorkoutSession;
} {
  const session = getTodayWorkoutSession();
  const exists = session.exercises.some((e) => e.id === exercise.id);
  const exercises = exists
    ? session.exercises.filter((e) => e.id !== exercise.id)
    : [...session.exercises, exercise];
  const checkedIds = { ...session.checkedIds };
  if (exists) {
    delete checkedIds[exercise.id];
  }
  const nextSession: TodayWorkoutSession = {
    date: session.date,
    exercises,
    checkedIds,
  };
  saveTodayWorkoutSession(nextSession);
  return { added: !exists, session: nextSession };
}

export function toggleExerciseCheckedInSession(id: string): TodayWorkoutSession {
  const session = getTodayWorkoutSession();
  const nextSession: TodayWorkoutSession = {
    ...session,
    checkedIds: {
      ...session.checkedIds,
      [id]: !session.checkedIds[id],
    },
  };
  saveTodayWorkoutSession(nextSession);
  return nextSession;
}
