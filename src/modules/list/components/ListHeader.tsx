import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";

interface ListHeaderProps {
  dragHandleProps: any; // vindo do Draggable pai
  listId: string;
  title: string;
  cardCount: number;
  wipLimit?: number;
  accentColor: string;
  onRename: (newTitle: string) => void;
  onDelete: () => void;
}

export function ListHeader({
  dragHandleProps,
  title: initialTitle,
  cardCount,
  wipLimit,
  accentColor,
  onRename,
  onDelete,
}: ListHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);

  const isWipExceeded = wipLimit != null && cardCount >= wipLimit;

  const handleSubmit = () => {
    setIsEditing(false);
    if (title.trim() && title !== initialTitle) {
      onRename(title.trim());
    } else {
      setTitle(initialTitle);
    }
  };

  const handleCancel = () => {
    setTitle(initialTitle);
    setIsEditing(false);
  };

  return (
    <div
      className="px-4 pt-3.5 pb-3 flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing"
      {...dragHandleProps}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {isEditing ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Escape") handleCancel();
            }}
            className="font-semibold text-[14px] rounded-lg px-2 py-0.5 focus:outline-none w-full"
            style={{
              background: "var(--app-bg)",
              color: "var(--app-text)",
              border: `1px solid ${accentColor}60`,
            }}
          />
        ) : (
          <h2
            onClick={() => setIsEditing(true)}
            className="font-semibold text-[14px] truncate cursor-text transition-colors"
            style={{ color: "var(--app-text)" }}
          >
            {title}
          </h2>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div
          className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{
            background: isWipExceeded ? "rgba(248,113,113,0.15)" : "var(--app-hover)",
            color: isWipExceeded ? "#f87171" : "var(--app-text-muted)",
            border: isWipExceeded ? "1px solid rgba(248,113,113,0.3)" : "1px solid transparent",
          }}
        >
          {isWipExceeded && <AlertTriangle className="w-3 h-3" />}
          {cardCount}
          {wipLimit != null && `/${wipLimit}`}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 group-hover/list:opacity-100 transition-opacity p-1 rounded-md"
          style={{ color: "var(--app-text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--app-text-muted)")}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}