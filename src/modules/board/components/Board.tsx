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
  const [activeView, setActiveView] = useState("board");

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
        userProfile={userProfile}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        setIsCreatingWorkspace={setIsCreatingWorkspace}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <BoardHeader
          currentWorkspaceName={currentWorkspace?.name}
          lists={lists}
          cards={cards}
          onOpenShare={() => setIsShareOpen(true)}
          onNotificationClick={handleNotificationClick}
          activeView={activeView}
        />

        <div className="flex-1 overflow-hidden relative flex flex-col">
          {activeView === "board" ? (
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
                    userProfile?.avatar_url ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.username}`
                  }
                  onListTypeChange={updateListType}
                />
              </DragDropContext>
            </motion.div>
          ) : (
            <motion.div 
              key="management-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 p-8 overflow-y-auto custom-scrollbar"
            >
              <div className="max-w-4xl mx-auto space-y-10">
                {activeView === "members" && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <div className="p-2 rounded-sm bg-indigo-500/10 border border-indigo-500/20">
                        <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      Workspace Members
                    </h2>
                    <div className="bg-(--app-panel) border border-(--app-border-faint) rounded-sm overflow-hidden shadow-xl">
                      <table className="w-full text-left">
                        <thead className="bg-(--app-hover)/50 border-b border-(--app-border-faint)">
                          <tr>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-(--app-text-muted)">User</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-(--app-text-muted)">Email</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-(--app-text-muted)">Role</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-(--app-border-faint)">
                          {allUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-(--app-hover)/30 transition-colors">
                              <td className="px-6 py-4 flex items-center gap-3">
                                <img 
                                  src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                                  className="w-8 h-8 rounded-sm object-cover border border-(--app-border-faint)"
                                  alt={user.username}
                                />
                                <span className="text-sm font-semibold">{user.display_name || user.username}</span>
                              </td>
                              <td className="px-6 py-4 text-sm text-(--app-text-muted)">{user.email || "No email provided"}</td>
                              <td className="px-6 py-4 text-sm">
                                <span className="px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Member
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeView === "invites" && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <div className="p-2 rounded-sm bg-indigo-500/10 border border-indigo-500/20">
                        <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      Active Invites
                    </h2>
                    <div className="bg-(--app-panel) border border-(--app-border-faint) rounded-sm p-12 text-center shadow-xl">
                      <div className="w-16 h-16 bg-(--app-hover) rounded-sm mx-auto mb-4 flex items-center justify-center border border-(--app-border-faint)">
                         <Mail className="w-8 h-8 text-indigo-400 opacity-50" />
                      </div>
                      <p className="text-lg font-bold mb-2">No active invitations</p>
                      <p className="text-sm text-(--app-text-muted) mb-6">Invitations sent will appear here until they are accepted.</p>
                      <button 
                        onClick={() => setIsShareOpen(true)}
                        className="px-6 py-2.5 rounded-sm bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20"
                      >
                        Send New Invitation
                      </button>
                    </div>
                  </div>
                )}
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
          currentUserId={userProfile?.id}
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
    </div>
  );
}

// Re-using Mail icon from lucide-react if needed in the view
import { Mail } from "lucide-react";
