import { useState } from "react";
import { UserX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MemberFiltersProps {
  selectedUserFilters: string[];
  setSelectedUserFilters: (filters: string[]) => void;
  allUsers: any[];
}

export function MemberFilters({
  selectedUserFilters,
  setSelectedUserFilters,
  allUsers,
}: MemberFiltersProps) {
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);
  const isUnassignedActive = selectedUserFilters.includes("unassigned");

  return (
    <div className="flex items-center gap-4 py-2 shrink-0">
      <span
        className="text-[11px] font-bold uppercase tracking-wider opacity-60"
        style={{ color: "var(--app-text-muted)" }}
      >
        Members
      </span>
      <div className="flex items-center -space-x-1.5">
        {/* Unassigned Filter */}
        <div className="relative flex items-center">
          <button
            onClick={() =>
              setSelectedUserFilters(
                isUnassignedActive
                  ? selectedUserFilters.filter((id) => id !== "unassigned")
                  : [...selectedUserFilters, "unassigned"]
              )
            }
            onMouseEnter={() => setHoveredMember("unassigned")}
            onMouseLeave={() => setHoveredMember(null)}
            className="relative flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 border"
            style={{
              background: isUnassignedActive ? "var(--app-primary)" : "var(--app-bg)",
              borderColor: isUnassignedActive ? "var(--app-primary)" : "var(--app-border)",
              zIndex: isUnassignedActive ? 21 : 5,
              transform: isUnassignedActive ? "scale(1.05)" : "scale(1)",
            }}
          >
            <UserX
              className={`w-3.5 h-3.5 ${isUnassignedActive ? "text-white" : "text-(--app-text-muted)"}`}
            />
          </button>
          <AnimatePresence>
            {hoveredMember === "unassigned" && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-black/90 backdrop-blur-md text-white text-[11px] font-bold rounded-sm shadow-2xl whitespace-nowrap z-[1000] pointer-events-none border border-white/10"
              >
                Unassigned
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {allUsers.map((user) => {
          const isActive = selectedUserFilters.includes(user.id);
          return (
            <div key={user.id} className="relative flex items-center">
              <button
                onClick={() =>
                  setSelectedUserFilters(
                    isActive
                      ? selectedUserFilters.filter((id) => id !== user.id)
                      : [...selectedUserFilters, user.id]
                  )
                }
                onMouseEnter={() => setHoveredMember(user.id)}
                onMouseLeave={() => setHoveredMember(null)}
                className="relative flex items-center justify-center rounded-full transition-all duration-200"
                style={{
                  zIndex: isActive ? 20 : 10,
                  transform: isActive ? "scale(1.05)" : "scale(1)",
                }}
              >
                <img
                  src={
                    user.avatarUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                  }
                  className="w-7 h-7 rounded-full object-cover"
                  style={{
                    border: `1.5px solid ${isActive ? "var(--app-primary)" : "var(--app-header)"}`,
                    opacity: isActive ? 1 : 0.85,
                  }}
                />
                {isActive && (
                  <div
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-1.5"
                    style={{
                      background: "var(--app-primary)",
                      borderColor: "var(--app-header)",
                    }}
                  />
                )}
              </button>
              <AnimatePresence>
                {hoveredMember === user.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-black/90 backdrop-blur-md text-white text-[11px] font-bold rounded-sm shadow-2xl whitespace-nowrap z-[1000] pointer-events-none border border-white/10"
                  >
                    {user.displayName || user.username}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
