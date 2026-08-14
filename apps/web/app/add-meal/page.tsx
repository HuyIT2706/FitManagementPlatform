/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import apiClient from "../../api/axios";
import toast from "../../utils/toast";
import { useMealBuilderStore } from "../../services/useMealBuilderStore";
import FoodSelector from "../../components/nutrition/FoodSelector";

function AddMealContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mealType = searchParams.get("type") || "BREAKFAST";
  const dateParam = searchParams.get("date");

  const {
    addedItems,
    removeItem,
    clearItems,
    getTotalCalories,
  } = useMealBuilderStore();

  const [isSaving, setIsSaving] = useState(false);

  const mealNameMap: Record<string, string> = {
    BREAKFAST: "Bữa Sáng",
    MORNING_SNACK: "Phụ Sáng",
    LUNCH: "Bữa Trưa",
    AFTERNOON_SNACK: "Phụ Chiều",
    DINNER: "Bữa Tối",
    SNACK: "Bữa Phụ",
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
    setIsSaving(true);
    try {
      await apiClient.post("/nutrition/meals", {
        mealName: mealType,
        logDate: dateParam || undefined,
        items: addedItems.map(item => ({
          foodId: item.food.id,
          weightInGram: item.weightInGram
        }))
      });
      toast.success(`Đã ghi nhận ${mealNameMap[mealType] || 'bữa ăn'}!`);
      clearItems();
      router.push("/home");
    } catch (error) {
      console.error("Failed to save meal:", error);
      toast.error("Không thể lưu bữa ăn. Vui lòng thử lại!");
      setIsSaving(false);
    }
  };

  const totalAddedCalories = getTotalCalories();

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/10 px-4 py-4 flex items-center gap-4">
        <button 
          type="button" 
          suppressHydrationWarning 
          onClick={() => router.back()} 
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold font-headline-md flex-1">Thêm {mealNameMap[mealType]}</h1>
        {addedItems.length > 0 && (
          <button 
            type="button"
            suppressHydrationWarning
            onClick={handleSaveMeal} 
            disabled={isSaving}
            className="px-5 py-2 bg-primary text-black rounded-full font-bold text-sm hover:opacity-90 transition-opacity shadow-[0_0_12px_rgba(102,200,28,0.4)] cursor-pointer"
          >
            {isSaving ? 'Đang lưu...' : 'Lưu lại'}
          </button>
        )}
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-6 pb-32">
        {/* Selected Items List Summary */}
        {addedItems.length > 0 && (
          <section className="bg-surface-bright/20 p-4 rounded-2xl border border-white/10 space-y-3">
            <h2 className="font-bold flex justify-between items-center text-sm">
              <span className="text-on-surface">Món ăn đã chọn ({addedItems.length})</span>
              <span className="text-primary font-bold text-base">{Math.round(totalAddedCalories)} kcal</span>
            </h2>
            <div className="space-y-2">
              {addedItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-background/70 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0 bg-black/40">
                      <img
                        src={item.food.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=120&q=80"}
                        alt={item.food.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm line-clamp-1 capitalize">{item.food.name}</h3>
                      <p className="text-xs text-on-surface-variant mt-0.5">{item.weightInGram}g • <strong className="text-primary">{Math.round(item.food.caloriesPer100g * item.weightInGram / 100)} kcal</strong></p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    suppressHydrationWarning 
                    onClick={() => handleRemoveItem(index)} 
                    className="text-red-400 p-1.5 hover:bg-red-400/10 rounded-full transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reusable Food Selector Component (Contains Search Debounce 400ms, Quick Filters & Card Design) */}
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
        <div className="min-h-screen flex items-center justify-center bg-background text-on-surface">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <AddMealContent />
    </Suspense>
  );
}
