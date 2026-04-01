import { useState } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ListAddCardProps {
  accentColor: string;
  onAdd: (content: string) => Promise<any> | void;
}

export function ListAddCard({ accentColor, onAdd }: ListAddCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [content, setContent] = useState("");
  const handleSubmit = () => {
    if (!content.trim()) return setIsAdding(false);

    onAdd(content);
    setContent("");
    setIsAdding(false);
  };

  const handleCancel = () => {
    setContent("");
    setIsAdding(false);
  };

  return (
    <div className="px-3 pb-2">
      <AnimatePresence initial={false}>
        {isAdding ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div
              className="mt-1 px-2 py-1 rounded-lg transition"
              style={{
                background: "transparent",
              }}
            >
              <textarea
                autoFocus
                placeholder="Descreva a tarefa..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={2}
                className="w-full bg-transparent resize-none text-[13px] focus:outline-none placeholder:opacity-50"
                style={{ color: "var(--app-text)" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                  if (e.key === "Escape") handleCancel();
                }}
              />

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-1 text-[12px] font-medium px-2.5 py-1.5 rounded-md transition"
                  style={{
                    background: accentColor + "20",
                    color: accentColor,
                  }}
                >
                  Add
                </button>

                <button
                  onClick={handleCancel}
                  className="text-[12px] px-2 py-1 opacity-60 hover:opacity-100 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="button"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 w-full py-2 text-[13px] transition group"
              style={{ color: "var(--app-text-muted)" }}
            >
              <Plus className="w-4 h-4 opacity-70 group-hover:opacity-100 transition" />
              <span className="group-hover:translate-x-[2px] transition">
                Adicionar tarefa
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}