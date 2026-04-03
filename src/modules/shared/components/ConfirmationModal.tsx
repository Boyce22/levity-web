'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface ConfirmationModalProps {
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
  const variantStyles = {
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
  };

  const currentVariant = variantStyles[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-[380px] bg-(--app-bg) border border-(--app-border) rounded-sm shadow-[0_32px_80px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-(--app-border-faint)">
              <h2 className="text-md font-bold text-(--app-text) tracking-tight flex items-center gap-3">
                <AlertTriangle className={`w-5 h-5 ${currentVariant.icon}`} />
                {title}
              </h2>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="text-(--app-text-muted) hover:text-(--app-text) transition-colors p-1.5 hover:bg-(--app-panel) rounded-sm disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 pt-5 pb-6">
              <p className="text-[13.5px] text-(--app-text-muted) mb-6 leading-relaxed opacity-90">
                {description}
              </p>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`flex items-center justify-center gap-2 w-full px-6 py-3 text-[13.5px] font-bold rounded-sm transition-all border ${currentVariant.button} disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    confirmText
                  )}
                </button>
                
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full px-6 py-3 rounded-sm text-[13.5px] font-medium transition-all bg-(--app-panel) border border-(--app-border-faint) text-(--app-text-muted) hover:text-(--app-text) disabled:opacity-50"
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
