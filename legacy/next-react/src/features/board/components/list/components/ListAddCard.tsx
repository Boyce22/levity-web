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
              className="mt-1 rounded-lg px-2 py-1 transition"
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
                className="w-full resize-none bg-transparent text-[13px] placeholder:opacity-50 focus:outline-none"
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
                  className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition"
                  style={{
                    background: accentColor + "20",
                    color: accentColor,
                  }}
                >
                  Add
                </button>

                <button
                  onClick={handleCancel}
                  className="px-2 py-1 text-[12px] opacity-60 transition hover:opacity-100"
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
              className="group flex w-full items-center gap-2 py-2 text-[13px] transition"
              style={{ color: "var(--app-text-muted)" }}
            >
              <Plus className="h-4 w-4 opacity-70 transition group-hover:opacity-100" />
              <span className="transition group-hover:translate-x-[2px]">
                Adicionar tarefa
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}