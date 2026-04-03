"use client";

import { Share2, ChevronRight, Layout } from "lucide-react";
import NotificationBell from "@/modules/users/components/NotificationBell";
import { Card as CardType, List as ListType } from "@/modules/board/actions/board";
import { getListType, getCardEffectiveProgress } from "@/modules/list/utils/listType";

interface BoardHeaderProps {
  currentWorkspaceName?: string;
  lists: ListType[];
  cards: CardType[];
  onOpenShare: () => void;
  onNotificationClick?: (cardId: string) => void;
  activeView: string;
}

export function BoardHeader({
  currentWorkspaceName,
  lists,
  cards,
  onOpenShare,
  onNotificationClick,
  activeView,
}: BoardHeaderProps) {
  // Workspace progress calculation
  const totalCards = cards.length;
  const sortedLists = [...lists].sort((a, b) => a.position - b.position);
  const listTypeMap = new Map<string, ReturnType<typeof getListType>>();
  
  sortedLists.forEach((list, idx) => {
    listTypeMap.set(list.id, getListType(list, idx, sortedLists.length));
  });

  const progressPct =
    totalCards > 0
      ? Math.round(
          cards.reduce((sum, c) => {
            const listType = listTypeMap.get(c.list_id) ?? "todo";
            return sum + getCardEffectiveProgress(c.progress, listType);
          }, 0) / totalCards
        )
      : 0;

  const viewLabels: Record<string, string> = {
    board: "Project Board",
    members: "Workspace Members",
    invites: "Active Invites",
    dashboard: "Analytics Dashboard",
  };

  return (
    <header
      className="h-16 px-6 flex items-center justify-between shrink-0 z-50 bg-(--app-header) border-b border-(--app-border-faint) sticky top-0"
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="text-sm font-medium text-(--app-text-muted) truncate max-w-[150px]">
          {currentWorkspaceName || "Workspace"}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-(--app-text-muted) opacity-40 shrink-0" />
        <div className="flex items-center gap-2 px-2 py-1 rounded-sm bg-(--app-primary-muted)/30 border border-(--app-border-faint)">
          <Layout className="w-3.5 h-3.5 text-(--app-primary)" />
          <span className="text-sm font-bold text-(--app-text) whitespace-nowrap">
            {viewLabels[activeView] || "Project Board"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Sprint progress pill - only show in board view */}
        {activeView === "board" && totalCards > 0 && (
          <div
            className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-sm text-[11px] font-bold transition-all bg-(--app-hover) border border-(--app-border)"
          >
            <div className="w-20 h-1.5 rounded-full overflow-hidden bg-(--app-border-faint)">
              <div
                className="h-full transition-all duration-700 ease-out"
                style={{
                  width: `${progressPct}%`,
                  background: progressPct === 100 ? "#10b981" : "var(--app-primary)",
                }}
              />
            </div>
            <span className="text-(--app-text) opacity-90">{progressPct}%</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <NotificationBell
            onNotificationClick={(cardId) => onNotificationClick?.(cardId)}
          />
          <div className="w-[1px] h-4 bg-(--app-border-faint) mx-1" />
          <button
            onClick={onOpenShare}
            className="flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-bold transition-all bg-(--app-primary) text-white hover:brightness-110 shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>
    </header>
  );
}