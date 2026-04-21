'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprint, UpdateSprint, UpdateSprintSchema, CreateSprint } from '@/contracts/Sprint';
import { Input } from '@/ui/primitives/Input';
import { Button } from '@/ui/primitives/Button';
import { cn } from '@/ui/utils/cn';

interface EditSprintModalProps {
  isOpen: boolean;
  sprint: Sprint;
  onClose: () => void;
  onSubmit: (data: UpdateSprint) => Promise<void>;
}

export function EditSprintModal({ isOpen, sprint, onClose, onSubmit }: EditSprintModalProps) {
  const [form, setForm] = useState<UpdateSprint>({});
  const [errors, setErrors] = useState<Partial<Record<keyof UpdateSprint, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        name: sprint.name,
        goal: sprint.goal ?? '',
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        trackingMode: sprint.trackingMode,
        capacityPoints: sprint.capacityPoints,
      });
      setErrors({});
    }
  }, [isOpen, sprint]);

  const handleChange = <K extends keyof UpdateSprint>(key: K, value: UpdateSprint[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = UpdateSprintSchema.safeParse({
      ...form,
      capacityPoints: form.capacityPoints || undefined,
      goal: form.goal || undefined,
    });
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof UpdateSprint, string>> = {};
      result.error.errors.forEach((err) => {
        const key = err.path[0] as keyof UpdateSprint;
        if (key) fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setIsLoading(true);
    try {
      await onSubmit(result.data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
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
            aria-labelledby="edit-sprint-title"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-app-bg border-app-border relative w-full max-w-md overflow-hidden rounded-sm border shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
          >
            <div className="border-app-border-faint flex items-center justify-between border-b px-6 pt-6 pb-5">
              <h2
                id="edit-sprint-title"
                className="text-app-text text-base font-bold tracking-tight"
              >
                Edit Sprint
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

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
              <Input
                label="Sprint name *"
                placeholder="e.g., Sprint 1"
                value={form.name ?? ''}
                onChange={(e) => handleChange('name', e.target.value)}
                error={errors.name}
                disabled={isLoading}
              />
              <Input
                label="Goal"
                placeholder="What do you want to achieve?"
                value={form.goal ?? ''}
                onChange={(e) => handleChange('goal', e.target.value)}
                error={errors.goal}
                disabled={isLoading}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Start date *"
                  type="date"
                  value={form.startDate ?? ''}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  error={errors.startDate}
                  disabled={isLoading}
                />
                <Input
                  label="End date *"
                  type="date"
                  value={form.endDate ?? ''}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  error={errors.endDate}
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-300">Tracking mode *</label>
                <select
                  value={form.trackingMode ?? 'count'}
                  onChange={(e) =>
                    handleChange(
                      'trackingMode',
                      e.target.value as CreateSprint['trackingMode'],
                    )
                  }
                  disabled={isLoading}
                  aria-label="Tracking mode"
                  className={cn(
                    'w-full bg-[#1c1c1e] text-white rounded-lg border border-white/10 px-3 py-2 text-sm',
                    'transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500',
                    'disabled:opacity-50',
                  )}
                >
                  <option value="count">Count (tasks done)</option>
                  <option value="points">Story Points</option>
                  <option value="hours">Estimated Hours</option>
                </select>
                {errors.trackingMode && (
                  <span className="text-xs text-red-500">{errors.trackingMode}</span>
                )}
              </div>
              <Input
                label="Capacity"
                type="number"
                placeholder="Optional"
                value={form.capacityPoints != null ? String(form.capacityPoints) : ''}
                onChange={(e) =>
                  handleChange(
                    'capacityPoints',
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                error={errors.capacityPoints}
                disabled={isLoading}
                min={0}
              />
              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

EditSprintModal.displayName = 'EditSprintModal';
