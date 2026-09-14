<script lang="ts">
  import { Trash2 } from 'lucide-svelte';
  import CardCover from './CardCover.svelte';
  import CardPriority from './CardPriority.svelte';
  import CardLabel from './CardLabel.svelte';
  import CardProgress from './CardProgress.svelte';
  import CardFooter from './CardFooter.svelte';
  import ConfirmationModal from '$lib/ui/ConfirmationModal.svelte';
  import { fade } from 'svelte/transition';
  import type { IssueModel, PriorityModel, TagModel, UserModel } from '$lib/contracts/models';

  interface Props {
    card: IssueModel;
    priority?: PriorityModel;
    tag?: TagModel;
    assignedUser?: UserModel | null;
    isDragging?: boolean;
    isNew?: boolean;
    canWrite?: boolean;
    ondelete?: (cardId: string) => void;
    onclick?: (card: IssueModel) => void;
    ondragstart?: (e: DragEvent) => void;
    ondragend?: (e: DragEvent) => void;
  }

  let {
    card,
    priority,
    tag,
    assignedUser = null,
    isDragging = false,
    isNew = false,
    canWrite = true,
    ondelete,
    onclick,
    ondragstart,
    ondragend,
  }: Props = $props();

  let isDeleteConfirmOpen = $state(false);

  function handleClick() {
    onclick?.(card);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }
</script>

<div
  role="button"
  tabindex="0"
  draggable={canWrite}
  onclick={handleClick}
  onkeydown={handleKeyDown}
  {ondragstart}
  {ondragend}
  class="group relative flex cursor-grab flex-col overflow-hidden text-left transition-all active:cursor-grabbing select-none"
  class:card-new={isNew}
  in:fade={{ duration: 180 }}
  style="
    background: var(--app-elevated, #1a1a1c);
    border: {isDragging ? '1px solid var(--app-primary, #818cf8)' : '1px solid var(--app-border-faint, rgba(255, 255, 255, 0.05))'};
    border-radius: var(--radius-card, 14px);
    box-shadow: {isDragging ? '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px var(--app-primary)' : '0 1px 3px rgba(0,0,0,0.2)'};
    transform: {isDragging ? 'scale(1.03) rotate(1deg)' : 'none'};
    opacity: {isDragging ? 0.85 : 1};
  "
>
  {#if card.coverUrl}
    <CardCover coverUrl={card.coverUrl} />
  {/if}

  <div class="p-3.5">
    {#if priority || tag}
      <div class="mb-2.5 flex flex-wrap items-center gap-2">
        {#if priority}
          <CardPriority {priority} />
        {/if}
        {#if tag}
          <CardLabel label={tag} />
        {/if}
      </div>
    {/if}

    <div class="flex items-start justify-between gap-2">
      <p
        class="min-w-0 flex-1 text-[13px] leading-[1.45] font-medium break-all"
        style="color: var(--app-text); opacity: 0.85;"
      >
        {card.content}
      </p>

      {#if canWrite}
        <button
          type="button"
          aria-label="Delete card"
          onclick={(e) => {
            e.stopPropagation();
            isDeleteConfirmOpen = true;
          }}
          class="-mt-0.5 -mr-0.5 shrink-0 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100"
          style="color: var(--app-text-muted);"
          onmouseenter={(e) => (e.currentTarget.style.color = 'var(--color-danger, #f87171)')}
          onmouseleave={(e) => (e.currentTarget.style.color = 'var(--app-text-muted)')}
        >
          <Trash2 class="h-3.5 w-3.5" />
        </button>
      {/if}
    </div>

    {#if card.progress != null}
      <CardProgress progress={card.progress} />
    {/if}

    <CardFooter
      description={card.description}
      dueDate={card.dueDate}
      commentCount={card.commentCount}
      {assignedUser}
    />
  </div>
</div>

<style>
  .group:hover:not(.card-new) { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(0, 0, 0, .2); }
  .card-new { animation: card-created 1.8s var(--ease-out); }
  @keyframes card-created { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--app-primary) 65%, transparent); } 35% { box-shadow: 0 0 0 5px color-mix(in srgb, var(--app-primary) 18%, transparent); } 100% { box-shadow: var(--shadow-card); } }
</style>

<ConfirmationModal
  isOpen={isDeleteConfirmOpen}
  onClose={() => (isDeleteConfirmOpen = false)}
  onConfirm={() => {
    isDeleteConfirmOpen = false;
    ondelete?.(card.id);
  }}
  title="Delete Card"
  description="Are you sure you want to delete this card? This action is permanent and cannot be undone."
  confirmText="Delete Card"
  variant="danger"
/>
