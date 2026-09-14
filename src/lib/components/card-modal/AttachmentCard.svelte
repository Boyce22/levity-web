<script lang="ts">
  import { ImageIcon, Download, X, Loader2 } from 'lucide-svelte';

  interface Props {
    url: string;
    publicId?: string;
    name?: string;
    isDeleting?: boolean;
    ondelete?: () => void;
  }

  let {
    url,
    publicId,
    name = '',
    isDeleting = false,
    ondelete,
  }: Props = $props();

  const fileName = $derived(name || url.split('/').pop()?.split('?')[0] || 'Imagem');
</script>

<div
  class="group flex items-center gap-3 rounded-sm border bg-[var(--app-bg)]/40 p-2 transition-all hover:bg-[var(--app-bg)]/60"
  style="border-color: var(--app-border-faint, rgba(255, 255, 255, 0.05));"
>
  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-white/5 bg-[var(--app-panel)] shadow-inner">
    <ImageIcon class="h-4 w-4 text-indigo-400" />
  </div>

  <div class="min-w-0 flex-1">
    <p class="truncate text-[11px] font-bold tracking-tight text-[var(--app-text)] uppercase opacity-80">
      {fileName}
    </p>
    <p class="text-[9px] font-medium tracking-widest text-[var(--app-text-muted)] uppercase opacity-50">
      Imagem
    </p>
  </div>

  <div class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      class="rounded-sm p-1.5 text-[var(--app-text-muted)] transition-all hover:bg-[var(--app-hover)] hover:text-indigo-400"
      title="Download"
    >
      <Download class="h-3.5 w-3.5" />
    </a>

    {#if ondelete && publicId}
      <button
        type="button"
        onclick={(e) => {
          e.preventDefault();
          ondelete?.();
        }}
        disabled={isDeleting}
        aria-label="Remover anexo"
        class="rounded-sm p-1.5 text-[var(--app-text-muted)] transition-all hover:bg-red-500/10 hover:text-red-400"
        title="Remover"
      >
        {#if isDeleting}
          <Loader2 class="h-3.5 w-3.5 animate-spin" />
        {:else}
          <X class="h-3.5 w-3.5" />
        {/if}
      </button>
    {/if}
  </div>
</div>
