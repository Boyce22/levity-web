"use client";

import { DragDropContext } from "@hello-pangea/dnd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createWorkspaceAction } from "@/modules/workspace/actions/workspace";
import { ProgressLoader } from "@/modules/shared/components/ProgressLoader";
import { AnimatePresence, motion } from "framer-motion";

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
import { Sidebar } from "@/modules/shared/components/Sidebar/Sidebar";
import { MembersManagement } from "@/modules/workspace/components/MembersManagement";
import { useBoardData } from "../hooks/useBoardData";
import { useDragDrop } from "../hooks/useDragDrop";
import { useFilters } from "../hooks/useFilters";
import { 
  Users,
  Mail 
} from "lucide-react";

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
  const [isResolving, setIsResolving] = useState(true);
  const [minTimeReached, setMinTimeReached] = useState(false);
  const [activeView, setActiveView] = useState("board");
  const [currentUserProfile, setCurrentUserProfile] = useState(userProfile);

  useEffect(() => {
    setCurrentUserProfile(userProfile);
  }, [userProfile]);

  // Persistence & Workspace Resolution
  useEffect(() => {
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
    userProfile: currentUserProfile,
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
      setActiveView("board"); // Return to board view when clicking notification
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
    <div className="flex h-screen overflow-hidden bg-(--app-bg) text-slate-200 font-sans antialiased">
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

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <BoardHeader
          currentWorkspaceName={currentWorkspace?.name}
          lists={lists}
          cards={cards}
          onOpenShare={() => setIsShareOpen(true)}
          onNotificationClick={handleNotificationClick}
          activeView={activeView}
          userRole={userRole}
        />

        <div className="flex-1 overflow-hidden relative flex flex-col">
          {activeView === "board" && (
            <motion.div 
              key="board-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col overflow-hidden"
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
                    currentUserProfile?.avatar_url ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserProfile?.username}`
                  }
                  onListTypeChange={updateListType}
                  onWipLimitChange={updateListWipLimit}
                  userRole={userRole}
                />
              </DragDropContext>
            </motion.div>
          )}

          {activeView === "management" && (
            <motion.div 
              key="management-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 p-8 overflow-y-auto custom-scrollbar"
            >
              <div className="max-w-4xl mx-auto space-y-10">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <div className="p-2 rounded-sm bg-indigo-500/10 border border-indigo-500/20">
                      <Users className="w-6 h-6 text-indigo-400" />
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

      {/* Modals */}
      {editingCard && (
        <CardModal
          card={editingCard}
          onClose={() => setEditingCard(null)}
          onUpdate={updateCard}
          currentUserId={currentUserProfile?.id}
          currentUserAvatar={
            currentUserProfile?.avatar_url ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserProfile?.username}`
          }
          allUsers={allUsers}
          tags={tags}
          priorities={priorities}
          workspaceId={currentWorkspaceId}
          workspaceName={currentWorkspace?.name || "Workspace"}
          listName={lists.find(l => l.id === editingCard?.list_id)?.title || "List"}
          initialTab={initialCardTab}
        />
      )}

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={currentUserProfile}
        onProfileUpdated={(updated) => setCurrentUserProfile(updated)}
        currentWorkspaceId={currentWorkspaceId}
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
    </div>
  );
}

