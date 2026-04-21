import { Tag } from "lucide-react";

interface LabelFiltersProps {
  tags: any[];
  labelFilter: string | null;
  setLabelFilter: (filter: string | null) => void;
}

export function LabelFilters({
  tags,
  labelFilter,
  setLabelFilter,
}: LabelFiltersProps) {
  return (
    <div className="flex shrink-0 items-center gap-2 py-2">
      <Tag
        className="mr-1 h-3.5 w-3.5"
        style={{ color: "var(--app-text-muted)", opacity: 0.4 }}
      />
      {tags.map((l) => (
        <button
          key={l.id}
          onClick={() => setLabelFilter(labelFilter === l.name ? null : l.name)}
          className="rounded-sm px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase transition-all"
          style={{
            background:
              labelFilter === l.name ? (l.color || "var(--app-text)") + "15" : "transparent",
            color:
              labelFilter === l.name ? (l.color || "var(--app-text)") : "var(--app-text-muted)",
            border: `1px solid ${labelFilter === l.name ? (l.color || "var(--app-text)") + "30" : "transparent"}`,
            opacity: labelFilter && labelFilter !== l.name ? 0.4 : 1
          }}
        >
          {l.name}
        </button>
      ))}
    </div>
  );
}
