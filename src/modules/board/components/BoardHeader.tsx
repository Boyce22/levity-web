// modules/board/components/BoardHeader.tsx
"use client";

import { useState } from "react";
import { Layout, ChevronDown, Settings, Share2, LogOut } from "lucide-react";
import NotificationBell from "@/modules/users/components/NotificationBell";
import { logoutAction } from "@/modules/users/actions/users";
import { Card as CardType, List as ListType } from "@/modules/board/actions/board";
import { getListType, getCardEffectiveProgress } from "@/modules/list/utils/listType";

import { LevityLogo } from "@/modules/shared/components/LevityLogo";

interface BoardHeaderProps {
  workspaces: any[];
  currentWorkspaceId: string;
  currentWorkspaceName?: string;
  userProfile: any;
  allUsers: any[];
  lists: ListType[];
  cards: CardType[];
  onOpenSettings: () => void;
  onOpenShare: () => void;
  onOpenProfile: () => void;
  onNotificationClick?: (cardId: string) => void;
  isCreatingWorkspace: boolean;
  setIsCreatingWorkspace: (creating: boolean) => void;
}

export function BoardHeader({
  workspaces,
  currentWorkspaceId,
  currentWorkspaceName,
  userProfile,
  allUsers,
  lists,
  cards,
  onOpenSettings,
  onOpenShare,
  onOpenProfile,
  onNotificationClick,
  isCreatingWorkspace,
  setIsCreatingWorkspace,
}: BoardHeaderProps) {
  const displayAvatar =
    userProfile?.avatar_url ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.username}`;

  // Workspace progress — média do progresso efetivo de todos os cards
  // Combina card.progress (checklist) com tipo inferido da lista como fallback
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

  return (
    <header
      className="px-5 py-3 flex flex-wrap gap-3 items-center justify-between shrink-0 z-60 sticky top-0"
      style={{
        background: "var(--app-header)",
        borderBottom: "1px solid var(--app-border-faint)",
      }}
    >
      <div className="flex items-center gap-3">
        {/* Logo */}
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
          style={{
            background: "var(--app-primary-muted)",
            border: "1px solid var(--app-border)",
          }}
        >
          <LevityLogo size={24} />
        </div>

        {/* Workspace switcher */}
        <div className="relative group/ws z-100 flex items-center gap-1.5">
          <h1
            className="text-[15px] font-bold tracking-tight flex items-center gap-1.5 cursor-pointer transition-colors"
            style={{ color: "var(--app-text)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--app-primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--app-text)")
            }
          >
            {currentWorkspaceName || "Workspace"}
            <ChevronDown
              className="w-3.5 h-3.5"
              style={{ color: "var(--app-text-muted)" }}
            />
          </h1>
          <button
            onClick={onOpenSettings}
            className="p-1 rounded-lg opacity-0 group-hover/ws:opacity-100 transition-all"
            style={{ color: "var(--app-text-muted)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--app-primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--app-text-muted)")
            }
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Dropdown */}
          <div
            className="absolute top-full left-0 mt-2 w-52 p-1.5 opacity-0 invisible group-hover/ws:opacity-100 group-hover/ws:visible transition-all"
            style={{
              borderRadius: "14px",
              background: "var(--app-elevated)",
              border: "1px solid var(--app-border)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
            }}
          >
            {workspaces.map((w) => (
              <a
                key={w.id}
                href={`/?workspace=${w.id}`}
                className="block px-3 py-2 rounded-lg text-sm transition-colors"
                style={{
                  color:
                    w.id === currentWorkspaceId
                      ? "var(--app-primary)"
                      : "var(--app-text-muted)",
                  background:
                    w.id === currentWorkspaceId
                      ? "var(--app-primary-muted)"
                      : "transparent",
                }}
                onMouseEnter={(e) =>
                  w.id !== currentWorkspaceId &&
                  (e.currentTarget.style.background = "var(--app-hover)")
                }
                onMouseLeave={(e) =>
                  w.id !== currentWorkspaceId &&
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {w.name}
              </a>
            ))}
            <div
              style={{
                height: "1px",
                background: "var(--app-border-faint)",
                margin: "4px 0",
              }}
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsCreatingWorkspace(true);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ color: "var(--app-primary)" }}
              onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                "var(--app-primary-muted)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              + Criar workspace
            </button>
          </div>
        </div>

        {/* Sprint progress pill */}
        {totalCards > 0 && (
          <div
            className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all"
            style={{
              background: "var(--app-hover)",
              border: "1px solid var(--app-border)",
            }}
          >
            <div
              className="w-24 h-2 rounded-full overflow-hidden shadow-inner"
              style={{ background: "var(--app-border-faint)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progressPct}%`,
                  background:
                    progressPct === 100
                      ? "#10b981"
                      : "linear-gradient(90deg, var(--app-primary) 0%, #a78bfa 100%)",
                  boxShadow: "0 0 10px rgba(129, 140, 248, 0.3)",
                }}
              />
            </div>
            <span style={{ color: "var(--app-text)", opacity: 0.9 }}>
              {progressPct}%
            </span>
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <NotificationBell
          onNotificationClick={(cardId) => onNotificationClick?.(cardId)}
        />
        <div
          style={{
            width: "1px",
            height: "20px",
            background: "var(--app-border)",
          }}
        />
        <button
          onClick={onOpenShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: "var(--app-primary-muted)",
            border: "1px solid var(--app-primary)",
            color: "var(--app-primary)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "var(--app-primary)";
            (e.currentTarget as HTMLButtonElement).style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "var(--app-primary-muted)";
            (e.currentTarget as HTMLButtonElement).style.color =
              "var(--app-primary)";
          }}
        >
          <Share2 className="w-4 h-4" /> Share
        </button>

        <button
          onClick={onOpenProfile}
          className="flex items-center transition-transform hover:scale-105"
        >
          <img
            src={displayAvatar}
            alt="Perfil"
            className="w-8 h-8 rounded-full object-cover"
            style={{ border: "2px solid var(--app-border)" }}
          />
        </button>

        <form action={logoutAction}>
          <button
            type="submit"
            title="Sair"
            className="flex items-center justify-center w-8 h-8 rounded-full transition-all"
            style={{ color: "var(--app-text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--app-text-muted)")
            }
          >
            <LogOut className="w-4 h-4" />
          </button>
        </form>
      </div>
    </header>
  );
}