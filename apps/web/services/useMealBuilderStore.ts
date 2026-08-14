import { create } from "zustand";
import type { FoodItem } from "../interface";

export interface SelectedMealItem {
  food: FoodItem;
  weightInGram: number;
}

interface MealBuilderState {
  addedItems: SelectedMealItem[];
  addItem: (food: FoodItem, weightInGram: number) => void;
  removeItem: (index: number) => void;
  updateWeight: (index: number, weightInGram: number) => void;
  clearItems: () => void;
  getTotalCalories: () => number;
  getTotalProtein: () => number;
  getTotalCarbs: () => number;
  getTotalFat: () => number;
}

export const useMealBuilderStore = create<MealBuilderState>((set, get) => ({
  addedItems: [],

  addItem: (food, weightInGram) => {
    set((state) => {
      const existingIndex = state.addedItems.findIndex(
        (item) => item.food.id === food.id
      );
      if (existingIndex > -1) {
        const updated = [...state.addedItems];
        const existingItem = updated[existingIndex];
        if (existingItem) {
          updated[existingIndex] = {
            ...existingItem,
            weightInGram: existingItem.weightInGram + weightInGram,
          };
        }
        return { addedItems: updated };
      }
      return { addedItems: [...state.addedItems, { food, weightInGram }] };
    });
  },

  removeItem: (index) => {
    set((state) => ({
      addedItems: state.addedItems.filter((_, i) => i !== index),
    }));
  },

  updateWeight: (index, weightInGram) => {
    set((state) => {
      const updated = [...state.addedItems];
      const targetItem = updated[index];
      if (targetItem) {
        updated[index] = { ...targetItem, weightInGram };
      }
      return { addedItems: updated };
    });
  },

  clearItems: () => {
    set({ addedItems: [] });
  },

  getTotalCalories: () => {
    return get().addedItems.reduce(
      (acc, item) => acc + (item.food.caloriesPer100g * item.weightInGram) / 100,
      0
    );
  },

  getTotalProtein: () => {
    return get().addedItems.reduce(
      (acc, item) => acc + (item.food.proteinPer100g * item.weightInGram) / 100,
      0
    );
  },

  getTotalCarbs: () => {
    return get().addedItems.reduce(
      (acc, item) => acc + (item.food.carbsPer100g * item.weightInGram) / 100,
      0
    );
  },

  getTotalFat: () => {
    return get().addedItems.reduce(
      (acc, item) => acc + (item.food.fatPer100g * item.weightInGram) / 100,
      0
    );
  },
}));
