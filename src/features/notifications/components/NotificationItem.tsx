import React from "react";
import {  motion } from "framer-motion";
import type { Notification  } from '@/contracts/Notification';

interface NotificationItemProps {
  notification: Notification;
  index: number;
  onClick?: (cardId: string) => void;
  onItemClick: (notif: Notification) => void;
}

export function NotificationItem({
  notification: notif,
  index,
  onClick,
  onItemClick,
}: NotificationItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={() => onItemClick(notif)}
      className={`flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors ${
        onClick ? "cursor-pointer hover:bg-white/5" : "cursor-default"
      }`}
      style={{
        background: notif.read ? "transparent" : "rgba(99,102,241,0.07)",
        opacity: notif.read ? 0.6 : 1,
      }}
    >
      <div className="relative shrink-0">
        <img
          src={
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${notif.actorId}`
          }
          className="h-7 w-7 rounded-full object-cover"
          style={{ border: "1.5px solid rgba(255,255,255,0.1)" }}
        />
        {!notif.read && (
          <span
            className="absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full"
            style={{
              background: "#6366f1",
              boxShadow: "0 0 6px rgba(99,102,241,0.6)",
            }}
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] leading-snug text-white/75">
          <span className="font-semibold text-white/90">
            {notif.actorId}
          </span>{" "}
          mentioned you in a comment.
        </p>
        {notif.content && (
          <p className="mt-0.5 truncate text-[11.5px] text-white/35">
            "{notif.content}"
          </p>
        )}
        <span className="mt-1 block text-[10px] text-white/25">
          {new Date(notif.createdAt).toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </motion.div>
  );
}
