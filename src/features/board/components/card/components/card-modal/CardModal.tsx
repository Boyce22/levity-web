"use client";

import {  useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Card as CardType  } from '@/contracts/Board';
import { useCardModal } from "../../hooks/useCardModal";
import { CardModalCover } from "./CardModalCover";
import { CardModalHeader } from "./CardModalHeader";
import { CardModalTabs } from "./CardModalTabs";
import { DescriptionTab } from "./description-tab/DescriptionTab";
import { CommentsTab } from "./comments-tab/CommentsTab";
import { DiagramTab } from "./diagram-tab/DiagramTab";
import { ChecklistProgress } from "./ChecklistProgress";

interface CardModalProps {
  card: CardType | null;
  onClose: () => void;
  onUpdate: (updatedCard: CardType) => void;
  currentUserId?: string;
  currentUserAvatar: string;
  allUsers: any[];
  tags: any[];
  priorities: any[];
  workspaceId: string;
  workspaceName: string;
  listName: string;
  initialTab?: "description" | "comments" | "diagram";
}

// Constantes fora do componente: evitam recriação de objeto a cada render e permitem
// compartilhamento futuro sem mudança de API.
const LABELS = [
  { id: "feature", label: "Feature", color: "#818cf8" },
  { id: "bug", label: "Bug", color: "#f87171" },
  { id: "infra", label: "Infra", color: "#94a3b8" },
  { id: "design", label: "Design", color: "#c084fc" },
  { id: "research", label: "Research", color: "#2dd4bf" },
] as const;

const PRIORITIES = [
  { id: "high", label: "High", color: "#f87171", icon: "↑" },
  { id: "medium", label: "Medium", color: "#fbbf24", icon: "→" },
  { id: "low", label: "Low", color: "#34d399", icon: "↓" },
] as const;

export default function CardModal({
  card,
  onClose,
  onUpdate,
  currentUserId,
  currentUserAvatar,
  allUsers,
  tags,
  priorities,
  workspaceId,
  workspaceName,
  listName,
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
    handleDeleteComment,
    history,
    handleSave,
    toggleAssignee,
    handleLabelSelect,
    handlePrioritySelect,
    handleCoverUpload,
    handleRemoveCover,
    checklistCounts,
    diagramData,
    loadingDiagram,
    isSavingDiagram,
    handleSaveDiagram,
  } = useCardModal(card, onUpdate, tags, priorities, workspaceId, initialTab);

  // Ref para handleSave: o listener de keydown é registrado uma única vez (deps: [onClose])
  // e sempre chama a versão mais recente do save via ref, sem re-registrar o listener.
  const handleSaveRef = useRef(handleSave);
  useEffect(() => { handleSaveRef.current = handleSave; }, [handleSave]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveRef.current();
      }
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]); // handleSave removido: acessado via ref

  if (!card) return null;

  // Memoizados para evitar recálculo em cada render — dependem de campos específicos
  const currentLabel = useMemo(
    () => LABELS.find((l) => l.id === selectedLabel),
    [selectedLabel]
  );
  const currentPriority = useMemo(
    () => PRIORITIES.find((p) => p.id === selectedPriority),
    [selectedPriority]
  );
  const assignedUser = useMemo(
    () => allUsers.find((u) => u.id === assigneeId),
    [allUsers, assigneeId]
  );

  // AnimatePresence externo removido: o componente retorna null quando !card (acima),
  // então AnimatePresence nunca veria o unmount do filho — a animação de saída era inoperante.
  // Para animar o modal ao fechar, envolva <CardModal> com <AnimatePresence> no pai.
  return (
    <div className="fixed inset-0 z-100 flex items-end justify-center sm:items-center">
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
        className="relative z-10 flex max-h-[92vh] w-full max-w-[95vw] flex-col sm:mx-4 sm:h-[48rem] sm:w-[68rem]"
        style={{
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
          workspaceName={workspaceName}
          listName={listName}
        />

        <div
          className="relative flex-1 overflow-y-auto"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "var(--app-border) transparent",
          }}
        >
          {/* Sticky Navigation Bar */}
          <div className="bg-app-bg border-app-border-faint sticky top-0 z-30 border-b px-6 pt-1 shadow-sm shadow-black/5">
            <CardModalTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              commentsCount={comments.length}
            />

            <ChecklistProgress
              done={checklistCounts.done}
              total={checklistCounts.total}
            />
          </div>

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
                  workspaceId={workspaceId}
                />
              </motion.div>
            ) : activeTab === "comments" ? (
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
                  onDeleteComment={handleDeleteComment}
                  currentUserId={currentUserId}
                  currentUserAvatar={currentUserAvatar}
                  allUsers={allUsers}
                  workspaceId={workspaceId}
                />
              </motion.div>
            ) : (
              <motion.div
                key="diagram"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="px-6 py-5"
              >
                <DiagramTab
                  initialData={diagramData}
                  onSave={handleSaveDiagram}
                  loading={loadingDiagram}
                  isSaving={isSavingDiagram}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div
          className="flex shrink-0 items-center justify-between px-6 py-3.5"
          style={{ borderTop: "1px solid var(--app-border-faint)" }}
        >
          <div className="flex items-center gap-3">
            <img
              src={currentUserAvatar}
              className="h-6 w-6 rounded-[5px] bg-[var(--app-panel)] object-cover"
              style={{ border: "1.5px solid var(--app-border-faint)" }}
            />
            <span className="text-[12px]" style={{ color: "var(--app-text-muted)", opacity: 0.8 }}>
              You are editing this card
            </span>
          </div>

          {/* Keyboard Legends (Desktop only) */}
          <div className="text-app-text-muted hidden items-center gap-4 text-[10px] font-black tracking-widest uppercase opacity-40 md:flex">
            <div className="flex items-center gap-1.5 transition-opacity hover:opacity-100">
              <kbd className="border-app-border bg-app-panel rounded-xs border px-1.5 py-0.5">ESC</kbd>
              <span>Close</span>
            </div>
            <div className="flex items-center gap-1.5 transition-opacity hover:opacity-100">
              {/* Corrigido: SHIF → SHIFT */}
              <kbd className="border-app-border bg-app-panel rounded-xs border px-1.5 py-0.5">CTRL + SHIFT + S</kbd>
              <span>Save</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-sm px-4 py-2 text-[13.5px] font-medium text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-panel)] hover:text-[var(--app-text)] focus:outline-none"
            >
              Close
            </button>
            <button
              onClick={async () => {
                // await garante que o save completa antes de fechar o modal,
                // evitando race condition entre a request e o unmount
                await handleSave();
                onClose();
              }}
              className="flex items-center justify-center gap-2 rounded-sm px-6 py-2 text-[13.5px] font-bold text-white shadow-sm shadow-indigo-950/20 transition-all hover:brightness-110 focus:ring-4 focus:ring-indigo-500/20 focus:outline-none"
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)' }}
            >
              Done
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

