<script lang="ts">
  import { onMount } from 'svelte';
  import { Tag, Check, Plus, Loader2 } from 'lucide-svelte';
  import type { TagModel } from '$lib/contracts/models';

  interface Props {
    selectedTagId?: string | null;
    tags?: TagModel[];
    workspaceId: string;
    onselect?: (tagId: string | null) => void;
  }

  let {
    selectedTagId = null,
    tags = [],
    workspaceId,
    onselect,
  }: Props = $props();

  let isOpen = $state(false);
  let containerEl = $state<HTMLDivElement | null>(null);
  let newTagName = $state('');
  let isCreating = $state(false);

  const selectedTag = $derived(tags.find((t) => t.id === selectedTagId));

  const COLORS = ['#818cf8', '#f87171', '#94a3b8', '#c084fc', '#2dd4bf', '#fbbf24', '#34d399'];

  async function handleCreate() {
    const trimmed = newTagName.trim();
    if (!trimmed) return;
    isCreating = true;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, color }),
      });
      if (res.ok) {
        const created = await res.json();
        tags.push(created);
        onselect?.(created.id);
        newTagName = '';
      }
    } catch {
      // Ignorar erro
    } finally {
      isCreating = false;
    }
  }

  onMount(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerEl && !containerEl.contains(event.target as Node)) {
        isOpen = false;
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  });
</script>

<div bind:this={containerEl} class="relative">
  <button
    type="button"
    onclick={() => (isOpen = !isOpen)}
    aria-label="Etiqueta"
    class="flex h-9 w-9 items-center justify-center rounded-sm transition-all"
    style="
      background: {isOpen ? 'var(--app-border, rgba(255, 255, 255, 0.1))' : 'var(--app-hover, rgba(255, 255, 255, 0.05))'};
      border: 1px solid var(--app-border, rgba(255, 255, 255, 0.1));
      color: {selectedTag?.color || 'var(--app-text-muted)'};
    "
    title="Etiqueta"
  >
    <Tag class="h-4 w-4" />
  </button>

  {#if isOpen}
    <div
      class="absolute top-11 right-0 z-50 w-56 p-1.5 shadow-2xl"
      style="
        border-radius: 6px;
        background: var(--app-panel, #212124);
        border: 1px solid var(--app-border, rgba(255, 255, 255, 0.1));
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
      "
    >
      <div class="mb-1.5 px-2 py-1 text-[10px] font-bold tracking-wider text-[var(--app-text-muted)] uppercase">
        Label
      </div>

      <div class="max-h-48 space-y-0.5 overflow-y-auto">
        <button
          type="button"
          onclick={() => {
            onselect?.(null);
            isOpen = false;
          }}
          class="flex w-full items-center justify-between rounded-sm px-2.5 py-1.5 text-left text-[12px] font-medium text-white/50 transition-colors hover:bg-white/5"
        >
          <span>No label</span>
          {#if !selectedTagId}
            <Check class="h-3.5 w-3.5 text-indigo-400" />
          {/if}
        </button>

        {#each tags as tag (tag.id)}
          {@const isSelected = tag.id === selectedTagId}
          <button
            type="button"
            onclick={() => {
              onselect?.(tag.id);
              isOpen = false;
            }}
            class="flex w-full items-center justify-between rounded-sm px-2.5 py-1.5 text-left text-[12px] font-medium transition-colors hover:bg-white/5"
            style="color: {tag.color || 'var(--app-text)'};"
          >
            <div class="flex items-center gap-2">
              <span class="h-2 w-2 rounded-full" style="background: {tag.color};"></span>
              <span>{tag.name}</span>
            </div>
            {#if isSelected}
              <Check class="h-3.5 w-3.5 text-indigo-400" />
            {/if}
          </button>
        {/each}
      </div>

      <div class="mt-2 border-t border-white/5 pt-2">
        <div class="flex items-center gap-1.5">
          <input
            type="text"
            placeholder="New label..."
            bind:value={newTagName}
            onkeydown={(e) => {
              if (e.key === 'Enter') handleCreate();
            }}
            class="w-full rounded-sm border border-[var(--app-border)] bg-[var(--app-bg)] px-2 py-1 text-[11px] text-[var(--app-text)] focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="button"
            onclick={handleCreate}
            disabled={isCreating}
            aria-label="Add label"
            class="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {#if isCreating}
              <Loader2 class="h-3 w-3 animate-spin" />
            {:else}
              <Plus class="h-3 w-3" />
            {/if}
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
