const PRIORITY_STYLES: Record<string, { color: string; label: string }> = {
  high: { color: "#f87171", label: "High" },
  medium: { color: "#fbbf24", label: "Medium" },
  low: { color: "#34d399", label: "Low" },
};

export function CardPriority({ priority }: { priority: string }) {
  const key = priority?.toLowerCase();
  const style = PRIORITY_STYLES[key as keyof typeof PRIORITY_STYLES];

  const color = style?.color || "rgba(156, 163, 175, 0.8)";
  const label = style?.label || priority;

  return (
    <span
      className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
      style={{
        color: color,
        background: `${color}${color.startsWith('#') ? '18' : ''}`,
        border: `1px solid ${color}40`
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}