import React, { useState, useRef } from "react";
import { X, Tag, ImagePlus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PriorityPicker } from "./pickers/PriorityPicker";
import { LabelPicker } from "./pickers/LabelPicker";
import { MemberPicker } from "./pickers/MemberPicker";
import { DueDatePicker } from "./pickers/DueDatePicker";
import { uploadImageAction } from "@/infra/storage/upload";

interface HeaderActionsProps {
  dueDate: string | null;
  setDueDate: (val: string) => void;
  selectedLabel: string | null;
  selectedPriority: string | null;
  assigneeId: string | null;
  onSave: () => void;
  onToggleAssignee: (userId: string) => void;
  onLabelSelect: (labelId: string) => void;
  onPrioritySelect: (priorityId: string) => void;
  onCoverUpload: (url: string) => void;
  allUsers: any[];
  tags: any[];
  priorities: any[];
  workspaceId: string;
}

export function HeaderActions({
  dueDate,
  setDueDate,
  selectedLabel,
  selectedPriority,
  assigneeId,
  onSave,
  onToggleAssignee,
  onLabelSelect,
  onPrioritySelect,
  onCoverUpload,
  allUsers,
  tags,
  priorities,
  workspaceId,
}: HeaderActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
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
    <div className="relative mt-1 flex shrink-0 items-center gap-2">
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
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-sm transition-all"
        style={{
          background: isUploading ? "var(--app-primary-muted)" : "var(--app-hover)",
          border: `1px solid ${isUploading ? "var(--app-primary)" : "var(--app-border)"}`,
          color: isUploading ? "var(--app-primary)" : "var(--app-text-muted)",
          pointerEvents: isUploading ? "none" : "auto",
        }}
        title="Add cover"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ImagePlus className="h-4 w-4" />
        )}
      </label>

      <button
        onClick={handleCopyLink}
        className="relative flex h-9 w-9 items-center justify-center rounded-sm transition-all"
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
              className="bg-app-primary pointer-events-none absolute rounded-[4px] px-2 py-1 text-[9px] font-black text-white uppercase"
            >
              Copied!
            </motion.span>
          )}
        </AnimatePresence>
        {copied ? (
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.2 }}>
            <Tag className="h-4 w-4" />
          </motion.div>
        ) : (
          <X className="h-4 w-4 rotate-45" />
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
    </div>
  );
}
