import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChevronDown, ArrowRight } from "lucide-react";
import { timeAgo } from "@/modules/shared/utils/date";
import { ACTION_META, ActionPill } from "../../../utils/historyUtils";

interface HistorySectionProps {
  history: any[];
  allUsers: any[];
}

export function HistorySection({ history, allUsers }: HistorySectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="rounded-sm overflow-hidden" style={{ border: "1px solid var(--app-border-faint)" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 transition-colors group"
        style={{ background: "var(--app-hover)" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--app-border-faint)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--app-hover)")}
      >
        <div className="flex items-center gap-2.5">
          <Clock className="w-3.5 h-3.5" style={{ color: "var(--app-text-muted)" }} />
          <span className="text-[13px] font-semibold transition-colors" style={{ color: "var(--app-text-muted)" }}>
            Edit History
          </span>
          {history.length > 0 && (
            <span
              className="px-1.5 py-0.5 rounded-sm text-[10px] font-bold"
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
          <ChevronDown className="w-4 h-4" style={{ color: "var(--app-text-muted)" }} />
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
            <div className="px-4 pb-4 pt-3">
              {sortedHistory.length === 0 ? (
                <p className="text-[12px] py-3 text-center italic" style={{ color: "var(--app-text-muted)" }}>
                  No edit history recorded.
                </p>
              ) : (
                <ol className="relative pl-8 space-y-0 mt-1">
                  <div
                    className="absolute left-2.75 top-2 bottom-2 w-px"
                    style={{ background: "var(--app-border)" }}
                  />
                  {sortedHistory.map((item, i) => {
                    const user = allUsers.find((u) => u.id === item.created_by) || item.users;
                    const meta = ACTION_META[item.action_type];
                    return (
                      <motion.li
                        key={item.id}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.025 }}
                        className="relative pb-4 last:pb-0"
                      >
                        <span className="absolute -left-8 top-1.25 w-5.5 flex justify-center">
                          <span
                            className="w-2 h-2 rounded-sm shrink-0"
                            style={{
                              background: meta?.dot ?? "#666",
                              boxShadow: `0 0 0 3px var(--app-elevated)`,
                            }}
                          />
                        </span>
                        <div className="flex items-start gap-2 flex-wrap">
                          {user && (
                            <img
                              src={
                                user.avatar_url ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                              }
                              className="w-5 h-5 rounded-sm object-cover shrink-0 mt-0.5 bg-[var(--app-panel)]"
                              style={{ border: "1px solid var(--app-border-faint)" }}
                            />
                          )}
                          <span className="text-[12.5px] font-semibold" style={{ color: "var(--app-text-muted)" }}>
                            {user?.display_name || user?.username || "Someone"}
                          </span>
                          <ActionPill type={item.action_type} field={item.field} />
                          {item.action_type === "updated" && item.old_value && item.new_value && (
                            <span
                              className="flex items-center gap-1 text-[11px] mt-0.5"
                              style={{ color: "var(--app-text-muted)" }}
                            >
                              <span className="line-through truncate max-w-18">{item.old_value}</span>
                              <ArrowRight className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate max-w-18">{item.new_value}</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] mt-0.5 block" style={{ color: "var(--app-text-muted)", opacity: 0.6 }}>
                          {timeAgo(item.created_at)}
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