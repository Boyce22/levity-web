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

export function CardLabel({ label }: { label: keyof typeof LABEL_STYLES }) {
  const style = LABEL_STYLES[label];
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-md capitalize"
      style={{ background: style.bg, color: style.text }}
    >
      {label}
    </span>
  );
}