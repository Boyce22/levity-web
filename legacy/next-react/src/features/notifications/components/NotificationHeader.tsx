import React from "react";
import {  CheckCheck } from "lucide-react";
import type { Notification  } from '@/contracts/Notification';

interface NotificationHeaderProps {
  notifications: Notification[];
  unreadCount: number;
  handleMarkAll: () => void;
}

export function NotificationHeader({
  notifications,
  unreadCount,
  handleMarkAll,
}: NotificationHeaderProps) {
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div
      className="flex items-center justify-between px-4 py-3.5"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-semibold text-white/85">
          Notifications
        </span>
        {unreadCount > 0 && (
          <span
            className="rounded-md px-1.5 py-0.5 text-[10px] font-bold"
            style={{
              background: "rgba(99,102,241,0.15)",
              color: "#a5b4fc",
              border: "1px solid rgba(99,102,241,0.2)",
            }}
          >
            {unreadCount} new
          </span>
        )}
      </div>
      {hasUnread && (
        <button
          onClick={handleMarkAll}
          className="flex items-center gap-1 text-[11px] font-medium text-white/30 transition-colors hover:text-indigo-400"
        >
          <CheckCheck className="h-3.5 w-3.5" /> Mark all read
        </button>
      )}
    </div>
  );
}
