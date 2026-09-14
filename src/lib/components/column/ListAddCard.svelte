<script lang="ts">
  import { Plus } from 'lucide-svelte';

  interface Props {
    accentColor?: string;
    onadd?: (content: string) => void;
  }

  let {
    accentColor = 'var(--app-primary, #818cf8)',
    onadd,
  }: Props = $props();

  let isAdding = $state(false);
  let content = $state('');

  function handleSubmit() {
    const trimmed = content.trim();
    if (!trimmed) {
      isAdding = false;
      return;
    }
    onadd?.(trimmed);
    content = '';
    isAdding = false;
  }

  function handleCancel() {
    content = '';
    isAdding = false;
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  }
</script>

<div class="px-3 pb-2">
  {#if isAdding}
    <div class="mt-1 rounded-lg px-2 py-1">
      <textarea
        bind:value={content}
        onkeydown={handleKeyDown}
        placeholder="Descreva a tarefa..."
        rows={2}
        class="w-full resize-none bg-transparent text-[13px] placeholder:opacity-50 focus:outline-none"
        style="color: var(--app-text);"
      ></textarea>

      <div class="flex items-center gap-2 pt-1">
        <button
          type="button"
          onclick={handleSubmit}
          class="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors"
          style="background: {accentColor}20; color: {accentColor};"
        >
          Add
        </button>

        <button
          type="button"
          onclick={handleCancel}
          class="px-2 py-1 text-[12px] opacity-60 transition-opacity hover:opacity-100"
          style="color: var(--app-text-muted);"
        >
          Cancel
        </button>
      </div>
    </div>
  {:else}
    <button
      type="button"
      onclick={() => (isAdding = true)}
      class="group flex w-full items-center gap-2 py-2 text-[13px] transition-colors"
      style="color: var(--app-text-muted);"
    >
      <Plus class="h-4 w-4 opacity-70 transition-opacity group-hover:opacity-100" />
      <span class="transition-transform group-hover:translate-x-0.5">
        Adicionar tarefa
      </span>
    </button>
  {/if}
</div>
