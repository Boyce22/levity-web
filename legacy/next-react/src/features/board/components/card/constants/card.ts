export const DEFAULT_LABELS = [
  { id: "feature", label: "Feature", color: "#818cf8" },
  { id: "bug", label: "Bug", color: "#f87171" },
  { id: "infra", label: "Infra", color: "#94a3b8" },
  { id: "design", label: "Design", color: "#c084fc" },
  { id: "research", label: "Research", color: "#2dd4bf" },
] as const;

export const DEFAULT_PRIORITIES = [
  { id: "high", label: "High", color: "#f87171", icon: "↑" },
  { id: "medium", label: "Medium", color: "#fbbf24", icon: "→" },
  { id: "low", label: "Low", color: "#34d399", icon: "↓" },
] as const;

export type LabelId = (typeof DEFAULT_LABELS)[number]["id"];
export type PriorityId = (typeof DEFAULT_PRIORITIES)[number]["id"];
