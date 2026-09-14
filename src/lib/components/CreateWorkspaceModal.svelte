<script lang="ts">
  import { Loader2, PlusCircle, X } from 'lucide-svelte';

  interface Props { isOpen: boolean; onclose: () => void; oncreate: (name: string) => Promise<void>; }
  let { isOpen, onclose, oncreate }: Props = $props();
  let name = $state('');
  let error = $state('');
  let isSubmitting = $state(false);

  async function submit() {
    const trimmed = name.trim();
    if (!trimmed) return error = 'O nome do workspace é obrigatório.';
    isSubmitting = true;
    error = '';
    try {
      await oncreate(trimmed);
      name = '';
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'Não foi possível criar o workspace.';
    } finally {
      isSubmitting = false;
    }
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 z-100 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="create-workspace-title">
    <button type="button" class="fixed inset-0 bg-black/60 backdrop-blur-sm" onclick={onclose} aria-label="Fechar"></button>
    <form onsubmit={(event) => { event.preventDefault(); submit(); }} class="bg-app-bg border-app-border relative flex w-full max-w-[380px] flex-col overflow-hidden rounded-sm border shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
      <div class="border-app-border-faint flex items-center justify-between border-b px-6 pt-6 pb-5">
        <h2 id="create-workspace-title" class="text-app-text flex items-center gap-3 text-base font-bold tracking-tight"><PlusCircle class="text-app-primary h-5 w-5" /> Criar workspace</h2>
        <button type="button" onclick={onclose} class="text-app-text-muted hover:text-app-text hover:bg-app-panel rounded-sm p-1.5 transition-colors" aria-label="Fechar"><X class="h-5 w-5" /></button>
      </div>
      <div class="space-y-5 px-6 pt-5 pb-6">
        <label class="block text-app-text-muted text-[11px] font-bold tracking-wider uppercase opacity-60">Nome do workspace
          <input bind:value={name} disabled={isSubmitting} maxlength="100" placeholder="Ex.: Produto" class="bg-app-panel text-app-text placeholder:text-app-text-muted mt-2 w-full rounded-sm border border-app-border-faint px-3 py-2 text-sm placeholder:opacity-50 focus:border-app-primary focus:ring-2 focus:ring-app-primary/20 focus:outline-none" />
        </label>
        {#if error}<p class="text-[12px] font-medium text-red-400">{error}</p>{/if}
        <button type="submit" disabled={isSubmitting || !name.trim()} class="flex w-full items-center justify-center gap-2 rounded-sm px-6 py-3 text-[13.5px] font-bold text-white shadow-lg transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50" style="background: linear-gradient(135deg, var(--action-emphasis-start) 0%, var(--action-emphasis-end) 100%);">
          {#if isSubmitting}<Loader2 class="h-5 w-5 animate-spin" /> Criando...{:else}Criar workspace{/if}
        </button>
      </div>
    </form>
  </div>
{/if}
