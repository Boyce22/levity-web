"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Trash2 } from "lucide-react";
import { Card as CardType } from "@/modules/board/actions/board";
import { CardCover } from "./CardCover";
import { CardPriority } from "./CardPriority";
import { CardLabel } from "./CardLabel";
import { CardProgress } from "./CardProgress";
import { CardFooter } from "./CardFooter";

interface CardProps {
  card: CardType;
  index: number;
  onDelete: () => void;
  onClick: () => void;
  allUsers: any[];
  commentCount?: number;
  userRole: string;
}

export default function Card({
  card,
  index,
  onDelete,
  onClick,
  allUsers,
  commentCount = 0,
  userRole,
}: CardProps) {
  const assignedUser = card.assignee_id
    ? allUsers.find((u) => u.id === card.assignee_id)
    : null;

  return (
    <Draggable 
      draggableId={card.id} 
      index={index}
      isDragDisabled={userRole === 'viewer'}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className="group relative flex flex-col cursor-grab active:cursor-grabbing overflow-hidden"
          style={{
            ...provided.draggableProps.style,
            background: "var(--app-elevated)",
            border: snapshot.isDragging
              ? "1px solid var(--app-primary)"
              : "1px solid var(--app-border-faint)",
            borderRadius: "14px",
            boxShadow: snapshot.isDragging
              ? "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px var(--app-primary)"
              : "0 1px 3px rgba(0,0,0,0.2)",
            transition: snapshot.isDragging
              ? provided.draggableProps.style?.transition
              : provided.draggableProps.style?.transition
                ? `${provided.draggableProps.style.transition}, border-color 0.2s, box-shadow 0.2s`
                : "border-color 0.2s, box-shadow 0.2s",
            transform: snapshot.isDragging
              ? provided.draggableProps.style?.transform
                ? `${provided.draggableProps.style.transform} scale(1.03) rotate(1deg)`
                : "scale(1.03) rotate(1deg)"
              : provided.draggableProps.style?.transform,
          }}
        >
          {card.cover_url && <CardCover coverUrl={card.cover_url} />}

          <div className="p-3.5">
            <div className="flex items-center gap-2 mb-2.5 flex-wrap">
              {card.priority && <CardPriority priority={card.priority} />}
              {card.label && <CardLabel label={card.label} />}
            </div>

            <div className="flex items-start justify-between gap-2">
              <p
                className="text-[13px] font-medium leading-[1.45] flex-1"
                style={{ color: "var(--app-text)", opacity: 0.85 }}
              >
                {card.content}
              </p>
              {['owner', 'admin', 'member'].includes(userRole) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md -mt-0.5 -mr-0.5"
                  style={{ color: "var(--app-text-muted)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--app-text-muted)")
                  }
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {card.progress != null && <CardProgress progress={card.progress} />}

            <CardFooter
              description={card.description}
              dueDate={card.due_date}
              commentCount={commentCount}
              assignedUser={assignedUser}
            />
          </div>
        </div>
      )}
    </Draggable>
  );
}