/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { Search, X, UtensilsCrossed, Plus, CheckCircle2, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import AppLoading from '../../../../../components/ui/AppLoading';
import apiClient from '../../../../../api/axios';
import toast from '../../../../../utils/toast';
import type { FoodItem, FoodPaginatedResponse } from '@repo/types';
import { QUICK_FILTERS } from '../../../../../components/nutrition/FoodSelector';

interface PtFoodSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetMealName: string;
  onAddFoodToMeal: (food: FoodItem, weightInGrams: number, macroText: string) => void;
}

const PtFoodSelectionModal = ({
  isOpen,
  onClose,
  targetMealName,
  onAddFoodToMeal,
}: PtFoodSelectionModalProps) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [weight, setWeight] = useState<number | ''>(100);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    apiClient
      .get<FoodPaginatedResponse | FoodItem[]>(
        `/nutrition/foods?q=${encodeURIComponent(debouncedQuery)}&page=${currentPage}&limit=8`
      )
      .then((res) => {
        if (res.data && 'data' in res.data && Array.isArray(res.data.data)) {
          setFoods(res.data.data);
          setTotalPages(res.data.totalPages || 1);
          setTotalCount(res.data.total || 0);
        } else if (Array.isArray(res.data)) {
          setFoods(res.data);
          setTotalPages(1);
          setTotalCount(res.data.length);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching foods for PT modal:', error);
        setLoading(false);
      });
  }, [isOpen, debouncedQuery, currentPage]);

  if (!isOpen) return null;

  const handleFilterClick = (filter: (typeof QUICK_FILTERS)[0]) => {
    setSelectedFilter(filter.id);
    setQuery(filter.query);
    setCurrentPage(1);
  };

  const handleConfirmAdd = () => {
    if (selectedFood && weight && Number(weight) > 0) {
      const numWeight = Number(weight);
      const cal = Math.round((selectedFood.caloriesPer100g * numWeight) / 100);
      const protein = Math.round((selectedFood.proteinPer100g * numWeight) / 100);
      const carbs = Math.round((selectedFood.carbsPer100g * numWeight) / 100);
      const fat = Math.round((selectedFood.fatPer100g * numWeight) / 100);

      const macroSummary = `${numWeight}g ${selectedFood.name} (${cal} kcal, ${protein}g P, ${carbs}g C, ${fat}g F)`;
      onAddFoodToMeal(selectedFood, numWeight, macroSummary);
      toast.success(`Đã thêm ${selectedFood.name} vào ${targetMealName}`);
      setSelectedFood(null);
      setWeight(100);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121814] border border-primary/30 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-[0_0_30px_rgba(102,200,28,0.15)] overflow-hidden relative text-left">
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center shrink-0">
              <UtensilsCrossed size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Thực đơn: {targetMealName}</h3>
              <p className="text-xs text-white/60">
                Tìm kiếm món ăn & tính toán Macro (Calo, Protein, Carbs, Fat) chính xác
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter and Search */}
        <div className="p-5 border-b border-white/10 space-y-4 bg-surface-bright/20">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 text-white/40" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm món ăn, thực phẩm (Ví dụ: ức gà, trứng, yến mạch)..."
              className="w-full bg-black/40 border border-white/15 rounded-2xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-primary transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-3 text-white/40 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 [&&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            {QUICK_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => handleFilterClick(filter)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedFilter === filter.id
                    ? 'bg-primary text-dark-slate shadow-[0_0_12px_rgba(102,200,28,0.3)] scale-105'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Food List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3 [&&::-webkit-scrollbar]:w-1.5 [&&::-webkit-scrollbar-thumb]:bg-primary/40 [&&::-webkit-scrollbar-thumb]:rounded-full [&&::-webkit-scrollbar-track]:bg-black/20">
          {loading ? (
            <AppLoading size="sm" message="Đang tìm món ăn..." />
          ) : foods.length === 0 ? (
            <div className="text-center py-12 text-white/50 space-y-2">
              <UtensilsCrossed size={36} className="mx-auto text-white/20" />
              <p className="text-sm font-medium">Không tìm thấy thực phẩm phù hợp</p>
            </div>
          ) : (
            foods.map((food) => (
              <div
                key={food.id}
                onClick={() => setSelectedFood(food)}
                className="p-3.5 rounded-2xl bg-surface-bright/20 border border-white/10 hover:border-primary/40 hover:bg-surface-bright/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-white/15 shrink-0 bg-black/60 shadow-sm">
                    <img
                      src={
                        food.imageUrl ||
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=120&q=80'
                      }
                      alt={food.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-on-surface text-xs leading-snug line-clamp-2 capitalize text-white">
                        {food.name}
                      </h4>
                      {food.source && (
                        <CheckCircle2 size={14} className="text-[#0095F6] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5 text-white/60">
                      100g, <strong className="text-primary font-bold">{food.caloriesPer100g} kcal</strong> • {food.proteinPer100g}g P • {food.carbsPer100g}g C • {food.fatPer100g}g F
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFood(food);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-primary/40 bg-primary/10 text-primary text-xs font-bold flex items-center gap-1 hover:bg-primary hover:text-dark-slate transition-all shrink-0 cursor-pointer"
                >
                  <Plus size={14} />
                  Chọn món
                </button>
              </div>
            ))
          )}
        </div>

        {/* Pagination Footer */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between gap-3 text-xs">
            <span className="text-white/60 font-medium">
              Trang <strong className="text-white">{currentPage}</strong> / {totalPages} ({totalCount} món)
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1 || loading}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/15 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-bold transition-all cursor-pointer"
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages || loading}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="px-3 py-1.5 rounded-xl bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-bold transition-all cursor-pointer"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Portion Weight Calculation Modal */}
        {selectedFood && (
          <div
            onClick={() => setSelectedFood(null)}
            className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#121620] border border-primary/40 w-full max-w-md rounded-3xl p-6 space-y-6 text-white shadow-2xl relative animate-in zoom-in-95 duration-200 text-left"
            >
              {/* Header */}
              <div className="flex justify-between items-start gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-white/15 shrink-0 bg-black/60">
                    <img
                      src={
                        selectedFood.imageUrl ||
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=120&q=80'
                      }
                      alt={selectedFood.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-base leading-tight capitalize text-white">
                      {selectedFood.name}
                    </h3>
                    <p className="text-xs text-white/60 mt-0.5">Chỉ định định lượng cho {targetMealName}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFood(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-colors border border-white/10 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Weight Input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-white/70">
                  Trọng lượng khẩu phần chỉ định (Gram):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full bg-white/[0.05] border border-primary/50 rounded-2xl p-4 text-3xl font-extrabold text-center text-primary focus:outline-none focus:border-primary transition-colors"
                    value={weight === 0 ? '' : weight}
                    onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                    autoFocus
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-white/50">
                    g
                  </span>
                </div>
              </div>

              {/* Real-time Calculated Nutrition Macros */}
              <div className="grid grid-cols-4 gap-2 bg-white/[0.04] border border-white/10 p-3.5 rounded-2xl">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-white/50 mb-1">CALO</p>
                  <p className="font-extrabold text-sm text-primary">
                    {weight ? Math.round((selectedFood.caloriesPer100g * Number(weight)) / 100) : 0}
                  </p>
                </div>
                <div className="text-center border-l border-white/10">
                  <p className="text-[10px] font-bold text-white/50 mb-1">PROTEIN</p>
                  <p className="font-bold text-sm text-amber-400">
                    {weight ? Math.round((selectedFood.proteinPer100g * Number(weight)) / 100) : 0}g
                  </p>
                </div>
                <div className="text-center border-l border-white/10">
                  <p className="text-[10px] font-bold text-white/50 mb-1">CARBS</p>
                  <p className="font-bold text-sm text-blue-400">
                    {weight ? Math.round((selectedFood.carbsPer100g * Number(weight)) / 100) : 0}g
                  </p>
                </div>
                <div className="text-center border-l border-white/10">
                  <p className="text-[10px] font-bold text-white/50 mb-1">FAT</p>
                  <p className="font-bold text-sm text-rose-400">
                    {weight ? Math.round((selectedFood.fatPer100g * Number(weight)) / 100) : 0}g
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFood(null)}
                  className="flex-1 py-3 rounded-2xl border border-white/10 text-white/70 hover:text-white font-bold text-xs cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAdd}
                  disabled={!weight || Number(weight) <= 0}
                  className="flex-2 bg-primary text-dark-slate font-extrabold py-3 rounded-2xl disabled:opacity-50 transition-all hover:bg-primary/90 shadow-[0_0_15px_rgba(102,200,28,0.4)] flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                >
                  <Check size={16} />
                  Thêm vào {targetMealName}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PtFoodSelectionModal;
