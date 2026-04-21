'use client';

import { useState, useEffect, useCallback } from 'react';
import { Zap, Loader2 } from 'lucide-react';
import {
  getSprintsByWorkspaceAction,
  getActiveSprintAction,
  getSprintByIdAction,
  createSprintAction,
  updateSprintAction,
  activateSprintAction,
  completeSprintAction,
  addCardToSprintAction,
  removeCardFromSprintAction,
  reorderSprintCardsAction,
} from '@/features/sprints/server/actions';
import { Sprint, SprintCard, CreateSprint, UpdateSprint } from '@/contracts/Sprint';
import { Card as CardType, List as ListType } from '@/contracts/Board';
import { SprintHeader } from './SprintHeader';
import { SprintCardList } from './SprintCardList';
import { CreateSprintModal } from './modals/CreateSprintModal';
import { EditSprintModal } from './modals/EditSprintModal';
import { CompleteSprintModal } from './modals/CompleteSprintModal';
import { AddCardModal } from './modals/AddCardModal';
import CardModal from '@/features/board/components/card/components/card-modal/CardModal';

interface SprintPanelProps {
  workspaceId: string;
  workspaceName: string;
  boardLists: ListType[];
  boardCards: CardType[];
  allUsers: any[];
  userProfile: any;
  userRole: string;
}

type ModalType = 'create' | 'edit' | 'complete' | 'addCard' | null;

// ─── Inner content (initialized after data loads) ─────────────────────────────

interface SprintContentProps {
  sprint: Sprint;
  sprints: Sprint[];
  workspaceId: string;
  workspaceName: string;
  boardLists: ListType[];
  boardCards: CardType[];
  allUsers: any[];
  userProfile: any;
  onSwitchSprint: (sprintId: string) => Promise<void>;
  onSprintCreated: (sprint: Sprint) => void;
  onSprintUpdated: (sprint: Sprint) => void;
  onSprintActivated: (sprint: Sprint) => void;
  onSprintCompleted: (sprint: Sprint) => void;
}

function SprintContent({
  sprint,
  sprints,
  workspaceId,
  workspaceName,
  boardLists,
  boardCards,
  allUsers,
  userProfile,
  onSwitchSprint,
  onSprintCreated,
  onSprintUpdated,
  onSprintActivated,
  onSprintCompleted,
}: SprintContentProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [sprintCards, setSprintCards] = useState<SprintCard[]>(sprint.cards ?? []);
  const [editingCard, setEditingCard] = useState<CardType | null>(null);

  const handleActivate = async () => {
    const updated = await activateSprintAction(workspaceId, sprint.id);
    onSprintActivated(updated);
  };

  const handleComplete = async (toSprintId?: string) => {
    const updated = await completeSprintAction(workspaceId, sprint.id, { toSprintId });
    onSprintCompleted(updated);
    setActiveModal(null);
  };

  const handleUpdate = async (data: UpdateSprint) => {
    const updated = await updateSprintAction(workspaceId, sprint.id, data);
    onSprintUpdated(updated);
    setActiveModal(null);
  };

  const handleAddCard = useCallback(async (cardId: string) => {
    const alreadyAdded = sprintCards.some((sc) => sc.cardId === cardId);
    if (alreadyAdded) return;
    const tempId = `temp-${Date.now()}`;
    const optimistic: SprintCard = {
      id: tempId,
      sprintId: sprint.id,
      cardId,
      position: sprintCards.length,
      addedAt: new Date().toISOString(),
      card: { id: cardId, content: '', listId: '' },
    };
    setSprintCards((prev) => [...prev, optimistic]);
    try {
      const saved = await addCardToSprintAction(workspaceId, sprint.id, cardId);
      setSprintCards((prev) => prev.map((sc) => (sc.id === tempId ? saved : sc)));
    } catch {
      setSprintCards((prev) => prev.filter((sc) => sc.id !== tempId));
    }
  }, [workspaceId, sprint.id, sprintCards]);

  const handleRemoveCard = useCallback(async (sprintCardId: string) => {
    const snapshot = sprintCards.find((sc) => sc.id === sprintCardId);
    setSprintCards((prev) => prev.filter((sc) => sc.id !== sprintCardId));
    try {
      const cardId = snapshot?.cardId ?? sprintCardId;
      await removeCardFromSprintAction(workspaceId, sprint.id, cardId);
    } catch {
      if (snapshot) setSprintCards((prev) => [...prev, snapshot]);
    }
  }, [workspaceId, sprint.id, sprintCards]);

  const handleReorder = useCallback(async (reordered: SprintCard[]) => {
    const withPos = reordered.map((sc, i) => ({ ...sc, position: i }));
    setSprintCards(withPos);
    try {
      await reorderSprintCardsAction(
        workspaceId,
        sprint.id,
        withPos.map((sc) => ({ id: sc.id, position: sc.position })),
      );
    } catch {
      setSprintCards(sprint.cards ?? []);
    }
  }, [workspaceId, sprint.id, sprint.cards]);

  const handleCardClick = (sprintCard: SprintCard) => {
    const boardCard = boardCards.find((c) => c.id === sprintCard.cardId);
    if (boardCard) setEditingCard(boardCard);
  };

  return (
    <>
      <SprintHeader
        sprint={sprint}
        sprints={sprints}
        onActivate={handleActivate}
        onComplete={() => setActiveModal('complete')}
        onEdit={() => setActiveModal('edit')}
        onAddCard={() => setActiveModal('addCard')}
        onNewSprint={() => setActiveModal('create')}
        onNavigate={onSwitchSprint}
      />

      <div className="custom-scrollbar flex-1 overflow-y-auto p-6">
        <SprintCardList
          sprintCards={sprintCards}
          sprint={sprint}
          onCardClick={handleCardClick}
          onRemoveCard={handleRemoveCard}
          onReorder={handleReorder}
        />
      </div>

      <CreateSprintModal
        isOpen={activeModal === 'create'}
        onClose={() => setActiveModal(null)}
        onSubmit={async (data) => {
          const created = await createSprintAction(workspaceId, data);
          onSprintCreated(created);
          setActiveModal(null);
        }}
      />

      <EditSprintModal
        isOpen={activeModal === 'edit'}
        sprint={sprint}
        onClose={() => setActiveModal(null)}
        onSubmit={handleUpdate}
      />

      <CompleteSprintModal
        isOpen={activeModal === 'complete'}
        sprint={sprint}
        sprints={sprints}
        onClose={() => setActiveModal(null)}
        onConfirm={handleComplete}
      />

      <AddCardModal
        isOpen={activeModal === 'addCard'}
        sprint={sprint}
        boardLists={boardLists}
        boardCards={boardCards}
        sprintCards={sprintCards}
        workspaceId={workspaceId}
        onClose={() => setActiveModal(null)}
        onAddCard={handleAddCard}
      />

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
          workspaceName={workspaceName}
          listName={boardLists.find((l) => l.id === editingCard.listId)?.title ?? 'List'}
        />
      )}
    </>
  );
}

