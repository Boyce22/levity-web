import { useState } from "react";
import { Trash2, AlertTriangle, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DeleteListModal from "./DeleteListModal";
import { ListType, updateListTypeAction } from "@/modules/board/actions/board";
import { LIST_TYPE_COLOR, LIST_TYPE_LABEL } from "@/modules/list/utils/listType";

interface ListHeaderProps {
  dragHandleProps: any;
  listId: string;
  title: string;
  cardCount: number;
  wipLimit?: number;
  accentColor: string;
  listType: ListType;
  onRename: (newTitle: string) => void;
  onDelete: () => void;
  onTypeChange?: (type: ListType) => void;
  userRole: string;
}

export function ListHeader({
  dragHandleProps,
  listId,
  title: initialTitle,
  cardCount,
  wipLimit,
  accentColor,
  listType,
  onRename,
  onDelete,
  onTypeChange,
  userRole,
}: ListHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  const LIST_TYPES: ListType[] = ['todo', 'in_progress', 'review', 'done'];

  const handleTypeChange = async (type: ListType) => {
    setIsTypeOpen(false);
    onTypeChange?.(type);
    await updateListTypeAction(listId, type);
  };

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
    <>
      <div
        className="px-4 pt-3.5 pb-3 flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
              onClick={() => {
                if (['owner', 'admin', 'member'].includes(userRole)) {
                  setIsEditing(true);
                }
              }}
              className={`font-semibold text-[14px] truncate transition-colors ${
                ['owner', 'admin', 'member'].includes(userRole) ? "cursor-text" : "cursor-default"
              }`}
              style={{ color: "var(--app-text)" }}
            >
              {title}
            </h2>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* List Type Badge/Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                if (['owner', 'admin', 'member'].includes(userRole)) {
                  setIsTypeOpen(!isTypeOpen);
                }
              }}
              className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
                ['owner', 'admin', 'member'].includes(userRole) ? "hover:brightness-110" : "cursor-default"
              }`}
              style={{
                background: `${LIST_TYPE_COLOR[listType]}20`,
                color: LIST_TYPE_COLOR[listType],
                border: `1px solid ${LIST_TYPE_COLOR[listType]}40`,
              }}
            >
              {LIST_TYPE_LABEL[listType]}
              {['owner', 'admin', 'member'].includes(userRole) && (
                <ChevronDown className={`w-3 h-3 transition-transform ${isTypeOpen ? 'rotate-180' : ''}`} />
              )}
            </button>

            <AnimatePresence>
              {isTypeOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute top-full left-0 mt-1 w-32 p-1 z-50 rounded-xl"
                  style={{
                    background: "var(--app-elevated)",
                    border: "1px solid var(--app-border)",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                  }}
                >
                  {LIST_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleTypeChange(type)}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors hover:bg-[var(--app-hover)] flex items-center gap-2"
                      style={{
                        color: type === listType ? LIST_TYPE_COLOR[type] : "var(--app-text-muted)",
                      }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: LIST_TYPE_COLOR[type] }} />
                      {LIST_TYPE_LABEL[type]}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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

           {['owner', 'admin', 'member'].includes(userRole) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteModalOpen(true);
              }}
              className="p-1 rounded-md transition-all duration-150"
              style={{
                opacity: isHovered ? 1 : 0,
                color: "var(--app-text-muted)",
                pointerEvents: isHovered ? "auto" : "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--app-text-muted)")}
              title="Deletar lista"
            >
              <Trash2 className="w-3.5 h-3.5" />
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