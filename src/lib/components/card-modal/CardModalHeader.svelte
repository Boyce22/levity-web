<script lang="ts">
  import { Calendar } from 'lucide-svelte';
  import Breadcrumbs from './Breadcrumbs.svelte';
  import StatusBadges from './StatusBadges.svelte';
  import HeaderActions from './HeaderActions.svelte';
  import type { PriorityModel, TagModel, UserModel } from '$lib/contracts/models';

  interface Props {
    content: string;
    dueDate?: string | null;
    selectedTagId?: string | null;
    selectedPriorityId?: string | null;
    assigneeId?: string | null;
    assignedUser?: UserModel | null;
    workspaceName: string;
    listName: string;
    allUsers?: UserModel[];
    tags?: TagModel[];
    priorities?: PriorityModel[];
    workspaceId: string;
    onupdatecontent?: (newContent: string) => void;
    onselectduedate?: (date: string | null) => void;
    onselectpriority?: (priorityId: string) => void;
    onselecttag?: (tagId: string | null) => void;
    onselectassignee?: (userId: string | null) => void;
    onuploadcover?: (url: string) => void;
  }

  let {
    content,
    dueDate = null,
    selectedTagId = null,
    selectedPriorityId = null,
    assigneeId = null,
    assignedUser = null,
    workspaceName,
    listName,
    allUsers = [],
    tags = [],
    priorities = [],
    workspaceId,
    onupdatecontent,
    onselectduedate,
    onselectpriority,
    onselecttag,
    onselectassignee,
    onuploadcover,
  }: Props = $props();

  let isEditingTitle = $state(false);
  let editContent = $derived(content);
  let textareaEl = $state<HTMLTextAreaElement | null>(null);

  $effect(() => {
    if (isEditingTitle && textareaEl) {
      textareaEl.style.height = '0px';
      textareaEl.style.height = `${textareaEl.scrollHeight}px`;
      textareaEl.focus();
      textareaEl.select();
    }
  });

  function handleTitleBlur() {
    isEditingTitle = false;
    const trimmed = editContent.trim();
    if (trimmed && trimmed !== content) {
      onupdatecontent?.(trimmed);
    } else {
      editContent = content;
    }
  }

  function handleTitleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTitleBlur();
    }
    if (e.key === 'Escape') {
      editContent = content;
      isEditingTitle = false;
    }
  }

  const currentTag = $derived(tags.find((t) => t.id === selectedTagId));
  const currentPriority = $derived(priorities.find((p) => p.id === selectedPriorityId));
</script>

<div
  class="shrink-0 px-6 pt-5 pb-4"
  style="border-bottom: 1px solid var(--app-border-faint, rgba(255, 255, 255, 0.05));"
>
  <div class="flex items-start gap-4">
    <div class="text-app-text min-w-0 flex-1">
      <Breadcrumbs {workspaceName} {listName} />

      <StatusBadges currentLabel={currentTag} {currentPriority} />

      {#if isEditingTitle}
        <textarea
          bind:this={textareaEl}
          bind:value={editContent}
          onblur={handleTitleBlur}
          onkeydown={handleTitleKeyDown}
          rows={1}
          class="-mx-2 w-full resize-none rounded-sm border border-[var(--app-primary)] bg-[var(--app-panel)] px-2 text-[18px] leading-tight font-bold transition-all focus:outline-none"
          style="color: var(--app-text); overflow: hidden;"
        ></textarea>
      {:else}
        <button
          type="button"
          onclick={() => (isEditingTitle = true)}
          class="block w-full cursor-text text-left text-[18px] leading-tight font-bold break-words whitespace-pre-wrap transition-opacity hover:opacity-80"
          style="color: var(--app-text);"
        >
          {content || 'Title'}
        </button>
      {/if}

      <div class="mt-2 flex flex-wrap items-center gap-3">
        {#if dueDate}
          <div class="flex items-center gap-1 text-xs" style="color: var(--app-text-muted);">
            <Calendar class="h-3.5 w-3.5" />
            <span>
              {new Date(dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </span>
          </div>
        {/if}

        {#if assignedUser}
          <div class="flex items-center gap-1.5">
            <img
              src={assignedUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${assignedUser.username}`}
              alt=""
              class="h-4 w-4 rounded-xs object-cover"
            />
            <span class="text-[11px] font-medium" style="color: var(--app-text-muted); opacity: 0.7;">
              {assignedUser.displayName || assignedUser.username}
            </span>
          </div>
        {/if}
      </div>
    </div>

    <HeaderActions
      {dueDate}
      {selectedTagId}
      {selectedPriorityId}
      {assigneeId}
      {allUsers}
      {tags}
      {priorities}
      {workspaceId}
      {onselectduedate}
      {onselectpriority}
      {onselecttag}
      {onselectassignee}
      {onuploadcover}
    />
  </div>
</div>
