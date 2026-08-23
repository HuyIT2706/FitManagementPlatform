'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '../../../api/axios';
import { toast } from '../../../utils/toast';
import type { AdminExerciseItem, AdminFoodItem } from '../../../interface';
import ContentLibraryTabNav from './components/ContentLibraryTabNav';
import ExerciseFilterBar from './components/ExerciseFilterBar';
import ExerciseTable from './components/ExerciseTable';
import ExerciseFormModal from './components/ExerciseFormModal';
import ExerciseDeleteModal from './components/ExerciseDeleteModal';
import FoodFilterBar from './components/FoodFilterBar';
import FoodTable from './components/FoodTable';
import FoodFormModal from './components/FoodFormModal';
import FoodDeleteModal from './components/FoodDeleteModal';
import LibraryPagination from './components/LibraryPagination';

export default function AdminContentLibraryManagement() {
  const [activeTab, setActiveTab] = useState<'EXERCISES' | 'FOODS'>('EXERCISES');

  // =====================
  // EXERCISES STATE
  // =====================
  const [exercises, setExercises] = useState<AdminExerciseItem[]>([]);
  const [exTotal, setExTotal] = useState(0);
  const [exPage, setExPage] = useState(1);
  const [exTotalPages, setExTotalPages] = useState(1);
  const [exLoading, setExLoading] = useState(true);
  const [exSearch, setExSearch] = useState('');
  const [exCategory, setExCategory] = useState('ALL');

  // Exercise Modal (Add/Edit)
  const [isExModalOpen, setIsExModalOpen] = useState(false);
  const [editingEx, setEditingEx] = useState<AdminExerciseItem | null>(null);
  const [exFormName, setExFormName] = useState('');
  const [exFormCategory, setExFormCategory] = useState('CHEST');
  const [exFormEquipment, setExFormEquipment] = useState('Dumbbell');
  const [exFormPrimaryMuscles, setExFormPrimaryMuscles] = useState('');
  const [exFormInstructions, setExFormInstructions] = useState('');
  const [exFormSetupUrl, setExFormSetupUrl] = useState('');
  const [exFormStartUrl, setExFormStartUrl] = useState('');

  // Exercise Delete Modal
  const [exToDelete, setExToDelete] = useState<AdminExerciseItem | null>(null);

  // =====================
  // FOODS STATE
  // =====================
  const [foods, setFoods] = useState<AdminFoodItem[]>([]);
  const [foodTotal, setFoodTotal] = useState(0);
  const [foodPage, setFoodPage] = useState(1);
  const [foodTotalPages, setFoodTotalPages] = useState(1);
  const [foodLoading, setFoodLoading] = useState(true);
  const [foodSearch, setFoodSearch] = useState('');
  const [foodCategory, setFoodCategory] = useState('ALL');

  // Food Modal (Add/Edit)
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<AdminFoodItem | null>(null);
  const [foodFormName, setFoodFormName] = useState('');
  const [foodFormCategory, setFoodFormCategory] = useState('Món ăn Việt');
  const [foodFormCalo, setFoodFormCalo] = useState('100');
  const [foodFormProtein, setFoodFormProtein] = useState('10');
  const [foodFormCarbs, setFoodFormCarbs] = useState('15');
  const [foodFormFat, setFoodFormFat] = useState('2');
  const [foodFormFiber, setFoodFormFiber] = useState('1');
  const [foodFormImage, setFoodFormImage] = useState('');

  // Food Delete Modal
  const [foodToDelete, setFoodToDelete] = useState<AdminFoodItem | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const [debouncedExSearch, setDebouncedExSearch] = useState('');
  const [debouncedFoodSearch, setDebouncedFoodSearch] = useState('');

  // =====================
  // DEBOUNCE SEARCH INPUTS
  // =====================
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedExSearch(exSearch);
    }, 350);
    return () => clearTimeout(handler);
  }, [exSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFoodSearch(foodSearch);
    }, 350);
    return () => clearTimeout(handler);
  }, [foodSearch]);

  // =====================
  // FETCH EXERCISES
  // =====================
  const fetchExercises = (pageNumber = exPage, searchVal = debouncedExSearch) => {
    setExLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(pageNumber));
    params.set('limit', '10');
    if (exCategory !== 'ALL') params.set('category', exCategory);
    if (searchVal.trim()) params.set('search', searchVal.trim());

    apiClient
      .get<{ data: AdminExerciseItem[]; total: number; totalPages: number }>(
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
  const fetchFoods = (pageNumber = foodPage, searchVal = debouncedFoodSearch) => {
    setFoodLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(pageNumber));
    params.set('limit', '10');
    if (foodCategory !== 'ALL') params.set('category', foodCategory);
    if (searchVal.trim()) params.set('search', searchVal.trim());

    apiClient
      .get<{ data: AdminFoodItem[]; total: number; totalPages: number }>(
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
    fetchExercises(1, debouncedExSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exCategory, debouncedExSearch]);

  useEffect(() => {
    fetchFoods(1, debouncedFoodSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foodCategory, debouncedFoodSearch]);

  // =====================
  // EXERCISE HANDLERS
  // =====================
  const handleOpenAddExModal = () => {
    setEditingEx(null);
    setExFormName('');
    setExFormCategory('CHEST');
    setExFormEquipment('Dumbbell');
    setExFormPrimaryMuscles('');
    setExFormInstructions('');
    setExFormSetupUrl('');
    setExFormStartUrl('');
    setIsExModalOpen(true);
  };

  const handleOpenEditExModal = (ex: AdminExerciseItem) => {
    setEditingEx(ex);
    setExFormName(ex.name);
    setExFormCategory(ex.category || 'CHEST');
    setExFormEquipment(ex.equipment || 'Dumbbell');
    setExFormPrimaryMuscles(ex.primaryMuscles?.join(', ') || '');
    setExFormInstructions(ex.instructions?.join('\n') || '');
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
      primaryMuscles: exFormPrimaryMuscles
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      instructions: exFormInstructions
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
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
  // FOOD HANDLERS
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

  const handleOpenEditFoodModal = (food: AdminFoodItem) => {
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
      {/* Top Tab Navigation & Add Action */}
      <ContentLibraryTabNav
        activeTab={activeTab}
        exTotal={exTotal}
        foodTotal={foodTotal}
        onTabChange={setActiveTab}
        onOpenAddModal={activeTab === 'EXERCISES' ? handleOpenAddExModal : handleOpenAddFoodModal}
      />

      {/* SECTION 1: EXERCISES LIST */}
      {activeTab === 'EXERCISES' && (
        <div className="space-y-4">
          <ExerciseFilterBar
            search={exSearch}
            category={exCategory}
            onSearchChange={setExSearch}
            onCategoryChange={setExCategory}
            onSearchSubmit={() => fetchExercises(1)}
            onRefresh={() => fetchExercises(exPage)}
          />

          <ExerciseTable
            exercises={exercises}
            loading={exLoading}
            onEdit={handleOpenEditExModal}
            onDelete={setExToDelete}
          />

          <LibraryPagination
            currentPage={exPage}
            totalPages={exTotalPages}
            onPageChange={fetchExercises}
          />
        </div>
      )}

      {/* SECTION 2: FOODS LIST */}
      {activeTab === 'FOODS' && (
        <div className="space-y-4">
          <FoodFilterBar
            search={foodSearch}
            category={foodCategory}
            onSearchChange={setFoodSearch}
            onCategoryChange={setFoodCategory}
            onSearchSubmit={() => fetchFoods(1)}
            onRefresh={() => fetchFoods(foodPage)}
          />

          <FoodTable
            foods={foods}
            loading={foodLoading}
            onEdit={handleOpenEditFoodModal}
            onDelete={setFoodToDelete}
          />

          <LibraryPagination
            currentPage={foodPage}
            totalPages={foodTotalPages}
            onPageChange={fetchFoods}
          />
        </div>
      )}

      {/* MODAL 1: EXERCISE ADD/EDIT */}
      <ExerciseFormModal
        isOpen={isExModalOpen}
        isEditing={Boolean(editingEx)}
        submitting={submitting}
        name={exFormName}
        category={exFormCategory}
        equipment={exFormEquipment}
        primaryMuscles={exFormPrimaryMuscles}
        instructions={exFormInstructions}
        setupUrl={exFormSetupUrl}
        startUrl={exFormStartUrl}
        onNameChange={setExFormName}
        onCategoryChange={setExFormCategory}
        onEquipmentChange={setExFormEquipment}
        onPrimaryMusclesChange={setExFormPrimaryMuscles}
        onInstructionsChange={setExFormInstructions}
        onSetupUrlChange={setExFormSetupUrl}
        onStartUrlChange={setExFormStartUrl}
        onClose={() => setIsExModalOpen(false)}
        onSubmit={handleSaveExercise}
      />

      {/* MODAL 2: EXERCISE DELETE */}
      <ExerciseDeleteModal
        isOpen={Boolean(exToDelete)}
        exercise={exToDelete}
        submitting={submitting}
        onClose={() => setExToDelete(null)}
        onConfirm={handleDeleteExercise}
      />

      {/* MODAL 3: FOOD ADD/EDIT */}
      <FoodFormModal
        isOpen={isFoodModalOpen}
        isEditing={Boolean(editingFood)}
        submitting={submitting}
        name={foodFormName}
        category={foodFormCategory}
        calo={foodFormCalo}
        protein={foodFormProtein}
        carbs={foodFormCarbs}
        fat={foodFormFat}
        fiber={foodFormFiber}
        image={foodFormImage}
        onNameChange={setFoodFormName}
        onCategoryChange={setFoodFormCategory}
        onCaloChange={setFoodFormCalo}
        onProteinChange={setFoodFormProtein}
        onCarbsChange={setFoodFormCarbs}
        onFatChange={setFoodFormFat}
        onFiberChange={setFoodFormFiber}
        onImageChange={setFoodFormImage}
        onClose={() => setIsFoodModalOpen(false)}
        onSubmit={handleSaveFood}
      />

      {/* MODAL 4: FOOD DELETE */}
      <FoodDeleteModal
        isOpen={Boolean(foodToDelete)}
        food={foodToDelete}
        submitting={submitting}
        onClose={() => setFoodToDelete(null)}
        onConfirm={handleDeleteFood}
      />
    </div>
  );
}
