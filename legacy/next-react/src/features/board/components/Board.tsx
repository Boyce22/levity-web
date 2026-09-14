"use client";

import {  DragDropContext } from "@hello-pangea/dnd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createWorkspaceAction } from "@/features/workspaces/server/actions";
import { ProgressLoader } from "@/ui/components/ProgressLoader";
import { AnimatePresence, motion } from "framer-motion";

import type { Card as CardType, List as ListType  } from '@/contracts/Board';

import { BoardCanvas } from "./BoardCanvas";
import { BoardFiltersBar } from "./BoardFiltersBar";
import { BoardHeader } from "./BoardHeader";
import { Sidebar } from "@/features/board/components/layout/Sidebar";
import { MembersManagement } from "@/features/workspaces/components/MembersManagement";
import { useBoardData } from "../hooks/useBoardData";
import { useDragDrop } from "../hooks/useDragDrop";
import { useFilters } from "../hooks/useFilters";
import { useWorkspaceResolution } from "../hooks/useWorkspaceResolution";
import { BoardModals } from "./BoardModals";
import { SprintPanel } from "@/features/sprints/components/SprintPanel";
import { Users } from "lucide-react";

interface BoardProps {
  initialLists: ListType[];
  initialCards: CardType[];
  userProfile: any;
  allUsers: any[];
  workspaces: any[];
  currentWorkspaceId: string;
  tags: any[];
  priorities: any[];
  userRole: string;
  initialInvites: any[];
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
  userRole,
  initialInvites,
}: BoardProps) {
  const router = useRouter();
  const [activeView, setActiveView] = useState("board");
  const [currentUserProfile, setCurrentUserProfile] = useState(userProfile);

  useEffect(() => {
    setCurrentUserProfile(userProfile);
  }, [userProfile]);

  const { isResolving, minTimeReached } = useWorkspaceResolution({
    currentWorkspaceId,
    workspaces,
  });

  const boardData = useBoardData({
    initialLists,
    initialCards,
    currentWorkspaceId,
    userProfile: currentUserProfile,
  });

  const {
    lists,
    cards,
    commentCounts,
    isReady,
    addList,
    deleteList,
    addCard,
    deleteCard,
    updateCard,
    updateListType,
    updateListWipLimit,
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
    setLists: boardData.setLists,
    cards,
    setCards: boardData.setCards,
    workspaceId: currentWorkspaceId,
  });

  // Workspace modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardType | null>(null);
  const [initialCardTab, setInitialCardTab] = useState<"description" | "comments">("description");
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);

  const handleNotificationClick = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    if (card) {
      setActiveView("board");
      setInitialCardTab("comments");
      setEditingCard(card);
    }
  };

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
    <div className="bg-app-bg flex h-screen overflow-hidden font-sans text-slate-200 antialiased">
      <AnimatePresence mode="wait">
        {showLoader && (
          <ProgressLoader 
            key="global-loader"
            isComplete={!isResolving && isReady}
            message={isResolving ? "Synchronizing Workspace..." : "Preparing Board Content..."} 
          />
        )}
      </AnimatePresence>

      <Sidebar 
        workspaces={workspaces}
        currentWorkspaceId={currentWorkspaceId}
        currentWorkspaceName={currentWorkspace?.name}
        userProfile={currentUserProfile}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        setIsCreatingWorkspace={setIsCreatingWorkspace}
        activeView={activeView}
        onViewChange={setActiveView}
        userRole={userRole}
      />

      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <BoardHeader
          currentWorkspaceName={currentWorkspace?.name}
          lists={lists}
          cards={cards}
          onOpenShare={() => setIsShareOpen(true)}
          onNotificationClick={handleNotificationClick}
          activeView={activeView}
          userRole={userRole}
        />

        <div className="relative flex flex-1 flex-col overflow-hidden">
          {activeView === "board" && (
            <motion.div 
              key="board-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-1 flex-col overflow-hidden"
            >
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
                    currentUserProfile?.avatarUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserProfile?.username}`
                  }
                  onListTypeChange={updateListType}
                  onWipLimitChange={updateListWipLimit}
                  userRole={userRole}
                />
              </DragDropContext>
            </motion.div>
          )}

          {activeView === "sprints" && (
            <motion.div
              key="sprints-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-1 flex-col overflow-hidden"
            >
              <SprintPanel
                workspaceId={currentWorkspaceId}
                workspaceName={currentWorkspace?.name ?? 'Workspace'}
                boardLists={lists}
                boardCards={cards}
                allUsers={allUsers}
                userProfile={currentUserProfile}
                userRole={userRole}
              />
            </motion.div>
          )}

          {activeView === "management" && (
            <motion.div 
              key="management-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="custom-scrollbar flex-1 overflow-y-auto p-8"
            >
              <div className="mx-auto max-w-4xl space-y-10">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold">
                    <div className="rounded-sm border border-indigo-500/20 bg-indigo-500/10 p-2">
                      <Users className="h-6 w-6 text-indigo-400" />
                    </div>
                    Workspace Management
                  </h2>
                  
                  <MembersManagement 
                    workspaceId={currentWorkspaceId}
                    members={allUsers}
                    onOpenShare={() => setIsShareOpen(true)}
                    initialInvites={initialInvites}
                    currentUserId={currentUserProfile?.id}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <BoardModals
        editingCard={editingCard}
        setEditingCard={setEditingCard}
        updateCard={updateCard}
        currentUserProfile={currentUserProfile}
        setCurrentUserProfile={setCurrentUserProfile}
        currentWorkspaceId={currentWorkspaceId}
        currentWorkspace={currentWorkspace}
        allUsers={allUsers}
        tags={tags}
        priorities={priorities}
        lists={lists}
        initialCardTab={initialCardTab}
        isProfileOpen={isProfileOpen}
        setIsProfileOpen={setIsProfileOpen}
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        isCreatingWorkspace={isCreatingWorkspace}
        setIsCreatingWorkspace={setIsCreatingWorkspace}
        isShareOpen={isShareOpen}
        setIsShareOpen={setIsShareOpen}
        handleCreateWorkspace={handleCreateWorkspace}
      />
    </div>
  );
}


