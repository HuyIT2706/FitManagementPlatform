/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import apiClient from "../../api/axios";
import toast from "../../utils/toast";
import type { FoodItem } from "../../interface";
import { useMealBuilderStore } from "../../services/useMealBuilderStore";

const QUICK_FILTERS = [
  { id: "ALL", label: "Tất cả", query: "" },
  { id: "MEAT", label: "Thịt & Cá", query: "thịt" },
  { id: "EGG", label: "Trứng & Sữa", query: "trứng" },
  { id: "VEG", label: "Rau củ", query: "rau" },
  { id: "RICE", label: "Cơm & Tinh bột", query: "cơm" },
  { id: "FRUIT", label: "Trái cây", query: "quả" },
];

interface FoodSelectorProps {
  onFoodAdded?: (food: FoodItem, weightInGram: number) => void;
  title?: string;
}

export default function FoodSelector({ onFoodAdded, title = "Thư viện thực phẩm" }: FoodSelectorProps) {
  const { addItem } = useMealBuilderStore();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [weight, setWeight] = useState<number | "">(100);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 800);

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

  const handleConfirmAdd = () => {
    if (selectedFood && weight && weight > 0) {
      const numWeight = Number(weight);
      addItem(selectedFood, numWeight);
      if (onFoodAdded) {
        onFoodAdded(selectedFood, numWeight);
      }
      toast.info(`Đã thêm ${selectedFood.name} (${numWeight}g)`);
      setSelectedFood(null);
      setWeight(100);
    }
  };

  return (
    <div className="space-y-4">
      {title && (
        <div className="px-1 flex items-center justify-between">
          <h3 className="font-bold text-lg text-on-surface">{title}</h3>
          <span className="text-xs text-on-surface-variant font-medium">
            {foods.length} món hiển thị
          </span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
          search
        </span>
        <input 
          type="text"
          suppressHydrationWarning
          placeholder="Tìm kiếm món ăn" 
          className="w-full bg-surface-bright/30 border border-white/10 rounded-full py-3.5 pl-12 pr-10 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            type="button"
            suppressHydrationWarning
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
              type="button"
              suppressHydrationWarning
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

      {/* Food Cards List */}
      <div className="space-y-2.5 pt-1">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : foods.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant text-sm">
            Không tìm thấy món ăn phù hợp.
          </div>
        ) : (
          foods.map((food) => (
            <div 
              key={food.id} 
              onClick={() => setSelectedFood(food)}
              className="p-3.5 rounded-2xl bg-surface-bright/20 border border-white/10 hover:border-primary/40 hover:bg-surface-bright/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Round Food Avatar */}
                <div className="w-12 h-12 rounded-full overflow-hidden border border-white/15 shrink-0 bg-black/60 shadow-sm">
                  <img
                    src={food.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=120&q=80"}
                    alt={food.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Food Details */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-on-surface text-xs leading-snug line-clamp-2 capitalize">
                      {food.name}
                    </h4>
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

              {/* Add Action Button */}
              <button
                type="button"
                suppressHydrationWarning
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

      {/* Input Portion Weight Modal */}
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
                  <h3 className="font-bold text-lg leading-tight line-clamp-2 capitalize">
                    {selectedFood.name}
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">Giá trị dinh dưỡng trên 100g</p>
                </div>
              </div>
              <button 
                type="button"
                suppressHydrationWarning
                onClick={() => setSelectedFood(null)} 
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-colors border border-white/10"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            
            {/* Gram Weight Input */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-white/70">Trọng lượng khẩu phần (Gram)</label>
              <div className="relative">
                <input 
                  type="number" 
                  suppressHydrationWarning
                  className="w-full bg-white/[0.05] border border-white/15 rounded-2xl p-4 text-3xl font-extrabold text-center text-primary focus:outline-none focus:border-primary transition-colors"
                  placeholder="100"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value) || "")}
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-white/50">g</span>
              </div>
            </div>

            {/* Nutrition Macros Breakdown */}
            <div className="grid grid-cols-4 gap-2 bg-white/[0.04] border border-white/10 p-4 rounded-2xl">
              <div className="text-center">
                <p className="text-[11px] font-semibold text-white/50 mb-1">CALO</p>
                <p className="font-extrabold text-base text-primary">
                  {weight ? Math.round((selectedFood.caloriesPer100g * Number(weight)) / 100) : 0}
                </p>
              </div>
              <div className="text-center border-l border-white/10">
                <p className="text-[11px] font-semibold text-white/50 mb-1">PROTEIN</p>
                <p className="font-bold text-base text-[#0086C9]">
                  {weight ? Math.round((selectedFood.proteinPer100g * Number(weight)) / 100) : 0}g
                </p>
              </div>
              <div className="text-center border-l border-white/10">
                <p className="text-[11px] font-semibold text-white/50 mb-1">CARB</p>
                <p className="font-bold text-base text-[#EF6820]">
                  {weight ? Math.round((selectedFood.carbsPer100g * Number(weight)) / 100) : 0}g
                </p>
              </div>
              <div className="text-center border-l border-white/10">
                <p className="text-[11px] font-semibold text-white/50 mb-1">FAT</p>
                <p className="font-bold text-base text-[#F63D68]">
                  {weight ? Math.round((selectedFood.fatPer100g * Number(weight)) / 100) : 0}g
                </p>
              </div>
            </div>

            {/* Confirm Add Button */}
            <button 
              type="button"
              suppressHydrationWarning
              onClick={handleConfirmAdd}
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
