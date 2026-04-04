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
    <div className="flex items-center gap-6 border-b border-(--app-border-faint) w-full relative">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              relative flex items-center gap-2 py-3 px-1 text-[13px] font-bold transition-all
              ${isActive ? 'text-(--app-text)' : 'text-(--app-text-muted) hover:text-(--app-text)'}
            `}
          >
            <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
            <span className="tracking-tight">{tab.label}</span>
            
            {tab.badge != null && tab.badge > 0 && (
              <span className="text-[10px] opacity-60 font-black px-1.5 py-0.5 rounded-full bg-(--app-panel)/50 border border-(--app-border-faint)">
                {tab.badge}
              </span>
            )}

            {/* Subtle Gliding Underline */}
            {isActive && (
              <motion.div
                layoutId="active-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-(--app-primary) z-10"
                transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}