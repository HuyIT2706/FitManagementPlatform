import { toastStore } from "./toastStore";
export { ToastContainer } from "./ToastContainer";
export type { ToastType, ToastItem } from "../../interface";

export const toast = {
  success: (message: string, title?: string, duration?: number) =>
    toastStore.add({ type: "success", message, title, duration }),

  error: (message: string, title?: string, duration?: number) =>
    toastStore.add({ type: "error", message, title, duration }),

  warning: (message: string, title?: string, duration?: number) =>
    toastStore.add({ type: "warning", message, title, duration }),

  info: (message: string, title?: string, duration?: number) =>
    toastStore.add({ type: "info", message, title, duration }),

  remove: (id: string) => toastStore.remove(id),

  clear: () => toastStore.clear(),
};

export default toast;
