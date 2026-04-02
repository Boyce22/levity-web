import { motion, AnimatePresence } from "framer-motion";
import { Users, Check } from "lucide-react";

interface MemberPickerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  assigneeId: string | null;
  onSelect: (userId: string) => void;
  allUsers: any[];
}

export function MemberPicker({ isOpen, setIsOpen, assigneeId, onSelect, allUsers }: MemberPickerProps) {
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-9 h-9 rounded-sm transition-all"
        style={{
          background: isOpen ? "var(--app-border)" : "var(--app-hover)",
          border: "1px solid var(--app-border)",
          color: "var(--app-text-muted)",
        }}
        title="Membros"
      >
        <Users className="w-4 h-4" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            className="absolute top-11 right-0 w-56 p-1.5 z-50"
            style={{
              borderRadius: "6px",
              background: "var(--app-panel)",
              border: "1px solid var(--app-border)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
            }}
          >
            <div className="space-y-0.5 max-h-48 overflow-y-auto">
              {allUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => {
                    onSelect(u.id);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-sm cursor-pointer transition-colors"
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--app-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <img
                    src={
                      u.avatar_url ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`
                    }
                    className="w-6 h-6 rounded-sm object-cover bg-[var(--app-panel)]"
                    style={{ border: "1px solid var(--app-border-faint)" }}
                  />
                  <span className="flex-1 text-[13px]" style={{ color: "var(--app-text)" }}>
                    {u.display_name || u.username}
                  </span>
                  {assigneeId === u.id && <Check className="w-3.5 h-3.5" style={{ color: "#34d399" }} />}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}