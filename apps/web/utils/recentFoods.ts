import type { FoodItem } from '@repo/types';

const RECENT_FOODS_KEY = 'fit_recent_foods_history';

export const getRecentFoods = (): FoodItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_FOODS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveRecentFood = (food: FoodItem) => {
  if (typeof window === 'undefined' || !food || !food.id) return;
  try {
    const existing = getRecentFoods();
    const filtered = existing.filter((item) => item.id !== food.id);
    const updated = [{ ...food, isRecent: true }, ...filtered].slice(0, 50);
    localStorage.setItem(RECENT_FOODS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving recent food:', err);
  }
};
