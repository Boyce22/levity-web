<script lang="ts">
  import { Calendar, X } from 'lucide-svelte';

  interface Props {
    dueDate?: string | null;
    onselect?: (date: string | null) => void;
  }

  let { dueDate = null, onselect }: Props = $props();

  let inputEl = $state<HTMLInputElement | null>(null);

  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const val = target.value;
    if (val) {
      onselect?.(new Date(val).toISOString());
    }
  }

  function handleOpenPicker() {
    if (inputEl) {
      if ('showPicker' in inputEl && typeof inputEl.showPicker === 'function') {
        inputEl.showPicker();
      } else {
        inputEl.click();
      }
    }
  }

  function handleClear(e: MouseEvent) {
    e.stopPropagation();
    onselect?.(null);
  }

  const dateValue = $derived(
    dueDate ? new Date(dueDate).toISOString().split('T')[0] : ''
  );
</script>

<div class="relative">
  <input
    bind:this={inputEl}
    type="date"
    class="pointer-events-none absolute inset-0 opacity-0"
    value={dateValue}
    onchange={handleChange}
  />
  <button
    type="button"
    onclick={handleOpenPicker}
    aria-label="Prazo"
    class="flex h-9 w-9 items-center justify-center rounded-sm transition-all"
    style="
      background: var(--app-hover, rgba(255, 255, 255, 0.05));
      border: 1px solid var(--app-border, rgba(255, 255, 255, 0.1));
      color: {dueDate ? 'var(--app-primary, #818cf8)' : 'var(--app-text-muted)'};
    "
    title="Prazo"
  >
    <Calendar class="h-4 w-4" />
  </button>

  {#if dueDate}
    <button
      type="button"
      onclick={handleClear}
      aria-label="Clear due date"
      class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500/80 text-white hover:bg-red-600"
      title="Remover prazo"
    >
      <X class="h-2.5 w-2.5" />
    </button>
  {/if}
</div>
