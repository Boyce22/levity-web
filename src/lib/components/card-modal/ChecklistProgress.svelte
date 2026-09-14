<script lang="ts">
  interface Props {
    done: number;
    total: number;
  }

  let { done, total }: Props = $props();

  const percentage = $derived(total > 0 ? Math.round((done / total) * 100) : 0);
  const color = $derived(
    done === total
      ? 'var(--color-success, #34d399)'
      : done / total >= 0.4
        ? 'var(--app-primary, #818cf8)'
        : 'var(--color-warning, #fbbf24)'
  );
</script>

{#if total > 0}
  <div class="py-2">
    <div class="flex items-center gap-3">
      <div
        class="h-1.5 flex-1 overflow-hidden rounded-sm"
        style="background: var(--app-border, rgba(255, 255, 255, 0.1));"
      >
        <div
          class="h-full rounded-sm transition-all duration-500"
          style="width: {percentage}%; background: {color};"
        ></div>
      </div>
      <span class="shrink-0 text-[11px] font-semibold" style="color: var(--app-text-muted);">
        {done}/{total} tasks
      </span>
    </div>
  </div>
{/if}
