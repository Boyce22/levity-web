import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, Check, Plus, Trash2, Loader2 } from "lucide-react";
import { createPriorityAction, deletePriorityAction } from "@/modules/workspace/actions/settings";

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
      await createPriorityAction(workspaceId, newPrioName.trim(), color, icon);
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
        className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
        style={{
          background: isOpen ? "var(--app-border)" : "var(--app-hover)",
          border: "1px solid var(--app-border)",
          color: currentPriorityData?.color || "var(--app-text-muted)",
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
            className="absolute top-11 right-0 w-56 p-1.5 z-50 flex flex-col gap-1.5"
            style={{
              borderRadius: "14px",
              background: "var(--app-panel)",
              border: "1px solid var(--app-border)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
            }}
          >
            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {priorities.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelect(p.name);
                    setIsOpen(false);
                  }}
                  className="group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                  style={{
                    color: selectedPriority === p.name ? p.color : "var(--app-text-muted)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--app-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span className="text-sm shrink-0 w-4">{p.icon}</span>
                  <span className="flex-1 text-[13px]">{p.name}</span>
                  <div className="flex items-center gap-1">
                    {selectedPriority === p.name && <Check className="w-3.5 h-3.5" />}
                    <button
                      onClick={(e) => handleDelete(e, p.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-400/10 hover:text-red-400 rounded-md transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
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

            <div className="pt-2 px-1 pb-1" style={{ borderTop: "1px solid var(--app-border-faint)" }}>
               <div className="flex items-center gap-2 px-2.5 py-2 rounded-xl border transition-all duration-200 focus-within:ring-2 focus-within:ring-[var(--app-primary)]/20"
                    style={{ 
                      background: "var(--app-bg)",
                      borderColor: "var(--app-border)",
                    }}
               >
                  <span className="text-xs w-4 text-center shrink-0" style={{ color: COLORS[0] }}>{ICONS[0]}</span>
                  <input 
                    type="text"
                    placeholder="Nova prioridade..."
                    className="flex-1 min-w-0 bg-transparent border-none text-[13px] text-[var(--app-text)] placeholder:text-[var(--app-text-muted)] focus:outline-none"
                    value={newPrioName}
                    onChange={(e) => setNewPrioName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  />
                  <button 
                    onClick={handleCreate}
                    disabled={isCreating || !newPrioName.trim()}
                    className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0 hover:bg-[var(--app-hover)] text-[var(--app-primary)] disabled:opacity-30 disabled:grayscale transition-all"
                  >
                    {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Plus className="w-4 h-4" />}
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}