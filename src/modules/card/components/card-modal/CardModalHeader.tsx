import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { X, Calendar, Flag, Tag, Users, ImagePlus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PriorityPicker } from "./pickers/PriorityPicker";
import { LabelPicker } from "./pickers/LabelPicker";
import { MemberPicker } from "./pickers/MemberPicker";
import { DueDatePicker } from "./pickers/DueDatePicker";
import { uploadImageAction } from "@/modules/shared/actions/upload";

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
  onClose,
  allUsers,
  tags,
  priorities,
  workspaceId,
  workspaceName,
  listName,
}: CardModalHeaderProps) {
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  // 📐 Auto-resize do textarea do título
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

  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [isLabelsOpen, setIsLabelsOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const url = await uploadImageAction(fd, workspaceId);
      onCoverUpload(url);
    } catch (err) {
      console.error("Cover upload failed", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className="shrink-0 px-6 pt-5 pb-4"
      style={{ borderBottom: "1px solid var(--app-border-faint)" }}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0 text-(--app-text)">
          {/* Breadcrumbs for Context */}
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-(--app-text-muted) opacity-60 mb-2">
            <span className="hover:text-(--app-primary) cursor-default transition-colors">{workspaceName}</span>
            <span className="opacity-30">/</span>
            <span className="hover:text-(--app-primary) cursor-default transition-colors">{listName}</span>
          </div>

          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[10px] font-bold tracking-widest uppercase"
              style={{
                background: "rgba(16,185,129,0.08)",
                color: "#34d399",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-sm bg-emerald-400 animate-pulse" />
              Active
            </span>

            {currentLabel && (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[10px] font-bold tracking-widest uppercase"
                style={{
                  background: currentLabel.color + "15",
                  color: currentLabel.color,
                  border: "1px solid " + currentLabel.color + "25",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-sm" style={{ background: currentLabel.color }} />
                {currentLabel.label}
              </span>
            )}

            {currentPriority && (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[10px] font-bold tracking-widest uppercase"
                style={{
                  background: currentPriority.color + "15",
                  color: currentPriority.color,
                  border: "1px solid " + currentPriority.color + "25",
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
              className="w-full bg-[var(--app-panel)] text-[18px] font-bold focus:outline-none resize-none leading-tight rounded-sm px-2 -mx-2 border border-[var(--app-primary)] transition-all"
              style={{ color: "var(--app-text)", overflow: "hidden" }}
            />
          ) : (
            <h2
              onClick={() => setIsEditingTitle(true)}
              className="text-[18px] font-bold leading-tight cursor-text whitespace-pre-wrap break-words transition-opacity hover:opacity-80"
              style={{ color: "var(--app-text)" }}
            >
              {content || (
                <span className="font-normal italic opacity-30">Title</span>
              )}
            </h2>
          )}

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {dueDate && (
              <div className="flex items-center gap-1 text-xs">
                <Calendar className="w-3.5 h-3.5" />
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
                    assignedUser.avatar_url ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${assignedUser.username}`
                  }
                  className="w-4 h-4 rounded-[4px] object-cover"
                />
                <span className="text-[11px] font-medium" style={{ color: "var(--app-text-muted)", opacity: 0.7 }}>
                  {assignedUser.display_name || assignedUser.username}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 mt-1 relative">
          {/* Cover upload button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            id="cover-upload"
            onChange={handleFileChange}
          />
          <label
            htmlFor="cover-upload"
            className="flex items-center justify-center w-9 h-9 rounded-sm transition-all cursor-pointer"
            style={{
              background: isUploading ? "var(--app-primary-muted)" : "var(--app-hover)",
              border: `1px solid ${isUploading ? "var(--app-primary)" : "var(--app-border)"}`,
              color: isUploading ? "var(--app-primary)" : "var(--app-text-muted)",
              pointerEvents: isUploading ? "none" : "auto",
            }}
            onMouseEnter={(e) => { if (!isUploading) e.currentTarget.style.color = "var(--app-primary)"; }}
            onMouseLeave={(e) => { if (!isUploading) e.currentTarget.style.color = "var(--app-text-muted)"; }}
            title="Add cover"
          >
            {isUploading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <ImagePlus className="w-4 h-4" />}
          </label>

          <button
            onClick={handleCopyLink}
            className="relative flex items-center justify-center w-9 h-9 rounded-sm transition-all"
            style={{
              background: "var(--app-hover)",
              border: "1px solid var(--app-border)",
              color: copied ? "var(--app-primary)" : "var(--app-text-muted)",
            }}
            title="Copy link"
          >
            <AnimatePresence>
              {copied && (
                <motion.span
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: -30, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute px-2 py-1 bg-(--app-primary) text-white text-[9px] font-black uppercase rounded-[4px] pointer-events-none"
                >
                  Copied!
                </motion.span>
              )}
            </AnimatePresence>
            {copied ? (
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.2 }}>
                <Tag className="w-4 h-4" />
              </motion.div>
            ) : (
              <X className="w-4 h-4 rotate-45" /> 
            )}
          </button>

          <PriorityPicker
            isOpen={isPriorityOpen}
            setIsOpen={setIsPriorityOpen}
            selectedPriority={selectedPriority}
            onSelect={onPrioritySelect}
            priorities={priorities}
            workspaceId={workspaceId}
          />

          <LabelPicker
            isOpen={isLabelsOpen}
            setIsOpen={setIsLabelsOpen}
            selectedLabel={selectedLabel}
            onSelect={onLabelSelect}
            tags={tags}
            workspaceId={workspaceId}
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

          {/* <button
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-sm transition-all"
            style={{
              background: "var(--app-hover)",
              border: "1px solid var(--app-border)",
              color: "var(--app-text-muted)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--app-text)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--app-text-muted)")}
          >
            <X className="w-4 h-4" />
          </button> */}
        </div>
      </div>
    </div>
  );
}