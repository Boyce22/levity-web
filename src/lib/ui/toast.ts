import { writable } from 'svelte/store';

export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
  actionLabel?: string;
  onAction?: () => void;
}

let nextId = 0;
export const toasts = writable<Toast[]>([]);

export function dismissToast(id: number) {
  toasts.update((items) => items.filter((toast) => toast.id !== id));
}

export function showToast(
  message: string,
  kind: ToastKind = 'info',
  options: Pick<Toast, 'actionLabel' | 'onAction'> = {},
) {
  const id = ++nextId;
  toasts.update((items) => [...items, { id, message, kind, ...options }]);
  globalThis.setTimeout(() => dismissToast(id), kind === 'error' ? 6000 : 4000);
  return id;
}
