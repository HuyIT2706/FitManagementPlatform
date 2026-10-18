import { formatYYYYMMDD } from './date';

const WATER_STORAGE_PREFIX = 'nutricore_water_';

export const getWaterStorageKey = (dateStr?: string): string => {
  const d = dateStr || formatYYYYMMDD(new Date());
  return `${WATER_STORAGE_PREFIX}${d}`;
};

export const getWaterForDate = (dateStr?: string): number => {
  if (typeof window === 'undefined') return 0;
  const key = getWaterStorageKey(dateStr);
  try {
    const val = localStorage.getItem(key);
    return val ? Math.max(0, parseInt(val, 10) || 0) : 0;
  } catch {
    return 0;
  }
};

export const saveWaterForDate = (amount: number, dateStr?: string): number => {
  if (typeof window === 'undefined') return amount;
  const targetDate = dateStr || formatYYYYMMDD(new Date());
  const key = getWaterStorageKey(targetDate);
  const safeAmount = Math.max(0, Math.round(amount));

  try {
    localStorage.setItem(key, safeAmount.toString());
    window.dispatchEvent(
      new CustomEvent('nutricore-water-updated', {
        detail: { date: targetDate, amount: safeAmount },
      })
    );
  } catch (err) {
    console.error('Failed to save water intake:', err);
  }

  return safeAmount;
};

export const addWaterForDate = (amountToAdd: number, dateStr?: string): number => {
  const current = getWaterForDate(dateStr);
  const newTotal = current + amountToAdd;
  return saveWaterForDate(newTotal, dateStr);
};
