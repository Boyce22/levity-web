import { useRef } from "react";
import { Calendar } from "lucide-react";

interface DueDatePickerProps {
  dueDate: string | null;
  setDueDate: (val: string) => void;
  onSave: () => void;
}

export function DueDatePicker({ dueDate, setDueDate, onSave }: DueDatePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      setDueDate(val);
      // We need a small timeout or just call onSave after state update
      setTimeout(() => onSave(), 100);
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="date"
        className="pointer-events-none absolute inset-0 opacity-0"
        onChange={handleChange}
        value={dueDate || ""}
      />
      <button
        onClick={() => inputRef.current?.showPicker ? inputRef.current.showPicker() : inputRef.current?.click()}
        className="flex h-9 w-9 items-center justify-center rounded-sm transition-all"
        style={{
          background: "var(--app-hover)",
          border: "1px solid var(--app-border)",
          color: dueDate ? "var(--app-primary)" : "var(--app-text-muted)",
        }}
        title="Prazo"
      >
        <Calendar className="h-4 w-4" />
      </button>
    </div>
  );
}