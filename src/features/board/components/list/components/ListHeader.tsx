import {  useState } from "react";
import { Trash2 } from "lucide-react";
import DeleteListModal from "./DeleteListModal";
import type { ListType  } from '@/contracts/Board';
import { updateListTypeAction, updateListWipLimitAction } from '@/features/board/server/actions/list.actions';;
import { ListTypePicker } from "./ListTypePicker";
import { WipLimitPicker } from "./WipLimitPicker";

interface ListHeaderProps {
  dragHandleProps: any;
  listId: string;
  workspaceId: string;
  title: string;
  cardCount: number;
  wipLimit?: number | null;
  accentColor: string;
  listType: ListType;
  onRename: (newTitle: string) => void;
  onDelete: () => void;
  onTypeChange?: (type: ListType) => void;
  onWipLimitChange?: (val: number | null) => void;
  userRole: string;
}

export function ListHeader({
  dragHandleProps,
  listId,
  workspaceId,
  title: initialTitle,
  cardCount,
  wipLimit,
  accentColor,
  listType,
  onRename,
  onDelete,
  onTypeChange,
  onWipLimitChange,
  userRole,
}: ListHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleTypeChange = async (type: ListType) => {
    onTypeChange?.(type);
    await updateListTypeAction(listId, type, workspaceId);
  };

  const handleWipLimitChange = async (val: number | null) => {
    onWipLimitChange?.(val);
    await updateListWipLimitAction(listId, val, workspaceId);
  };

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

  const canEdit = ["owner", "admin", "member"].includes(userRole);

  return (
    <>
      <div
        className="flex cursor-grab items-center justify-between gap-2 px-4 pt-3.5 pb-3 active:cursor-grabbing"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...dragHandleProps}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
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
              className="w-full rounded-lg px-2 py-0.5 text-[14px] font-semibold focus:outline-none"
              style={{
                background: "var(--app-bg)",
                color: "var(--app-text)",
                border: `1px solid ${accentColor}60`,
              }}
            />
          ) : (
            <h2
              onClick={() => {
                if (canEdit) setIsEditing(true);
              }}
              className={`truncate text-[14px] font-semibold transition-colors ${
                canEdit ? "cursor-text" : "cursor-default"
              }`}
              style={{ color: "var(--app-text)" }}
            >
              {title}
            </h2>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ListTypePicker
            listId={listId}
            listType={listType}
            onTypeChange={handleTypeChange}
            userRole={userRole}
          />

          <WipLimitPicker
            cardCount={cardCount}
            wipLimit={wipLimit}
            onWipLimitChange={handleWipLimitChange}
            userRole={userRole}
          />

          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteModalOpen(true);
              }}
              className="rounded-md p-1 transition-all duration-150"
              style={{
                opacity: isHovered ? 1 : 0,
                color: "var(--app-text-muted)",
                pointerEvents: isHovered ? "auto" : "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--app-text-muted)")
              }
              title="Deletar lista"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <DeleteListModal
        isOpen={isDeleteModalOpen}
        listTitle={title}
        cardCount={cardCount}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={onDelete}
      />
    </>
  );
}