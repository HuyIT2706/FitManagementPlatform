/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import apiClient from "../../api/axios";
import toast from "../../utils/toast";
import type { FoodItem } from "../../interface";

const QUICK_FILTERS = [
  { id: "ALL", label: "Tất cả", query: "" },
  { id: "MEAT", label: "Thịt & Cá", query: "thịt" },
  { id: "EGG", label: "Trứng & Sữa", query: "trứng" },
  { id: "VEG", label: "Rau củ", query: "rau" },
  { id: "RICE", label: "Cơm & Tinh bột", query: "cơm" },
  { id: "FRUIT", label: "Trái cây", query: "quả" },
];

function AddMealContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mealType = searchParams.get("type") || "BREAKFAST";
  const dateParam = searchParams.get("date");

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [weight, setWeight] = useState<number | "">(100);
  
  const [addedItems, setAddedItems] = useState<{ food: FoodItem; weightInGram: number }[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Debounce search input by 400ms to avoid overwhelming backend API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    fetchFoods(debouncedQuery);
  }, [debouncedQuery]);

  const fetchFoods = async (q: string = "") => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/nutrition/foods?q=${encodeURIComponent(q)}`);
      setFoods(res.data);
    } catch (error) {
      console.error("Error fetching foods:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterClick = (filter: typeof QUICK_FILTERS[0]) => {
    setSelectedFilter(filter.id);
    setQuery(filter.query);
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
      setWeight(100);
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
        logDate: dateParam || undefined,
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
      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/10 px-4 py-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold font-headline-md flex-1">Thêm {mealNameMap[mealType]}</h1>
        {addedItems.length > 0 && (
          <button 
            onClick={handleSaveMeal} 
            disabled={isSaving}
            className="px-5 py-2 bg-primary text-black rounded-full font-bold text-sm hover:opacity-90 transition-opacity shadow-[0_0_12px_rgba(102,200,28,0.4)]"
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
                  <button onClick={() => handleRemoveItem(index)} className="text-red-400 p-1.5 hover:bg-red-400/10 rounded-full transition-colors">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Search & Quick Filter Section */}
        <section className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              type="text" 
              placeholder="Tìm kiếm món ăn (tên, thành phần...)" 
              className="w-full bg-surface-bright/30 border border-white/10 rounded-full py-3.5 pl-12 pr-10 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>

          {/* Quick Filter Chips */}
          <div className="flex overflow-x-auto gap-2 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {QUICK_FILTERS.map((filter) => {
              const isActive = selectedFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => handleFilterClick(filter)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-primary text-dark-slate shadow-[0_0_10px_rgba(102,200,28,0.4)] scale-[1.02]"
                      : "bg-surface-bright/40 text-on-surface-variant border border-white/10 hover:bg-surface-bright hover:text-on-surface"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* Food Items List (Styled matching screenshot: round image, verified badge, title, portion/cal, + button) */}
          <div className="space-y-2.5 pt-2">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : foods.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant text-sm">Không tìm thấy món ăn phù hợp.</div>
            ) : (
              foods.map(food => (
                <div 
                  key={food.id} 
                  onClick={() => setSelectedFood(food)}
                  className="p-3.5 rounded-2xl bg-surface-bright/20 border border-white/10 hover:border-primary/40 hover:bg-surface-bright/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Round Image */}
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-white/15 shrink-0 bg-black/60 shadow-sm">
                      <img
                        src={food.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=120&q=80"}
                        alt={food.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Food Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-on-surface text-xs leading-snug line-clamp-2 capitalize">{food.name}</h3>
                        {food.source && (
                          <span
                            className="material-symbols-outlined text-[#0095F6] text-sm shrink-0"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                            title={food.source}
                          >
                            verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        100g, <strong className="text-on-surface font-semibold">{food.caloriesPer100g} kcal</strong>
                      </p>
                    </div>
                  </div>

                  {/* Add (+) Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFood(food);
                    }}
                    className="w-9 h-9 rounded-full border border-white/20 hover:border-primary hover:bg-primary hover:text-black text-on-surface flex items-center justify-center shrink-0 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xl">add</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Modal nhập trọng lượng Gram */}
      {selectedFood && (
        <div 
          onClick={() => setSelectedFood(null)}
          className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4 cursor-pointer animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#121620] border border-white/15 w-full md:w-[440px] rounded-t-[32px] md:rounded-[32px] p-6 space-y-6 text-white shadow-2xl relative cursor-default animate-in slide-in-from-bottom duration-200"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-white/15 shrink-0 bg-black/60">
                  <img
                    src={selectedFood.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=120&q=80"}
                    alt={selectedFood.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="font-bold text-lg leading-tight line-clamp-2 capitalize">{selectedFood.name}</h2>
                  <p className="text-m text-white/60 mt-0.5">Giá trị dinh dưỡng trên 100g</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedFood(null)} 
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-colors border border-white/10"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            
            {/* Weight Gram Input */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-white/70">Trọng lượng khẩu phần (Gram)</label>
              <div className="relative">
                <input 
                  type="number" 
                  className="w-full bg-white/[0.05] border border-white/15 rounded-2xl p-4 text-3xl font-extrabold text-center text-primary focus:outline-none focus:border-primary transition-colors"
                  placeholder="100"
                  value={weight}
                  onChange={e => setWeight(Number(e.target.value) || "")}
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-white/50">g</span>
              </div>
            </div>

            {/* Calculated Macros Box */}
            <div className="grid grid-cols-4 gap-2 bg-white/[0.04] border border-white/10 p-4 rounded-2xl">
              <div className="text-center">
                <p className="text-[11px] font-semibold text-white/50 mb-1">CALO</p>
                <p className="font-extrabold text-base text-primary">{weight ? Math.round(selectedFood.caloriesPer100g * Number(weight) / 100) : 0}</p>
              </div>
              <div className="text-center border-l border-white/10">
                <p className="text-[11px] font-semibold text-white/50 mb-1">PROTEIN</p>
                <p className="font-bold text-base text-[#0086C9]">{weight ? Math.round(selectedFood.proteinPer100g * Number(weight) / 100) : 0}g</p>
              </div>
              <div className="text-center border-l border-white/10">
                <p className="text-[11px] font-semibold text-white/50 mb-1">CARB</p>
                <p className="font-bold text-base text-[#EF6820]">{weight ? Math.round(selectedFood.carbsPer100g * Number(weight) / 100) : 0}g</p>
              </div>
              <div className="text-center border-l border-white/10">
                <p className="text-[11px] font-semibold text-white/50 mb-1">FAT</p>
                <p className="font-bold text-base text-[#F63D68]">{weight ? Math.round(selectedFood.fatPer100g * Number(weight) / 100) : 0}g</p>
              </div>
            </div>

            {/* Confirm Add Button */}
            <button 
              onClick={handleAddToList}
              disabled={!weight || Number(weight) <= 0}
              className="w-full bg-primary text-dark-slate font-bold py-3.5 rounded-2xl disabled:opacity-50 transition-all hover:opacity-90 shadow-[0_0_15px_rgba(102,200,28,0.4)] cursor-pointer"
            >
              Thêm vào bữa ăn
            </button>
          </div>
        </div>
      )}
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
