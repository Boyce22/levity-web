import { Calendar } from "lucide-react";

interface DueDatePickerProps {
  dueDate: string | null;
  setDueDate: (val: string) => void;
  onSave: () => void;
}

export function DueDatePicker({ dueDate, setDueDate, onSave }: DueDatePickerProps) {
  return (
    <button
      className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
      style={{
        background: "var(--app-hover)",
        border: "1px solid var(--app-border)",
        color: dueDate ? "var(--app-primary)" : "var(--app-text-muted)",
      }}
      title="Prazo"
      onClick={() => {
        // This would open a date picker. For simplicity, we rely on the inline date input.
      }}
    >
      <Calendar className="w-4 h-4" />
    </button>
  );
}