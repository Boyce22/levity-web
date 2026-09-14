import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, Check, Plus, Trash2, Loader2 } from "lucide-react";
import { createPriorityAction, deletePriorityAction } from "@/features/workspaces/server/actions";

interface PriorityPickerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedPriority: string | null;
  onSelect: (priorityId: string) => void;
  priorities: any[];
  workspaceId: string;
}

const COLORS = ["#f87171", "#fbbf24", "#34d399", "#818cf8", "#c084fc"];
const ICONS = ["↑", "→", "↓", "!", "★"];

export function PriorityPicker({ isOpen, setIsOpen, selectedPriority, onSelect, priorities, workspaceId }: PriorityPickerProps) {
  const [newPrioName, setNewPrioName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const currentPriorityData = priorities.find((p) => p.name === selectedPriority);

  const handleCreate = async () => {
    if (!newPrioName.trim()) return;
    setIsCreating(true);
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const icon = ICONS[Math.floor(Math.random() * ICONS.length)];
    try {
      await createPriorityAction(workspaceId, { name: newPrioName.trim(), color, icon });
      setNewPrioName("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, prioId: string) => {
    e.stopPropagation();
    try {
      await deletePriorityAction(workspaceId, prioId);
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
          color: currentPriorityData?.color || "var(--app-text-muted)",
        }}
        title="Prioridade"
      >
        <Flag className="h-4 w-4" />
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
              {priorities.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelect(p.name);
                    setIsOpen(false);
                  }}
                  className="group flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2 transition-colors"
                  style={{
                    color: selectedPriority === p.name ? p.color : "var(--app-text-muted)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--app-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span className="w-4 shrink-0 text-sm">{p.icon}</span>
                  <span className="flex-1 text-[13px]">{p.name}</span>
                  <div className="flex items-center gap-1">
                    {selectedPriority === p.name && <Check className="h-3.5 w-3.5" />}
                    <button
                      onClick={(e) => handleDelete(e, p.id)}
                      className="rounded-md p-1 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-400/10 hover:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
              {priorities.length === 0 && (
                <div className="px-3 py-4 text-center">
                   <p className="text-[11px]" style={{ color: "var(--app-text-muted)" }}>
                     Sem prioridades configuradas
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
                  <span className="w-4 shrink-0 text-center text-xs" style={{ color: COLORS[0] }}>{ICONS[0]}</span>
                  <input 
                    type="text"
                    placeholder="Nova prioridade..."
                    className="min-w-0 flex-1 border-none bg-transparent text-[13px] text-[var(--app-text)] placeholder:text-[var(--app-text-muted)] focus:outline-none"
                    value={newPrioName}
                    onChange={(e) => setNewPrioName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  />
                  <button 
                    onClick={handleCreate}
                    disabled={isCreating || !newPrioName.trim()}
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