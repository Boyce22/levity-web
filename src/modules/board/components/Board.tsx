"use client";

import { DragDropContext } from "@hello-pangea/dnd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCommentsAction } from "@/modules/board/actions/comments";
import { createWorkspaceAction } from "@/modules/workspace/actions/workspace";

import {
  Card as CardType,
  List as ListType,
} from "@/modules/board/actions/board";
import CardModal from "@/modules/card/components/card-modal/CardModal";

import ProfileModal from "@/modules/users/components/ProfileModal";
import ShareWorkspaceModal from "@/modules/workspace/components/ShareWorkspaceModal";
import WorkspaceSettingsModal from "@/modules/workspace/components/WorkspaceSettingsModal";
import { BoardCanvas } from "./BoardCanvas";
import { BoardFiltersBar } from "./BoardFiltersBar";
import { BoardHeader } from "./BoardHeader";
import { useBoardData } from "../hooks/useBoardData";
import { useDragDrop } from "../hooks/useDragDrop";
import { useFilters } from "../hooks/useFilters";

interface BoardProps {
  initialLists: ListType[];
  initialCards: CardType[];
  userProfile: any;
  allUsers: any[];
  workspaces: any[];
  currentWorkspaceId: string;
}

export default function Board({
  initialLists,
  initialCards,
  userProfile,
  allUsers,
  workspaces,
  currentWorkspaceId,
}: BoardProps) {
  const router = useRouter();

  // Core board state management
  const {
    lists,
    setLists,
    cards,
    setCards,
    commentCounts,
    setCommentCounts,
    addList,
    deleteList,
    addCard,
    deleteCard,
    updateCard,
  } = useBoardData({
    initialLists,
    initialCards,
    currentWorkspaceId,
    userProfile,
  });

  // Filters & search
  const {
    searchQuery,
    setSearchQuery,
    selectedUserFilters,
    setSelectedUserFilters,
    priorityFilter,
    setPriorityFilter,
    labelFilter,
    setLabelFilter,
    filteredCards,
    hasActiveFilters,
    clearFilters,
  } = useFilters({ cards });

  // Drag & drop logic
  const onDragEnd = useDragDrop({
    lists,
    setLists,
    cards,
    setCards,
  });

  useEffect(() => {
    const loadCounts = async () => {
      const counts: Record<string, number> = {};
      await Promise.all(
        initialCards.map(async (card) => {
          const comments = await getCommentsAction(card.id, 50, null);
          counts[card.id] = comments.length;
        }),
      );
      setCommentCounts(counts);
    };
    if (initialCards.length) loadCounts();
  }, [initialCards, setCommentCounts]);

  // Workspace modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardType | null>(null);

  // Workspace creation
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      setIsCreatingWorkspace(false);
      return;
    }
    const newWorkspace = await createWorkspaceAction(newWorkspaceName);
    if (newWorkspace) {
      setNewWorkspaceName("");
      setIsCreatingWorkspace(false);
      router.push(`/?workspace=${newWorkspace.id}`);
    }
  };

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId);

  return (
    <>
      <BoardHeader
        workspaces={workspaces}
        currentWorkspaceId={currentWorkspaceId}
        currentWorkspaceName={currentWorkspace?.name}
        userProfile={userProfile}
        allUsers={allUsers}
        cards={cards}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        isCreatingWorkspace={isCreatingWorkspace}
        newWorkspaceName={newWorkspaceName}
        setNewWorkspaceName={setNewWorkspaceName}
        onCreateWorkspace={handleCreateWorkspace}
        setIsCreatingWorkspace={setIsCreatingWorkspace}
      />

      <BoardFiltersBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedUserFilters={selectedUserFilters}
        setSelectedUserFilters={setSelectedUserFilters}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        labelFilter={labelFilter}
        setLabelFilter={setLabelFilter}
        allUsers={allUsers}
        hasActiveFilters={hasActiveFilters}
        clearFilters={clearFilters}
      />

      <DragDropContext onDragEnd={onDragEnd}>
        <BoardCanvas
          lists={lists}
          cards={filteredCards}
          onAddCard={addCard}
          onDeleteList={deleteList}
          onDeleteCard={deleteCard}
          onCardClick={setEditingCard}
          allUsers={allUsers}
          commentCounts={commentCounts}
          userAvatarUrl={
            userProfile?.avatar_url ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.username}`
          }
        />
      </DragDropContext>

      {editingCard && (
        <CardModal
          card={editingCard}
          onClose={() => setEditingCard(null)}
          onUpdate={updateCard}
          currentUserAvatar={
            userProfile?.avatar_url ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.username}`
          }
          allUsers={allUsers}
        />
      )}

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={userProfile}
        onProfileUpdated={() => {}}
      />

      <WorkspaceSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        workspace={currentWorkspace}
      />

      <ShareWorkspaceModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        workspaceId={currentWorkspaceId}
        workspaceName={currentWorkspace?.name}
      />
    </>
  );
}
