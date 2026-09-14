<script lang="ts">
  interface Props {
    label: string | { name: string; color?: string };
  }

  let { label }: Props = $props();

  const LABEL_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
    feature: {
      bg: 'rgba(99, 102, 241, 0.15)',
      text: 'var(--app-primary, #818cf8)',
      dot: '#818cf8',
    },
    bug: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', dot: '#ef4444' },
    infra: {
      bg: 'rgba(255, 255, 255, 0.08)',
      text: 'var(--app-text-muted)',
      dot: '#888',
    },
    design: { bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', dot: '#a855f7' },
    research: { bg: 'rgba(20, 184, 166, 0.15)', text: '#2dd4bf', dot: '#14b8a6' },
  };

  const config = $derived.by(() => {
    if (typeof label === 'object') {
      const color = label.color || '#818cf8';
      return {
        name: label.name,
        bg: `${color}18`,
        text: color,
        dot: color,
      };
    }
    const key = label.toLowerCase();
    const style = LABEL_STYLES[key];
    return {
      name: label,
      bg: style?.bg || 'rgba(255, 255, 255, 0.05)',
      text: style?.text || 'var(--app-text-muted)',
      dot: style?.dot || '#9ca3af',
    };
  });
</script>

<span
  class="flex items-center gap-1.5 rounded-md border border-white/5 px-2 py-0.5 text-[10px] font-semibold capitalize"
  style="background: {config.bg}; color: {config.text};"
>
  <span class="h-1 w-1 shrink-0 rounded-full" style="background: {config.dot};"></span>
  {config.name}
</span>
