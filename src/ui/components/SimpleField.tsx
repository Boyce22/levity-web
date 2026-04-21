import React from 'react';
import { cn } from '@/ui/utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SimpleFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Generic form field wrapper providing a label row and optional inline error.
 * Does NOT use forwardRef — it is a pure layout container with no direct DOM element.
 */
export function SimpleField({ label, error, children, className = '' }: SimpleFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between">
        <span className="text-app-text-muted ml-1 text-[11px] font-bold tracking-wider uppercase opacity-60">
          {label}
        </span>
        {error && (
          <span role="alert" className="text-[12px] font-medium text-red-400">
            {error}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

SimpleField.displayName = 'SimpleField';

