<script lang="ts">
  import { AlertTriangle, Infinity as InfinityIcon } from 'lucide-svelte';

  interface Props {
    cardCount: number;
    wipLimit?: number | null;
    canEdit?: boolean;
    onchange?: (val: number | null) => void;
  }

  let {
    cardCount,
    wipLimit = null,
    canEdit = true,
    onchange,
  }: Props = $props();

  let isEditing = $state(false);
  let newWip = $derived(wipLimit?.toString() || '');

  const isWipExceeded = $derived(wipLimit != null && cardCount >= wipLimit);

  function handleSubmit() {
    isEditing = false;
    const trimmed = newWip.trim();
    const val = trimmed === '' ? null : parseInt(trimmed, 10);
    if (val === null || !isNaN(val)) {
      onchange?.(val);
    } else {
      newWip = wipLimit?.toString() || '';
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') isEditing = false;
  }
</script>

<div class="relative">
  <button
    type="button"
    onclick={() => {
      if (canEdit) isEditing = !isEditing;
    }}
    class="flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-bold transition-all {canEdit ? 'cursor-pointer hover:bg-white/10' : 'cursor-default'}"
    style="
      background: {isWipExceeded ? 'rgba(248,113,113,0.15)' : 'var(--app-hover)'};
      color: {isWipExceeded ? 'var(--color-danger, #f87171)' : 'var(--app-text-muted)'};
      border: {isWipExceeded ? '1px solid rgba(248,113,113,0.3)' : '1px solid var(--app-border)'};
    "
  >
    {#if isWipExceeded}
      <AlertTriangle class="h-3 w-3" />
    {/if}
    <span>{cardCount}</span>
    <div class="flex items-center text-[11px] opacity-50">
      <span>/</span>
      {#if wipLimit != null}
        <span>{wipLimit}</span>
      {:else}
        <InfinityIcon class="h-3.5 w-3.5" />
      {/if}
    </div>
  </button>

  {#if isEditing}
    <div
      class="absolute top-full right-0 z-50 mt-2 w-48 rounded-xl p-3 shadow-2xl"
      style="
        background: var(--app-elevated, #1a1a1c);
        border: 1px solid var(--app-border, rgba(255, 255, 255, 0.1));
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      "
    >
      <div class="mb-2 text-[10px] font-bold tracking-wider text-[var(--app-text-muted)] uppercase">
        Set Column Limit (WIP)
      </div>
      <input
        type="text"
        bind:value={newWip}
        onkeydown={handleKeyDown}
        placeholder="No limit"
        class="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-panel)] px-2 py-1.5 text-[12px] transition-all focus:border-[var(--app-primary)] focus:outline-none"
      />
      <p class="mt-2 text-[9px] text-[var(--app-text-muted)] italic">
        Leave empty to remove limit.
      </p>
    </div>
  {/if}
</div>
