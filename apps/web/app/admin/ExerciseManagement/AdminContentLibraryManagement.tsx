/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Utensils,
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Flame,
} from 'lucide-react';
import apiClient from '../../../api/axios';
import { toast } from '../../../utils/toast';

interface ExerciseItem {
  id: string;
  name: string;
  category?: string;
  equipment?: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  setupImageUrl?: string;
  startImageUrl?: string;
}

interface FoodItem {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g?: number;
  category?: string;
  imageUrl?: string;
}

export default function AdminContentLibraryManagement() {
  const [activeTab, setActiveTab] = useState<'EXERCISES' | 'FOODS'>('EXERCISES');

  // =====================
  // EXERCISES STATE
  // =====================
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [exTotal, setExTotal] = useState(0);
  const [exPage, setExPage] = useState(1);
  const [exTotalPages, setExTotalPages] = useState(1);
  const [exLoading, setExLoading] = useState(true);
  const [exSearch, setExSearch] = useState('');
  const [exCategory, setExCategory] = useState('ALL');

  // Exercise Modal (Add/Edit)
  const [isExModalOpen, setIsExModalOpen] = useState(false);
  const [editingEx, setEditingEx] = useState<ExerciseItem | null>(null);
  const [exFormName, setExFormName] = useState('');
  const [exFormCategory, setExFormCategory] = useState('CHEST');
  const [exFormEquipment, setExFormEquipment] = useState('Dumbbell');
  const [exFormPrimaryMuscles, setExFormPrimaryMuscles] = useState('');
  const [exFormInstructions, setExFormInstructions] = useState('');
  const [exFormSetupUrl, setExFormSetupUrl] = useState('');
  const [exFormStartUrl, setExFormStartUrl] = useState('');

  // Exercise Delete Modal
  const [exToDelete, setExToDelete] = useState<ExerciseItem | null>(null);

  // =====================
  // FOODS STATE
  // =====================
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [foodTotal, setFoodTotal] = useState(0);
  const [foodPage, setFoodPage] = useState(1);
  const [foodTotalPages, setFoodTotalPages] = useState(1);
  const [foodLoading, setFoodLoading] = useState(true);
  const [foodSearch, setFoodSearch] = useState('');
  const [foodCategory, setFoodCategory] = useState('ALL');

  // Food Modal (Add/Edit)
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [foodFormName, setFoodFormName] = useState('');
  const [foodFormCategory, setFoodFormCategory] = useState('Món ăn Việt');
  const [foodFormCalo, setFoodFormCalo] = useState('100');
  const [foodFormProtein, setFoodFormProtein] = useState('10');
  const [foodFormCarbs, setFoodFormCarbs] = useState('15');
  const [foodFormFat, setFoodFormFat] = useState('2');
  const [foodFormFiber, setFoodFormFiber] = useState('1');
  const [foodFormImage, setFoodFormImage] = useState('');

  // Food Delete Modal
  const [foodToDelete, setFoodToDelete] = useState<FoodItem | null>(null);

  const [submitting, setSubmitting] = useState(false);

  // =====================
  // FETCH EXERCISES
  // =====================
  const fetchExercises = (pageNumber = exPage) => {
    setExLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(pageNumber));
    params.set('limit', '10');
    if (exCategory !== 'ALL') params.set('category', exCategory);
    if (exSearch.trim()) params.set('search', exSearch.trim());

    apiClient
      .get<{ data: ExerciseItem[]; total: number; totalPages: number }>(
        `/admin/exercises?${params.toString()}`
      )
      .then((res) => {
        setExercises(res.data.data);
        setExTotal(res.data.total);
        setExPage(pageNumber);
        setExTotalPages(res.data.totalPages || 1);
        setExLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching exercises:', err);
        setExLoading(false);
        toast.error('Không thể tải danh sách bài tập');
      });
  };

  // =====================
  // FETCH FOODS
  // =====================
  const fetchFoods = (pageNumber = foodPage) => {
    setFoodLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(pageNumber));
    params.set('limit', '10');
    if (foodCategory !== 'ALL') params.set('category', foodCategory);
    if (foodSearch.trim()) params.set('search', foodSearch.trim());

    apiClient
      .get<{ data: FoodItem[]; total: number; totalPages: number }>(
        `/admin/foods?${params.toString()}`
      )
      .then((res) => {
        setFoods(res.data.data);
        setFoodTotal(res.data.total);
        setFoodPage(pageNumber);
        setFoodTotalPages(res.data.totalPages || 1);
        setFoodLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching foods:', err);
        setFoodLoading(false);
        toast.error('Không thể tải danh sách món ăn');
      });
  };

  useEffect(() => {
    if (activeTab === 'EXERCISES') {
      fetchExercises(1);
    } else {
      fetchFoods(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, exCategory, foodCategory]);

  // =====================
  // EXERCISE MODAL HANDLERS
  // =====================
  const handleOpenAddExModal = () => {
    setEditingEx(null);
    setExFormName('');
    setExFormCategory('CHEST');
    setExFormEquipment('Dumbbell');
    setExFormPrimaryMuscles('Ngực');
    setExFormInstructions('');
    setExFormSetupUrl('');
    setExFormStartUrl('');
    setIsExModalOpen(true);
  };

  const handleOpenEditExModal = (ex: ExerciseItem) => {
    setEditingEx(ex);
    setExFormName(ex.name);
    setExFormCategory(ex.category || 'CHEST');
    setExFormEquipment(ex.equipment || 'Dumbbell');
    setExFormPrimaryMuscles(ex.primaryMuscles.join(', '));
    setExFormInstructions(ex.instructions.join('\n'));
    setExFormSetupUrl(ex.setupImageUrl || '');
    setExFormStartUrl(ex.startImageUrl || '');
    setIsExModalOpen(true);
  };

  const handleSaveExercise = () => {
    if (!exFormName.trim()) {
      toast.error('Vui lòng nhập tên bài tập!');
      return;
    }

    setSubmitting(true);
    const payload = {
      name: exFormName.trim(),
      category: exFormCategory,
      equipment: exFormEquipment,
      primaryMuscles: exFormPrimaryMuscles.split(',').map((s) => s.trim()).filter(Boolean),
      instructions: exFormInstructions.split('\n').map((s) => s.trim()).filter(Boolean),
      setupImageUrl: exFormSetupUrl.trim() || undefined,
      startImageUrl: exFormStartUrl.trim() || undefined,
    };

    const request = editingEx
      ? apiClient.put(`/admin/exercises/${editingEx.id}`, payload)
      : apiClient.post('/admin/exercises', payload);

    request
      .then((res) => {
        toast.success(res.data.message || 'Lưu bài tập thành công!');
        setIsExModalOpen(false);
        fetchExercises(exPage);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Không thể lưu bài tập!');
      })
      .finally(() => setSubmitting(false));
  };

  const handleDeleteExercise = () => {
    if (!exToDelete) return;
    setSubmitting(true);
    apiClient
      .delete(`/admin/exercises/${exToDelete.id}`)
      .then((res) => {
        toast.success(res.data.message || 'Xóa bài tập thành công!');
        setExToDelete(null);
        fetchExercises(exPage);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Không thể xóa bài tập này!');
      })
      .finally(() => setSubmitting(false));
  };

  // =====================
  // FOOD MODAL HANDLERS
  // =====================
  const handleOpenAddFoodModal = () => {
    setEditingFood(null);
    setFoodFormName('');
    setFoodFormCategory('Món ăn Việt');
    setFoodFormCalo('150');
    setFoodFormProtein('15');
    setFoodFormCarbs('10');
    setFoodFormFat('3');
    setFoodFormFiber('1');
    setFoodFormImage('');
    setIsFoodModalOpen(true);
  };

  const handleOpenEditFoodModal = (food: FoodItem) => {
    setEditingFood(food);
    setFoodFormName(food.name);
    setFoodFormCategory(food.category || 'Món ăn Việt');
    setFoodFormCalo(String(food.caloriesPer100g));
    setFoodFormProtein(String(food.proteinPer100g));
    setFoodFormCarbs(String(food.carbsPer100g));
    setFoodFormFat(String(food.fatPer100g));
    setFoodFormFiber(food.fiberPer100g ? String(food.fiberPer100g) : '');
    setFoodFormImage(food.imageUrl || '');
    setIsFoodModalOpen(true);
  };

  const handleSaveFood = () => {
    if (!foodFormName.trim()) {
      toast.error('Vui lòng nhập tên món ăn!');
      return;
    }

    setSubmitting(true);
    const payload = {
      name: foodFormName.trim(),
      category: foodFormCategory,
      caloriesPer100g: Number(foodFormCalo) || 0,
      proteinPer100g: Number(foodFormProtein) || 0,
      carbsPer100g: Number(foodFormCarbs) || 0,
      fatPer100g: Number(foodFormFat) || 0,
      fiberPer100g: foodFormFiber ? Number(foodFormFiber) : undefined,
      imageUrl: foodFormImage.trim() || undefined,
    };

    const request = editingFood
      ? apiClient.put(`/admin/foods/${editingFood.id}`, payload)
      : apiClient.post('/admin/foods', payload);

    request
      .then((res) => {
        toast.success(res.data.message || 'Lưu món ăn thành công!');
        setIsFoodModalOpen(false);
        fetchFoods(foodPage);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Không thể lưu món ăn!');
      })
      .finally(() => setSubmitting(false));
  };

  const handleDeleteFood = () => {
    if (!foodToDelete) return;
    setSubmitting(true);
    apiClient
      .delete(`/admin/foods/${foodToDelete.id}`)
      .then((res) => {
        toast.success(res.data.message || 'Xóa món ăn thành công!');
        setFoodToDelete(null);
        fetchFoods(foodPage);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Không thể xóa món ăn này!');
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher: Exercises vs Foods */}
      <div className="flex items-center justify-between gap-4 bg-[#121a15] p-3 rounded-2xl border border-white/10">
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('EXERCISES')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'EXERCISES'
                ? 'bg-[#10b981] text-[#003824] shadow-md shadow-[#10b981]/20'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Dumbbell size={16} />
            Thư Viện Bài Tập ({exTotal})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('FOODS')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'FOODS'
                ? 'bg-[#10b981] text-[#003824] shadow-md shadow-[#10b981]/20'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Utensils size={16} />
            Thư Viện Món Ăn ({foodTotal})
          </button>
        </div>

        <button
          type="button"
          onClick={activeTab === 'EXERCISES' ? handleOpenAddExModal : handleOpenAddFoodModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#10b981] text-[#003824] text-xs font-extrabold shadow-[0_0_12px_rgba(16,185,129,0.3)] hover:opacity-90 transition-opacity cursor-pointer shrink-0"
        >
          <Plus size={16} />
          {activeTab === 'EXERCISES' ? 'Thêm Bài Tập Mới' : 'Thêm Món Ăn Mới'}
        </button>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: EXERCISES LIST */}
      {/* ======================================================== */}
      {activeTab === 'EXERCISES' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#121a15] p-4 rounded-2xl border border-white/10">
            <div className="relative grow max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={exSearch}
                onChange={(e) => setExSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchExercises(1)}
                placeholder="Tìm bài tập theo tên hoặc thiết bị..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/40 focus:border-[#10b981] outline-none"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              {(['ALL', 'CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'ARMS', 'ABS', 'CARDIO'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setExCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    exCategory === cat
                      ? 'bg-[#10b981] text-[#003824] shadow-md shadow-[#10b981]/20'
                      : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  {cat === 'ALL'
                    ? 'Tất cả'
                    : cat === 'CHEST'
                      ? 'Ngực'
                      : cat === 'BACK'
                        ? 'Lưng'
                        : cat === 'LEGS'
                          ? 'Chân'
                          : cat === 'SHOULDERS'
                            ? 'Vai'
                            : cat === 'ARMS'
                              ? 'Tay'
                              : cat === 'ABS'
                                ? 'Bụng'
                                : 'Cardio'}
                </button>
              ))}

              <button
                type="button"
                onClick={() => fetchExercises(exPage)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white cursor-pointer ml-auto shrink-0"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* Exercise Table */}
          <div className="bg-[#121a15] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-white">
                <thead className="bg-white/5 text-white/60 uppercase font-semibold text-[10px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4">Bài Tập & Hình Ảnh</th>
                    <th className="px-6 py-4">Nhóm Cơ / Danh Mục</th>
                    <th className="px-6 py-4">Thiết Bị</th>
                    <th className="px-6 py-4">Hướng Dẫn Thực Hiện</th>
                    <th className="px-6 py-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {exLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-white/50">
                        <div className="w-6 h-6 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        Đang tải danh sách bài tập...
                      </td>
                    </tr>
                  ) : exercises.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-white/50">
                        <Dumbbell size={32} className="mx-auto mb-2 text-white/20" />
                        Không tìm thấy bài tập nào
                      </td>
                    </tr>
                  ) : (
                    exercises.map((ex) => (
                      <tr key={ex.id} className="hover:bg-white/[0.02] transition-colors">
                        {/* Image & Name */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/15 shrink-0 bg-white/5 flex items-center justify-center">
                              {ex.setupImageUrl || ex.startImageUrl ? (
                                <img
                                  src={ex.setupImageUrl || ex.startImageUrl}
                                  alt={ex.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Dumbbell size={20} className="text-[#10b981]" />
                              )}
                            </div>
                            <div>
                              <strong className="block text-white font-bold text-sm">{ex.name}</strong>
                              <span className="text-white/40 text-[10px]">ID: {ex.id}</span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-md bg-[#10b981]/15 text-[#10b981] font-bold border border-[#10b981]/30 text-[11px] w-fit block">
                            {ex.category || 'FULL_BODY'}
                          </span>
                          {ex.primaryMuscles?.length > 0 && (
                            <span className="text-white/50 text-[10px] block mt-1">
                              {ex.primaryMuscles.join(', ')}
                            </span>
                          )}
                        </td>

                        {/* Equipment */}
                        <td className="px-6 py-4 text-white/80 font-medium">{ex.equipment || 'Tự do'}</td>

                        {/* Instructions snippet */}
                        <td className="px-6 py-4 max-w-xs text-white/60 text-[11px] truncate">
                          {ex.instructions?.length > 0 ? ex.instructions[0] : 'Chưa có hướng dẫn'}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditExModal(ex)}
                              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                              title="Chỉnh sửa bài tập"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setExToDelete(ex)}
                              className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                              title="Xóa bài tập"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
              <span>
                Hiển thị <strong>{exercises.length}</strong> / <strong>{exTotal}</strong> bài tập (Trang {exPage}/
                {exTotalPages})
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={exPage <= 1}
                  onClick={() => fetchExercises(exPage - 1)}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  disabled={exPage >= exTotalPages}
                  onClick={() => fetchExercises(exPage + 1)}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: FOODS LIST */}
      {/* ======================================================== */}
      {activeTab === 'FOODS' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#121a15] p-4 rounded-2xl border border-white/10">
            <div className="relative grow max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={foodSearch}
                onChange={(e) => setFoodSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchFoods(1)}
                placeholder="Tìm món ăn theo tên thực phẩm..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/40 focus:border-[#10b981] outline-none"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              {(['ALL', 'Thịt & Cá', 'Rau củ', 'Cơm & Tinh bột', 'Trứng & Sữa', 'Trái cây'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFoodCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    foodCategory === cat
                      ? 'bg-[#10b981] text-[#003824] shadow-md shadow-[#10b981]/20'
                      : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  {cat === 'ALL' ? 'Tất cả' : cat}
                </button>
              ))}

              <button
                type="button"
                onClick={() => fetchFoods(foodPage)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white cursor-pointer ml-auto shrink-0"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* Food Table */}
          <div className="bg-[#121a15] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-white">
                <thead className="bg-white/5 text-white/60 uppercase font-semibold text-[10px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4">Tên Thực Phẩm</th>
                    <th className="px-6 py-4">Calo / 100g</th>
                    <th className="px-6 py-4">Protein (Đạm)</th>
                    <th className="px-6 py-4">Carbs (Tinh bột)</th>
                    <th className="px-6 py-4">Fat (Chất béo)</th>
                    <th className="px-6 py-4">Danh Mục</th>
                    <th className="px-6 py-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {foodLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-white/50">
                        <div className="w-6 h-6 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        Đang tải danh sách món ăn...
                      </td>
                    </tr>
                  ) : foods.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-white/50">
                        <Utensils size={32} className="mx-auto mb-2 text-white/20" />
                        Không tìm thấy món ăn nào
                      </td>
                    </tr>
                  ) : (
                    foods.map((food) => (
                      <tr key={food.id} className="hover:bg-white/[0.02] transition-colors">
                        {/* Name & Thumbnail */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/15 shrink-0 bg-white/5 flex items-center justify-center">
                              {food.imageUrl ? (
                                <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover" />
                              ) : (
                                <Utensils size={18} className="text-amber-400" />
                              )}
                            </div>
                            <strong className="block text-white font-bold text-sm">{food.name}</strong>
                          </div>
                        </td>

                        {/* Calories */}
                        <td className="px-6 py-4 font-bold text-[#10b981] text-sm">
                          <span className="flex items-center gap-1">
                            <Flame size={14} />
                            {food.caloriesPer100g} kcal
                          </span>
                        </td>

                        {/* Protein */}
                        <td className="px-6 py-4 font-semibold text-rose-400">{food.proteinPer100g}g</td>

                        {/* Carbs */}
                        <td className="px-6 py-4 font-semibold text-amber-400">{food.carbsPer100g}g</td>

                        {/* Fat */}
                        <td className="px-6 py-4 font-semibold text-blue-400">{food.fatPer100g}g</td>

                        {/* Category */}
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-0.5 rounded-md bg-white/5 text-white/70 text-[11px] border border-white/10">
                            {food.category || 'Món ăn Việt'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditFoodModal(food)}
                              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                              title="Chỉnh sửa món ăn"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setFoodToDelete(food)}
                              className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                              title="Xóa món ăn"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
              <span>
                Hiển thị <strong>{foods.length}</strong> / <strong>{foodTotal}</strong> món ăn (Trang {foodPage}/
                {foodTotalPages})
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={foodPage <= 1}
                  onClick={() => fetchFoods(foodPage - 1)}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  disabled={foodPage >= foodTotalPages}
                  onClick={() => fetchFoods(foodPage + 1)}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EXERCISE ADD/EDIT MODAL */}
      {/* ======================================================== */}
      {isExModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#121a15] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4 text-white shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Dumbbell className="text-[#10b981]" size={20} />
              {editingEx ? 'Chỉnh Sửa Bài Tập' : 'Thêm Bài Tập Mới Vào CSDL'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-white/80 font-bold mb-1">Tên bài tập (*)</label>
                <input
                  type="text"
                  value={exFormName}
                  onChange={(e) => setExFormName(e.target.value)}
                  placeholder="Ví dụ: Barbell Bench Press"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#10b981] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/80 font-bold mb-1">Nhóm cơ chính</label>
                  <select
                    value={exFormCategory}
                    onChange={(e) => setExFormCategory(e.target.value)}
                    className="w-full bg-[#1c2720] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#10b981] outline-none"
                  >
                    <option value="CHEST">Ngực (Chest)</option>
                    <option value="BACK">Lưng (Back)</option>
                    <option value="LEGS">Chân (Legs)</option>
                    <option value="SHOULDERS">Vai (Shoulders)</option>
                    <option value="ARMS">Tay (Arms)</option>
                    <option value="ABS">Bụng (Abs)</option>
                    <option value="CARDIO">Cardio</option>
                    <option value="FULL_BODY">Toàn thân (Full Body)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 font-bold mb-1">Thiết bị</label>
                  <input
                    type="text"
                    value={exFormEquipment}
                    onChange={(e) => setExFormEquipment(e.target.value)}
                    placeholder="Barbell, Dumbbell, Machine..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#10b981] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 font-bold mb-1">Cơ tác động (phân tách dấu phẩy)</label>
                <input
                  type="text"
                  value={exFormPrimaryMuscles}
                  onChange={(e) => setExFormPrimaryMuscles(e.target.value)}
                  placeholder="Ví dụ: Ngực trên, Tay sau, Vai trước"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#10b981] outline-none"
                />
              </div>

              <div>
                <label className="block text-white/80 font-bold mb-1">URL Ảnh Setup / Bắt Đầu</label>
                <input
                  type="text"
                  value={exFormSetupUrl}
                  onChange={(e) => setExFormSetupUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#10b981] outline-none"
                />
              </div>

              <div>
                <label className="block text-white/80 font-bold mb-1">URL Ảnh Động Tác / Kết Thúc</label>
                <input
                  type="text"
                  value={exFormStartUrl}
                  onChange={(e) => setExFormStartUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#10b981] outline-none"
                />
              </div>

              <div>
                <label className="block text-white/80 font-bold mb-1">Hướng dẫn thực hiện (mỗi dòng 1 bước)</label>
                <textarea
                  rows={3}
                  value={exFormInstructions}
                  onChange={(e) => setExFormInstructions(e.target.value)}
                  placeholder="Bước 1: Nằm trên ghế..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#10b981] outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsExModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/70 text-xs font-bold hover:bg-white/5 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveExercise}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-[#10b981] text-[#003824] text-xs font-extrabold shadow-[0_0_12px_rgba(16,185,129,0.4)] hover:opacity-90 transition-opacity cursor-pointer"
              >
                {submitting ? 'Đang lưu...' : 'Lưu Bài Tập'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* FOOD ADD/EDIT MODAL */}
      {/* ======================================================== */}
      {isFoodModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#121a15] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4 text-white shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Utensils className="text-[#10b981]" size={20} />
              {editingFood ? 'Chỉnh Sửa Món Ăn' : 'Thêm Món Ăn Mới Vào CSDL'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-white/80 font-bold mb-1">Tên món ăn / Thực phẩm (*)</label>
                <input
                  type="text"
                  value={foodFormName}
                  onChange={(e) => setFoodFormName(e.target.value)}
                  placeholder="Ví dụ: Ức gà áp chảo"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#10b981] outline-none"
                />
              </div>

              <div>
                <label className="block text-white/80 font-bold mb-1">Danh mục thực phẩm</label>
                <input
                  type="text"
                  value={foodFormCategory}
                  onChange={(e) => setFoodFormCategory(e.target.value)}
                  placeholder="Ví dụ: Thịt & Cá, Rau củ, Tinh bột..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#10b981] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[#10b981] font-bold mb-1">Calo (kcal)</label>
                  <input
                    type="number"
                    value={foodFormCalo}
                    onChange={(e) => setFoodFormCalo(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white focus:border-[#10b981] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-rose-400 font-bold mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={foodFormProtein}
                    onChange={(e) => setFoodFormProtein(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white focus:border-[#10b981] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-amber-400 font-bold mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={foodFormCarbs}
                    onChange={(e) => setFoodFormCarbs(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white focus:border-[#10b981] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-blue-400 font-bold mb-1">Fat (g)</label>
                  <input
                    type="number"
                    value={foodFormFat}
                    onChange={(e) => setFoodFormFat(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white focus:border-[#10b981] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 font-bold mb-1">URL Hình Ảnh Món Ăn</label>
                <input
                  type="text"
                  value={foodFormImage}
                  onChange={(e) => setFoodFormImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#10b981] outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsFoodModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/70 text-xs font-bold hover:bg-white/5 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveFood}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-[#10b981] text-[#003824] text-xs font-extrabold shadow-[0_0_12px_rgba(16,185,129,0.4)] hover:opacity-90 transition-opacity cursor-pointer"
              >
                {submitting ? 'Đang lưu...' : 'Lưu Món Ăn'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modals */}
      {exToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#121a15] border border-rose-500/30 rounded-2xl w-full max-w-md p-6 space-y-4 text-white shadow-2xl">
            <h3 className="text-lg font-bold text-rose-400 flex items-center gap-2">
              <Trash2 size={20} />
              Xóa Bài Tập Khỏi Thư Viện
            </h3>
            <p className="text-xs text-white/70">
              Bạn có chắc chắn muốn xóa bài tập <strong className="text-white">{exToDelete.name}</strong>?
            </p>
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setExToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/70 text-xs font-bold hover:bg-white/5"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteExercise}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-[0_0_12px_rgba(244,63,94,0.4)]"
              >
                {submitting ? 'Đang xóa...' : 'Xác Nhận Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {foodToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#121a15] border border-rose-500/30 rounded-2xl w-full max-w-md p-6 space-y-4 text-white shadow-2xl">
            <h3 className="text-lg font-bold text-rose-400 flex items-center gap-2">
              <Trash2 size={20} />
              Xóa Món Ăn Khỏi Thư Viện
            </h3>
            <p className="text-xs text-white/70">
              Bạn có chắc chắn muốn xóa món ăn <strong className="text-white">{foodToDelete.name}</strong>?
            </p>
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setFoodToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/70 text-xs font-bold hover:bg-white/5"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteFood}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-[0_0_12px_rgba(244,63,94,0.4)]"
              >
                {submitting ? 'Đang xóa...' : 'Xác Nhận Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
