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
  { id: "high", label: "Alta", color: "#f87171", icon: "↑" },
  { id: "medium", label: "Média", color: "#fbbf24", icon: "→" },
  { id: "low", label: "Baixa", color: "#34d399", icon: "↓" },
];

export default function CardModal({
  card,
  onClose,
  onUpdate,
  currentUserAvatar,
  allUsers,
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
  } = useCardModal(card, onUpdate);

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
          className="relative w-full sm:max-w-195 sm:mx-4 flex flex-col z-10"
          style={{
            maxHeight: "92vh",
            borderRadius: "20px",
            background: "var(--app-elevated)",
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
            onClose={onClose}
            allUsers={allUsers}
          />

          <CardModalTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            commentsCount={comments.length}
          />

          <div
            className="flex-1 overflow-y-auto px-7 py-6 space-y-4"
            style={{ scrollbarWidth: "thin", scrollbarColor: "var(--app-border) transparent" }}
          >
            {activeTab === "description" && (
              <DescriptionTab
                description={description}
                setDescription={setDescription}
                isEditing={isEditingDesc}
                setIsEditing={setIsEditingDesc}
                savedStatus={savedStatus}
                history={history}
                allUsers={allUsers}
              />
            )}
            {activeTab === "comments" && (
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
            )}
          </div>

          <div
            className="shrink-0 px-7 py-4 flex items-center justify-between"
            style={{ borderTop: "1px solid var(--app-border-faint)" }}
          >
            <div className="flex items-center gap-3">
              <img
                src={currentUserAvatar}
                className="w-6 h-6 rounded-full object-cover"
                style={{ border: "1.5px solid var(--app-border)" }}
              />
              <span className="text-xs" style={{ color: "var(--app-text-muted)" }}>
                Você está editando esta tarefa
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-sm font-medium transition-colors"
                style={{ color: "var(--app-text-muted)" }}
              >
                Descartar
              </button>
              <button
                onClick={() => {
                  handleSave();
                  onClose();
                }}
                className="px-4 py-1.5 text-sm font-semibold rounded-xl transition-all"
                style={{
                  background: "var(--app-primary-muted)",
                  border: "1px solid var(--app-primary)",
                  color: "var(--app-primary)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--app-primary)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--app-primary-muted)";
                  e.currentTarget.style.color = "var(--app-primary)";
                }}
              >
                Concluído
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}