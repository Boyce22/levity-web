'use client';

import { useState } from 'react';
import { CheckCircle2, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprint } from '@/contracts/Sprint';
import { cn } from '@/ui/utils/cn';

interface CompleteSprintModalProps {
  isOpen: boolean;
  sprint: Sprint;
  sprints: Sprint[];
  onClose: () => void;
  onConfirm: (toSprintId?: string) => Promise<void>;
}

export function CompleteSprintModal({
  isOpen,
  sprint,
  sprints,
  onClose,
  onConfirm,
}: CompleteSprintModalProps) {
  const [toSprintId, setToSprintId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const incomplete = sprint.totalCards - sprint.completedCards;
  const destination = sprints.filter(
    (s) => s.id !== sprint.id && s.status !== 'completed',
  );

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm(toSprintId || undefined);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setToSprintId('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="complete-sprint-title"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-app-bg border-app-border relative w-full max-w-[400px] overflow-hidden rounded-sm border shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
          >
            <div className="border-app-border-faint flex items-center justify-between border-b px-6 pt-6 pb-5">
              <h2
                id="complete-sprint-title"
                className="text-app-text flex items-center gap-3 text-base font-bold tracking-tight"
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                Complete Sprint
              </h2>
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                aria-label="Close modal"
                className="text-app-text-muted hover:text-app-text hover:bg-app-panel rounded-sm p-1.5 transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4 px-6 py-5">
              {incomplete > 0 ? (
                <p className="text-app-text-muted text-[13.5px] leading-relaxed">
                  <span className="font-semibold text-amber-400">{incomplete}</span> card
                  {incomplete === 1 ? '' : 's'} {incomplete === 1 ? 'is' : 'are'} not completed.
                  Optionally move them to another sprint.
                </p>
              ) : (
                <p className="text-app-text-muted text-[13.5px] leading-relaxed">
                  All cards are completed. Ready to close this sprint!
                </p>
              )}

              {incomplete > 0 && destination.length > 0 && (
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="carryover-sprint"
                    className="text-sm font-medium text-slate-300"
                  >
                    Move incomplete cards to
                  </label>
                  <select
                    id="carryover-sprint"
                    value={toSprintId}
                    onChange={(e) => setToSprintId(e.target.value)}
                    disabled={isLoading}
                    aria-label="Destination sprint for incomplete cards"
                    className={cn(
                      'w-full bg-[#1c1c1e] text-white rounded-lg border border-white/10 px-3 py-2 text-sm',
                      'transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500',
                      'disabled:opacity-50',
                    )}
                  >
                    <option value="">Don&apos;t move (keep as backlog)</option>
                    {destination.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className={cn(
                    'flex items-center justify-center gap-2 w-full px-6 py-3 text-[13.5px] font-bold rounded-sm transition-all border',
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50',
                    'disabled:opacity-60 disabled:cursor-not-allowed',
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                      Completing…
                    </>
                  ) : (
                    'Complete Sprint'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="bg-app-panel border-app-border-faint text-app-text-muted hover:text-app-text w-full rounded-sm border px-6 py-3 text-[13.5px] font-medium transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

CompleteSprintModal.displayName = 'CompleteSprintModal';
