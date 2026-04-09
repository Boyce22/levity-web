import { useState, useCallback, useEffect } from "react";
import {
  List as ListType,
  Card as CardType,
  ListType as LType,
  createListAction,
  createCardAction,
  deleteListAction,
  deleteCardAction,
  updateListWipLimitAction,
} from "@/modules/board/actions/board";

interface UseBoardDataProps {
  initialLists: ListType[];
  initialCards: CardType[];
  currentWorkspaceId: string;
  userProfile: any;
}

export function useBoardData({
  initialLists,
  initialCards,
  currentWorkspaceId,
  userProfile,
}: UseBoardDataProps) {
  const [lists, setLists] = useState<ListType[]>(initialLists);
  const [cards, setCards] = useState<CardType[]>(initialCards);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>(
    {},
  );
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    setLists(initialLists);
    setCards(initialCards);

    // Populate commentCounts from initialCards
    const counts: Record<string, number> = {};
    initialCards.forEach((card) => {
      counts[card.id] = card.commentCount ?? 0;
    });
    setCommentCounts(counts);

    setIsReady(true);
  }, [initialLists, initialCards]);

  const addList = useCallback(
    async (title: string) => {
      const tempId = `temp-${Date.now()}`;
      const position = lists.length;
      const newList: ListType = {
        id: tempId,
        title,
        position,
        createdBy: userProfile?.id || "temp",
        workspaceId: currentWorkspaceId,
        createdAt: new Date().toISOString(),
        cards: [],
      };
      setLists((prev) => [...prev, newList]);

      const saved = await createListAction(title, position, currentWorkspaceId);
      if (saved) {
        setLists((prev) => prev.map((l) => (l.id === tempId ? saved : l)));
      } else {
        setLists((prev) => prev.filter((l) => l.id !== tempId));
      }
      return saved;
    },
    [lists.length, currentWorkspaceId, userProfile],
  );

  const deleteList = useCallback(async (listId: string) => {
    setLists((prev) => prev.filter((l) => l.id !== listId));
    setCards((prev) => prev.filter((c) => c.listId !== listId));
    await deleteListAction(listId, currentWorkspaceId);
  }, [currentWorkspaceId]);

  const addCard = useCallback(
    async (listId: string, content: string) => {
      const tempId = `temp-${Date.now()}`;
      const position = cards.filter((c) => c.listId === listId).length;
      const newCard: CardType = {
        id: tempId,
        listId,
        content,
        position,
        createdBy: userProfile?.id || "temp",
        createdAt: new Date().toISOString(),
      };
      setCards((prev) => [...prev, newCard]);

      const saved = await createCardAction(listId, content, position, currentWorkspaceId);
      if (saved) {
        setCards((prev) => prev.map((c) => (c.id === tempId ? saved : c)));
      } else {
        setCards((prev) => prev.filter((c) => c.id !== tempId));
      }
      return saved;
    },
    [cards],
  );

  const deleteCard = useCallback(async (cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    await deleteCardAction(cardId, currentWorkspaceId);
  }, [currentWorkspaceId]);

  const updateListType = useCallback((listId: string, type: LType) => {
    setLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, listType: type } : l)),
    );
  }, []);

  const updateCard = useCallback((updatedCard: CardType) => {
    setCards((prev) =>
      prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)),
    );
  }, []);

  const updateListWipLimit = useCallback(async (listId: string, wipLimit: number | null) => {
    setLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, wipLimit } : l)),
    );
    await updateListWipLimitAction(listId, wipLimit, currentWorkspaceId);
  }, [currentWorkspaceId]);

  return {
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
  };
}
