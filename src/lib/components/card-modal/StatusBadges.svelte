<script lang="ts">
  import type { PriorityModel, TagModel } from '$lib/contracts/models';

  interface Props {
    currentLabel?: TagModel | { id: string; label: string; color: string } | null;
    currentPriority?: PriorityModel | { id: string; label: string; color: string; icon?: string } | null;
  }

  let { currentLabel = null, currentPriority = null }: Props = $props();

  const labelData = $derived.by(() => {
    if (!currentLabel) return null;
    const name = 'name' in currentLabel ? currentLabel.name : currentLabel.label;
    const color = currentLabel.color || '#818cf8';
    return { name, color };
  });

  const priorityData = $derived.by(() => {
    if (!currentPriority) return null;
    const name = 'name' in currentPriority ? currentPriority.name : currentPriority.label;
    const color = currentPriority.color || '#fbbf24';
    const icon = currentPriority.icon || '→';
    return { name, color, icon };
  });
</script>

<div class="mb-2 flex flex-wrap items-center gap-2">
  <span
    class="inline-flex items-center gap-1.5 rounded-[4px] px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase"
    style="
      background: rgba(16, 185, 129, 0.08);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.2);
    "
  >
    <span class="h-1.5 w-1.5 animate-pulse rounded-sm bg-emerald-400"></span>
    Active
  </span>

  {#if labelData}
    <span
      class="inline-flex items-center gap-1.5 rounded-[4px] px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase"
      style="
        background: {labelData.color}15;
        color: {labelData.color};
        border: 1px solid {labelData.color}25;
      "
    >
      <span class="h-1.5 w-1.5 rounded-sm" style="background: {labelData.color};"></span>
      {labelData.name}
    </span>
  {/if}

  {#if priorityData}
    <span
      class="inline-flex items-center gap-1.5 rounded-[4px] px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase"
      style="
        background: {priorityData.color}15;
        color: {priorityData.color};
        border: 1px solid {priorityData.color}25;
      "
    >
      {priorityData.icon} {priorityData.name}
    </span>
  {/if}
</div>
