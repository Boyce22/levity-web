"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Card as CardType } from "@/modules/board/actions/board";
import { useCardModal } from "../../hooks/useCardModal";
import { CardModalCover } from "./CardModalCover";
import { CardModalHeader } from "./CardModalHeader";
import { CardModalTabs } from "./CardModalTabs";
import { DescriptionTab } from "./description-tab/DescriptionTab";
import { CommentsTab } from "./comments-tab/CommentsTab";

interface CardModalProps {
  card: CardType | null;
  onClose: () => void;
  onUpdate: (updatedCard: CardType) => void;
  currentUserAvatar: string;
  allUsers: any[];
  tags: any[];
  priorities: any[];
  workspaceId: string;
  initialTab?: "description" | "comments";
}

// Constants for labels and priorities (could be moved to a shared file)
const LABELS = [
  { id: "feature", label: "Feature", color: "#818cf8" },
  { id: "bug", label: "Bug", color: "#f87171" },
  { id: "infra", label: "Infra", color: "#94a3b8" },
  { id: "design", label: "Design", color: "#c084fc" },
  { id: "research", label: "Research", color: "#2dd4bf" },
];

const PRIORITIES = [
  { id: "high", label: "High", color: "#f87171", icon: "↑" },
  { id: "medium", label: "Medium", color: "#fbbf24", icon: "→" },
  { id: "low", label: "Low", color: "#34d399", icon: "↓" },
];

export default function CardModal({
  card,
  onClose,
  onUpdate,
  currentUserAvatar,
  allUsers,
  tags,
  priorities,
  workspaceId,
  initialTab,
}: CardModalProps) {
  const {
    content,
    setContent,
    description,
    setDescription,
    coverUrl,
    dueDate,
    setDueDate,
    selectedLabel,
    selectedPriority,
    assigneeId,
    isEditingTitle,
    setIsEditingTitle,
    isEditingDesc,
    setIsEditingDesc,
    activeTab,
    setActiveTab,
    savedStatus,
    comments,
    loadingComments,
    hasMoreComments,
    isLoadingMore,
    loadMoreComments,
    handlePostComment,
    history,
    handleSave,
    toggleAssignee,
    handleLabelSelect,
    handlePrioritySelect,
    handleCoverUpload,
    handleRemoveCover,
    checklistCounts,
  } = useCardModal(card, onUpdate, tags, priorities, initialTab);

  if (!card) return null;

  const currentLabel = LABELS.find((l) => l.id === selectedLabel);
  const currentPriority = PRIORITIES.find((p) => p.id === selectedPriority);
  const assignedUser = allUsers.find((u) => u.id === assigneeId);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="relative w-full sm:max-w-[700px] sm:mx-4 flex flex-col z-10"
          style={{
            maxHeight: "92vh",
            borderRadius: "6px",
            background: "var(--app-bg)",
            border: "1px solid var(--app-border)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
          }}
        >
          <CardModalCover
            coverUrl={coverUrl}
            isUploading={false} // TODO: manage upload state
            onUpload={handleCoverUpload}
            onRemove={handleRemoveCover}
          />

          <CardModalHeader
            content={content}
            setContent={setContent}
            isEditingTitle={isEditingTitle}
            setIsEditingTitle={setIsEditingTitle}
            dueDate={dueDate}
            setDueDate={setDueDate}
            selectedLabel={selectedLabel}
            selectedPriority={selectedPriority}
            assigneeId={assigneeId}
            assignedUser={assignedUser}
            currentLabel={currentLabel}
            currentPriority={currentPriority}
            onSave={handleSave}
            onToggleAssignee={toggleAssignee}
            onLabelSelect={handleLabelSelect}
            onPrioritySelect={handlePrioritySelect}
            onCoverUpload={handleCoverUpload}
            onClose={onClose}
            allUsers={allUsers}
            tags={tags}
            priorities={priorities}
            workspaceId={workspaceId}
          />

          <div className="px-6 pt-1" style={{ borderBottom: "1px solid var(--app-border-faint)" }}>
            <CardModalTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              commentsCount={comments.length}
            />
          </div>

          {/* Checklist progress bar */}
          {checklistCounts.total > 0 && (
            <div className="px-6 py-2" style={{ borderBottom: "1px solid var(--app-border-faint)" }}>
              <div className="flex items-center gap-3">
                <div
                  className="flex-1 h-1.5 rounded-sm overflow-hidden"
                  style={{ background: "var(--app-border)" }}
                >
                  <div
                    className="h-full rounded-sm transition-all duration-500"
                    style={{
                      width: `${Math.round((checklistCounts.done / checklistCounts.total) * 100)}%`,
                      background:
                        checklistCounts.done === checklistCounts.total
                          ? "#34d399"
                          : checklistCounts.done / checklistCounts.total >= 0.4
                          ? "var(--app-primary)"
                          : "#fbbf24",
                    }}
                  />
                </div>
                <span className="text-[11px] font-semibold shrink-0" style={{ color: "var(--app-text-muted)" }}>
                  {checklistCounts.done}/{checklistCounts.total} tasks
                </span>
              </div>
            </div>
          )}

          <div
            className="flex-1 overflow-y-auto relative"
            style={{ 
              scrollbarWidth: "thin", 
              scrollbarColor: "var(--app-border) transparent",
              minHeight: "300px" 
            }}
          >
            <AnimatePresence mode="wait">
              {activeTab === "description" ? (
                <motion.div
                  key="description"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="px-6 py-5"
                >
                  <DescriptionTab
                    description={description}
                    setDescription={setDescription}
                    isEditing={isEditingDesc}
                    setIsEditing={setIsEditingDesc}
                    savedStatus={savedStatus}
                    history={history}
                    allUsers={allUsers}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="comments"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="px-6 py-5"
                >
                  <CommentsTab
                    comments={comments}
                    loading={loadingComments}
                    hasMore={hasMoreComments}
                    isLoadingMore={isLoadingMore}
                    onLoadMore={loadMoreComments}
                    onPostComment={handlePostComment}
                    currentUserAvatar={currentUserAvatar}
                    allUsers={allUsers}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div
            className="shrink-0 px-6 py-3.5 flex items-center justify-between"
            style={{ borderTop: "1px solid var(--app-border-faint)" }}
          >
            <div className="flex items-center gap-3">
              <img
                src={currentUserAvatar}
                className="w-6 h-6 rounded-[5px] object-cover bg-[var(--app-panel)]"
                style={{ border: "1.5px solid var(--app-border-faint)" }}
              />
              <span className="text-[12px]" style={{ color: "var(--app-text-muted)", opacity: 0.8 }}>
                Você está editando esta tarefa
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-[13.5px] font-medium text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-panel)] rounded-sm transition-colors focus:outline-none"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleSave();
                  onClose();
                }}
                className="flex items-center justify-center gap-2 px-6 py-2 shadow-sm shadow-indigo-950/20 focus:ring-4 focus:ring-indigo-500/20 hover:brightness-110 text-white text-[13.5px] font-bold rounded-sm transition-all focus:outline-none"
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)' }}
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}