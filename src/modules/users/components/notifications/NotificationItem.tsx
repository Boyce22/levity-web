import React from "react";
import { motion } from "framer-motion";
import { Notification } from "@/modules/users/actions/notifications";

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
      className={`flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors ${
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
            notif.actor?.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${notif.actor?.username}`
          }
          className="w-7 h-7 rounded-full object-cover"
          style={{ border: "1.5px solid rgba(255,255,255,0.1)" }}
        />
        {!notif.read && (
          <span
            className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full"
            style={{
              background: "#6366f1",
              boxShadow: "0 0 6px rgba(99,102,241,0.6)",
            }}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12.5px] text-white/75 leading-snug">
          <span className="font-semibold text-white/90">
            {notif.actor?.displayName || notif.actor?.username}
          </span>{" "}
          mentioned you in a comment.
        </p>
        {notif.content && (
          <p className="text-[11.5px] text-white/35 mt-0.5 truncate">
            "{notif.content}"
          </p>
        )}
        <span className="text-[10px] text-white/25 mt-1 block">
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
