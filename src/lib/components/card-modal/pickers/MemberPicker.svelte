<script lang="ts">
  import { onMount } from 'svelte';
  import { Users, Check } from 'lucide-svelte';
  import type { UserModel } from '$lib/contracts/models';

  interface Props {
    assigneeId?: string | null;
    allUsers?: UserModel[];
    onselect?: (userId: string | null) => void;
  }

  let {
    assigneeId = null,
    allUsers = [],
    onselect,
  }: Props = $props();

  let isOpen = $state(false);
  let containerEl = $state<HTMLDivElement | null>(null);

  onMount(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerEl && !containerEl.contains(event.target as Node)) {
        isOpen = false;
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  });
</script>

<div bind:this={containerEl} class="relative">
  <button
    type="button"
    onclick={() => (isOpen = !isOpen)}
    aria-label="Membros"
    class="flex h-9 w-9 items-center justify-center rounded-sm transition-all"
    style="
      background: {isOpen ? 'var(--app-border, rgba(255, 255, 255, 0.1))' : 'var(--app-hover, rgba(255, 255, 255, 0.05))'};
      border: 1px solid var(--app-border, rgba(255, 255, 255, 0.1));
      color: {assigneeId ? 'var(--app-primary, #818cf8)' : 'var(--app-text-muted)'};
    "
    title="Membros"
  >
    <Users class="h-4 w-4" />
  </button>

  {#if isOpen}
    <div
      class="absolute top-11 right-0 z-50 w-56 p-1.5 shadow-2xl"
      style="
        border-radius: 6px;
        background: var(--app-panel, #212124);
        border: 1px solid var(--app-border, rgba(255, 255, 255, 0.1));
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
      "
    >
      <div class="mb-1.5 px-2 py-1 text-[10px] font-bold tracking-wider text-[var(--app-text-muted)] uppercase">
        Assignee
      </div>

      <div class="max-h-48 space-y-0.5 overflow-y-auto">
        <button
          type="button"
          onclick={() => {
            onselect?.(null);
            isOpen = false;
          }}
          class="flex w-full items-center justify-between rounded-sm px-2.5 py-1.5 text-left text-[12px] font-medium text-white/50 transition-colors hover:bg-white/5"
        >
          <span>Unassigned</span>
          {#if !assigneeId}
            <Check class="h-3.5 w-3.5 text-indigo-400" />
          {/if}
        </button>

        {#each allUsers as user (user.id)}
          {@const isSelected = user.id === assigneeId}
          <button
            type="button"
            onclick={() => {
              onselect?.(user.id);
              isOpen = false;
            }}
            class="flex w-full items-center justify-between rounded-sm px-2.5 py-1.5 text-left text-[12px] font-medium transition-colors hover:bg-white/5"
            style="color: var(--app-text);"
          >
            <div class="flex items-center gap-2.5">
              <img
                src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                alt=""
                class="h-5 w-5 rounded-sm object-cover"
                style="border: 1px solid var(--app-border-faint);"
              />
              <span class="truncate">{user.displayName || user.username}</span>
            </div>
            {#if isSelected}
              <Check class="h-3.5 w-3.5 text-indigo-400" />
            {/if}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>
