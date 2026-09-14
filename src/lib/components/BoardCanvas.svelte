<script lang="ts">
  import { Plus } from 'lucide-svelte';
  import BoardColumn from './column/BoardColumn.svelte';
  import type { ColumnModel, IssueModel, PriorityModel, TagModel, UserModel, ColumnType } from '$lib/contracts/models';
  import { canMoveIssueToColumn } from '$lib/utils/dnd';
  import { showToast } from '$lib/ui/toast';

  interface Props {
    columns: ColumnModel[];
    priorities?: PriorityModel[];
    tags?: TagModel[];
    allUsers?: UserModel[];
    canWrite?: boolean;
    recentlyCreatedIssueId?: string | null;
    oncardclick?: (card: IssueModel) => void;
    oncarddelete?: (cardId: string) => void;
    onaddcard?: (columnId: string, content: string) => void;
    onaddcolumn?: (title: string) => void;
    ondeletecolumn?: (columnId: string) => void;
    onrenamecolumn?: (columnId: string, newTitle: string) => void;
    ontypechange?: (columnId: string, type: ColumnType) => void;
    onwiplimitchange?: (columnId: string, wip: number | null) => void;
    onmoveissue?: (issueId: string, targetColumnId: string, targetIndex: number) => void;
  }

  let {
    columns = [],
    priorities = [],
    tags = [],
    allUsers = [],
    canWrite = true,
    recentlyCreatedIssueId = null,
    oncardclick,
    oncarddelete,
    onaddcard,
    onaddcolumn,
    ondeletecolumn,
    onrenamecolumn,
    ontypechange,
    onwiplimitchange,
    onmoveissue,
  }: Props = $props();

  let isAddingList = $state(false);
  let newListTitle = $state('');

  let draggedCard = $state<IssueModel | null>(null);
  let dragOverColumnId = $state<string | null>(null);

  function handleCreateList() {
    const trimmed = newListTitle.trim();
    if (!trimmed) {
      isAddingList = false;
      return;
    }
    onaddcolumn?.(trimmed);
    newListTitle = '';
    isAddingList = false;
  }

  function handleCardDragStart(e: DragEvent, card: IssueModel) {
    if (!canWrite) return;
    draggedCard = card;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', card.id);
    }
  }

  function handleCardDragEnd() {
    draggedCard = null;
    dragOverColumnId = null;
  }

  function handleColumnDragOver(e: DragEvent, columnId: string) {
    if (!draggedCard || !canWrite) return;
    dragOverColumnId = columnId;
  }

  function handleColumnDragLeave(e: DragEvent, columnId: string) {
    if (dragOverColumnId === columnId) {
      dragOverColumnId = null;
    }
  }

  function handleColumnDrop(e: DragEvent, targetColumnId: string) {
    if (!draggedCard || !canWrite) return;

    const sourceCol = columns.find((c) => c.issues.some((i) => i.id === draggedCard?.id));
    const targetCol = columns.find((c) => c.id === targetColumnId);

    if (sourceCol && targetCol) {
      const check = canMoveIssueToColumn(draggedCard, targetCol, sourceCol);
      if (!check.allowed) {
        showToast(check.reason ?? 'Não foi possível mover a tarefa para esta lista.', 'error');
        handleCardDragEnd();
        return;
      }

      const targetIndex = targetCol.issues.length;
      onmoveissue?.(draggedCard.id, targetColumnId, targetIndex);
    }

    handleCardDragEnd();
  }
</script>

<div class="board-canvas custom-scrollbar flex w-full flex-1 items-start gap-4 overflow-x-auto p-5 md:p-6">
  {#each columns as column (column.id)}
    <BoardColumn
      {column}
      {priorities}
      {tags}
      {allUsers}
      {canWrite}
      {recentlyCreatedIssueId}
      isDraggingOver={dragOverColumnId === column.id}
      draggedIssueId={draggedCard?.id ?? null}
      {oncardclick}
      {oncarddelete}
      {onaddcard}
      {ondeletecolumn}
      {onrenamecolumn}
      {ontypechange}
      {onwiplimitchange}
      ondragover={handleColumnDragOver}
      ondragleave={handleColumnDragLeave}
      ondrop={handleColumnDrop}
      oncarddragstart={handleCardDragStart}
      oncarddragend={handleCardDragEnd}
    />
  {/each}

  {#if canWrite}
    <div class="min-w-[260px] shrink-0">
      {#if isAddingList}
        <div
          class="rounded-[18px] p-3"
          style="
            background: var(--app-panel, #212124);
            border: 1px solid var(--app-border, rgba(255, 255, 255, 0.1));
          "
        >
          <input
            type="text"
              placeholder="Título da lista"
            bind:value={newListTitle}
            onkeydown={(e) => {
              if (e.key === 'Enter') handleCreateList();
              if (e.key === 'Escape') isAddingList = false;
            }}
            class="w-full rounded-xl px-3 py-2 text-[13px] focus:outline-none"
            style="
              background: var(--app-bg, #151515);
              color: var(--app-text, #ffffff);
              border: 1px solid var(--app-border, rgba(255, 255, 255, 0.1));
            "
          />
          <div class="mt-2.5 flex items-center gap-2 pl-1">
            <button
              type="button"
              onclick={handleCreateList}
              class="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
              style="
                background: var(--app-primary-muted, rgba(99, 102, 241, 0.2));
                color: var(--app-primary, #818cf8);
                border: 1px solid var(--app-primary, #818cf8);
              "
            >
              Adicionar
            </button>
            <button
              type="button"
              onclick={() => (isAddingList = false)}
              class="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
              style="color: var(--app-text-muted);"
            >
              Cancelar
            </button>
          </div>
        </div>
      {:else}
        <button
          type="button"
          onclick={() => (isAddingList = true)}
          class="create-list-btn flex w-full items-center justify-center gap-2 rounded-[18px] px-4 py-4 text-sm font-semibold transition-all"
          style="
            color: var(--app-text-muted);
            border: 1.5px dashed var(--app-border, rgba(255, 255, 255, 0.15));
            background: transparent;
          "
        >
          <Plus class="h-4 w-4" /> Criar lista
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .create-list-btn:hover {
    color: var(--app-primary, #818cf8) !important;
    border-color: var(--app-primary, #818cf8) !important;
    background: var(--app-primary-muted, rgba(99, 102, 241, 0.2)) !important;
  }
</style>
