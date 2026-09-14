<script lang="ts">
  import { onMount } from 'svelte';
  import { Flag, Check, Plus, Loader2 } from 'lucide-svelte';
  import type { PriorityModel } from '$lib/contracts/models';

  interface Props {
    selectedPriorityId?: string | null;
    priorities?: PriorityModel[];
    workspaceId: string;
    onselect?: (priorityId: string) => void;
  }

  let {
    selectedPriorityId = null,
    priorities = [],
    workspaceId,
    onselect,
  }: Props = $props();

  let isOpen = $state(false);
  let containerEl = $state<HTMLDivElement | null>(null);
  let newPrioName = $state('');
  let isCreating = $state(false);

  const selectedPriority = $derived(priorities.find((p) => p.id === selectedPriorityId));

  const COLORS = ['#f87171', '#fbbf24', '#34d399', '#818cf8', '#c084fc'];
  const ICONS = ['↑', '→', '↓', '!', '★'];

  async function handleCreate() {
    const trimmed = newPrioName.trim();
    if (!trimmed) return;
    isCreating = true;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const icon = ICONS[Math.floor(Math.random() * ICONS.length)];
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/priorities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, color, icon }),
      });
      if (res.ok) {
        const created = await res.json();
        priorities.push(created);
        onselect?.(created.id);
        newPrioName = '';
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
    aria-label="Prioridade"
    class="flex h-9 w-9 items-center justify-center rounded-sm transition-all"
    style="
      background: {isOpen ? 'var(--app-border, rgba(255, 255, 255, 0.1))' : 'var(--app-hover, rgba(255, 255, 255, 0.05))'};
      border: 1px solid var(--app-border, rgba(255, 255, 255, 0.1));
      color: {selectedPriority?.color || 'var(--app-text-muted)'};
    "
    title="Prioridade"
  >
    <Flag class="h-4 w-4" />
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
        Priority
      </div>

      <div class="max-h-48 space-y-0.5 overflow-y-auto">
        {#each priorities as prio (prio.id)}
          {@const isSelected = prio.id === selectedPriorityId}
          <button
            type="button"
            onclick={() => {
              onselect?.(prio.id);
              isOpen = false;
            }}
            class="flex w-full items-center justify-between rounded-sm px-2.5 py-1.5 text-left text-[12px] font-medium transition-colors hover:bg-white/5"
            style="color: {prio.color || 'var(--app-text)'};"
          >
            <div class="flex items-center gap-2">
              <span>{prio.icon}</span>
              <span>{prio.name}</span>
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
            placeholder="New priority..."
            bind:value={newPrioName}
            onkeydown={(e) => {
              if (e.key === 'Enter') handleCreate();
            }}
            class="w-full rounded-sm border border-[var(--app-border)] bg-[var(--app-bg)] px-2 py-1 text-[11px] text-[var(--app-text)] focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="button"
            onclick={handleCreate}
            disabled={isCreating}
            aria-label="Add priority"
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
