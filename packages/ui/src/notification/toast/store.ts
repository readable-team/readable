import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Toast = {
  id: symbol;
  type: 'success' | 'error';
  title: string;
  message?: string;
  duration: number;
};

type ToastOptions = Partial<Pick<Toast, 'message' | 'duration'>>;

export const store = writable<Toast[]>([]);
const append = (toast: Omit<Toast, 'id'>) => {
  if (!browser) {
    throw new Error('toast can only be used in browser');
  }
  store.update((toasts) => [...toasts, { id: Symbol(), ...toast }]);
};

export const toast = {
  success: (title: string, options?: ToastOptions) => append({ title, type: 'success', duration: 3000, ...options }),
  error: (title: string, options?: ToastOptions) => append({ title, type: 'error', duration: 3000, ...options }),
};
