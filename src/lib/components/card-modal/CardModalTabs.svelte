<script lang="ts">
  import { AlignLeft, MessageSquare, Paintbrush } from 'lucide-svelte';

  export type ModalTab = 'description' | 'comments' | 'diagram';

  interface Props {
    activeTab?: ModalTab;
    commentsCount?: number;
    ontabchange?: (tab: ModalTab) => void;
  }

  let {
    activeTab = 'description',
    commentsCount = 0,
    ontabchange,
  }: Props = $props();

  const tabs = $derived<Array<{ id: ModalTab; label: string; icon: typeof AlignLeft; badge?: number }>>([
    { id: 'description', label: 'Description', icon: AlignLeft },
    { id: 'comments', label: 'Comments', icon: MessageSquare, badge: commentsCount },
    { id: 'diagram', label: 'Diagram', icon: Paintbrush },
  ]);
</script>

<div class="border-app-border-faint relative flex w-full items-center gap-6 border-b">
  {#each tabs as tab (tab.id)}
    {@const isActive = activeTab === tab.id}
    <button
      type="button"
      onclick={() => ontabchange?.(tab.id)}
      class="relative flex items-center gap-2 px-1 py-3 text-[13px] font-bold transition-all {isActive ? 'text-app-text' : 'text-app-text-muted hover:text-app-text'}"
    >
      <tab.icon size={14} strokeWidth={isActive ? 2.5 : 2} />
      <span class="tracking-tight">{tab.label}</span>

      {#if tab.id === 'comments' && commentsCount > 0}
        <span class="bg-app-panel/50 border-app-border-faint rounded-full border px-1.5 py-0.5 text-[10px] font-black opacity-60">
          {commentsCount}
        </span>
      {/if}

      {#if isActive}
        <div class="bg-app-primary absolute right-0 bottom-0 left-0 z-10 h-0.5"></div>
      {/if}
    </button>
  {/each}
</div>
