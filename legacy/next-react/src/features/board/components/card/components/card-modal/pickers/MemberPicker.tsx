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
        className="flex h-9 w-9 items-center justify-center rounded-sm transition-all"
        style={{
          background: isOpen ? "var(--app-border)" : "var(--app-hover)",
          border: "1px solid var(--app-border)",
          color: "var(--app-text-muted)",
        }}
        title="Membros"
      >
        <Users className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            className="absolute top-11 right-0 z-50 w-56 p-1.5"
            style={{
              borderRadius: "6px",
              background: "var(--app-panel)",
              border: "1px solid var(--app-border)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
            }}
          >
            <div className="max-h-48 space-y-0.5 overflow-y-auto">
              {allUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => {
                    onSelect(u.id);
                    setIsOpen(false);
                  }}
                  className="flex cursor-pointer items-center gap-2.5 rounded-sm px-3 py-2 transition-colors"
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--app-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <img
                    src={
                      u.avatarUrl ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`
                    }
                    className="h-6 w-6 rounded-sm bg-[var(--app-panel)] object-cover"
                    style={{ border: "1px solid var(--app-border-faint)" }}
                  />
                  <span className="flex-1 text-[13px]" style={{ color: "var(--app-text)" }}>
                    {u.displayName || u.username}
                  </span>
                  {assigneeId === u.id && <Check className="h-3.5 w-3.5" style={{ color: "#34d399" }} />}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}