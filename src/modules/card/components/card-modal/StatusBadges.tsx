import React from "react";

interface StatusBadgesProps {
  currentLabel?: { id: string; label: string; color: string };
  currentPriority?: { id: string; label: string; color: string; icon: string };
}

export function StatusBadges({
  currentLabel,
  currentPriority,
}: StatusBadgesProps) {
  return (
    <div className="flex items-center gap-2 mb-2 flex-wrap">
      <span
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[10px] font-bold tracking-widest uppercase"
        style={{
          background: "rgba(16,185,129,0.08)",
          color: "#34d399",
          border: "1px solid rgba(16,185,129,0.2)",
        }}
      >
        <span className="w-1.5 h-1.5 rounded-sm bg-emerald-400 animate-pulse" />
        Active
      </span>

      {currentLabel && (
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[10px] font-bold tracking-widest uppercase"
          style={{
            background: currentLabel.color + "15",
            color: currentLabel.color,
            border: "1px solid " + currentLabel.color + "25",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-sm"
            style={{ background: currentLabel.color }}
          />
          {currentLabel.label}
        </span>
      )}

      {currentPriority && (
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[10px] font-bold tracking-widest uppercase"
          style={{
            background: currentPriority.color + "15",
            color: currentPriority.color,
            border: "1px solid " + currentPriority.color + "25",
          }}
        >
          {currentPriority.icon} {currentPriority.label}
        </span>
      )}
    </div>
  );
}
