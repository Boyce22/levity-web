<script lang="ts">
  import { AlignLeft, MessageSquare } from 'lucide-svelte';
  import CardDueDate from './CardDueDate.svelte';
  import type { UserModel } from '$lib/contracts/models';

  interface Props {
    description?: string | null;
    dueDate?: string | null;
    commentCount?: number;
    assignedUser?: UserModel | null;
  }

  let {
    description = null,
    dueDate = null,
    commentCount = 0,
    assignedUser = null,
  }: Props = $props();
</script>

<div class="mt-3 flex items-center justify-between gap-2">
  <div class="flex items-center gap-2">
    {#if dueDate}
      <CardDueDate {dueDate} />
    {/if}
    <div class="flex items-center gap-2" style="color: var(--app-text-muted);">
      {#if description}
        <AlignLeft class="h-3.5 w-3.5" />
      {/if}
      {#if commentCount > 0}
        <span class="flex items-center gap-1 text-[11px]">
          <MessageSquare class="h-3.5 w-3.5" />
          {commentCount}
        </span>
      {/if}
    </div>
  </div>

  {#if assignedUser}
    <img
      src={assignedUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${assignedUser.username}`}
      title={assignedUser.displayName || assignedUser.username}
      alt={assignedUser.displayName || assignedUser.username}
      class="h-6 w-6 rounded-full object-cover"
      style="border: 2px solid var(--app-panel);"
    />
  {/if}
</div>
