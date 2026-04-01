import { DropResult } from "@hello-pangea/dnd";
import {
  List as ListType,
  Card as CardType,
  updateListPositionsAction,
  updateCardPositionsAction,
} from "@/modules/board/actions/board";

interface UseDragDropProps {
  lists: ListType[];
  setLists: React.Dispatch<React.SetStateAction<ListType[]>>;
  cards: CardType[];
  setCards: React.Dispatch<React.SetStateAction<CardType[]>>;
}

export function useDragDrop({
  lists,
  setLists,
  cards,
  setCards,
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
      );
      return;
    }

    if (type === "card") {
      const destListId = destination.droppableId;
      const newCards = Array.from(cards);
      const cardIndex = newCards.findIndex((c) => c.id === draggableId);
      const [movedCard] = newCards.splice(cardIndex, 1);
      movedCard.list_id = destListId;

      const destListCards = newCards
        .filter((c) => c.list_id === destListId)
        .sort((a, b) => a.position - b.position);
      destListCards.splice(destination.index, 0, movedCard);
      const updatedDest = destListCards.map((c, i) => ({ ...c, position: i }));

      // Combine with cards from other lists
      const others = newCards.filter((c) => c.list_id !== destListId);
      const finalCards = [...others, ...updatedDest];
      setCards(finalCards);

      await updateCardPositionsAction(
        updatedDest.map((c) => ({
          id: c.id,
          list_id: c.list_id,
          position: c.position,
        })),
      );
    }
  };

  return onDragEnd;
}
