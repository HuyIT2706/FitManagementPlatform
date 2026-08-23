'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLoading from '../../components/ui/AppLoading';
import apiClient from '../../api/axios';
import toast from '../../utils/toast';
import { useMealBuilderStore } from '../../services/useMealBuilderStore';
import FoodSelector from '../../components/nutrition/FoodSelector';

import AddMealHeader from './components/AddMealHeader';
import SelectedFoodSummary from './components/SelectedFoodSummary';

function AddMealContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mealType = searchParams.get('type') || 'BREAKFAST';
  const dateParam = searchParams.get('date');

  const { addedItems, removeItem, clearItems, getTotalCalories } = useMealBuilderStore();

  const [isSaving, setIsSaving] = useState(false);

  const mealNameMap: Record<string, string> = {
    BREAKFAST: 'Bữa Sáng',
    MORNING_SNACK: 'Phụ Sáng',
    LUNCH: 'Bữa Trưa',
    AFTERNOON_SNACK: 'Phụ Chiều',
    DINNER: 'Bữa Tối',
    SNACK: 'Bữa Phụ',
  };

  const handleRemoveItem = (index: number) => {
    const removedItem = addedItems[index];
    removeItem(index);
    if (removedItem) {
      toast.info(`Đã bỏ ${removedItem.food.name}`);
    }
  };

  const handleSaveMeal = async () => {
    if (addedItems.length === 0) return;

    if (dateParam) {
      const targetDate = new Date(dateParam);
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
        mealName: mealType,
        logDate: dateParam || undefined,
        items: addedItems.map((item) => ({
          foodId: item.food.id,
          weightInGram: item.weightInGram,
        })),
      });
      toast.success(`Đã ghi nhận ${mealNameMap[mealType] || 'bữa ăn'}!`);
      clearItems();
      router.push('/home');
    } catch (error) {
      console.error('Failed to save meal:', error);
      toast.error('Không thể lưu bữa ăn. Vui lòng thử lại!');
      setIsSaving(false);
    }
  };

  const totalAddedCalories = getTotalCalories();
  const mealTitle = mealNameMap[mealType] || 'Bữa ăn';

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Sticky Header Bar */}
      <AddMealHeader
        mealTitle={mealTitle}
        addedItemsCount={addedItems.length}
        isSaving={isSaving}
        onBack={() => router.back()}
        onSaveMeal={handleSaveMeal}
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
          <FoodSelector title="Tìm kiếm & Chọn thực phẩm" />
        </section>
      </main>
    </div>
  );
}

export default function AddMealPage() {
  return (
    <Suspense
      fallback={
        <AppLoading fullScreen size="lg" message="Đang nạp công cụ ghi nhận bữa ăn..." />
      }
    >
      <AddMealContent />
    </Suspense>
  );
}
