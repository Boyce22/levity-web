import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Check, Plus, Trash2, Loader2 } from "lucide-react";
import { createTagAction, deleteTagAction } from "@/features/workspaces/server/actions";

interface LabelPickerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedLabel: string | null;
  onSelect: (labelId: string) => void;
  tags: any[];
  workspaceId: string;
}

const COLORS = ["#818cf8", "#f87171", "#94a3b8", "#c084fc", "#2dd4bf", "#fbbf24", "#34d399"];

export function LabelPicker({ isOpen, setIsOpen, selectedLabel, onSelect, tags, workspaceId }: LabelPickerProps) {
  const [newTagName, setNewTagName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const currentLabelData = tags.find((l) => l.name === selectedLabel);

  const handleCreate = async () => {
    if (!newTagName.trim()) return;
    setIsCreating(true);
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    try {
      await createTagAction(workspaceId, { name: newTagName.trim(), color });
      setNewTagName("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, tagId: string) => {
    e.stopPropagation();
    try {
      await deleteTagAction(workspaceId, tagId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-sm transition-all"
        style={{
          background: isOpen ? "var(--app-border)" : "var(--app-hover)",
          border: "1px solid var(--app-border)",
          color: currentLabelData?.color || "var(--app-text-muted)",
        }}
        title="Etiqueta"
      >
        <Tag className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            className="absolute top-11 right-0 z-50 flex w-56 flex-col gap-1.5 p-1.5"
            style={{
              borderRadius: "6px",
              background: "var(--app-panel)",
              border: "1px solid var(--app-border)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
            }}
          >
            <div className="max-h-48 space-y-0.5 overflow-y-auto">
              {tags.map((l) => (
                <div
                  key={l.id}
                  onClick={() => {
                    onSelect(l.name);
                    setIsOpen(false);
                  }}
                  className="group flex cursor-pointer items-center gap-2.5 rounded-sm px-3 py-2 transition-colors"
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--app-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: l.color }} />
                  <span className="flex-1 text-[13px]" style={{ color: "var(--app-text)" }}>
                    {l.name}
                  </span>
                  <div className="flex items-center gap-1">
                    {selectedLabel === l.name && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                    <button
                      onClick={(e) => handleDelete(e, l.id)}
                      className="rounded-md p-1 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-400/10 hover:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
              {tags.length === 0 && (
                <div className="px-3 py-4 text-center">
                   <p className="text-[11px]" style={{ color: "var(--app-text-muted)" }}>
                     Sem etiquetas criadas
                   </p>
                </div>
              )}
            </div>

            <div className="px-1 pt-2 pb-1" style={{ borderTop: "1px solid var(--app-border-faint)" }}>
               <div className="flex items-center gap-2 rounded-sm border px-2.5 py-2 transition-all duration-200 focus-within:ring-2 focus-within:ring-[var(--app-primary)]/20"
                    style={{ 
                      background: "var(--app-bg)",
                      borderColor: "var(--app-border)",
                    }}
               >
                  <div className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: COLORS[0] }} />
                  <input 
                    type="text"
                    placeholder="Nova tag..."
                    className="min-w-0 flex-1 border-none bg-transparent text-[13px] text-[var(--app-text)] placeholder:text-[var(--app-text-muted)] focus:outline-none"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  />
                  <button 
                    onClick={handleCreate}
                    disabled={isCreating || !newTagName.trim()}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-[var(--app-primary)] transition-all hover:bg-[var(--app-hover)] disabled:opacity-30 disabled:grayscale"
                  >
                    {isCreating ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Plus className="h-4 w-4" />}
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}