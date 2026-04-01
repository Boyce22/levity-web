// modules/board/components/BoardFiltersBar.tsx
import { Search, Flag, Tag } from "lucide-react";

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
  hasActiveFilters,
  clearFilters,
}: BoardFiltersBarProps) {
  return (
    <div
      className="px-5 shrink-0 sticky z-10 flex overflow-x-auto no-scrollbar"
      style={{
        top: "57px",
        background: "var(--app-header)",
        borderBottom: "1px solid var(--app-border-faint)",
      }}
    >
      <div className="flex items-center gap-4 text-[13px] font-medium w-full py-1">
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
            placeholder="Buscar cards…"
            className="rounded-xl py-1.5 pl-9 pr-4 text-sm focus:outline-none w-35 sm:w-50 transition-all"
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
            height: "18px",
            background: "var(--app-border-faint)",
            flexShrink: 0,
          }}
        />

        {/* Member filters */}
        <div className="flex items-center gap-2 py-2 shrink-0">
          <span
            className="text-[10px] uppercase tracking-widest font-bold"
            style={{ color: "var(--app-text-muted)", opacity: 0.5 }}
          >
            Membros
          </span>
          <div className="flex -space-x-1.5">
            {allUsers.map((user) => {
              const isActive = selectedUserFilters.includes(user.id);
              return (
                <button
                  key={user.id}
                  onClick={() =>
                    setSelectedUserFilters(
                      isActive
                        ? selectedUserFilters.filter((id) => id !== user.id)
                        : [...selectedUserFilters, user.id]
                    )
                  }
                  className="relative rounded-full transition-all duration-200"
                  style={{
                    zIndex: isActive ? 20 : 10,
                    transform: isActive ? "scale(1.12)" : "scale(1)",
                    outline: isActive
                      ? `2px solid var(--app-primary)`
                      : "none",
                    outlineOffset: "1px",
                  }}
                  title={user.display_name || user.username}
                >
                  <img
                    src={
                      user.avatar_url ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                    }
                    className="w-6 h-6 rounded-full object-cover"
                    style={{
                      border: "2px solid var(--app-header)",
                      opacity: isActive ? 1 : 0.65,
                    }}
                  />
                  {isActive && (
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                      style={{
                        background: "var(--app-primary)",
                        borderColor: "var(--app-header)",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            width: "1px",
            height: "18px",
            background: "var(--app-border-faint)",
            flexShrink: 0,
          }}
        />

        {/* Priority filter */}
        <div className="flex items-center gap-1.5 py-2 shrink-0">
          <Flag
            className="w-3 h-3"
            style={{ color: "var(--app-text-muted)", opacity: 0.5 }}
          />
          {[
            { id: "high", label: "Alta", color: "#f87171" },
            { id: "medium", label: "Média", color: "#fbbf24" },
            { id: "low", label: "Baixa", color: "#34d399" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() =>
                setPriorityFilter(priorityFilter === p.id ? null : p.id)
              }
              className="text-[10px] font-bold px-2 py-0.5 rounded-full transition-all"
              style={{
                background:
                  priorityFilter === p.id ? p.color + "25" : "transparent",
                color:
                  priorityFilter === p.id ? p.color : "var(--app-text-muted)",
                border: `1px solid ${priorityFilter === p.id ? p.color + "50" : "transparent"}`,
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Label filter */}
        <div className="flex items-center gap-1.5 py-2 shrink-0">
          <Tag
            className="w-3 h-3"
            style={{ color: "var(--app-text-muted)", opacity: 0.5 }}
          />
          {[
            { id: "feature", label: "Feature", color: "#818cf8" },
            { id: "bug", label: "Bug", color: "#f87171" },
            { id: "infra", label: "Infra", color: "#94a3b8" },
          ].map((l) => (
            <button
              key={l.id}
              onClick={() => setLabelFilter(labelFilter === l.id ? null : l.id)}
              className="text-[10px] font-bold px-2 py-0.5 rounded-full transition-all"
              style={{
                background:
                  labelFilter === l.id ? l.color + "25" : "transparent",
                color:
                  labelFilter === l.id ? l.color : "var(--app-text-muted)",
                border: `1px solid ${labelFilter === l.id ? l.color + "50" : "transparent"}`,
              }}
            >
              {l.label}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="ml-auto text-[11px] font-bold uppercase tracking-wider transition-colors shrink-0 px-2 py-1 rounded-lg"
            style={{ color: "var(--app-text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--app-text-muted)")
            }
          >
            Limpar filtros ✕
          </button>
        )}
      </div>
    </div>
  );
}