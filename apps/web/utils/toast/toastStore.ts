import type { ToastItem, ToastType } from "../../interface";

export type { ToastItem, ToastType };

type Listener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners: Set<Listener> = new Set();

const notify = () => {
  listeners.forEach((listener) => listener([...toasts]));
};

export const toastStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getToasts() {
    return toasts;
  },

  add(toast: Omit<ToastItem, 'id'>): string {
    const id = Math.random().toString(36).substring(2, 9);
    const duration = toast.duration ?? 1000;
    const newItem: ToastItem = {
      ...toast,
      id,
      duration,
    };
    toasts = [newItem, ...toasts].slice(0, 5); // Keep max 5 toasts
    notify();

    setTimeout(() => {
      toastStore.remove(id);
    }, duration);

    return id;
  },

  remove(id: string) {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  },

  clear() {
    toasts = [];
    notify();
  },
};
