const LABEL_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  feature: {
    bg: "rgba(99,102,241,0.15)",
    text: "var(--app-primary)",
    dot: "#818cf8",
  },
  bug: { bg: "rgba(239,68,68,0.15)", text: "#f87171", dot: "#ef4444" },
  infra: {
    bg: "rgba(255,255,255,0.08)",
    text: "var(--app-text-muted)",
    dot: "#888",
  },
  design: { bg: "rgba(168,85,247,0.15)", text: "#c084fc", dot: "#a855f7" },
  research: { bg: "rgba(20,184,166,0.15)", text: "#2dd4bf", dot: "#14b8a6" },
};

export function CardLabel({ label }: { label: string }) {
  const key = label?.toLowerCase();
  const style = LABEL_STYLES[key as keyof typeof LABEL_STYLES];

  // Defensive Fallback: If label is unknown, use neutral styling
  const config = style || {
    bg: "rgba(255, 255, 255, 0.05)",
    text: "var(--app-text-muted)",
    dot: "#9ca3af",
  };

  return (
    <span
      className="flex items-center gap-1.5 rounded-md border border-white/5 px-2 py-0.5 text-[10px] font-semibold capitalize"
      style={{ background: config.bg, color: config.text }}
    >
      <span className="h-1 w-1 shrink-0 rounded-full" style={{ background: config.dot }} />
      {label}
    </span>
  );
}