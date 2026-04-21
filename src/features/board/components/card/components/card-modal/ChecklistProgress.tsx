import React from "react";

interface ChecklistProgressProps {
  done: number;
  total: number;
}

export function ChecklistProgress({ done, total }: ChecklistProgressProps) {
  if (total === 0) return null;

  const percentage = Math.round((done / total) * 100);

  return (
    <div className="py-2">
      <div className="flex items-center gap-3">
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-sm"
          style={{ background: "var(--app-border)" }}
        >
          <div
            className="h-full rounded-sm transition-all duration-500"
            style={{
              width: `${percentage}%`,
              background:
                done === total
                  ? "#34d399"
                  : done / total >= 0.4
                    ? "var(--app-primary)"
                    : "#fbbf24",
            }}
          />
        </div>
        <span
          className="shrink-0 text-[11px] font-semibold"
          style={{ color: "var(--app-text-muted)" }}
        >
          {done}/{total} tasks
        </span>
      </div>
    </div>
  );
}
