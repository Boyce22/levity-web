import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { ListType } from "@/modules/board/actions/board";
import { LIST_TYPE_COLOR, LIST_TYPE_LABEL } from "@/modules/list/utils/listType";

interface ListTypePickerProps {
  listId: string;
  listType: ListType;
  onTypeChange?: (type: ListType) => void;
  userRole: string;
}

export function ListTypePicker({
  listType,
  onTypeChange,
  userRole,
}: ListTypePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const LIST_TYPES: ListType[] = ["todo", "inProgress", "review", "done"];

  const canEdit = ["owner", "admin", "member"].includes(userRole);

  const handleTypeChange = (type: ListType) => {
    setIsOpen(false);
    onTypeChange?.(type);
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          if (canEdit) setIsOpen(!isOpen);
        }}
        className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
          canEdit ? "hover:brightness-110" : "cursor-default"
        }`}
        style={{
          background: `${LIST_TYPE_COLOR[listType]}20`,
          color: LIST_TYPE_COLOR[listType],
          border: `1px solid ${LIST_TYPE_COLOR[listType]}40`,
        }}
      >
        {LIST_TYPE_LABEL[listType]}
        {canEdit && (
          <ChevronDown
            className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
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
                  color:
                    type === listType
                      ? LIST_TYPE_COLOR[type]
                      : "var(--app-text-muted)",
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: LIST_TYPE_COLOR[type] }}
                />
                {LIST_TYPE_LABEL[type]}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
