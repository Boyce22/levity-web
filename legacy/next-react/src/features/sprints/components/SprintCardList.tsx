'use client';

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { SprintCard, Sprint } from '@/contracts/Sprint';
import { SprintCardItem } from './SprintCardItem';

interface SprintCardListProps {
  sprintCards: SprintCard[];
  sprint: Sprint;
  onCardClick: (sprintCard: SprintCard) => void;
  onRemoveCard: (sprintCardId: string) => Promise<void>;
  onReorder: (reordered: SprintCard[]) => Promise<void>;
}

export function SprintCardList({
  sprintCards,
  sprint,
  onCardClick,
  onRemoveCard,
  onReorder,
}: SprintCardListProps) {
  const sorted = [...sprintCards].sort((a, b) => a.position - b.position);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) return;
    if (destination.index === source.index) return;

    const reordered = Array.from(sorted);
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);
    onReorder(reordered);
  };

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-app-text-muted text-sm opacity-60">
          No cards in this sprint yet.
        </p>
        <p className="text-app-text-muted mt-1 text-xs opacity-40">
          Click &ldquo;Add Card&rdquo; to get started.
        </p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="sprint-cards" type="sprint-card">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex flex-col gap-2"
          >
            {sorted.map((sc, index) => (
              <Draggable key={sc.id} draggableId={sc.id} index={index}>
                {(draggable, snapshot) => (
                  <SprintCardItem
                    sprintCard={sc}
                    sprint={sprint}
                    onRemove={onRemoveCard}
                    onClick={onCardClick}
                    innerRef={draggable.innerRef}
                    draggableProps={draggable.draggableProps}
                    dragHandleProps={draggable.dragHandleProps ?? undefined}
                    isDragging={snapshot.isDragging}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

SprintCardList.displayName = 'SprintCardList';
