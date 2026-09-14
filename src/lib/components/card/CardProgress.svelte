<script lang="ts">
  interface Props {
    progress: number;
  }

  let { progress }: Props = $props();

  const color = $derived(
    progress >= 80
      ? 'var(--color-success, #34d399)'
      : progress >= 40
        ? 'var(--app-primary, #818cf8)'
        : 'var(--color-warning, #fbbf24)'
  );
</script>

<div class="mt-3">
  <div
    class="h-1 w-full overflow-hidden rounded-full"
    style="background: var(--app-border, rgba(255, 255, 255, 0.1));"
  >
    <div
      class="h-full rounded-full transition-all duration-500"
      style="width: {progress}%; background: {color};"
    ></div>
  </div>
  <span class="mt-0.5 block text-[10px]" style="color: var(--app-text-muted);">
    Progresso: {progress}%
  </span>
</div>
