"use client";

import { motion } from "framer-motion";
import { AlignLeft, MessageSquare, Paintbrush } from "lucide-react";
import React from "react";

type Tab = "description" | "comments" | "diagram";

interface CardModalTabsProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  commentsCount: number;
}

export function CardModalTabs({ activeTab, setActiveTab, commentsCount }: CardModalTabsProps) {
  const tabs: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "description", label: "Description", icon: AlignLeft },
    { id: "comments", label: "Comments", icon: MessageSquare, badge: commentsCount },
    { id: "diagram", label: "Diagram", icon: Paintbrush },
  ];

  return (
    <div className="border-app-border-faint relative flex w-full items-center gap-6 border-b">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              relative flex items-center gap-2 px-1 py-3 text-[13px] font-bold transition-all
              ${isActive ? 'text-app-text' : 'text-app-text-muted hover:text-app-text'}
            `}
          >
            <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
            <span className="tracking-tight">{tab.label}</span>
            
            {tab.badge != null && tab.badge > 0 && (
              <span className="bg-app-panel/50 border-app-border-faint rounded-full border px-1.5 py-0.5 text-[10px] font-black opacity-60">
                {tab.badge}
              </span>
            )}

            {/* Subtle Gliding Underline */}
            {isActive && (
              <motion.div
                layoutId="active-underline"
                className="bg-app-primary absolute right-0 bottom-0 left-0 z-10 h-0.5"
                transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
