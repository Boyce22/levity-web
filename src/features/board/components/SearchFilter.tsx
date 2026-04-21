import { Search } from "lucide-react";

interface SearchFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function SearchFilter({ searchQuery, setSearchQuery }: SearchFilterProps) {
  return (
    <div className="group relative">
      <Search
        className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 transition-colors"
        style={{
          color: searchQuery ? "var(--app-primary)" : "var(--app-text-muted)",
        }}
      />
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        type="text"
        placeholder="Search tasks..."
        className="w-35 rounded-sm py-2 pr-4 pl-9 text-[13px] transition-all focus:outline-none sm:w-54"
        style={{
          background: "var(--app-bg)",
          border: `1px solid ${searchQuery ? "var(--app-primary)" : "var(--app-border)"}`,
          color: "var(--app-text)",
        }}
      />
    </div>
  );
}
