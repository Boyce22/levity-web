'use client';

import { X } from 'lucide-react';
import { SprintCard, Sprint } from '@/contracts/Sprint';
import { cn } from '@/ui/utils/cn';

interface SprintCardItemProps {
  sprintCard: SprintCard;
  sprint: Sprint;
  onRemove: (sprintCardId: string) => Promise<void>;
  onClick: (sprintCard: SprintCard) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  draggableProps?: React.HTMLAttributes<HTMLDivElement>;
  innerRef?: React.Ref<HTMLDivElement>;
  isDragging?: boolean;
}

export function SprintCardItem({
  sprintCard,
  sprint,
  onRemove,
  onClick,
  dragHandleProps,
  draggableProps,
  innerRef,
  isDragging,
}: SprintCardItemProps) {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(sprintCard.id);
  };

  return (
    <div
      ref={innerRef}
      {...draggableProps}
      className={cn(
        'bg-app-panel border-app-border-faint group flex cursor-pointer items-center gap-3 rounded-sm border px-4 py-3 transition-all',
        isDragging
          ? 'rotate-1 border-indigo-500/40 bg-indigo-500/5 shadow-xl'
          : 'hover:border-app-border hover:bg-app-elevated',
      )}
    >
      {/* Drag handle */}
      <div
        {...dragHandleProps}
        className="text-app-text-muted flex h-4 w-3 shrink-0 cursor-grab flex-col justify-between opacity-30 transition-opacity group-hover:opacity-60 active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <span className="block h-0.5 w-full rounded-full bg-current" />
        <span className="block h-0.5 w-full rounded-full bg-current" />
        <span className="block h-0.5 w-full rounded-full bg-current" />
      </div>

      {/* Card content */}
      <button
        type="button"
        onClick={() => onClick(sprintCard)}
        className="min-w-0 flex-1 text-left"
        aria-label={`Open card: ${sprintCard.card.content}`}
      >
        <p className="text-app-text truncate text-sm">{sprintCard.card.content}</p>
      </button>

      {/* Tracking metric */}
      {sprint.trackingMode === 'points' && sprintCard.card.storyPoints != null && (
        <span className="text-app-text-muted shrink-0 rounded-sm bg-indigo-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-indigo-400">
          {sprintCard.card.storyPoints}pts
        </span>
      )}
      {sprint.trackingMode === 'hours' && sprintCard.card.estimatedHours != null && (
        <span className="text-app-text-muted shrink-0 rounded-sm bg-slate-500/10 px-1.5 py-0.5 text-[11px] font-semibold">
          {sprintCard.card.estimatedHours}h
        </span>
      )}

      {/* Remove button */}
      <button
        type="button"
        onClick={handleRemove}
        aria-label="Remove card from sprint"
        className="text-app-text-muted ml-1 shrink-0 rounded-sm p-1 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
      >
        <X size={13} />
      </button>
    </div>
  );
}

SprintCardItem.displayName = 'SprintCardItem';
