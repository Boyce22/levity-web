export const ACTION_META: Record<
  string,
  { label: (f?: string) => string; color: string; dot: string }
> = {
  updated: {
    label: (f) => `edited ${f || "the card"}`,
    color: "rgba(99,102,241,0.15)",
    dot: "#6366f1",
  },
  assigned: {
    label: () => "changed the assignee",
    color: "rgba(245,158,11,0.15)",
    dot: "#f59e0b",
  },
  created: {
    label: () => "created this card",
    color: "rgba(16,185,129,0.15)",
    dot: "#10b981",
  },
  moved: {
    label: (f) => `moved to ${f || "…"}`,
    color: "rgba(59,130,246,0.15)",
    dot: "#3b82f6",
  },
};

export function ActionPill({ type, field }: { type: string; field?: string }) {
  const meta = ACTION_META[type] ?? {
    label: () => type,
    color: "rgba(255,255,255,0.06)",
    dot: "#fff",
  };
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium"
      style={{ background: meta.color, color: "var(--app-text-muted)" }}
    >
      {meta.label(field)}
    </span>
  );
}