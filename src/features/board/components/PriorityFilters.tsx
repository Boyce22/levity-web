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
    <div className="flex shrink-0 items-center gap-2 py-2">
      <Flag
        className="mr-1 h-3.5 w-3.5"
        style={{ color: "var(--app-text-muted)", opacity: 0.4 }}
      />
      {priorities.map((p) => (
        <button
          key={p.id}
          onClick={() =>
            setPriorityFilter(priorityFilter === p.name ? null : p.name)
          }
          className="rounded-sm px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase transition-all"
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
