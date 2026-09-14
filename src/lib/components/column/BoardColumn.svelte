<script lang="ts">
  import ListHeader from './ListHeader.svelte';
  import ListAddCard from './ListAddCard.svelte';
  import BoardCard from '../card/BoardCard.svelte';
  import type { ColumnModel, IssueModel, PriorityModel, TagModel, UserModel, ColumnType } from '$lib/contracts/models';

  interface Props {
    column: ColumnModel;
    priorities?: PriorityModel[];
    tags?: TagModel[];
    allUsers?: UserModel[];
    canWrite?: boolean;
    recentlyCreatedIssueId?: string | null;
    isDraggingOver?: boolean;
    draggedIssueId?: string | null;
    oncardclick?: (card: IssueModel) => void;
    oncarddelete?: (cardId: string) => void;
    onaddcard?: (columnId: string, content: string) => void;
    ondeletecolumn?: (columnId: string) => void;
    onrenamecolumn?: (columnId: string, newTitle: string) => void;
    ontypechange?: (columnId: string, type: ColumnType) => void;
    onwiplimitchange?: (columnId: string, wip: number | null) => void;
    ondragover?: (e: DragEvent, columnId: string) => void;
    ondragleave?: (e: DragEvent, columnId: string) => void;
    ondrop?: (e: DragEvent, columnId: string) => void;
    oncarddragstart?: (e: DragEvent, card: IssueModel) => void;
    oncarddragend?: (e: DragEvent) => void;
  }

  let {
    column,
    priorities = [],
    tags = [],
    allUsers = [],
    canWrite = true,
    recentlyCreatedIssueId = null,
    isDraggingOver = false,
    draggedIssueId = null,
    oncardclick,
    oncarddelete,
    onaddcard,
    ondeletecolumn,
    onrenamecolumn,
    ontypechange,
    onwiplimitchange,
    ondragover,
    ondragleave,
    ondrop,
    oncarddragstart,
    oncarddragend,
  }: Props = $props();

  const TYPE_ACCENTS: Record<string, string> = {
    TODO: 'var(--column-todo, #6b7280)',
    IN_PROGRESS: 'var(--column-in-progress, #818cf8)',
    REVIEW: 'var(--column-review, #f59e0b)',
    DONE: 'var(--column-done, #34d399)',
  };

  const accent = $derived(TYPE_ACCENTS[column.columnType || 'TODO'] || 'var(--app-primary, #818cf8)');
  const isWipExceeded = $derived(column.wipLimit != null && column.issues.length >= column.wipLimit);

  function getPriority(id?: string | null) {
    return priorities.find((p) => p.id === id);
  }

  function getTag(id?: string | null) {
    return tags.find((t) => t.id === id);
  }

  function getUser(id?: string | null) {
    return allUsers.find((u) => u.id === id);
  }
</script>

<div
  role="region"
  aria-label={column.title}
  class="board-column flex flex-col shrink-0 transition-colors duration-150"
  style="
    min-width: 280px;
    max-width: 280px;
    background: var(--app-panel, #212124);
    border: {isWipExceeded ? '1px solid rgba(248, 113, 113, 0.4)' : isDraggingOver ? `1px solid ${accent}80` : '1px solid var(--app-border-faint, rgba(255, 255, 255, 0.05))'};
    border-radius: 0 0 var(--radius-panel, 12px) var(--radius-panel, 12px);
    box-shadow: {isDraggingOver ? `0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px ${accent}40` : '0 2px 8px rgba(0,0,0,0.15)'};
  "
  ondragover={(e) => {
    e.preventDefault();
    ondragover?.(e, column.id);
  }}
  ondragleave={(e) => ondragleave?.(e, column.id)}
  ondrop={(e) => {
    e.preventDefault();
    ondrop?.(e, column.id);
  }}
>
  <!-- Top accent bar -->
  <div
    style="
      height: 3px;
      background: {isWipExceeded ? 'var(--color-danger, #f87171)' : accent};
      opacity: {isWipExceeded ? 1 : 0.8};
      transition: background 0.3s;
    "
  ></div>

  <!-- Header -->
  <ListHeader
    title={column.title}
    cardCount={column.issues.length}
    wipLimit={column.wipLimit}
    columnType={column.columnType}
    accentColor={accent}
    canEdit={canWrite}
    onrename={(newTitle) => onrenamecolumn?.(column.id, newTitle)}
    ondelete={() => ondeletecolumn?.(column.id)}
    ontypechange={(type) => ontypechange?.(column.id, type)}
    onwiplimitchange={(wip) => onwiplimitchange?.(column.id, wip)}
  />

  <!-- WIP limit warning banner -->
  {#if isWipExceeded}
    <div class="px-4 pb-2">
      <div
        class="rounded-lg py-1.5 text-center text-[11px] font-semibold"
        style="
          background: rgba(248, 113, 113, 0.1);
          color: var(--color-danger, #f87171);
          border: 1px solid rgba(248, 113, 113, 0.2);
        "
      >
        ⚠ Limite WIP atingido — conclua antes de adicionar
      </div>
    </div>
  {/if}

  <!-- Cards Area -->
  <div
    class="custom-scrollbar flex flex-1 flex-col gap-2.5 px-3 pb-2 transition-colors duration-150"
    style="
      min-height: 10px;
      background: {isDraggingOver ? `${accent}08` : 'transparent'};
      border-radius: {isDraggingOver ? '12px' : '0'};
    "
  >
    {#each column.issues as card (card.id)}
      <BoardCard
        {card}
        priority={getPriority(card.priorityId)}
        tag={getTag(card.tagId)}
        assignedUser={getUser(card.assigneeId)}
        isDragging={draggedIssueId === card.id}
        isNew={recentlyCreatedIssueId === card.id}
        {canWrite}
        onclick={oncardclick}
        ondelete={oncarddelete}
        ondragstart={(e) => oncarddragstart?.(e, card)}
        ondragend={oncarddragend}
      />
    {/each}
  </div>

  <!-- Add Card Trigger -->
  {#if canWrite && !isWipExceeded}
    <ListAddCard
      accentColor={accent}
      onadd={(content) => onaddcard?.(column.id, content)}
    />
  {/if}
</div>
