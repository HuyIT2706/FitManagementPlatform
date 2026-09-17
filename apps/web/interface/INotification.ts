export type NotificationType =
  | 'SESSION_DEDUCT'
  | 'MEAL_LOG'
  | 'WATER'
  | 'WORKOUT'
  | 'STUDENT_REQUEST'
  | 'PT_APPLICATION'
  | 'SYSTEM'
  | string;

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  linkUrl?: string | null;
  createdAt: string;
}

export interface NotificationBellDropdownProps {
  buttonClassName?: string;
}

export interface NotificationOptions {
  mealReminders: boolean;
  waterReminders: boolean;
  workoutSchedule: boolean;
  ptReviews: boolean;
  weeklyReport: boolean;
}

export interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}
