import React from "react";
import {  motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { ListType  } from '@/contracts/Board';
import { LIST_TYPE_COLOR, LIST_TYPE_LABEL } from "@/features/board/components/list/utils/listType";

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
        className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold transition-all ${
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
            className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute top-full left-0 z-50 mt-1 w-32 rounded-xl p-1"
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
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] font-medium transition-colors hover:bg-[var(--app-hover)]"
                style={{
                  color:
                    type === listType
                      ? LIST_TYPE_COLOR[type]
                      : "var(--app-text-muted)",
                }}
              >
                <div
                  className="h-1.5 w-1.5 rounded-full"
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
