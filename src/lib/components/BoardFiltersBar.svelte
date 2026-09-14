<script lang="ts">
  import { X } from 'lucide-svelte';
  import SearchFilter from './SearchFilter.svelte';
  import MemberFilters from './MemberFilters.svelte';
  import PriorityFilters from './PriorityFilters.svelte';
  import LabelFilters from './LabelFilters.svelte';
  import type { UserModel, TagModel, PriorityModel } from '$lib/contracts/models';

  interface Props {
    searchQuery?: string;
    selectedUserFilters?: string[];
    priorityFilter?: string | null;
    labelFilter?: string | null;
    allUsers?: UserModel[];
    tags?: TagModel[];
    priorities?: PriorityModel[];
    onclear?: () => void;
  }

  let {
    searchQuery = $bindable(''),
    selectedUserFilters = $bindable([]),
    priorityFilter = $bindable(null),
    labelFilter = $bindable(null),
    allUsers = [],
    tags = [],
    priorities = [],
    onclear,
  }: Props = $props();

  let hasActiveFilters = $derived(
    searchQuery.trim().length > 0 ||
    selectedUserFilters.length > 0 ||
    priorityFilter !== null ||
    labelFilter !== null
  );

  function clearAllFilters() {
    searchQuery = '';
    selectedUserFilters = [];
    priorityFilter = null;
    labelFilter = null;
    onclear?.();
  }
</script>

<div class="no-scrollbar bg-app-bg border-app-border-faint flex shrink-0 overflow-x-auto border-b px-6">
  <div class="flex w-full items-center gap-6 py-2 text-[13px] font-medium">
    <SearchFilter bind:searchQuery />

    <div class="bg-app-border-faint h-4 w-px shrink-0"></div>

    <MemberFilters bind:selectedUserFilters {allUsers} />

    <div class="bg-app-border-faint h-4 w-px shrink-0"></div>

    <PriorityFilters bind:priorityFilter {priorities} />

    <LabelFilters bind:labelFilter {tags} />

    {#if hasActiveFilters}
      <button
        type="button"
        onclick={clearAllFilters}
        class="clear-filters-btn ml-auto flex shrink-0 items-center gap-1.5 rounded-sm px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase transition-all"
        style="
          color: var(--color-danger, #f87171);
          background: rgba(248, 113, 113, 0.08);
          border: 1px solid rgba(248, 113, 113, 0.2);
        "
      >
        Limpar filtros
        <X class="h-3 w-3" />
      </button>
    {/if}
  </div>
</div>

<style>
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .clear-filters-btn:hover {
    background: rgba(248, 113, 113, 0.15) !important;
    transform: translateY(-1px);
  }
</style>
