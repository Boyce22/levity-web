// modules/board/components/BoardFiltersBar.tsx
import { Search, Flag, Tag, UserX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface BoardFiltersBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedUserFilters: string[];
  setSelectedUserFilters: (filters: string[]) => void;
  priorityFilter: string | null;
  setPriorityFilter: (filter: string | null) => void;
  labelFilter: string | null;
  setLabelFilter: (filter: string | null) => void;
  allUsers: any[];
  tags: any[];
  priorities: any[];
  hasActiveFilters: boolean;
  clearFilters: () => void;
}

export function BoardFiltersBar({
  searchQuery,
  setSearchQuery,
  selectedUserFilters,
  setSelectedUserFilters,
  priorityFilter,
  setPriorityFilter,
  labelFilter,
  setLabelFilter,
  allUsers,
  tags,
  priorities,
  hasActiveFilters,
  clearFilters,
}: BoardFiltersBarProps) {
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);

  const isUnassignedActive = selectedUserFilters.includes("unassigned");

  return (
    <div
      className="px-6 shrink-0 sticky z-40 flex no-scrollbar"
      style={{
        top: "57px",
        background: "var(--app-header)",
        borderBottom: "1px solid var(--app-border-faint)",
      }}
    >
      <div className="flex items-center gap-6 text-[13px] font-medium w-full py-2">
        {/* Search input */}
        <div className="relative group">
          <Search
            className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 transition-colors"
            style={{
              color: searchQuery
                ? "var(--app-primary)"
                : "var(--app-text-muted)",
            }}
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
            placeholder="Search"
            className="rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none w-35 sm:w-54 transition-all"
            style={{
              background: "var(--app-bg)",
              border: `1px solid ${searchQuery ? "var(--app-primary)" : "var(--app-border)"}`,
              color: "var(--app-text)",
            }}
          />
        </div>

        <div
          style={{
            width: "1px",
            height: "22px",
            background: "var(--app-border-faint)",
            flexShrink: 0,
          }}
        />

        {/* Member filters */}
        <div className="flex items-center gap-3 py-2 shrink-0">
          <span
            className="text-[10px] uppercase tracking-[0.2em] font-bold"
            style={{ color: "var(--app-text-muted)", opacity: 0.5 }}
          >
            Members
          </span>
          <div className="flex items-center -space-x-2">
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
                className="relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 border-2"
                style={{
                  background: isUnassignedActive ? "var(--app-primary)" : "var(--app-bg)",
                  borderColor: isUnassignedActive ? "var(--app-primary)" : "var(--app-border)",
                  zIndex: isUnassignedActive ? 21 : 5,
                  transform: isUnassignedActive ? "scale(1.1)" : "scale(1)",
                }}
              >
                <UserX className={`w-4 h-4 ${isUnassignedActive ? 'text-white' : 'text-var(--app-text-muted)'}`} />
              </button>
              <AnimatePresence>
                {hoveredMember === "unassigned" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-white text-[10px] font-bold rounded shadow-xl whitespace-nowrap z-[1000] pointer-events-none border border-white/5"
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
                      transform: isActive ? "scale(1.1)" : "scale(1)",
                      outline: isActive
                        ? `2px solid var(--app-primary)`
                        : "none",
                      outlineOffset: "1px",
                    }}
                  >
                    <img
                      src={
                        user.avatar_url ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                      }
                      className="w-8 h-8 rounded-full object-cover"
                      style={{
                        border: "2px solid var(--app-header)",
                        opacity: isActive ? 1 : 0.7,
                      }}
                    />
                    {isActive && (
                      <div
                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
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
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-zinc-800 text-white text-[11px] font-bold rounded-lg shadow-2xl whitespace-nowrap z-[1000] pointer-events-none border border-white/5"
                      >
                        {user.display_name || user.username}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        <div
          style={{
            width: "1px",
            height: "22px",
            background: "var(--app-border-faint)",
            flexShrink: 0,
          }}
        />

        {/* Priority filter */}
        <div className="flex items-center gap-2 py-2 shrink-0">
          <Flag
            className="w-3.5 h-3.5"
            style={{ color: "var(--app-text-muted)", opacity: 0.5 }}
          />
          {priorities.map((p) => (
            <button
              key={p.id}
              onClick={() =>
                setPriorityFilter(priorityFilter === p.name ? null : p.name)
              }
              className="text-[10px] font-bold px-2.5 py-1 rounded-full transition-all"
              style={{
                background:
                  priorityFilter === p.name ? (p.color || "var(--app-text)") + "25" : "transparent",
                color:
                  priorityFilter === p.name ? (p.color || "var(--app-text)") : "var(--app-text-muted)",
                border: `1px solid ${priorityFilter === p.name ? (p.color || "var(--app-text)") + "50" : "transparent"}`,
              }}
            >
              {p.icon} {p.name}
            </button>
          ))}
        </div>

        {/* Label filter */}
        <div className="flex items-center gap-2 py-2 shrink-0">
          <Tag
            className="w-3.5 h-3.5"
            style={{ color: "var(--app-text-muted)", opacity: 0.5 }}
          />
          {tags.map((l) => (
            <button
              key={l.id}
              onClick={() => setLabelFilter(labelFilter === l.name ? null : l.name)}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full transition-all"
              style={{
                background:
                  labelFilter === l.name ? (l.color || "var(--app-text)") + "25" : "transparent",
                color:
                  labelFilter === l.name ? (l.color || "var(--app-text)") : "var(--app-text-muted)",
                border: `1px solid ${labelFilter === l.name ? (l.color || "var(--app-text)") + "50" : "transparent"}`,
              }}
            >
              {l.name}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="ml-auto text-[11px] font-bold uppercase tracking-[0.15em] transition-colors shrink-0 px-3 py-1.5 rounded-xl flex items-center gap-2"
            style={{ 
              color: "var(--app-text-muted)",
              background: "rgba(248, 113, 113, 0.08)",
              border: "1px solid rgba(248, 113, 113, 0.1)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#f87171";
              e.currentTarget.style.background = "rgba(248, 113, 113, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--app-text-muted)";
              e.currentTarget.style.background = "rgba(248, 113, 113, 0.08)";
            }}
          >
            Clear Filters ✕
          </button>
        )}
      </div>
    </div>
  );
}