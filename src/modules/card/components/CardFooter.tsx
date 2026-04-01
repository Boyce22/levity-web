import { AlignLeft, MessageSquare } from "lucide-react";
import { CardDueDate } from "./CardDueDate";

interface CardFooterProps {
  description?: string | null;
  dueDate?: string | null;
  commentCount: number;
  assignedUser: any | null;
}

export function CardFooter({ description, dueDate, commentCount, assignedUser }: CardFooterProps) {
  return (
    <div className="flex items-center justify-between mt-3 gap-2">
      <div className="flex items-center gap-2">
        {dueDate && <CardDueDate dueDate={dueDate} />}
        <div className="flex items-center gap-2" style={{ color: "var(--app-text-muted)" }}>
          {description && <AlignLeft className="w-3.5 h-3.5" />}
          {commentCount > 0 && (
            <span className="flex items-center gap-1 text-[11px]">
              <MessageSquare className="w-3.5 h-3.5" />
              {commentCount}
            </span>
          )}
        </div>
      </div>
      {assignedUser && (
        <img
          src={
            assignedUser.avatar_url ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${assignedUser.username}`
          }
          title={assignedUser.display_name || assignedUser.username}
          className="w-6 h-6 rounded-full object-cover"
          style={{ border: "2px solid var(--app-panel)" }}
        />
      )}
    </div>
  );
}