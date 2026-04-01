import { motion, AnimatePresence } from "framer-motion";
import { Tag, Check } from "lucide-react";

const LABELS = [
  { id: "feature", label: "Feature", color: "#818cf8" },
  { id: "bug", label: "Bug", color: "#f87171" },
  { id: "infra", label: "Infra", color: "#94a3b8" },
  { id: "design", label: "Design", color: "#c084fc" },
  { id: "research", label: "Research", color: "#2dd4bf" },
];

interface LabelPickerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedLabel: string | null;
  onSelect: (labelId: string) => void;
}

export function LabelPicker({ isOpen, setIsOpen, selectedLabel, onSelect }: LabelPickerProps) {
  const currentLabel = LABELS.find((l) => l.id === selectedLabel);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
        style={{
          background: isOpen ? "var(--app-border)" : "var(--app-hover)",
          border: "1px solid var(--app-border)",
          color: currentLabel?.color || "var(--app-text-muted)",
        }}
        title="Etiqueta"
      >
        <Tag className="w-4 h-4" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            className="absolute top-11 right-0 w-48 p-1.5 z-50"
            style={{
              borderRadius: "14px",
              background: "var(--app-panel)",
              border: "1px solid var(--app-border)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
            }}
          >
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-muted)" }}>
              Etiqueta
            </div>
            {LABELS.map((l) => (
              <div
                key={l.id}
                onClick={() => {
                  onSelect(l.id);
                  setIsOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--app-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: l.color }} />
                <span className="flex-1 text-[13px]" style={{ color: "var(--app-text)" }}>
                  {l.label}
                </span>
                {selectedLabel === l.id && <Check className="w-3.5 h-3.5" style={{ color: l.color }} />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}