const PRIORITY_STYLES: Record<string, { color: string; label: string }> = {
  high: { color: "#f87171", label: "Alta" },
  medium: { color: "#fbbf24", label: "Média" },
  low: { color: "#34d399", label: "Baixa" },
};

export function CardPriority({ priority }: { priority: keyof typeof PRIORITY_STYLES }) {
  const style = PRIORITY_STYLES[priority];
  return (
    <span
      className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
      style={{ color: style.color, background: `${style.color}18` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: style.color }} />
      {style.label}
    </span>
  );
}