<script lang="ts">
  interface Props {
    priority: string | { name: string; color?: string; icon?: string };
  }

  let { priority }: Props = $props();

  const PRIORITY_STYLES: Record<string, { color: string; label: string }> = {
    high: { color: 'var(--priority-high, #f87171)', label: 'High' },
    medium: { color: 'var(--priority-medium, #fbbf24)', label: 'Medium' },
    low: { color: 'var(--priority-low, #34d399)', label: 'Low' },
  };

  const style = $derived.by(() => {
    if (typeof priority === 'object') {
      return {
        color: priority.color || 'var(--priority-medium, #fbbf24)',
        label: priority.name,
      };
    }
    const key = priority.toLowerCase();
    return PRIORITY_STYLES[key] || { color: 'rgba(156, 163, 175, 0.8)', label: priority };
  });
</script>

<span
  class="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase"
  style="
    color: {style.color};
    background: {style.color.startsWith('#') ? `${style.color}18` : 'rgba(255, 255, 255, 0.05)'};
    border: 1px solid {style.color.startsWith('#') ? `${style.color}40` : 'rgba(255, 255, 255, 0.1)'};
  "
>
  <span class="h-1.5 w-1.5 rounded-full" style="background: {style.color};"></span>
  {style.label}
</span>
