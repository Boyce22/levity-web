import { useState, useRef, useEffect } from "react";
import { X, Calendar, Flag, Tag, Users, ImagePlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PriorityPicker } from "./pickers/PriorityPicker";
import { LabelPicker } from "./pickers/LabelPicker";
import { MemberPicker } from "./pickers/MemberPicker";
import { DueDatePicker } from "./pickers/DueDatePicker";

interface CardModalHeaderProps {
  content: string;
  setContent: (val: string) => void;
  isEditingTitle: boolean;
  setIsEditingTitle: (val: boolean) => void;
  dueDate: string | null;
  setDueDate: (val: string) => void;
  selectedLabel: string | null;
  selectedPriority: string | null;
  assigneeId: string | null;
  assignedUser: any | null;
  currentLabel: { id: string; label: string; color: string } | undefined;
  currentPriority: { id: string; label: string; color: string; icon: string } | undefined;
  onSave: () => void;
  onToggleAssignee: (userId: string) => void;
  onLabelSelect: (labelId: string) => void;
  onPrioritySelect: (priorityId: string) => void;
  onClose: () => void;
  allUsers: any[];
}

export function CardModalHeader({
  content,
  setContent,
  isEditingTitle,
  setIsEditingTitle,
  dueDate,
  setDueDate,
  selectedLabel,
  selectedPriority,
  assigneeId,
  assignedUser,
  currentLabel,
  currentPriority,
  onSave,
  onToggleAssignee,
  onLabelSelect,
  onPrioritySelect,
  onClose,
  allUsers,
}: CardModalHeaderProps) {
  const titleRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditingTitle && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    onSave();
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      setIsEditingTitle(false);
      onSave();
    }
  };

  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [isLabelsOpen, setIsLabelsOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);

  return (
    <div className="shrink-0 px-7 pt-6 pb-0">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wider uppercase"
              style={{
                background: "rgba(16,185,129,0.12)",
                color: "#34d399",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Ativo
            </span>

            {currentLabel && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold"
                style={{
                  background: currentLabel.color + "20",
                  color: currentLabel.color,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: currentLabel.color }} />
                {currentLabel.label}
              </span>
            )}

            {currentPriority && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold"
                style={{
                  background: currentPriority.color + "20",
                  color: currentPriority.color,
                }}
              >
                {currentPriority.icon} {currentPriority.label}
              </span>
            )}
          </div>

          {isEditingTitle ? (
            <textarea
              ref={titleRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              rows={1}
              className="w-full bg-transparent text-[22px] font-bold focus:outline-none resize-none leading-tight"
              style={{ color: "var(--app-text)" }}
            />
          ) : (
            <h2
              onClick={() => setIsEditingTitle(true)}
              className="text-[22px] font-bold leading-tight cursor-text truncate transition-opacity hover:opacity-80"
              style={{ color: "var(--app-text)" }}
            >
              {content || (
                <span className="font-normal italic opacity-30">Título da tarefa…</span>
              )}
            </h2>
          )}

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {dueDate && (
              <div className="flex items-center gap-1 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {new Date(dueDate).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              </div>
            )}
            {assignedUser && (
              <div className="flex items-center gap-1.5">
                <img
                  src={
                    assignedUser.avatar_url ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${assignedUser.username}`
                  }
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span className="text-xs" style={{ color: "var(--app-text-muted)" }}>
                  {assignedUser.display_name || assignedUser.username}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 mt-1 relative">
          {/* Cover upload button */}
          <input type="file" accept="image/*" className="hidden" id="cover-upload" />
          <label
            htmlFor="cover-upload"
            className="flex items-center justify-center w-9 h-9 rounded-xl transition-all cursor-pointer"
            style={{
              background: "var(--app-hover)",
              border: "1px solid var(--app-border)",
              color: "var(--app-text-muted)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--app-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--app-text-muted)")}
          >
            <ImagePlus className="w-4 h-4" />
          </label>

          <PriorityPicker
            isOpen={isPriorityOpen}
            setIsOpen={setIsPriorityOpen}
            selectedPriority={selectedPriority}
            onSelect={onPrioritySelect}
          />

          <LabelPicker
            isOpen={isLabelsOpen}
            setIsOpen={setIsLabelsOpen}
            selectedLabel={selectedLabel}
            onSelect={onLabelSelect}
          />

          <MemberPicker
            isOpen={isMembersOpen}
            setIsOpen={setIsMembersOpen}
            assigneeId={assigneeId}
            onSelect={onToggleAssignee}
            allUsers={allUsers}
          />

          <DueDatePicker
            dueDate={dueDate}
            setDueDate={setDueDate}
            onSave={onSave}
          />

          <button
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
            style={{
              background: "var(--app-hover)",
              border: "1px solid var(--app-border)",
              color: "var(--app-text-muted)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--app-text)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--app-text-muted)")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <label className="flex items-center gap-2 text-xs font-medium" style={{ color: "var(--app-text-muted)" }}>
          <Calendar className="w-3.5 h-3.5" />
          Prazo
        </label>
        <input
          type="date"
          value={dueDate ? dueDate.split("T")[0] : ""}
          onChange={(e) => setDueDate(e.target.value)}
          onBlur={() => onSave()}
          className="rounded-lg px-2 py-1 text-xs font-medium focus:outline-none transition-colors"
          style={{
            background: "var(--app-hover)",
            border: "1px solid var(--app-border)",
            color: "var(--app-text)",
            colorScheme: "dark",
          }}
        />
        {dueDate && (
          <button
            onClick={() => {
              setDueDate("");
              onSave();
            }}
            className="text-xs transition-colors"
            style={{ color: "var(--app-text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--app-text-muted)")}
          >
            Limpar
          </button>
        )}
      </div>
    </div>
  );
}