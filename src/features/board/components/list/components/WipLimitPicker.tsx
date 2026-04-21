import React, { useState } from "react";
import { AlertTriangle, LucideInfinity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WipLimitPickerProps {
  cardCount: number;
  wipLimit?: number | null;
  onWipLimitChange?: (val: number | null) => void;
  userRole: string;
}

export function WipLimitPicker({
  cardCount,
  wipLimit,
  onWipLimitChange,
  userRole,
}: WipLimitPickerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newWip, setNewWip] = useState(wipLimit?.toString() || "");

  const canEdit = ["owner", "admin", "member"].includes(userRole);
  const isWipExceeded = wipLimit != null && cardCount >= wipLimit;

  const handleWipSubmit = () => {
    setIsEditing(false);
    const val = newWip.trim() === "" ? null : parseInt(newWip, 10);
    if (val === null || !isNaN(val)) {
      onWipLimitChange?.(val);
    } else {
      setNewWip(wipLimit?.toString() || "");
    }
  };

  return (
    <div className="relative">
      <div
        className={`flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-bold transition-all ${
          canEdit ? "cursor-pointer hover:bg-[var(--app-hover)]" : ""
        }`}
        style={{
          background: isWipExceeded
            ? "rgba(248,113,113,0.15)"
            : "var(--app-hover)",
          color: isWipExceeded ? "#f87171" : "var(--app-text-muted)",
          border: isWipExceeded
            ? "1px solid rgba(248,113,113,0.3)"
            : "1px solid var(--app-border)",
        }}
        onClick={() => {
          if (canEdit) setIsEditing(!isEditing);
        }}
      >
        {isWipExceeded && <AlertTriangle className="h-3 w-3" />}
        <span>{cardCount}</span>
        <div className="flex items-center text-[11px] opacity-50">
          <span>/</span>
          {wipLimit != null ? (
            <span>{wipLimit}</span>
          ) : (
            <LucideInfinity className="!h-3.5 !w-3.5" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute top-full right-0 z-50 mt-2 w-max max-w-[240px] rounded-xl p-3"
            style={{
              background: "var(--app-elevated)",
              border: "1px solid var(--app-border)",
              boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
            }}
          >
            <div className="mb-2 text-[10px] font-bold tracking-wider text-[var(--app-text-muted)] uppercase">
              Set List Limit (WIP)
            </div>
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={newWip}
                onChange={(e) => setNewWip(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleWipSubmit();
                  if (e.key === "Escape") setIsEditing(false);
                }}
                className="flex-1 rounded-lg border border-[var(--app-border)] bg-[var(--app-panel)] px-2 py-1.5 text-[12px] transition-all focus:border-[var(--app-primary)] focus:outline-none"
                placeholder="No limit"
              />
            </div>
            <p className="mt-2 text-[9px] text-[var(--app-text-muted)] italic">
              Leave empty to remove limit.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
