import {  DropResult } from "@hello-pangea/dnd";
import type { List as ListType, Card as CardType  } from '@/contracts/Board';
import { updateListPositionsAction } from '@/features/board/server/actions/list.actions';
import { updateCardPositionsAction } from '@/features/board/server/actions/card.actions';

interface UseDragDropProps {
  lists: ListType[];
  setLists: React.Dispatch<React.SetStateAction<ListType[]>>;
  cards: CardType[];
  setCards: React.Dispatch<React.SetStateAction<CardType[]>>;
  workspaceId: string;
}

export function useDragDrop({
  lists,
  setLists,
  cards,
  setCards,
  workspaceId,
}: UseDragDropProps) {
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, type, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "list") {
      const newLists = Array.from(lists);
      const [moved] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, moved);
      const updated = newLists.map((l, i) => ({ ...l, position: i }));
      setLists(updated);
      await updateListPositionsAction(
        updated.map((l) => ({ id: l.id, position: l.position })),
        workspaceId,
      );
      return;
    }

    if (type === "card") {
      const destListId = destination.droppableId;
      const sourceListId = source.droppableId;
      const newCards = Array.from(cards);
      const cardIndex = newCards.findIndex((c) => c.id === draggableId);
      // Cria novo objeto em vez de mutar o item extraído do array shallow-copied
      const [extracted] = newCards.splice(cardIndex, 1);
      const movedCard = { ...extracted, listId: destListId };

      const destListCards = newCards
        .filter((c) => c.listId === destListId)
        .sort((a, b) => a.position - b.position);
      destListCards.splice(destination.index, 0, movedCard);
      const updatedDest = destListCards.map((c, i) => ({ ...c, position: i }));

      let updatedSource: typeof newCards = [];
      if (sourceListId !== destListId) {
        const sourceListCards = newCards
          .filter((c) => c.listId === sourceListId)
          .sort((a, b) => a.position - b.position);
        updatedSource = sourceListCards.map((c, i) => ({ ...c, position: i }));
      }

      const others = newCards.filter(
        (c) => c.listId !== destListId && c.listId !== sourceListId,
      );
      const finalCards = [...others, ...updatedDest, ...updatedSource];
      setCards(finalCards);

      const toUpdate = [...updatedDest, ...updatedSource];
      await updateCardPositionsAction(
        toUpdate.map((c) => ({
          id: c.id,
          listId: c.listId,
          position: c.position,
        })),
        workspaceId,
      );
    }
  };

  return onDragEnd;
}
