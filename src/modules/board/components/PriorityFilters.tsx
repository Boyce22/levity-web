import { Flag } from "lucide-react";

interface PriorityFiltersProps {
  priorities: any[];
  priorityFilter: string | null;
  setPriorityFilter: (filter: string | null) => void;
}

export function PriorityFilters({
  priorities,
  priorityFilter,
  setPriorityFilter,
}: PriorityFiltersProps) {
  return (
    <div className="flex items-center gap-2 py-2 shrink-0">
      <Flag
        className="w-3.5 h-3.5 mr-1"
        style={{ color: "var(--app-text-muted)", opacity: 0.4 }}
      />
      {priorities.map((p) => (
        <button
          key={p.id}
          onClick={() =>
            setPriorityFilter(priorityFilter === p.name ? null : p.name)
          }
          className="text-[10px] font-bold px-2 py-0.5 rounded-sm transition-all uppercase tracking-wider"
          style={{
            background:
              priorityFilter === p.name ? (p.color || "var(--app-text)") + "15" : "transparent",
            color:
              priorityFilter === p.name ? (p.color || "var(--app-text)") : "var(--app-text-muted)",
            border: `1px solid ${priorityFilter === p.name ? (p.color || "var(--app-text)") + "30" : "transparent"}`,
            opacity: priorityFilter && priorityFilter !== p.name ? 0.4 : 1
          }}
        >
          {p.icon} {p.name}
        </button>
      ))}
    </div>
  );
}
