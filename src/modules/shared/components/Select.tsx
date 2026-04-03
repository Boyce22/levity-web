"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

export interface SelectOption {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  description?: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string | number;
  onChange: (value: any) => void;
  options: SelectOption[];
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  placeholder?: string;
  size?: "sm" | "md";
  minWidth?: number;
  isLoading?: boolean;
}

export function Select({
  value,
  onChange,
  options,
  disabled,
  className = "",
  triggerClassName = "",
  placeholder = "Select...",
  size = "md",
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

  const toggle = () => {
    if (disabled) return;
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
       if (isOpen && triggerRef.current) {
         const rect = triggerRef.current.getBoundingClientRect();
         setCoords({
           top: rect.bottom + window.scrollY,
           left: rect.left + window.scrollX,
           width: rect.width,
         });
       }
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const dropdownContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
           initial={{ opacity: 0, y: -4, scale: 0.98 }}
           animate={{ opacity: 1, y: 4, scale: 1 }}
           exit={{ opacity: 0, y: -4, scale: 0.98 }}
           transition={{ duration: 0.15, ease: "easeOut" }}
           style={{
             position: "absolute",
             top: coords.top,
             left: coords.left,
             minWidth: minWidth ?? (size === 'sm' ? Math.max(coords.width, 130) : Math.max(coords.width, 180)),
             zIndex: 9999,
           }}
           className="bg-(--app-bg) border border-(--app-border) rounded-sm shadow-[0_12px_40px_rgba(0,0,0,0.5)] overflow-hidden p-1.5"
        >
          <div className="flex flex-col gap-0.5 max-h-[300px] overflow-y-auto custom-scrollbar">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                onClick={() => {
                  if (option.disabled) return;
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between w-full rounded-sm text-left transition-all ${
                  size === 'sm' ? 'px-2 py-1.5' : 'px-3 py-2'
                } ${
                  option.disabled 
                    ? "opacity-50 cursor-not-allowed grayscale-[0.5]" 
                    : option.value === value 
                    ? "bg-indigo-500/10 text-indigo-400" 
                    : "text-(--app-text-muted) hover:bg-(--app-hover)/40 hover:text-(--app-text)"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {option.icon && (
                    <span 
                      style={{ color: option.color }} 
                      className="shrink-0"
                    >
                      {option.icon}
                    </span>
                  )}
                  <div className="flex flex-col">
                    <span className={`text-[13px] font-medium ${option.value === value ? 'font-bold' : ''}`}>
                      {option.label}
                    </span>
                    {option.description && (
                      <span className="text-[10px] opacity-60 line-clamp-1 leading-tight mt-0.5">
                        {option.description}
                      </span>
                    )}
                  </div>
                </div>
                {option.value === value && (
                   <Check size={14} className="shrink-0" />
                )}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        disabled={disabled || isLoading}
        className={`flex items-center justify-between gap-2 bg-(--app-panel) border border-(--app-border-faint) rounded-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-(--app-hover)/20 shadow-sm ${
          size === 'sm' ? 'px-2 py-1 text-[11px]' : 'px-3 py-2 text-[13px]'
        } ${triggerClassName}`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon && (
            <span style={{ color: selectedOption.color }} className="shrink-0 scale-90">
              {selectedOption.icon}
            </span>
          )}
          <span className={`truncate font-semibold tracking-tight uppercase text-[10px] ${isLoading ? 'animate-pulse' : ''}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        {isLoading ? (
          <Loader2 size={size === 'sm' ? 12 : 14} className="shrink-0 animate-spin text-indigo-400" />
        ) : (
          <ChevronDown 
            size={size === 'sm' ? 14 : 16} 
            className={`shrink-0 transition-transform duration-300 opacity-60 ${isOpen ? "rotate-180" : ""}`}
          />
        )}
      </button>
      {mounted && createPortal(dropdownContent, document.body)}
    </div>
  );
}
