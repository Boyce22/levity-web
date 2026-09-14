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
    <div className="mt-3 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        {dueDate && <CardDueDate dueDate={dueDate} />}
        <div className="flex items-center gap-2" style={{ color: "var(--app-text-muted)" }}>
          {description && <AlignLeft className="h-3.5 w-3.5" />}
          {commentCount > 0 && (
            <span className="flex items-center gap-1 text-[11px]">
              <MessageSquare className="h-3.5 w-3.5" />
              {commentCount}
            </span>
          )}
        </div>
      </div>
      {assignedUser && (
        <img
          src={
            assignedUser.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${assignedUser.username}`
          }
          title={assignedUser.displayName || assignedUser.username}
          className="h-6 w-6 rounded-full object-cover"
          style={{ border: "2px solid var(--app-panel)" }}
        />
      )}
    </div>
  );
}