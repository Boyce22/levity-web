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
    <div className="flex px-7 pt-4 mt-0" style={{ borderBottom: "1px solid var(--app-border-faint)" }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className="relative pb-3 px-1 mr-6 text-sm font-semibold transition-colors"
          style={{
            color: activeTab === tab.id ? "var(--app-text)" : "var(--app-text-muted)",
          }}
        >
          <span className="flex items-center gap-1.5">
            {tab.icon}
            {tab.label}
            {tab.badge != null && tab.badge > 0 && (
              <span
                className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                style={{
                  background: "var(--app-primary-muted)",
                  color: "var(--app-primary)",
                }}
              >
                {tab.badge}
              </span>
            )}
          </span>
          {activeTab === tab.id && (
            <motion.div
              layoutId="modal-tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
              style={{ background: "var(--app-primary)" }}
            />
          )}
        </button>
      ))}
    </div>
  );
}