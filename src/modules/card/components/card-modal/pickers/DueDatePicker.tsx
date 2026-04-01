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
        className="absolute inset-0 opacity-0 pointer-events-none"
        onChange={handleChange}
        value={dueDate || ""}
      />
      <button
        onClick={() => inputRef.current?.showPicker ? inputRef.current.showPicker() : inputRef.current?.click()}
        className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
        style={{
          background: "var(--app-hover)",
          border: "1px solid var(--app-border)",
          color: dueDate ? "var(--app-primary)" : "var(--app-text-muted)",
        }}
        title="Prazo"
      >
        <Calendar className="w-4 h-4" />
      </button>
    </div>
  );
}