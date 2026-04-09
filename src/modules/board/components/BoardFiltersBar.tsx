// modules/board/components/BoardFiltersBar.tsx
import { X } from "lucide-react";
import { SearchFilter } from "./SearchFilter";
import { MemberFilters } from "./MemberFilters";
import { PriorityFilters } from "./PriorityFilters";
import { LabelFilters } from "./LabelFilters";

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
  return (
    <div
      className="px-6 shrink-0 flex no-scrollbar bg-(--app-bg) border-b border-(--app-border-faint)"
    >
      <div className="flex items-center gap-6 text-[13px] font-medium w-full py-2">
        <SearchFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <Divider />

        <MemberFilters
          selectedUserFilters={selectedUserFilters}
          setSelectedUserFilters={setSelectedUserFilters}
          allUsers={allUsers}
        />

        <Divider />

        <PriorityFilters
          priorities={priorities}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
        />

        <LabelFilters
          tags={tags}
          labelFilter={labelFilter}
          setLabelFilter={setLabelFilter}
        />

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="ml-auto text-[10px] font-bold uppercase tracking-wider transition-all shrink-0 px-2.5 py-1 rounded-sm flex items-center gap-1.5"
            style={{ 
              color: "#f87171",
              background: "rgba(248, 113, 113, 0.08)",
              border: "1px solid rgba(248, 113, 113, 0.2)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(248, 113, 113, 0.15)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(248, 113, 113, 0.08)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Clear Filters
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div
      style={{
        width: "1px",
        height: "18px",
        background: "var(--app-border-faint)",
        flexShrink: 0,
        opacity: 0.5
      }}
    />
  );
}