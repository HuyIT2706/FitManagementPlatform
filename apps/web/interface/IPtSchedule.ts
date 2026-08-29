import type { PTSessionItem, PTStudentSummary } from '@repo/types';

export interface ScheduleSlot {
  id: string;
  startTime: string;
  endTime: string;
  studentName?: string;
  studentAvatar?: string;
  packageName?: string;
  sessionNumber?: string;
  workoutName?: string;
  exercisesCount?: number;
  status?: 'ONGOING' | 'UPCOMING' | 'COMPLETED' | 'OVERDUE';
  isCheckedIn?: boolean;
  isBusy: boolean;
}

export interface PtScheduleSlotCardProps {
  slot: ScheduleSlot;
  isChecked: boolean;
  onCheckIn: (slotId: string) => void;
}

export interface PtScheduleMonthGridProps {
  viewDate: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  schedules: PTSessionItem[];
  checkedSessions: Record<string, boolean>;
  onOpenAddModal: (date?: Date) => void;
  onOpenDayDetails?: (date: Date) => void;
  filterStudentId?: string;
}

export interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: PTStudentSummary[];
  onAddSession: (newSession: PTSessionItem) => void;
  defaultStartTime?: string;
  defaultDate?: Date;
}

export interface DaySessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  slots: ScheduleSlot[];
  checkedSessions: Record<string, boolean>;
  onCheckIn: (slotId: string) => void;
  onOpenAddModal: (date: Date) => void;
}
