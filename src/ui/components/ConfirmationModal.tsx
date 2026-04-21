'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { cn } from '@/ui/utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

// ─── Variant map ──────────────────────────────────────────────────────────────

const variantClass = {
  danger: {
    button: 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50',
    icon: 'text-red-400',
  },
  warning: {
    button: 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50',
    icon: 'text-amber-400',
  },
  primary: {
    button: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20 hover:border-indigo-500/50',
    icon: 'text-indigo-400',
  },
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmationModalProps) {
  const styles = variantClass[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-app-bg border-app-border relative flex w-full max-w-[380px] flex-col overflow-hidden rounded-sm border shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
          >
            {/* Header */}
            <div className="border-app-border-faint flex items-center justify-between border-b px-6 pt-6 pb-5">
              <h2
                id="confirm-modal-title"
                className="text-app-text flex items-center gap-3 text-base font-bold tracking-tight"
              >
                <AlertTriangle className={cn('w-5 h-5', styles.icon)} aria-hidden="true" />
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                aria-label="Close modal"
                className="text-app-text-muted hover:text-app-text hover:bg-app-panel rounded-sm p-1.5 transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 pt-5 pb-6">
              <p className="text-app-text-muted mb-6 text-[13.5px] leading-relaxed opacity-90">
                {description}
              </p>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={cn(
                    'flex items-center justify-center gap-2 w-full px-6 py-3 text-[13.5px] font-bold rounded-sm transition-all border',
                    'disabled:opacity-60 disabled:cursor-not-allowed',
                    styles.button,
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                      Processing...
                    </>
                  ) : (
                    confirmText
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="bg-app-panel border-app-border-faint text-app-text-muted hover:text-app-text w-full rounded-sm border px-6 py-3 text-[13.5px] font-medium transition-all disabled:opacity-50"
                >
                  {cancelText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

ConfirmationModal.displayName = 'ConfirmationModal';
