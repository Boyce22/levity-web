import { motion, AnimatePresence } from "framer-motion";
import { Flag, Check } from "lucide-react";

const PRIORITIES = [
  { id: "high", label: "High", color: "#f87171", icon: "↑" },
  { id: "medium", label: "Medium", color: "#fbbf24", icon: "→" },
  { id: "low", label: "Low", color: "#34d399", icon: "↓" },
];

interface PriorityPickerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedPriority: string | null;
  onSelect: (priorityId: string) => void;
}

export function PriorityPicker({ isOpen, setIsOpen, selectedPriority, onSelect }: PriorityPickerProps) {
  const currentPriority = PRIORITIES.find((p) => p.id === selectedPriority);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
        style={{
          background: isOpen ? "var(--app-border)" : "var(--app-hover)",
          border: "1px solid var(--app-border)",
          color: currentPriority?.color || "var(--app-text-muted)",
        }}
        title="Prioridade"
      >
        <Flag className="w-4 h-4" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            className="absolute top-11 right-0 w-44 p-1.5 z-50"
            style={{
              borderRadius: "14px",
              background: "var(--app-panel)",
              border: "1px solid var(--app-border)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
            }}
          >
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-muted)" }}>
              Prioridade
            </div>
            {PRIORITIES.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  onSelect(p.id);
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                style={{
                  color: selectedPriority === p.id ? p.color : "var(--app-text-muted)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--app-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span className="text-sm">{p.icon}</span>
                <span className="text-[13px]">{p.label}</span>
                {selectedPriority === p.id && <Check className="w-3.5 h-3.5 ml-auto" />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}