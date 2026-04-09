import React from "react";

interface SimpleFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * A reusable form field component with label and error display.
 */
export function SimpleField({
  label,
  error,
  children,
  className = "",
}: SimpleFieldProps) {
  return (
    <div className={`flex flex-col gap-[6px] ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider opacity-60 ml-1">
          {label}
        </label>
        {error && (
          <span className="text-[12px] text-red-400 font-medium">{error}</span>
        )}
      </div>
      {children}
    </div>
  );
}
