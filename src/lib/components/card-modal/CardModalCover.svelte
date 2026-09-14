<script lang="ts">
  import { Trash2 } from 'lucide-svelte';

  interface Props {
    coverUrl?: string | null;
    isUploading?: boolean;
    onRemove?: () => void;
  }

  let {
    coverUrl = null,
    isUploading = false,
    onRemove,
  }: Props = $props();
</script>

{#if coverUrl}
  <div
    class="group relative w-full shrink-0 overflow-hidden"
    style="height: 200px; border-radius: 6px 6px 0 0;"
  >
    <img src={coverUrl} class="h-full w-full object-cover" alt="Cover" />
    <div
      class="absolute inset-0"
      style="background: linear-gradient(to bottom, transparent 50%, var(--app-bg, #151515) 100%);"
    ></div>

    {#if isUploading}
      <div class="absolute inset-0 flex items-center justify-center bg-black/50">
        <span class="animate-pulse text-sm font-semibold text-white">Enviando…</span>
      </div>
    {/if}

    <button
      type="button"
      onclick={onRemove}
      class="absolute top-3 right-3 flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition-all group-hover:opacity-100"
      style="
        background: rgba(239, 68, 68, 0.75);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(239, 68, 68, 0.3);
      "
    >
      <Trash2 class="h-3 w-3" /> Remover
    </button>
  </div>
{/if}
