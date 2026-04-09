import { Search } from "lucide-react";

interface SearchFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function SearchFilter({ searchQuery, setSearchQuery }: SearchFilterProps) {
  return (
    <div className="relative group">
      <Search
        className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 transition-colors"
        style={{
          color: searchQuery ? "var(--app-primary)" : "var(--app-text-muted)",
        }}
      />
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        type="text"
        placeholder="Search tasks..."
        className="rounded-sm py-2 pl-9 pr-4 text-[13px] focus:outline-none w-35 sm:w-54 transition-all"
        style={{
          background: "var(--app-bg)",
          border: `1px solid ${searchQuery ? "var(--app-primary)" : "var(--app-border)"}`,
          color: "var(--app-text)",
        }}
      />
    </div>
  );
}
