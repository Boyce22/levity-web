'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { cn } from '@/ui/utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  description?: string;
  disabled?: boolean;
}

export interface SelectProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  placeholder?: string;
  size?: 'sm' | 'md';
  minWidth?: number;
  isLoading?: boolean;
}

// ─── Size map ─────────────────────────────────────────────────────────────────

const triggerSizeClass = {
  sm: 'px-2 py-1 text-[11px]',
  md: 'px-3 py-2 text-[13px]',
} as const;

const itemSizeClass = {
  sm: 'px-2 py-1.5',
  md: 'px-3 py-2',
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function Select({
  value,
  onChange,
  options,
  disabled,
  className = '',
  triggerClassName = '',
  placeholder = 'Select...',
  size = 'md',
  minWidth,
  isLoading,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  const toggle = () => {
    if (disabled) return;
    if (!isOpen) updateCoords();
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleScroll = () => { if (isOpen) updateCoords(); };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const resolvedMinWidth = minWidth ?? (size === 'sm' ? Math.max(coords.width, 130) : Math.max(coords.width, 180));

  const dropdown = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="listbox"
          aria-label="Options"
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 4, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: coords.top,
            left: coords.left,
            minWidth: resolvedMinWidth,
            zIndex: 9999,
          }}
          className="bg-app-bg border-app-border overflow-hidden rounded-sm border p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
        >
          <div className="custom-scrollbar flex max-h-[300px] flex-col gap-0.5 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                disabled={option.disabled}
                onClick={() => {
                  if (option.disabled) return;
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'flex items-center justify-between w-full rounded-sm text-left transition-all',
                  itemSizeClass[size],
                  option.disabled
                    ? 'opacity-50 cursor-not-allowed grayscale-[0.5]'
                    : option.value === value
                      ? 'bg-indigo-500/10 text-indigo-400'
                      : 'text-app-text-muted hover:bg-app-hover/40 hover:text-app-text',
                )}
              >
                <div className="flex items-center gap-2.5">
                  {option.icon && (
                    <span style={{ color: option.color }} className="shrink-0">
                      {option.icon}
                    </span>
                  )}
                  <div className="flex flex-col">
                    <span className={cn('text-[13px] font-medium', option.value === value && 'font-bold')}>
                      {option.label}
                    </span>
                    {option.description && (
                      <span className="mt-0.5 line-clamp-1 text-[10px] leading-tight opacity-60">
                        {option.description}
                      </span>
                    )}
                  </div>
                </div>
                {option.value === value && <Check size={14} className="shrink-0" aria-hidden="true" />}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={cn('relative inline-block', className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={toggle}
        disabled={disabled || isLoading}
        className={cn(
          'flex items-center justify-between gap-2 bg-app-panel border border-app-border-faint rounded-sm transition-all',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'hover:bg-app-hover/20 shadow-sm',
          triggerSizeClass[size],
          triggerClassName,
        )}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon && (
            <span style={{ color: selectedOption.color }} className="shrink-0 scale-90">
              {selectedOption.icon}
            </span>
          )}
          <span className={cn('truncate font-semibold tracking-tight uppercase text-[10px]', isLoading && 'animate-pulse')}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        {isLoading ? (
          <Loader2 size={size === 'sm' ? 12 : 14} className="shrink-0 animate-spin text-indigo-400" aria-hidden="true" />
        ) : (
          <ChevronDown
            size={size === 'sm' ? 14 : 16}
            className={cn('shrink-0 transition-transform duration-300 opacity-60', isOpen && 'rotate-180')}
            aria-hidden="true"
          />
        )}
      </button>
      {mounted && createPortal(dropdown, document.body)}
    </div>
  );
}

Select.displayName = 'Select';

