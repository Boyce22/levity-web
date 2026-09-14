<script lang="ts">
  import { Clock, AlertCircle } from 'lucide-svelte';

  interface Props {
    dueDate: string;
  }

  let { dueDate }: Props = $props();

  const info = $derived.by(() => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue = diffDays < 0;
    const isDueSoon = diffDays >= 0 && diffDays <= 2;

    const color = isOverdue
      ? 'var(--color-danger, #f87171)'
      : isDueSoon
        ? 'var(--color-warning, #fbbf24)'
        : 'var(--app-text-muted)';

    const background = isOverdue
      ? 'rgba(239, 68, 68, 0.12)'
      : isDueSoon
        ? 'rgba(251, 191, 36, 0.12)'
        : 'rgba(255, 255, 255, 0.05)';

    const label = isOverdue
      ? `${Math.abs(diffDays)}d atrasado`
      : diffDays === 0
        ? 'Hoje'
        : diffDays === 1
          ? 'Amanhã'
          : due.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

    return { isOverdue, color, background, label };
  });
</script>

<span
  class="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold"
  style="color: {info.color}; background: {info.background};"
>
  {#if info.isOverdue}
    <AlertCircle class="h-3 w-3" />
  {:else}
    <Clock class="h-3 w-3" />
  {/if}
  {info.label}
</span>
