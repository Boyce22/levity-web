<script lang="ts">
  import { UserX } from 'lucide-svelte';
  import type { UserModel } from '$lib/contracts/models';

  interface Props {
    selectedUserFilters?: string[];
    allUsers?: UserModel[];
    onchange?: (filters: string[]) => void;
  }

  let {
    selectedUserFilters = $bindable([]),
    allUsers = [],
    onchange,
  }: Props = $props();

  let hoveredMember = $state<string | null>(null);

  let isUnassignedActive = $derived(selectedUserFilters.includes('unassigned'));

  function toggleUnassigned() {
    if (isUnassignedActive) {
      selectedUserFilters = selectedUserFilters.filter((id) => id !== 'unassigned');
    } else {
      selectedUserFilters = [...selectedUserFilters, 'unassigned'];
    }
    onchange?.(selectedUserFilters);
  }

  function toggleUser(userId: string) {
    if (selectedUserFilters.includes(userId)) {
      selectedUserFilters = selectedUserFilters.filter((id) => id !== userId);
    } else {
      selectedUserFilters = [...selectedUserFilters, userId];
    }
    onchange?.(selectedUserFilters);
  }
</script>

<div class="member-filters flex shrink-0 items-center gap-4 py-2">
  <span
    class="text-[11px] font-bold tracking-wider uppercase opacity-60"
    style="color: var(--app-text-muted);"
  >
    Members
  </span>

  <div class="flex items-center -space-x-1.5">
    <!-- Unassigned Filter -->
    <div class="relative flex items-center">
      <button
        type="button"
        onclick={toggleUnassigned}
        onmouseenter={() => (hoveredMember = 'unassigned')}
        onmouseleave={() => (hoveredMember = null)}
        onfocus={() => (hoveredMember = 'unassigned')}
        onblur={() => (hoveredMember = null)}
        aria-label="Filter unassigned issues"
        class="relative flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-200"
        style="
          background: {isUnassignedActive ? 'var(--app-primary)' : 'var(--app-bg)'};
          border-color: {isUnassignedActive ? 'var(--app-primary)' : 'var(--app-border)'};
          z-index: {isUnassignedActive ? 21 : 5};
          transform: {isUnassignedActive ? 'scale(1.05)' : 'scale(1)'};
        "
      >
        <UserX
          class="h-3.5 w-3.5 {isUnassignedActive ? 'text-white' : 'text-app-text-muted'}"
        />
      </button>

      {#if hoveredMember === 'unassigned'}
        <div
          role="tooltip"
          class="pointer-events-none absolute top-full left-1/2 z-50 mt-2 -translate-x-1/2 rounded-sm border border-white/10 bg-black/90 px-2.5 py-1.5 text-[11px] font-bold whitespace-nowrap text-white shadow-2xl backdrop-blur-md"
        >
          Unassigned
        </div>
      {/if}
    </div>

    <!-- User Avatars -->
    {#each allUsers as user (user.id)}
      {@const isActive = selectedUserFilters.includes(user.id)}
      <div class="relative flex items-center">
        <button
          type="button"
          onclick={() => toggleUser(user.id)}
          onmouseenter={() => (hoveredMember = user.id)}
          onmouseleave={() => (hoveredMember = null)}
          onfocus={() => (hoveredMember = user.id)}
          onblur={() => (hoveredMember = null)}
          aria-label="Filter by {user.displayName || user.username}"
          class="relative flex items-center justify-center rounded-full transition-all duration-200"
          style="
            z-index: {isActive ? 20 : 10};
            transform: {isActive ? 'scale(1.05)' : 'scale(1)'};
          "
        >
          <img
            src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
            alt={user.displayName || user.username}
            class="h-7 w-7 rounded-full object-cover"
            style="
              border: 1.5px solid {isActive ? 'var(--app-primary)' : 'var(--app-header)'};
              opacity: {isActive ? 1 : 0.85};
            "
          />
          {#if isActive}
            <div
              class="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border border-black"
              style="background: var(--app-primary); border-color: var(--app-header);"
            ></div>
          {/if}
        </button>

        {#if hoveredMember === user.id}
          <div
            role="tooltip"
            class="pointer-events-none absolute top-full left-1/2 z-50 mt-2 -translate-x-1/2 rounded-sm border border-white/10 bg-black/90 px-2.5 py-1.5 text-[11px] font-bold whitespace-nowrap text-white shadow-2xl backdrop-blur-md"
          >
            {user.displayName || user.username}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
