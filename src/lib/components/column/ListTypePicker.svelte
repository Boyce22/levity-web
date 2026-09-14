<script lang="ts">
  import { ChevronDown } from 'lucide-svelte';
  import type { ColumnType } from '$lib/contracts/models';

  interface Props {
    columnType?: ColumnType | null;
    canEdit?: boolean;
    onchange?: (type: ColumnType) => void;
  }

  let {
    columnType = 'TODO',
    canEdit = true,
    onchange,
  }: Props = $props();

  let isOpen = $state(false);

  const TYPE_CONFIG: Record<ColumnType, { label: string; color: string }> = {
    TODO: { label: 'To Do', color: 'var(--column-todo, #6b7280)' },
    IN_PROGRESS: { label: 'In Progress', color: 'var(--column-in-progress, #818cf8)' },
    REVIEW: { label: 'Review', color: 'var(--column-review, #f59e0b)' },
    DONE: { label: 'Done', color: 'var(--column-done, #34d399)' },
  };

  const currentType = $derived(columnType || 'TODO');
  const currentConfig = $derived(TYPE_CONFIG[currentType] || TYPE_CONFIG.TODO);

  const types: ColumnType[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];

  function selectType(type: ColumnType) {
    isOpen = false;
    onchange?.(type);
  }
</script>

<div class="relative">
  <button
    type="button"
    onclick={() => {
      if (canEdit) isOpen = !isOpen;
    }}
    class="flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold transition-all {canEdit ? 'hover:brightness-110 cursor-pointer' : 'cursor-default'}"
    style="
      background: {currentConfig.color}20;
      color: {currentConfig.color};
      border: 1px solid {currentConfig.color}40;
    "
  >
    {currentConfig.label}
    {#if canEdit}
      <ChevronDown class="h-3 w-3 transition-transform {isOpen ? 'rotate-180' : ''}" />
    {/if}
  </button>

  {#if isOpen}
    <div
      class="absolute top-full left-0 z-50 mt-1 w-32 rounded-xl p-1 shadow-2xl"
      style="
        background: var(--app-elevated, #1a1a1c);
        border: 1px solid var(--app-border, rgba(255, 255, 255, 0.1));
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      "
    >
      {#each types as type (type)}
        {@const config = TYPE_CONFIG[type]}
        <button
          type="button"
          onclick={() => selectType(type)}
          class="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] font-medium transition-colors hover:bg-white/5"
          style="color: {type === currentType ? config.color : 'var(--app-text-muted)'};"
        >
          <div class="h-1.5 w-1.5 rounded-full" style="background: {config.color};"></div>
          {config.label}
        </button>
      {/each}
    </div>
  {/if}
</div>
