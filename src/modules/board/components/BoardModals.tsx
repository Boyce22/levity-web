import React from "react";
import CardModal from "@/modules/card/components/card-modal/CardModal";
import ProfileModal from "@/modules/users/components/ProfileModal";
import ShareWorkspaceModal from "@/modules/workspace/components/ShareWorkspaceModal";
import WorkspaceSettingsModal from "@/modules/workspace/components/WorkspaceSettingsModal";
import CreateWorkspaceModal from "@/modules/workspace/components/CreateWorkspaceModal";
import { Card as CardType, List as ListType } from "@/modules/board/actions/board";

interface BoardModalsProps {
  editingCard: CardType | null;
  setEditingCard: (card: CardType | null) => void;
  updateCard: (updatedCard: CardType) => void;
  currentUserProfile: any;
  setCurrentUserProfile: (profile: any) => void;
  currentWorkspaceId: string;
  currentWorkspace: any;
  allUsers: any[];
  tags: any[];
  priorities: any[];
  lists: ListType[];
  initialCardTab: "description" | "comments";
  isProfileOpen: boolean;
  setIsProfileOpen: (isOpen: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
  isCreatingWorkspace: boolean;
  setIsCreatingWorkspace: (isOpen: boolean) => void;
  isShareOpen: boolean;
  setIsShareOpen: (isOpen: boolean) => void;
  handleCreateWorkspace: (name: string) => Promise<void>;
}

export function BoardModals({
  editingCard,
  setEditingCard,
  updateCard,
  currentUserProfile,
  setCurrentUserProfile,
  currentWorkspaceId,
  currentWorkspace,
  allUsers,
  tags,
  priorities,
  lists,
  initialCardTab,
  isProfileOpen,
  setIsProfileOpen,
  isSettingsOpen,
  setIsSettingsOpen,
  isCreatingWorkspace,
  setIsCreatingWorkspace,
  isShareOpen,
  setIsShareOpen,
  handleCreateWorkspace,
}: BoardModalsProps) {
  return (
    <>
      {editingCard && (
        <CardModal
          card={editingCard}
          onClose={() => setEditingCard(null)}
          onUpdate={updateCard}
          currentUserId={currentUserProfile?.id}
          currentUserAvatar={
            currentUserProfile?.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserProfile?.username}`
          }
          allUsers={allUsers}
          tags={tags}
          priorities={priorities}
          workspaceId={currentWorkspaceId}
          workspaceName={currentWorkspace?.name || "Workspace"}
          listName={
            lists.find((l) => l.id === editingCard?.listId)?.title || "List"
          }
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
    </>
  );
}
