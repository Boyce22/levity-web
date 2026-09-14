'use client';

import { useState, useCallback } from 'react';
import { SprintCard } from '@/contracts/Sprint';
import {
  addCardToSprintAction,
  removeCardFromSprintAction,
  reorderSprintCardsAction,
} from '@/features/sprints/server/actions';

export function useSprintCards(
  initialCards: SprintCard[],
  workspaceId: string,
  sprintId: string,
) {
  const [sprintCards, setSprintCards] = useState<SprintCard[]>(initialCards);

  const addCard = useCallback(
    async (cardId: string) => {
      const alreadyAdded = sprintCards.some((sc) => sc.cardId === cardId);
      if (alreadyAdded) return;

      const tempId = `temp-${Date.now()}`;
      const optimistic: SprintCard = {
        id: tempId,
        sprintId,
        cardId,
        position: sprintCards.length,
        addedAt: new Date().toISOString(),
        card: {
          id: cardId,
          content: '',
          listId: '',
        },
      };
      setSprintCards((prev) => [...prev, optimistic]);
      try {
        const saved = await addCardToSprintAction(workspaceId, sprintId, cardId);
        setSprintCards((prev) => prev.map((sc) => (sc.id === tempId ? saved : sc)));
        return saved;
      } catch (err) {
        setSprintCards((prev) => prev.filter((sc) => sc.id !== tempId));
        throw err;
      }
    },
    [workspaceId, sprintId, sprintCards],
  );

  const removeCard = useCallback(
    async (sprintCardId: string) => {
      const snapshot = sprintCards.find((sc) => sc.id === sprintCardId);
      setSprintCards((prev) => prev.filter((sc) => sc.id !== sprintCardId));
      try {
        const cardId = snapshot?.cardId ?? sprintCardId;
        await removeCardFromSprintAction(workspaceId, sprintId, cardId);
      } catch (err) {
        if (snapshot) {
          setSprintCards((prev) => [...prev, snapshot]);
        }
        throw err;
      }
    },
    [workspaceId, sprintId, sprintCards],
  );

  const reorderCards = useCallback(
    async (reordered: SprintCard[]) => {
      const withPositions = reordered.map((sc, i) => ({ ...sc, position: i }));
      setSprintCards(withPositions);
      try {
        await reorderSprintCardsAction(
          workspaceId,
          sprintId,
          withPositions.map((sc) => ({ id: sc.id, position: sc.position })),
        );
      } catch (err) {
        setSprintCards(initialCards);
        throw err;
      }
    },
    [workspaceId, sprintId, initialCards],
  );

  return {
    sprintCards,
    addCard,
    removeCard,
    reorderCards,
  };
}
