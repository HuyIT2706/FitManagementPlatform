'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLoading from '../../components/ui/AppLoading';
import apiClient from '../../api/axios';
import toast from '../../utils/toast';
import { useMealBuilderStore } from '../../services/useMealBuilderStore';
import FoodSelector from '../../components/nutrition/FoodSelector';
import { useCurrentUser, useDailyNutrition } from '../../hooks/swr';

import AddMealHeader from './components/AddMealHeader';
import SelectedFoodSummary from './components/SelectedFoodSummary';
import MealDatePickerBottomSheet, {
  type MealOption,
} from './components/MealDateDown';
import { formatYYYYMMDD } from '../../utils/date';

const AddMealContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialType = searchParams.get('type') || 'BREAKFAST';
  const initialDate = searchParams.get('date') || formatYYYYMMDD(new Date());

  const [currentMealType, setCurrentMealType] = useState<string>(initialType);
  const [currentDateStr, setCurrentDateStr] = useState<string>(initialDate);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const { data: userData } = useCurrentUser();
  const { data: dailyData } = useDailyNutrition(currentDateStr);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      router.replace('/login');
    }
  }, [router]);

  useEffect(() => {
    const t = searchParams.get('type');
    const d = searchParams.get('date');
    if (t) setCurrentMealType(t);
    if (d) setCurrentDateStr(d);
  }, [searchParams]);

  const { addedItems, removeItem, clearItems, getTotalCalories } = useMealBuilderStore();

  const [isSaving, setIsSaving] = useState(false);

  const mealFullTitleMap: Record<string, string> = {
    BREAKFAST: 'Bữa Sáng',
    MORNING_SNACK: 'Phụ Sáng',
    LUNCH: 'Bữa Trưa',
    AFTERNOON_SNACK: 'Phụ Chiều',
    DINNER: 'Bữa Tối',
    SNACK: 'Bữa Phụ',
  };

  const mealShortNameMap: Record<string, string> = {
    BREAKFAST: 'Sáng',
    MORNING_SNACK: 'Phụ Sáng',
    LUNCH: 'Trưa',
    AFTERNOON_SNACK: 'Phụ Chiều',
    DINNER: 'Tối',
    SNACK: 'Phụ',
  };

  // Strictly filter meal options matching user's configured meal slots
  const availableMealOptions: MealOption[] = useMemo(() => {
    if (dailyData?.mealSlots && dailyData.mealSlots.length > 0) {
      return dailyData.mealSlots.map((slot) => ({
        id: slot.id,
        label: slot.name,
        shortLabel:
          slot.id === 'BREAKFAST'
            ? 'Sáng'
            : slot.id === 'LUNCH'
              ? 'Trưa'
              : slot.id === 'DINNER'
                ? 'Tối'
                : slot.id === 'SNACK'
                  ? 'Phụ'
                  : slot.id === 'MORNING_SNACK'
                    ? 'Phụ Sáng'
                    : slot.id === 'AFTERNOON_SNACK'
                      ? 'Phụ Chiều'
                      : slot.name,
      }));
    }

    const freq = userData?.mealFrequency;
    switch (freq) {
      case 2:
        return [
          { id: 'BREAKFAST', shortLabel: 'Sáng', label: 'Bữa Sáng' },
          { id: 'DINNER', shortLabel: 'Tối', label: 'Bữa Tối' },
        ];
      case 3:
        return [
          { id: 'BREAKFAST', shortLabel: 'Sáng', label: 'Bữa Sáng' },
          { id: 'LUNCH', shortLabel: 'Trưa', label: 'Bữa Trưa' },
          { id: 'DINNER', shortLabel: 'Tối', label: 'Bữa Tối' },
        ];
      case 5:
        return [
          { id: 'BREAKFAST', shortLabel: 'Sáng', label: 'Bữa Sáng' },
          { id: 'MORNING_SNACK', shortLabel: 'Phụ Sáng', label: 'Phụ Sáng' },
          { id: 'LUNCH', shortLabel: 'Trưa', label: 'Bữa Trưa' },
          { id: 'AFTERNOON_SNACK', shortLabel: 'Phụ Chiều', label: 'Phụ Chiều' },
          { id: 'DINNER', shortLabel: 'Tối', label: 'Bữa Tối' },
        ];
      case 4:
      default:
        return [
          { id: 'BREAKFAST', shortLabel: 'Sáng', label: 'Bữa Sáng' },
          { id: 'LUNCH', shortLabel: 'Trưa', label: 'Bữa Trưa' },
          { id: 'DINNER', shortLabel: 'Tối', label: 'Bữa Tối' },
          { id: 'SNACK', shortLabel: 'Phụ', label: 'Bữa Phụ' },
        ];
    }
  }, [dailyData?.mealSlots, userData?.mealFrequency]);

  const mealOptionsWithCurrent = useMemo(() => {
    const exists = availableMealOptions.some((m) => m.id === currentMealType);
    if (!exists && currentMealType) {
      const fallbackShort = mealShortNameMap[currentMealType] || currentMealType;
      const fallbackFull = mealFullTitleMap[currentMealType] || currentMealType;
      return [
        ...availableMealOptions,
        { id: currentMealType, shortLabel: fallbackShort, label: fallbackFull },
      ];
    }
    return availableMealOptions;
  }, [availableMealOptions, currentMealType]);

  const formatDisplayShortDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return dateStr;
  };

  const handleRemoveItem = (index: number) => {
    const removedItem = addedItems[index];
    removeItem(index);
    if (removedItem) {
      toast.info(`Đã bỏ ${removedItem.food.name}`);
    }
  };

  const handleApplyMealDate = (newType: string, newDate: string) => {
    setCurrentMealType(newType);
    setCurrentDateStr(newDate);
    router.replace(`/add-meal?type=${newType}&date=${newDate}`, { scroll: false });
    toast.info(`Đã chuyển sang ${mealFullTitleMap[newType] || newType} - ${formatDisplayShortDate(newDate)}`);
  };

  const handleSaveMeal = async () => {
    if (addedItems.length === 0) return;

    if (currentDateStr) {
      const targetDate = new Date(currentDateStr);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      if (targetDate > todayEnd) {
        toast.error('Không thể ghi nhận bữa ăn cho các ngày ở tương lai!');
        return;
      }
    }

    setIsSaving(true);
    try {
      await apiClient.post('/nutrition/meals', {
        mealName: currentMealType,
        logDate: currentDateStr,
        items: addedItems.map((item) => ({
          foodId: item.food.id,
          weightInGram: item.weightInGram,
        })),
      });
      toast.success(`Đã ghi nhận ${mealFullTitleMap[currentMealType] || 'bữa ăn'}!`);
      clearItems();
      router.push(`/home?date=${currentDateStr}`);
    } catch (error) {
      console.error('Failed to save meal:', error);
      toast.error('Không thể lưu bữa ăn. Vui lòng thử lại!');
      setIsSaving(false);
    }
  };

  const totalAddedCalories = getTotalCalories();
  const mealTitle = mealFullTitleMap[currentMealType] || 'Bữa ăn';
  const mealShortName = mealShortNameMap[currentMealType] || 'Bữa ăn';
  const displayShortDate = formatDisplayShortDate(currentDateStr);

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Sticky Header Bar with Centered Meal Dropdown */}
      <AddMealHeader
        mealTitle={mealTitle}
        mealShortName={mealShortName}
        displayDate={displayShortDate}
        addedItemsCount={addedItems.length}
        isSaving={isSaving}
        onBack={() => router.back()}
        onSaveMeal={handleSaveMeal}
        onOpenMealDatePicker={() => setIsDatePickerOpen(true)}
      />

      {/* Bottom Sheet for changing meal and past date */}
      <MealDatePickerBottomSheet
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        selectedMeal={currentMealType}
        selectedDate={currentDateStr}
        mealOptions={mealOptionsWithCurrent}
        onApply={handleApplyMealDate}
      />

      <main className="p-4 max-w-2xl mx-auto space-y-6 pb-32">
        {/* Selected Items List Summary */}
        <SelectedFoodSummary
          addedItems={addedItems}
          totalAddedCalories={totalAddedCalories}
          onRemoveItem={handleRemoveItem}
        />

        {/* Reusable Food Selector Component */}
        <section>
          <FoodSelector />
        </section>
      </main>
    </div>
  );
};

const AddMealPage = () => {
  return (
    <Suspense
      fallback={
        <AppLoading fullScreen size="lg" message="Đang nạp công cụ ghi nhận bữa ăn..." />
      }
    >
      <AddMealContent />
    </Suspense>
  );
};

export default AddMealPage;
