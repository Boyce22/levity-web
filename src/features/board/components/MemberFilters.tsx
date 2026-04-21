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
    <div className="flex shrink-0 items-center gap-4 py-2">
      <span
        className="text-[11px] font-bold tracking-wider uppercase opacity-60"
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
            className="relative flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-200"
            style={{
              background: isUnassignedActive ? "var(--app-primary)" : "var(--app-bg)",
              borderColor: isUnassignedActive ? "var(--app-primary)" : "var(--app-border)",
              zIndex: isUnassignedActive ? 21 : 5,
              transform: isUnassignedActive ? "scale(1.05)" : "scale(1)",
            }}
          >
            <UserX
              className={`h-3.5 w-3.5 ${isUnassignedActive ? "text-white" : "text-app-text-muted"}`}
            />
          </button>
          <AnimatePresence>
            {hoveredMember === "unassigned" && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                className="pointer-events-none absolute top-full left-1/2 z-1000 mt-2 -translate-x-1/2 rounded-sm border border-white/10 bg-black/90 px-2.5 py-1.5 text-[11px] font-bold whitespace-nowrap text-white shadow-2xl backdrop-blur-md"
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
                  className="h-7 w-7 rounded-full object-cover"
                  style={{
                    border: `1.5px solid ${isActive ? "var(--app-primary)" : "var(--app-header)"}`,
                    opacity: isActive ? 1 : 0.85,
                  }}
                />
                {isActive && (
                  <div
                    className="border-1.5 absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full"
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
                    className="pointer-events-none absolute top-full left-1/2 z-1000 mt-2 -translate-x-1/2 rounded-sm border border-white/10 bg-black/90 px-2.5 py-1.5 text-[11px] font-bold whitespace-nowrap text-white shadow-2xl backdrop-blur-md"
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

