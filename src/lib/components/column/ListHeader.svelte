<script lang="ts">
  import { Trash2 } from 'lucide-svelte';
  import ListTypePicker from './ListTypePicker.svelte';
  import WipLimitPicker from './WipLimitPicker.svelte';
  import ConfirmationModal from '$lib/ui/ConfirmationModal.svelte';
  import type { ColumnType } from '$lib/contracts/models';

  interface Props {
    title: string;
    cardCount: number;
    wipLimit?: number | null;
    columnType?: ColumnType | null;
    accentColor?: string;
    canEdit?: boolean;
    onrename?: (newTitle: string) => void;
    ondelete?: () => void;
    ontypechange?: (type: ColumnType) => void;
    onwiplimitchange?: (wip: number | null) => void;
  }

  let {
    title,
    cardCount,
    wipLimit = null,
    columnType = 'TODO',
    accentColor = 'var(--app-primary, #818cf8)',
    canEdit = true,
    onrename,
    ondelete,
    ontypechange,
    onwiplimitchange,
  }: Props = $props();

  let isEditing = $state(false);
  let editTitle = $derived(title);
  let isDeleteModalOpen = $state(false);

  function handleSubmit() {
    isEditing = false;
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== title) {
      onrename?.(trimmed);
    } else {
      editTitle = title;
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') {
      editTitle = title;
      isEditing = false;
    }
  }
</script>

<div class="group flex items-center justify-between gap-2 px-4 pt-3.5 pb-3">
  <div class="flex min-w-0 flex-1 items-center gap-2">
    {#if isEditing}
      <input
        type="text"
        bind:value={editTitle}
        onblur={handleSubmit}
        onkeydown={handleKeyDown}
        class="w-full rounded-lg px-2 py-0.5 text-[14px] font-semibold focus:outline-none"
        style="background: var(--app-bg); color: var(--app-text); border: 1px solid {accentColor}60;"
      />
    {:else}
      <button
        type="button"
        onclick={() => {
          if (canEdit) isEditing = true;
        }}
        class="truncate text-left text-[14px] font-semibold transition-colors {canEdit ? 'cursor-text hover:text-white' : 'cursor-default'}"
        style="color: var(--app-text);"
      >
        {title}
      </button>
    {/if}
  </div>

  <div class="flex shrink-0 items-center gap-2">
    <ListTypePicker
      {columnType}
      {canEdit}
      onchange={ontypechange}
    />

    <WipLimitPicker
      {cardCount}
      {wipLimit}
      {canEdit}
      onchange={onwiplimitchange}
    />

    {#if canEdit}
      <button
        type="button"
        aria-label="Delete list"
        onclick={() => (isDeleteModalOpen = true)}
        class="rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100"
        style="color: var(--app-text-muted);"
        onmouseenter={(e) => (e.currentTarget.style.color = 'var(--color-danger, #f87171)')}
        onmouseleave={(e) => (e.currentTarget.style.color = 'var(--app-text-muted)')}
      >
        <Trash2 class="h-3.5 w-3.5" />
      </button>
    {/if}
  </div>
</div>

<ConfirmationModal
  isOpen={isDeleteModalOpen}
  onClose={() => (isDeleteModalOpen = false)}
  onConfirm={() => {
    isDeleteModalOpen = false;
    ondelete?.();
  }}
  title="Delete List"
  description="Are you sure you want to delete this list and all its cards? This cannot be undone."
  confirmText="Delete List"
  variant="danger"
/>
