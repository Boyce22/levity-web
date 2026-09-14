<script lang="ts">
  import { Search } from 'lucide-svelte';

  interface Props {
    searchQuery?: string;
    onchange?: (query: string) => void;
  }

  let { searchQuery = $bindable(''), onchange }: Props = $props();

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    searchQuery = target.value;
    onchange?.(searchQuery);
  }
</script>

<div class="search-filter group relative">
  <Search
    class="search-icon absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 transition-colors"
    style="color: {searchQuery ? 'var(--app-primary)' : 'var(--app-text-muted)'};"
  />
  <input
    value={searchQuery}
    oninput={handleInput}
    type="text"
    placeholder="Buscar tarefas..."
    class="search-input w-36 rounded-sm py-2 pr-4 pl-9 text-[13px] transition-all focus:outline-none sm:w-56"
    style="background: var(--app-bg); border: 1px solid {searchQuery ? 'var(--app-primary)' : 'var(--app-border)'}; color: var(--app-text);"
  />
</div>

<style>
  .search-input:focus {
    border-color: var(--app-primary) !important;
    box-shadow: 0 0 0 1px var(--app-primary);
  }
</style>
