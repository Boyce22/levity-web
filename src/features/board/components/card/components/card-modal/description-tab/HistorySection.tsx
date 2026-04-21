import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChevronDown, ArrowRight } from "lucide-react";
import { timeAgo } from "@/ui/utils/date";
import { ACTION_META, ActionPill } from "../../../utils/historyUtils";

interface HistorySectionProps {
  history: any[];
  allUsers: any[];
}

export function HistorySection({ history, allUsers }: HistorySectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="overflow-hidden rounded-sm" style={{ border: "1px solid var(--app-border-faint)" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex w-full items-center justify-between px-4 py-3 transition-colors"
        style={{ background: "var(--app-hover)" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--app-border-faint)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--app-hover)")}
      >
        <div className="flex items-center gap-2.5">
          <Clock className="h-3.5 w-3.5" style={{ color: "var(--app-text-muted)" }} />
          <span className="text-[13px] font-semibold transition-colors" style={{ color: "var(--app-text-muted)" }}>
            Edit History
          </span>
          {history.length > 0 && (
            <span
              className="rounded-sm px-1.5 py-0.5 text-[10px] font-bold"
              style={{
                background: "var(--app-border)",
                color: "var(--app-text-muted)",
              }}
            >
              {history.length}
            </span>
          )}
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4" style={{ color: "var(--app-text-muted)" }} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            style={{
              overflow: "hidden",
              borderTop: "1px solid var(--app-border-faint)",
            }}
          >
            <div className="px-4 pt-3 pb-4">
              {sortedHistory.length === 0 ? (
                <p className="py-3 text-center text-[12px] italic" style={{ color: "var(--app-text-muted)" }}>
                  No edit history recorded.
                </p>
              ) : (
                <ol className="relative mt-1 space-y-0 pl-8">
                  <div
                    className="absolute top-2 bottom-2 left-2.75 w-px"
                    style={{ background: "var(--app-border)" }}
                  />
                  {sortedHistory.map((item, i) => {
                    const user = allUsers.find((u) => u.id === item.createdBy) || item.users;
                    const meta = ACTION_META[item.actionType];
                    return (
                      <motion.li
                        key={item.id}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.025 }}
                        className="relative pb-4 last:pb-0"
                      >
                        <span className="absolute top-1.25 -left-8 flex w-5.5 justify-center">
                          <span
                            className="h-2 w-2 shrink-0 rounded-sm"
                            style={{
                              background: meta?.dot ?? "#666",
                              boxShadow: `0 0 0 3px var(--app-elevated)`,
                            }}
                          />
                        </span>
                        <div className="flex flex-wrap items-start gap-2">
                          {user && (
                            <img
                              src={
                                user.avatarUrl ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                              }
                              className="mt-0.5 h-5 w-5 shrink-0 rounded-sm bg-[var(--app-panel)] object-cover"
                              style={{ border: "1px solid var(--app-border-faint)" }}
                            />
                          )}
                          <span className="text-[12.5px] font-semibold" style={{ color: "var(--app-text-muted)" }}>
                            {user?.displayName || user?.username || "Someone"}
                          </span>
                          <ActionPill type={item.actionType} field={item.field} />
                          {item.actionType === "updated" && item.oldValue && item.newValue && (
                            <span
                              className="mt-0.5 flex items-center gap-1 text-[11px]"
                              style={{ color: "var(--app-text-muted)" }}
                            >
                              <span className="max-w-18 truncate line-through">{item.oldValue}</span>
                              <ArrowRight className="h-2.5 w-2.5 shrink-0" />
                              <span className="max-w-18 truncate">{item.newValue}</span>
                            </span>
                          )}
                        </div>
                        <span className="mt-0.5 block text-[11px]" style={{ color: "var(--app-text-muted)", opacity: 0.6 }}>
                          {timeAgo(item.createdAt)}
                        </span>
                      </motion.li>
                    );
                  })}
                </ol>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}