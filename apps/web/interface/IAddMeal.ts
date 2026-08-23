import type { FoodItem } from '@repo/types';

export interface AddedMealBuilderItem {
  food: FoodItem;
  weightInGram: number;
}

export interface AddMealHeaderProps {
  mealTitle: string;
  addedItemsCount: number;
  isSaving: boolean;
  onBack: () => void;
  onSaveMeal: () => void;
}

export interface SelectedFoodSummaryProps {
  addedItems: AddedMealBuilderItem[];
  totalAddedCalories: number;
  onRemoveItem: (index: number) => void;
}

export interface FoodSelectorProps {
  onFoodAdded?: (food: FoodItem, weightInGram: number) => void;
  title?: string;
}

export interface PortionWeightModalProps {
  selectedFood: FoodItem | null;
  weight: number | '';
  onWeightChange: (val: number | '') => void;
  onConfirmAdd: () => void;
  onClose: () => void;
}
