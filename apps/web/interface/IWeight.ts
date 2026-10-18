export type WeightTimeRange = 'DAY' | 'WEEK' | 'MONTH';
export type WeightEditMode = 'INITIAL' | 'CURRENT' | 'TARGET' | null;

export interface WeightMetricItem {
  id: string;
  userId?: string;
  weight: number;
  height?: number | null;
  bodyFat?: number | null;
  muscleMass?: number | null;
  recordedAt: string | Date;
}

export interface WeightChartPoint {
  label: string;
  fullDate: string;
  weight: number;
  id: string;
}

export interface WeightHeaderProps {
  onBack: () => void;
  onOpenAddModal: () => void;
}

export interface WeightSummaryCardProps {
  initialWeight: number;
  currentWeight: number;
  targetWeight: number;
  onEditInitial: () => void;
  onEditCurrent: () => void;
  onEditTarget: () => void;
}

export interface WeightStatusBannerProps {
  statusMessage: string;
}

export interface WeightTimeRangeFilterProps {
  timeRange: WeightTimeRange;
  onChangeTimeRange: (range: WeightTimeRange) => void;
}

export interface WeightChartCardProps {
  yTicks: number[];
  maxVal: number;
  chartPoints: WeightChartPoint[];
  targetWeight?: number;
}

export interface WeightHistoryListProps {
  metrics: WeightMetricItem[];
  isDeletingId: string | null;
  onDelete: (id: string) => void;
  onOpenAddModal?: () => void;
}

export interface WeightEditModalProps {
  isOpen: boolean;
  editMode: WeightEditMode;
  weightInput: string;
  isSaving: boolean;
  onWeightInputChange: (val: string) => void;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
}
