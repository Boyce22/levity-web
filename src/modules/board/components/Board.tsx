"use client";

import { DragDropContext } from "@hello-pangea/dnd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCommentsAction } from "@/modules/board/actions/comments";
import { createWorkspaceAction } from "@/modules/workspace/actions/workspace";
import { ProgressLoader } from "@/modules/shared/components/ProgressLoader";
import { AnimatePresence } from "framer-motion";

import {
  Card as CardType,
  List as ListType,
} from "@/modules/board/actions/board";
import CardModal from "@/modules/card/components/card-modal/CardModal";

import ProfileModal from "@/modules/users/components/ProfileModal";
import ShareWorkspaceModal from "@/modules/workspace/components/ShareWorkspaceModal";
import WorkspaceSettingsModal from "@/modules/workspace/components/WorkspaceSettingsModal";
import CreateWorkspaceModal from "@/modules/workspace/components/CreateWorkspaceModal";
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
  tags: any[];
  priorities: any[];
}

export default function Board({
  initialLists,
  initialCards,
  userProfile,
  allUsers,
  workspaces,
  currentWorkspaceId,
  tags,
  priorities,
}: BoardProps) {
  const router = useRouter();
  const [isResolving, setIsResolving] = useState(true);
  const [minTimeReached, setMinTimeReached] = useState(false);

  // Persistence & Workspace Resolution
  useEffect(() => {
    // Ensure the premium loader is seen for at least 1.2s to feel high-fidelity
    const timer = setTimeout(() => setMinTimeReached(true), 1200);

    const urlParams = new URLSearchParams(window.location.search);
    const urlWorkspace = urlParams.get("workspace");
    const lastWorkspace = localStorage.getItem("last-workspace-id");

    if (!urlWorkspace && lastWorkspace && lastWorkspace !== currentWorkspaceId) {
      const exists = workspaces.some(w => w.id === lastWorkspace);
      if (exists) {
        router.replace(`/?workspace=${lastWorkspace}`);
        return;
      }
    }

    if (currentWorkspaceId) {
      localStorage.setItem("last-workspace-id", currentWorkspaceId);
    }

    setIsResolving(false);
    return () => clearTimeout(timer);
  }, [currentWorkspaceId, router, workspaces]);

  // Core board state management
  const boardData = useBoardData({
    initialLists,
    initialCards,
    currentWorkspaceId,
    userProfile,
  });

  const {
    lists,
    setLists,
    cards,
    setCards,
    commentCounts,
    setCommentCounts,
    isReady,
    addList,
    deleteList,
    addCard,
    deleteCard,
    updateCard,
    updateListType,
  } = boardData;

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

  // Workspace modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardType | null>(null);
  const [initialCardTab, setInitialCardTab] = useState<"description" | "comments">("description");

  const handleNotificationClick = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    if (card) {
      setInitialCardTab("comments");
      setEditingCard(card);
    }
  };

  // Workspace creation
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const handleCreateWorkspace = async (name: string) => {
    setIsCreatingWorkspace(true);
    try {
      const newWorkspace = await createWorkspaceAction(name);
      if (newWorkspace) {
        setIsCreatingWorkspace(false);
        router.push(`/?workspace=${newWorkspace.id}`);
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId);

  const showLoader = isResolving || !isReady || !minTimeReached;

  return (
    <>
      <AnimatePresence mode="wait">
        {showLoader && (
          <ProgressLoader 
            key="global-loader"
            isComplete={!isResolving && isReady}
            message={isResolving ? "Synchronizing Workspace..." : "Preparing Board Content..."} 
          />
        )}
      </AnimatePresence>

      <BoardHeader
        workspaces={workspaces}
        currentWorkspaceId={currentWorkspaceId}
        currentWorkspaceName={currentWorkspace?.name}
        userProfile={userProfile}
        allUsers={allUsers}
        lists={lists}
        cards={cards}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onNotificationClick={handleNotificationClick}
        isCreatingWorkspace={isCreatingWorkspace}
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
        tags={tags}
        priorities={priorities}
        hasActiveFilters={hasActiveFilters}
        clearFilters={clearFilters}
      />

      <DragDropContext onDragEnd={onDragEnd}>
        <BoardCanvas
          lists={lists}
          cards={filteredCards}
          onAddCard={addCard}
          onAddList={addList}
          onDeleteList={deleteList}
          onDeleteCard={deleteCard}
          onCardClick={(card) => {
            setInitialCardTab("description");
            setEditingCard(card);
          }}
          allUsers={allUsers}
          commentCounts={commentCounts}
          userAvatarUrl={
            userProfile?.avatar_url ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.username}`
          }
          onListTypeChange={updateListType}
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
          tags={tags}
          priorities={priorities}
          workspaceId={currentWorkspaceId}
          initialTab={initialCardTab}
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

      <CreateWorkspaceModal
        isOpen={isCreatingWorkspace}
        onClose={() => setIsCreatingWorkspace(false)}
        onCreate={handleCreateWorkspace}
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
