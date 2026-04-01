import { motion } from "framer-motion";
import { AlignLeft, MessageSquare } from "lucide-react";

type Tab = "description" | "comments";

interface CardModalTabsProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  commentsCount: number;
}

export function CardModalTabs({ activeTab, setActiveTab, commentsCount }: CardModalTabsProps) {
  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: "description",
      label: "Descrição",
      icon: <AlignLeft className="w-3.5 h-3.5" />,
    },
    {
      id: "comments",
      label: "Comentários",
      icon: <MessageSquare className="w-3.5 h-3.5" />,
      badge: commentsCount,
    },
  ];

  return (
    <div className="flex gap-4" style={{ position: "relative" }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative flex items-center gap-2 py-3 px-1 text-[13px] font-bold transition-colors"
            style={{
              color: isActive ? "var(--app-text)" : "var(--app-text-muted)",
            }}
          >
            {tab.icon}
            {tab.label}
            
            {tab.badge != null && tab.badge > 0 && (
              <span
                className="ml-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold"
                style={{
                  background: isActive ? "var(--app-primary)" : "var(--app-border)",
                  color: isActive ? "#fff" : "var(--app-text-muted)",
                }}
              >
                {tab.badge}
              </span>
            )}

            {isActive && (
              <motion.div
                layoutId="modal-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ background: "var(--app-primary)" }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}