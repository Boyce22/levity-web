import { useState, useMemo } from "react";
import { Card as CardType } from "@/modules/board/actions/board";

export function useFilters({ cards }: { cards: CardType[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserFilters, setSelectedUserFilters] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [labelFilter, setLabelFilter] = useState<string | null>(null);

  const filteredCards = useMemo(() => {
    return cards.filter((c) => {
      const matchesSearch =
        c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesUser =
        selectedUserFilters.length === 0 ||
        (c.assignee_id && selectedUserFilters.includes(c.assignee_id));
      const matchesPriority = !priorityFilter || c.priority === priorityFilter;
      const matchesLabel = !labelFilter || c.label === labelFilter;
      return matchesSearch && matchesUser && matchesPriority && matchesLabel;
    });
  }, [cards, searchQuery, selectedUserFilters, priorityFilter, labelFilter]);

  const hasActiveFilters =
    selectedUserFilters.length > 0 ||
    priorityFilter !== null ||
    labelFilter !== null ||
    searchQuery !== "";

  const clearFilters = () => {
    setSelectedUserFilters([]);
    setPriorityFilter(null);
    setLabelFilter(null);
    setSearchQuery("");
  };

  return {
    searchQuery,
    setSearchQuery,
    selectedUserFilters,
    setSelectedUserFilters,
    priorityFilter,
    setPriorityFilter,
    labelFilter,
    setLabelFilter,
    filteredCards,
    hasActiveFilters,
    clearFilters,
  };
}