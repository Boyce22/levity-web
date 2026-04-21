import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Função utilitária do Design System para lidar condicionalmente
 * com a fusão (merge) inteligente de classes Tailwind sem causar clashing.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
