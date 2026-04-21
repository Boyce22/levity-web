import React from 'react';
import { cn } from '@/ui/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex w-full flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full bg-[#1c1c1e] text-white rounded-lg border px-3 py-2 text-sm",
            "transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500",
            error ? "border-red-500" : "border-white/10 placeholder:text-slate-500",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
