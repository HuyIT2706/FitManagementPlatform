"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import apiClient from "../../api/axios";
import toast from "../../utils/toast";
import type { FoodItem } from "../../interface";

export default function AddMealPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mealType = searchParams.get("type") || "BREAKFAST"; // BREAKFAST, LUNCH, DINNER, SNACK

  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [weight, setWeight] = useState<number | "">("");
  
  const [addedItems, setAddedItems] = useState<{ food: FoodItem, weightInGram: number }[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Initial fetch for popular foods
    fetchFoods();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchFoods(query);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  const fetchFoods = async (q: string = "") => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/nutrition/foods?q=${q}`);
      setFoods(res.data);
    } catch (error) {
      console.error("Error fetching foods:", error);
    } finally {
      setLoading(false);
    }
  };

  const mealNameMap: Record<string, string> = {
    BREAKFAST: "Bữa Sáng",
    MORNING_SNACK: "Phụ Sáng",
    LUNCH: "Bữa Trưa",
    AFTERNOON_SNACK: "Phụ Chiều",
    DINNER: "Bữa Tối",
    SNACK: "Bữa Phụ",
  };

  const handleAddToList = () => {
    if (selectedFood && weight && weight > 0) {
      setAddedItems([...addedItems, { food: selectedFood, weightInGram: Number(weight) }]);
      toast.info(`Đã thêm ${selectedFood.name} (${weight}g)`);
      setSelectedFood(null);
      setWeight("");
      setQuery("");
    }
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...addedItems];
    const removed = newItems.splice(index, 1);
    setAddedItems(newItems);
    if (removed[0]) {
      toast.info(`Đã bỏ ${removed[0].food.name}`);
    }
  };

  const handleSaveMeal = async () => {
    if (addedItems.length === 0) return;
    setIsSaving(true);
    try {
      await apiClient.post("/nutrition/meals", {
        mealName: mealType,
        items: addedItems.map(item => ({
          foodId: item.food.id,
          weightInGram: item.weightInGram
        }))
      });
      toast.success(`Đã ghi nhận ${mealNameMap[mealType] || 'bữa ăn'}!`);
      router.push("/home");
    } catch (error) {
      console.error("Failed to save meal:", error);
      toast.error("Không thể lưu bữa ăn. Vui lòng thử lại!");
      setIsSaving(false);
    }
  };

  const totalAddedCalories = addedItems.reduce((acc, curr) => acc + (curr.food.caloriesPer100g * curr.weightInGram / 100), 0);

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/10 px-4 py-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold font-headline-md flex-1">Thêm {mealNameMap[mealType]}</h1>
        {addedItems.length > 0 && (
          <button 
            onClick={handleSaveMeal} 
            disabled={isSaving}
            className="px-4 py-1.5 bg-primary text-white rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
          >
            {isSaving ? 'Đang lưu...' : 'Lưu lại'}
          </button>
        )}
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-6 pb-32">
        {addedItems.length > 0 && (
          <section className="bg-surface-bright/20 p-4 rounded-2xl border border-white/5">
            <h2 className="font-bold mb-3 flex justify-between">
              <span>Đã chọn ({addedItems.length})</span>
              <span className="text-green-light">{Math.round(totalAddedCalories)} kcal</span>
            </h2>
            <div className="space-y-3">
              {addedItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-background/50 p-3 rounded-xl">
                  <div>
                    <h3 className="font-semibold text-sm">{item.food.name}</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">{item.weightInGram}g • {Math.round(item.food.caloriesPer100g * item.weightInGram / 100)} kcal</p>
                  </div>
                  <button onClick={() => handleRemoveItem(index)} className="text-red-400 p-1 hover:bg-red-400/10 rounded-full">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="relative mb-6">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              type="text" 
              placeholder="Tìm kiếm thực phẩm..." 
              className="w-full bg-surface-bright/30 border border-white/10 rounded-full py-3 pl-12 pr-4 text-on-surface focus:outline-none focus:border-primary transition-colors"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-on-surface-variant">Đang tìm kiếm...</div>
            ) : foods.length === 0 ? (
              <div className="text-center py-8 text-on-surface-variant">Không tìm thấy thực phẩm.</div>
            ) : (
              foods.map(food => (
                <div 
                  key={food.id} 
                  onClick={() => setSelectedFood(food)}
                  className="p-4 rounded-2xl bg-surface-bright/10 border border-white/5 hover:bg-surface-bright/30 transition-colors cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-bold text-on-surface">{food.name}</h3>
                    <p className="text-sm text-on-surface-variant mt-1">{food.caloriesPer100g} kcal / 100g</p>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-green-light/10 text-green-light flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Modal nhập số lượng */}
      {selectedFood && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center">
          <div className="bg-surface-dim w-full md:w-[400px] rounded-t-3xl md:rounded-3xl p-6 border border-white/10 shadow-2xl transform transition-transform">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-xl">{selectedFood.name}</h2>
              <button onClick={() => setSelectedFood(null)} className="text-on-surface-variant p-1 bg-surface-bright/20 rounded-full">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm text-on-surface-variant mb-2">Trọng lượng (Gram)</label>
              <input 
                type="number" 
                className="w-full bg-surface-bright/30 border border-white/10 rounded-xl p-4 text-2xl font-bold text-center focus:outline-none focus:border-primary"
                placeholder="100"
                value={weight}
                onChange={e => setWeight(Number(e.target.value) || "")}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-4 gap-2 mb-8 bg-surface-bright/20 p-4 rounded-xl">
              <div className="text-center">
                <p className="text-xs text-on-surface-variant mb-1">Calo</p>
                <p className="font-bold text-green-light">{weight ? Math.round(selectedFood.caloriesPer100g * Number(weight) / 100) : 0}</p>
              </div>
              <div className="text-center border-l border-white/10">
                <p className="text-xs text-on-surface-variant mb-1">Pro</p>
                <p className="font-bold text-[#0086C9]">{weight ? Math.round(selectedFood.proteinPer100g * Number(weight) / 100) : 0}g</p>
              </div>
              <div className="text-center border-l border-white/10">
                <p className="text-xs text-on-surface-variant mb-1">Carb</p>
                <p className="font-bold text-[#EF6820]">{weight ? Math.round(selectedFood.carbsPer100g * Number(weight) / 100) : 0}g</p>
              </div>
              <div className="text-center border-l border-white/10">
                <p className="text-xs text-on-surface-variant mb-1">Fat</p>
                <p className="font-bold text-[#F63D68]">{weight ? Math.round(selectedFood.fatPer100g * Number(weight) / 100) : 0}g</p>
              </div>
            </div>

            <button 
              onClick={handleAddToList}
              disabled={!weight || Number(weight) <= 0}
              className="w-full bg-primary text-black font-bold py-4 rounded-xl disabled:opacity-50 transition-opacity"
            >
              Thêm vào bữa ăn
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
