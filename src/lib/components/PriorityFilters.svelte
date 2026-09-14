<script lang="ts">
  import { Flag } from 'lucide-svelte';
  import type { PriorityModel } from '$lib/contracts/models';

  interface Props {
    priorities?: PriorityModel[];
    priorityFilter?: string | null;
    onchange?: (filter: string | null) => void;
  }

  let {
    priorities = [],
    priorityFilter = $bindable(null),
    onchange,
  }: Props = $props();

  function togglePriority(name: string) {
    priorityFilter = priorityFilter === name ? null : name;
    onchange?.(priorityFilter);
  }
</script>

<div class="priority-filters flex shrink-0 items-center gap-2 py-2">
  <Flag
    class="mr-1 h-3.5 w-3.5"
    style="color: var(--app-text-muted); opacity: 0.4;"
  />
  {#each priorities as p (p.id)}
    {@const isSelected = priorityFilter === p.name}
    {@const color = p.color || 'var(--app-text)'}
    <button
      type="button"
      onclick={() => togglePriority(p.name)}
      class="rounded-sm px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase transition-all"
      style="
        background: {isSelected ? `${color}15` : 'transparent'};
        color: {isSelected ? color : 'var(--app-text-muted)'};
        border: 1px solid {isSelected ? `${color}30` : 'transparent'};
        opacity: {priorityFilter && !isSelected ? 0.4 : 1};
      "
    >
      {#if p.icon}{p.icon}{/if} {p.name}
    </button>
  {/each}
</div>
