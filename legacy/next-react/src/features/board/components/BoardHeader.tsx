"use client";

import {  Share2, ChevronRight, Layout } from "lucide-react";
import NotificationBell from "@/features/notifications/components/NotificationBell";
import type { Card as CardType, List as ListType  } from '@/contracts/Board';
import { getListType, getCardEffectiveProgress } from "@/features/board/components/list/utils/listType";

interface BoardHeaderProps {
  currentWorkspaceName?: string;
  lists: ListType[];
  cards: CardType[];
  onOpenShare: () => void;
  onNotificationClick?: (cardId: string) => void;
  activeView: string;
  userRole: string;
}

export function BoardHeader({
  currentWorkspaceName,
  lists,
  cards,
  onOpenShare,
  onNotificationClick,
  activeView,
  userRole,
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
            const listType = listTypeMap.get(c.listId) ?? "todo";
            return sum + getCardEffectiveProgress(c.progress, listType);
          }, 0) / totalCards
        )
      : 0;

  const viewLabels: Record<string, string> = {
    board: "Project Board",
    sprints: "Sprints",
    management: "Workspace Management",
    dashboard: "Analytics Dashboard",
  };

  return (
    <header
      className="bg-app-header border-app-border-faint sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between border-b px-6"
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="text-app-text-muted max-w-[150px] truncate text-sm font-medium">
          {currentWorkspaceName || "Workspace"}
        </span>
        <ChevronRight className="text-app-text-muted h-3.5 w-3.5 shrink-0 opacity-40" />
        <div className="bg-app-primary-muted/30 border-app-border-faint flex items-center gap-2 rounded-sm border px-2 py-1">
          <Layout className="text-app-primary h-3.5 w-3.5" />
          <span className="text-app-text text-sm font-bold whitespace-nowrap">
            {viewLabels[activeView] || "Project Board"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Sprint progress pill - only show in board view */}
        {activeView === "board" && totalCards > 0 && (
          <div
            className="bg-app-hover border-app-border hidden items-center gap-2.5 rounded-sm border px-3 py-1.5 text-[11px] font-bold transition-all md:flex"
          >
            <div className="bg-app-border-faint h-1.5 w-20 overflow-hidden rounded-full">
              <div
                className="h-full transition-all duration-700 ease-out"
                style={{
                  width: `${progressPct}%`,
                  background: progressPct === 100 ? "#10b981" : "var(--app-primary)",
                }}
              />
            </div>
            <span className="text-app-text opacity-90">{progressPct}%</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <NotificationBell
            onNotificationClick={(cardId) => onNotificationClick?.(cardId)}
          />
          <div className="bg-app-border-faint mx-1 h-4 w-[1px]" />
          {['owner', 'admin'].includes(userRole) && (
            <button
              onClick={onOpenShare}
              className="bg-app-primary flex items-center gap-2 rounded-sm px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:brightness-110"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
