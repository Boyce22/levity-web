import { useState } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ListAddCardProps {
  accentColor: string;
  onAdd: (content: string) => void;
}

export function ListAddCard({ accentColor, onAdd }: ListAddCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (!content.trim()) {
      setIsAdding(false);
      return;
    }
    onAdd(content);
    setContent("");
    setIsAdding(false);
  };

  const handleCancel = () => {
    setContent("");
    setIsAdding(false);
  };

  return (
    <div className="px-3 pb-3 pt-1">
      <AnimatePresence mode="wait">
        {isAdding ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-xl overflow-hidden"
            style={{
              background: "var(--app-bg)",
              border: `1px solid ${accentColor}50`,
            }}
          >
            <textarea
              autoFocus
              className="w-full px-3 py-2.5 bg-transparent resize-none text-[13px] focus:outline-none"
              style={{ color: "var(--app-text)" }}
              placeholder="Descrição da tarefa..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
                if (e.key === "Escape") handleCancel();
              }}
            />
            <div
              className="flex items-center gap-2 px-3 pb-2.5"
              style={{ borderTop: "1px solid var(--app-border-faint)" }}
            >
              <button
                onClick={handleSubmit}
                className="px-3 py-1 rounded-lg text-[12px] font-semibold transition-colors"
                style={{
                  background: accentColor + "25",
                  color: accentColor,
                  border: `1px solid ${accentColor}40`,
                }}
              >
                Adicionar
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1 rounded-lg text-[12px] font-semibold transition-colors"
                style={{ color: "var(--app-text-muted)" }}
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-[12px] font-semibold transition-all"
            style={{
              color: "var(--app-text-muted)",
              border: "1px dashed var(--app-border)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = accentColor;
              e.currentTarget.style.borderColor = accentColor + "60";
              e.currentTarget.style.background = accentColor + "08";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--app-text-muted)";
              e.currentTarget.style.borderColor = "var(--app-border)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar tarefa
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}