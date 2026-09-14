<script lang="ts">
  import { Tag } from 'lucide-svelte';
  import type { TagModel } from '$lib/contracts/models';

  interface Props {
    tags?: TagModel[];
    labelFilter?: string | null;
    onchange?: (filter: string | null) => void;
  }

  let {
    tags = [],
    labelFilter = $bindable(null),
    onchange,
  }: Props = $props();

  function toggleLabel(name: string) {
    labelFilter = labelFilter === name ? null : name;
    onchange?.(labelFilter);
  }
</script>

<div class="label-filters flex shrink-0 items-center gap-2 py-2">
  <Tag
    class="mr-1 h-3.5 w-3.5"
    style="color: var(--app-text-muted); opacity: 0.4;"
  />
  {#each tags as l (l.id)}
    {@const isSelected = labelFilter === l.name}
    {@const color = l.color || 'var(--app-text)'}
    <button
      type="button"
      onclick={() => toggleLabel(l.name)}
      class="rounded-sm px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase transition-all"
      style="
        background: {isSelected ? `${color}15` : 'transparent'};
        color: {isSelected ? color : 'var(--app-text-muted)'};
        border: 1px solid {isSelected ? `${color}30` : 'transparent'};
        opacity: {labelFilter && !isSelected ? 0.4 : 1};
      "
    >
      {l.name}
    </button>
  {/each}
</div>
