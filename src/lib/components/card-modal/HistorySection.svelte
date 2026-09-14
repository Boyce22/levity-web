<script lang="ts">
  import { Clock, ChevronDown } from 'lucide-svelte';
  import type { IssueEventModel, UserModel } from '$lib/contracts/models';

  interface Props {
    history?: IssueEventModel[];
    allUsers?: UserModel[];
  }

  let { history = [], allUsers = [] }: Props = $props();

  let isOpen = $state(false);

  const sortedHistory = $derived(
    [...history].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  );

  function getUser(userId: string) {
    return allUsers.find((u) => u.id === userId);
  }

  function formatTimeAgo(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'agora';
      if (diffMins < 60) return `${diffMins}m atrás`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h atrás`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d atrás`;
    } catch {
      return dateStr;
    }
  }

  function formatAction(item: IssueEventModel): string {
    const field = item.field || 'issue';
    if (item.actionType === 'CREATE') return 'criou esta issue';
    if (item.actionType === 'UPDATE') {
      if (item.oldVal && item.newVal) {
        return `alterou ${field} de "${item.oldVal}" para "${item.newVal}"`;
      }
      return `atualizou ${field}`;
    }
    if (item.actionType === 'DELETE') return `removeu ${field}`;
    return item.actionType.toLowerCase();
  }
</script>

<div class="overflow-hidden rounded-sm" style="border: 1px solid var(--app-border-faint, rgba(255, 255, 255, 0.05));">
  <button
    type="button"
    onclick={() => (isOpen = !isOpen)}
    class="group flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-white/5"
    style="background: var(--app-hover, rgba(255, 255, 255, 0.03));"
  >
    <div class="flex items-center gap-2.5">
      <Clock class="h-3.5 w-3.5" style="color: var(--app-text-muted);" />
      <span class="text-[13px] font-semibold" style="color: var(--app-text-muted);">
        Edit History
      </span>
      {#if history.length > 0}
        <span
          class="rounded-sm px-1.5 py-0.5 text-[10px] font-bold"
          style="background: var(--app-border, rgba(255, 255, 255, 0.1)); color: var(--app-text-muted);"
        >
          {history.length}
        </span>
      {/if}
    </div>
    <ChevronDown
      class="h-4 w-4 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}"
      style="color: var(--app-text-muted);"
    />
  </button>

  {#if isOpen}
    <div
      class="px-4 pt-3 pb-4"
      style="border-top: 1px solid var(--app-border-faint, rgba(255, 255, 255, 0.05));"
    >
      {#if sortedHistory.length === 0}
        <p class="py-3 text-center text-[12px] italic" style="color: var(--app-text-muted);">
          No edit history recorded.
        </p>
      {:else}
        <ol class="relative mt-1 space-y-3 pl-6">
          <div
            class="absolute top-2 bottom-2 left-2 w-px"
            style="background: var(--app-border, rgba(255, 255, 255, 0.1));"
          ></div>
          {#each sortedHistory as item (item.id)}
            {@const author = getUser(item.createdBy) || (item.author ? { username: item.author.username, avatarUrl: item.author.avatarUrl || undefined, displayName: item.author.username } : undefined)}
            <li class="relative">
              <span
                class="absolute -left-5.5 top-1.5 h-2 w-2 rounded-full"
                style="background: var(--app-primary, #818cf8); box-shadow: 0 0 0 2px var(--app-panel, #212124);"
              ></span>
              <div class="flex items-start gap-2">
                {#if author}
                  <img
                    src={author.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.username}`}
                    alt=""
                    class="h-4 w-4 rounded-xs object-cover"
                  />
                {/if}
                <div class="min-w-0 flex-1 text-xs">
                  <span class="font-bold text-white/90">
                    {author?.displayName || author?.username || 'Sistema'}
                  </span>&nbsp;
                  <span class="text-white/60">{formatAction(item)}</span>
                  <span class="ml-2 text-[10px] text-white/30">
                    {formatTimeAgo(item.createdAt)}
                  </span>
                </div>
              </div>
            </li>
          {/each}
        </ol>
      {/if}
    </div>
  {/if}
</div>
