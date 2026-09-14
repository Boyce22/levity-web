import { useRef, useEffect, useLayoutEffect } from "react";
import { Calendar } from "lucide-react";
import { Breadcrumbs } from "./Breadcrumbs";
import { StatusBadges } from "./StatusBadges";
import { HeaderActions } from "./HeaderActions";

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
  onCoverUpload: (url: string) => void;
  onClose: () => void;
  allUsers: any[];
  tags: any[];
  priorities: any[];
  workspaceId: string;
  workspaceName: string;
  listName: string;
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
  onCoverUpload,
  allUsers,
  tags,
  priorities,
  workspaceId,
  workspaceName,
  listName,
}: CardModalHeaderProps) {
  const titleRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    if (isEditingTitle && titleRef.current) {
      titleRef.current.style.height = "0px";
      const scrollHeight = titleRef.current.scrollHeight;
      titleRef.current.style.height = `${scrollHeight}px`;
    }
  }, [content, isEditingTitle]);

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

  return (
    <div
      className="shrink-0 px-6 pt-5 pb-4"
      style={{ borderBottom: "1px solid var(--app-border-faint)" }}
    >
      <div className="flex items-start gap-4">
        <div className="text-app-text min-w-0 flex-1">
          <Breadcrumbs workspaceName={workspaceName} listName={listName} />

          <StatusBadges
            currentLabel={currentLabel}
            currentPriority={currentPriority}
          />

          {isEditingTitle ? (
            <textarea
              ref={titleRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              rows={1}
              className="-mx-2 w-full resize-none rounded-sm border border-[var(--app-primary)] bg-[var(--app-panel)] px-2 text-[18px] leading-tight font-bold transition-all focus:outline-none"
              style={{ color: "var(--app-text)", overflow: "hidden" }}
            />
          ) : (
            <h2
              onClick={() => setIsEditingTitle(true)}
              className="cursor-text text-[18px] leading-tight font-bold break-words whitespace-pre-wrap transition-opacity hover:opacity-80"
              style={{ color: "var(--app-text)" }}
            >
              {content || (
                <span className="font-normal italic opacity-30">Title</span>
              )}
            </h2>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-3">
            {dueDate && (
              <div className="flex items-center gap-1 text-xs">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {new Date(dueDate).toLocaleDateString("en-US", {
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
                    assignedUser.avatarUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${assignedUser.username}`
                  }
                  className="h-4 w-4 rounded-[4px] object-cover"
                />
                <span className="text-[11px] font-medium" style={{ color: "var(--app-text-muted)", opacity: 0.7 }}>
                  {assignedUser.displayName || assignedUser.username}
                </span>
              </div>
            )}
          </div>
        </div>

        <HeaderActions
          dueDate={dueDate}
          setDueDate={setDueDate}
          selectedLabel={selectedLabel}
          selectedPriority={selectedPriority}
          assigneeId={assigneeId}
          onSave={onSave}
          onToggleAssignee={onToggleAssignee}
          onLabelSelect={onLabelSelect}
          onPrioritySelect={onPrioritySelect}
          onCoverUpload={onCoverUpload}
          allUsers={allUsers}
          tags={tags}
          priorities={priorities}
          workspaceId={workspaceId}
        />
      </div>
    </div>
  );
}
