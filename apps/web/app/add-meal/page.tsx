'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLoading from '../../components/ui/AppLoading';
import apiClient from '../../api/axios';
import toast from '../../utils/toast';
import { useMealBuilderStore } from '../../services/useMealBuilderStore';
import FoodSelector from '../../components/nutrition/FoodSelector';
import { mutate } from 'swr';
import { useCurrentUser, useDailyNutrition } from '../../hooks/swr';
import { broadcastSync } from '../../utils/realtimeSync';

import AddMealHeader from './components/AddMealHeader';
import SelectedFoodSummary from './components/SelectedFoodSummary';
import MealDatePickerBottomSheet, {
  type MealOption,
} from './components/MealDateDown';
import { SmartFoodInputView } from './components/SmartFoodInputView';
import { SmartFoodResultsView } from './components/FoodResultsView';
import type { SmartParsedFoodItem, SmartParseResponse, FoodPaginatedResponse } from '../../interface';
import { parseVietnameseFoodTokens } from '../../utils/smartFoodParser';
import { formatYYYYMMDD } from '../../utils/date';

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

const AddMealContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialType = searchParams.get('type') || 'BREAKFAST';
  const initialDate = searchParams.get('date') || formatYYYYMMDD(new Date());
  const initialMode = searchParams.get('mode');

  const [currentMealType, setCurrentMealType] = useState<string>(initialType);
  const [currentDateStr, setCurrentDateStr] = useState<string>(initialDate);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [viewMode, setViewMode] = useState<'standard' | 'smart-input' | 'smart-results'>(
    initialMode === 'smart-voice' || initialMode === 'smart-text' || initialMode === 'smart-camera'
      ? 'smart-input'
      : 'standard'
  );
  const [smartInputTab, setSmartInputTab] = useState<'voice' | 'text' | 'camera'>(
    initialMode === 'smart-text'
      ? 'text'
      : initialMode === 'smart-camera'
        ? 'camera'
        : 'voice'
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [smartResults, setSmartResults] = useState<SmartParsedFoodItem[]>([]);

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
    const m = searchParams.get('mode');
    if (t) setCurrentMealType(t);
    if (d) setCurrentDateStr(d);
    if (m === 'smart-voice') {
      setViewMode('smart-input');
      setSmartInputTab('voice');
    } else if (m === 'smart-text') {
      setViewMode('smart-input');
      setSmartInputTab('text');
    } else if (m === 'smart-camera') {
      setViewMode('smart-input');
      setSmartInputTab('camera');
    }
  }, [searchParams]);

  const { addedItems, removeItem, clearItems, getTotalCalories } = useMealBuilderStore();

  const [isSaving, setIsSaving] = useState(false);

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

      // Trigger realtime SWR cache invalidation immediately
      await Promise.all([
        mutate(`/nutrition/daily?date=${currentDateStr}`),
        mutate((key) => typeof key === 'string' && key.startsWith('/nutrition/daily')),
        mutate('/users/me'),
      ]);
      broadcastSync('MEAL_PLAN_UPDATED');

      router.push(`/home?date=${currentDateStr}`);
    } catch (error) {
      console.error('Failed to save meal:', error);
      toast.error('Không thể lưu bữa ăn. Vui lòng thử lại!');
      setIsSaving(false);
    }
  };

  const handleSmartAnalyze = async (rawText: string) => {
    setIsAnalyzing(true);
    try {
      const res = await apiClient.post<SmartParseResponse>('/nutrition/smart-parse', {
        text: rawText,
      });
      if (res.data?.allFoods && res.data.allFoods.length > 0) {
        setSmartResults(res.data.allFoods);
        setViewMode('smart-results');
      } else {
        const tokens = parseVietnameseFoodTokens(rawText);
        if (tokens.length > 0) {
          const fallbackResults: SmartParsedFoodItem[] = [];
          for (const token of tokens) {
            try {
              const searchRes = await apiClient.get<FoodPaginatedResponse>(
                `/nutrition/foods?q=${encodeURIComponent(token.query)}&limit=6`
              );
              const list = searchRes.data?.data || [];
              for (const f of list) {
                const cal = Math.round((f.caloriesPer100g * token.weight) / 100);
                fallbackResults.push({
                  ...f,
                  suggestedWeight: token.weight,
                  calculatedCalories: cal,
                  calculatedProtein: Math.round(((f.proteinPer100g * token.weight) / 100) * 10) / 10,
                  calculatedCarbs: Math.round(((f.carbsPer100g * token.weight) / 100) * 10) / 10,
                  calculatedFat: Math.round(((f.fatPer100g * token.weight) / 100) * 10) / 10,
                });
              }
            } catch {
              void 0;
            }
          }
          if (fallbackResults.length > 0) {
            setSmartResults(fallbackResults);
            setViewMode('smart-results');
            return;
          }
        }
        toast.info('Chưa tìm thấy món tương ứng trong thư viện. Bạn có thể tìm kiếm thủ công.');
        setSmartResults([]);
        setViewMode('smart-results');
      }
    } catch (error) {
      console.error('Smart parse error:', error);
      const tokens = parseVietnameseFoodTokens(rawText);
      const fallbackResults: SmartParsedFoodItem[] = [];
      for (const token of tokens) {
        try {
          const searchRes = await apiClient.get<FoodPaginatedResponse>(
            `/nutrition/foods?q=${encodeURIComponent(token.query)}&limit=6`
          );
          const list = searchRes.data?.data || [];
          for (const f of list) {
            const cal = Math.round((f.caloriesPer100g * token.weight) / 100);
            fallbackResults.push({
              ...f,
              suggestedWeight: token.weight,
              calculatedCalories: cal,
              calculatedProtein: Math.round(((f.proteinPer100g * token.weight) / 100) * 10) / 10,
              calculatedCarbs: Math.round(((f.carbsPer100g * token.weight) / 100) * 10) / 10,
              calculatedFat: Math.round(((f.fatPer100g * token.weight) / 100) * 10) / 10,
            });
          }
        } catch {
          void 0;
        }
      }
      if (fallbackResults.length > 0) {
        setSmartResults(fallbackResults);
        setViewMode('smart-results');
      } else {
        toast.error('Không thể tìm món, vui lòng thử lại hoặc tìm kiếm thủ công.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSmartImageAnalyze = async (base64Image: string) => {
    setIsAnalyzing(true);
    try {
      const res = await apiClient.post<SmartParseResponse>(
        '/nutrition/smart-image-parse',
        {
          imageBase64: base64Image,
        }
      );
      if (res.data?.allFoods && res.data.allFoods.length > 0) {
        setSmartResults(res.data.allFoods);
        setViewMode('smart-results');
        if (res.data.rawDetectedText) {
          toast.success(`Nhận diện: ${res.data.rawDetectedText}`);
        }
      } else {
        const msg =
          res.data?.rawDetectedText ||
          'Chưa tìm thấy món tương ứng trong thư viện từ ảnh. Bạn có thể tìm kiếm thủ công!';
        toast.info(msg);
        setSmartResults([]);
        setViewMode('smart-results');
      }
    } catch (error: unknown) {
      console.error('Failed to parse food image:', error);
      toast.error('Không thể phân tích ảnh món ăn. Vui lòng thử lại!');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const totalAddedCalories = getTotalCalories();
  const mealTitle = mealFullTitleMap[currentMealType] || 'Bữa ăn';
  const mealShortName = mealShortNameMap[currentMealType] || 'Bữa ăn';
  const displayShortDate = formatDisplayShortDate(currentDateStr);

  if (viewMode === 'smart-input') {
    return (
      <>
        <SmartFoodInputView
          initialTab={smartInputTab}
          onBack={() => {
            if (initialMode) {
              router.back();
            } else {
              setViewMode('standard');
            }
          }}
          onAnalyze={handleSmartAnalyze}
          onAnalyzeImage={handleSmartImageAnalyze}
          isAnalyzing={isAnalyzing}
          onManualSearch={() => setViewMode('standard')}
        />
        <MealDatePickerBottomSheet
          isOpen={isDatePickerOpen}
          onClose={() => setIsDatePickerOpen(false)}
          selectedMeal={currentMealType}
          selectedDate={currentDateStr}
          mealOptions={mealOptionsWithCurrent}
          onApply={handleApplyMealDate}
        />
      </>
    );
  }

  if (viewMode === 'smart-results') {
    return (
      <>
        <SmartFoodResultsView
          mealShortName={mealShortName}
          displayDate={displayShortDate}
          onOpenMealDatePicker={() => setIsDatePickerOpen(true)}
          onBack={() => setViewMode('smart-input')}
          onReopenSmartInput={() => setViewMode('smart-input')}
          results={smartResults}
          onFinish={() => setViewMode('standard')}
        />
        <MealDatePickerBottomSheet
          isOpen={isDatePickerOpen}
          onClose={() => setIsDatePickerOpen(false)}
          selectedMeal={currentMealType}
          selectedDate={currentDateStr}
          mealOptions={mealOptionsWithCurrent}
          onApply={handleApplyMealDate}
        />
      </>
    );
  }

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
        onOpenCameraInput={() => {
          setSmartInputTab('camera');
          setViewMode('smart-input');
        }}
        onOpenSmartInput={() => {
          setSmartInputTab('voice');
          setViewMode('smart-input');
        }}
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
