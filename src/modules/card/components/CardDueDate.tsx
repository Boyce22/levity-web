import { Clock, AlertCircle } from "lucide-react";

export function CardDueDate({ dueDate }: { dueDate: string }) {
  const due = new Date(dueDate);
  const now = new Date();
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = diffDays < 0;
  const isDueSoon = diffDays >= 0 && diffDays <= 2;
  const color = isOverdue
    ? "#f87171"
    : isDueSoon
      ? "#fbbf24"
      : "var(--app-text-muted)";
  const label = isOverdue
    ? `${Math.abs(diffDays)}d atrasado`
    : diffDays === 0
      ? "Hoje"
      : diffDays === 1
        ? "Amanhã"
        : due.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

  return (
    <span
      className="flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-md"
      style={{
        color,
        background: isOverdue
          ? "rgba(239,68,68,0.12)"
          : isDueSoon
            ? "rgba(251,191,36,0.12)"
            : "rgba(255,255,255,0.05)",
      }}
    >
      {isOverdue ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      {label}
    </span>
  );
}