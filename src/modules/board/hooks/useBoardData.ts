// modules/board/hooks/useBoardData.ts
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
import { getCommentsAction } from "@/modules/board/actions/comments";

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
    const loadCounts = async () => {
      const counts: Record<string, number> = {};
      await Promise.all(
        initialCards.map(async (card) => {
          const comments = await getCommentsAction(card.id, 50, null);
          counts[card.id] = comments.length;
        }),
      );
      setCommentCounts(counts);
      setIsReady(true);
    };
    if (initialCards.length) {
      loadCounts();
    } else {
      setIsReady(true);
    }
  }, [initialCards]);

  const addList = useCallback(
    async (title: string) => {
      const tempId = `temp-${Date.now()}`;
      const position = lists.length;
      const newList: ListType = {
        id: tempId,
        title,
        position,
        created_by: userProfile?.id || "temp",
        workspace_id: currentWorkspaceId,
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
    setCards((prev) => prev.filter((c) => c.list_id !== listId));
    await deleteListAction(listId);
  }, []);

  const addCard = useCallback(
    async (listId: string, content: string) => {
      const tempId = `temp-${Date.now()}`;
      const position = cards.filter((c) => c.list_id === listId).length;
      const newCard: CardType = {
        id: tempId,
        list_id: listId,
        content,
        position,
      };
      setCards((prev) => [...prev, newCard]);

      const saved = await createCardAction(listId, content, position);
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
    await deleteCardAction(cardId);
  }, []);

  const updateListType = useCallback((listId: string, type: LType) => {
    setLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, list_type: type } : l)),
    );
  }, []);

  const updateCard = useCallback((updatedCard: CardType) => {
    setCards((prev) =>
      prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)),
    );
  }, []);

  const updateListWipLimit = useCallback(async (listId: string, wipLimit: number | null) => {
    // 🚀 Optimistic Update
    setLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, wip_limit: wipLimit } : l)),
    );
    await updateListWipLimitAction(listId, wipLimit);
  }, []);

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