SprintContent.displayName = 'SprintContent';

// ─── Panel (loading + data orchestration) ────────────────────────────────────

export function SprintPanel({
  workspaceId,
  workspaceName,
  boardLists,
  boardCards,
  allUsers,
  userProfile,
  userRole,
}: SprintPanelProps) {
  const [loading, setLoading] = useState(true);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [currentSprint, setCurrentSprint] = useState<Sprint | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      setLoading(true);
      const [all, active] = await Promise.all([
        getSprintsByWorkspaceAction(workspaceId),
        getActiveSprintAction(workspaceId),
      ]);
      if (cancelled) return;
      setSprints(all);
      const targetId =
        active?.id ??
        all.find((s) => s.status === 'planning')?.id ??
        all[0]?.id;
      if (targetId) {
        const full = await getSprintByIdAction(workspaceId, targetId);
        if (!cancelled) setCurrentSprint(full);
      }
      if (!cancelled) setLoading(false);
    }
    init();
    return () => { cancelled = true; };
  }, [workspaceId]);

  const handleSwitchSprint = useCallback(async (sprintId: string) => {
    setLoading(true);
    const full = await getSprintByIdAction(workspaceId, sprintId);
    setCurrentSprint(full);
    setLoading(false);
  }, [workspaceId]);

  const handleSprintCreated = useCallback((sprint: Sprint) => {
    setSprints((prev) => [...prev, sprint]);
    handleSwitchSprint(sprint.id);
    setShowCreate(false);
  }, [handleSwitchSprint]);

  const handleSprintUpdated = useCallback((updated: Sprint) => {
    setSprints((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)));
    setCurrentSprint(updated);
  }, []);

  const handleSprintActivated = useCallback((updated: Sprint) => {
    setSprints((prev) =>
      prev.map((s) =>
        s.id === updated.id
          ? { ...s, status: 'active' }
          : s.status === 'active'
          ? { ...s, status: 'planning' }
          : s,
      ),
    );
    setCurrentSprint(updated);
  }, []);

  const handleSprintCompleted = useCallback((updated: Sprint) => {
    setSprints((prev) => prev.map((s) => (s.id === updated.id ? { ...s, status: 'completed' } : s)));
    setCurrentSprint(updated);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  // Empty state
  if (!currentSprint) {
    return (
      <>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
          <div className="rounded-sm border border-indigo-500/20 bg-indigo-500/10 p-4">
            <Zap className="h-8 w-8 text-indigo-400" />
          </div>
          <div className="text-center">
            <h2 className="text-app-text text-xl font-bold tracking-tight">No sprints yet</h2>
            <p className="text-app-text-muted mt-2 text-sm opacity-70">
              Create your first sprint to start tracking work.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="rounded-sm bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
          >
            Create Sprint
          </button>
        </div>

        <CreateSprintModal
          isOpen={showCreate}
          onClose={() => setShowCreate(false)}
          onSubmit={async (data) => {
            const created = await createSprintAction(workspaceId, data);
            handleSprintCreated(created);
          }}
        />
      </>
    );
  }

  return (
    <SprintContent
      key={currentSprint.id}
      sprint={currentSprint}
      sprints={sprints}
      workspaceId={workspaceId}
      workspaceName={workspaceName}
      boardLists={boardLists}
      boardCards={boardCards}
      allUsers={allUsers}
      userProfile={userProfile}
      onSwitchSprint={handleSwitchSprint}
      onSprintCreated={handleSprintCreated}
      onSprintUpdated={handleSprintUpdated}
      onSprintActivated={handleSprintActivated}
      onSprintCompleted={handleSprintCompleted}
    />
  );
}

SprintPanel.displayName = 'SprintPanel';
