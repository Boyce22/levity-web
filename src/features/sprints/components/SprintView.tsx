'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';
import { Sprint, SprintCard } from '@/contracts/Sprint';
import { useSprints } from '@/features/sprints/hooks/useSprints';
import { useSprintCards } from '@/features/sprints/hooks/useSprintCards';
import { SprintHeader } from './SprintHeader';
import { SprintCardList } from './SprintCardList';
import { CreateSprintModal } from './modals/CreateSprintModal';
import { EditSprintModal } from './modals/EditSprintModal';
import { CompleteSprintModal } from './modals/CompleteSprintModal';
import { AddCardModal } from './modals/AddCardModal';
import { Sidebar } from '@/features/board/components/layout/Sidebar';
import CardModal from '@/features/board/components/card/components/card-modal/CardModal';
import type { Card as CardType, List as ListType } from '@/contracts/Board';

interface SprintViewProps {
  sprint: Sprint;
  initialSprints: Sprint[];
  workspaceId: string;
  boardLists: ListType[];
  boardCards: CardType[];
  workspaces: { id: string; name: string }[];
  userProfile: any;
  allUsers: any[];
  userRole: string;
  openCreateOnMount?: boolean;
}

type ModalType = 'create' | 'edit' | 'complete' | 'addCard' | null;

export function SprintView({
  sprint,
  initialSprints,
  workspaceId,
  boardLists,
  boardCards,
  workspaces,
  userProfile,
  allUsers,
  userRole,
  openCreateOnMount = false,
}: SprintViewProps) {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<ModalType>(
    openCreateOnMount ? 'create' : null,
  );
  const [editingCard, setEditingCard] = useState<CardType | null>(null);

  const { sprints, addSprint, updateSprint, activateSprint, completeSprint } =
    useSprints(initialSprints, workspaceId);

  const isEmpty = sprint.id === '';
  const currentSprint = sprints.find((s) => s.id === sprint.id) ?? sprint;

  const { sprintCards, addCard, removeCard, reorderCards } = useSprintCards(
    sprint.cards ?? [],
    workspaceId,
    sprint.id,
  );

  const currentWorkspace = workspaces.find((w) => w.id === workspaceId);

  const handleActivate = async () => {
    await activateSprint(sprint.id);
  };

  const handleComplete = async (toSprintId?: string) => {
    await completeSprint(sprint.id, { toSprintId });
    setActiveModal(null);
  };

  const handleCardClick = (sprintCard: SprintCard) => {
    const boardCard = boardCards.find((c) => c.id === sprintCard.cardId);
    if (boardCard) setEditingCard(boardCard);
  };

  const handleSprintNavigate = (targetSprintId: string) => {
    router.push(`/sprints/${workspaceId}/${targetSprintId}`);
  };

  return (
    <div className="bg-app-bg flex h-screen overflow-hidden font-sans text-slate-200 antialiased">
      <Sidebar
        workspaces={workspaces}
        currentWorkspaceId={workspaceId}
        currentWorkspaceName={currentWorkspace?.name}
        userProfile={userProfile}
        onOpenSettings={() => router.push(`/?workspace=${workspaceId}`)}
        onOpenProfile={() => router.push(`/?workspace=${workspaceId}`)}
        setIsCreatingWorkspace={() => router.push(`/?workspace=${workspaceId}`)}
        activeView="sprints"
        onViewChange={(view) => {
          if (view !== 'sprints') {
            router.push(`/?workspace=${workspaceId}`);
          }
        }}
        userRole={userRole}
      />

      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
            <div className="rounded-sm border border-indigo-500/20 bg-indigo-500/10 p-4">
              <Zap className="h-8 w-8 text-indigo-400" />
            </div>
            <div className="text-center">
              <h2 className="text-app-text text-xl font-bold tracking-tight">
                No sprints yet
              </h2>
              <p className="text-app-text-muted mt-2 text-sm opacity-70">
                Create your first sprint to start tracking work.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveModal('create')}
              className="rounded-sm bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
            >
              Create Sprint
            </button>
          </div>
        ) : (
          <>
            <SprintHeader
              sprint={currentSprint}
              sprints={sprints}
              onActivate={handleActivate}
              onComplete={() => setActiveModal('complete')}
              onEdit={() => setActiveModal('edit')}
              onAddCard={() => setActiveModal('addCard')}
              onNewSprint={() => setActiveModal('create')}
              onNavigate={handleSprintNavigate}
            />
            <div className="custom-scrollbar flex-1 overflow-y-auto p-6">
              <SprintCardList
                sprintCards={sprintCards}
                sprint={currentSprint}
                onCardClick={handleCardClick}
                onRemoveCard={removeCard}
                onReorder={reorderCards}
              />
            </div>
          </>
        )}
      </main>

      <CreateSprintModal
        isOpen={activeModal === 'create'}
        onClose={() => setActiveModal(null)}
        onSubmit={async (data) => {
          const created = await addSprint(data);
          setActiveModal(null);
          if (created) {
            router.push(`/sprints/${workspaceId}/${created.id}`);
          }
        }}
      />

      {!isEmpty && (
        <>
          <EditSprintModal
            isOpen={activeModal === 'edit'}
            sprint={currentSprint}
            onClose={() => setActiveModal(null)}
            onSubmit={async (data) => {
              await updateSprint(sprint.id, data);
              setActiveModal(null);
            }}
          />

          <CompleteSprintModal
            isOpen={activeModal === 'complete'}
            sprint={currentSprint}
            sprints={sprints}
            onClose={() => setActiveModal(null)}
            onConfirm={handleComplete}
          />

          <AddCardModal
            isOpen={activeModal === 'addCard'}
            sprint={currentSprint}
            boardLists={boardLists}
            boardCards={boardCards}
            sprintCards={sprintCards}
            workspaceId={workspaceId}
            onClose={() => setActiveModal(null)}
            onAddCard={addCard}
          />
        </>
      )}

      {editingCard && (
        <CardModal
          card={editingCard}
          onClose={() => setEditingCard(null)}
          onUpdate={(updated) => setEditingCard(updated)}
          currentUserId={userProfile?.id}
          currentUserAvatar={
            userProfile?.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.username}`
          }
          allUsers={allUsers}
          tags={[]}
          priorities={[]}
          workspaceId={workspaceId}
          workspaceName={currentWorkspace?.name ?? 'Workspace'}
          listName={boardLists.find((l) => l.id === editingCard.listId)?.title ?? 'List'}
        />
      )}
    </div>
  );
}

SprintView.displayName = 'SprintView';
