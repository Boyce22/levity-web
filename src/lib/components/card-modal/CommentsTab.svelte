<script lang="ts">
  import { MessageSquare } from 'lucide-svelte';
  import CommentInput from './CommentInput.svelte';
  import CommentItem from './CommentItem.svelte';
  import type { CommentModel, UserModel } from '$lib/contracts/models';

  interface Props {
    comments?: CommentModel[];
    loading?: boolean;
    allUsers?: UserModel[];
    currentUserId?: string;
    currentUserAvatar?: string;
    workspaceId: string;
    onpostcomment?: (text: string, parentId?: string | null) => Promise<void> | void;
    ondeletecomment?: (commentId: string) => void;
    onupdatecomment?: (commentId: string, newContent: string) => void;
  }

  let {
    comments = [],
    loading = false,
    allUsers = [],
    currentUserId,
    currentUserAvatar = '',
    workspaceId,
    onpostcomment,
    ondeletecomment,
    onupdatecomment,
  }: Props = $props();

  let replyingTo = $state<{ id: string; authorName?: string } | null>(null);

  const rootComments = $derived(comments.filter((c) => !c.parentId));

  const repliesMap = $derived.by(() => {
    const map: Record<string, CommentModel[]> = {};
    for (const c of comments) {
      if (c.parentId) {
        (map[c.parentId] ??= []).push(c);
      }
    }
    return map;
  });

  function handleReply(parent: CommentModel) {
    const author = parent.author || allUsers.find((u) => u.id === parent.createdBy);
    replyingTo = {
      id: parent.id,
      authorName: author?.displayName || author?.username,
    };
  }
</script>

<div class="space-y-6">
  <!-- Input -->
  <CommentInput
    avatarUrl={currentUserAvatar}
    {replyingTo}
    {allUsers}
    {workspaceId}
    onpost={onpostcomment}
    oncancelreply={() => (replyingTo = null)}
  />

  <!-- Comments List -->
  {#if loading}
    <div class="space-y-4">
      {#each [0, 1] as index (index)}
        <div class="flex animate-pulse gap-3">
          <div class="h-8 w-8 shrink-0 rounded-full" style="background: var(--app-border);"></div>
          <div class="flex-1 space-y-2">
            <div class="h-3 w-1/3 rounded" style="background: var(--app-border);"></div>
            <div class="h-10 rounded-sm" style="background: var(--app-border-faint);"></div>
          </div>
        </div>
      {/each}
    </div>
  {:else if comments.length === 0}
    <div class="py-8 text-center">
      <div
        class="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-sm"
        style="background: var(--app-hover); border: 1px solid var(--app-border);"
      >
        <MessageSquare class="h-5 w-5" style="color: var(--app-text-muted); opacity: 0.5;" />
      </div>
      <p class="text-sm" style="color: var(--app-text-muted); opacity: 0.6;">
        No comments yet. Be the first!
      </p>
    </div>
  {:else}
    <div class="custom-scrollbar max-h-96 space-y-4 overflow-y-auto pr-2">
      {#each rootComments as comment (comment.id)}
        <div class="space-y-2">
          <CommentItem
            {comment}
            {allUsers}
            {currentUserId}
            onreply={handleReply}
            ondelete={ondeletecomment}
            onupdate={onupdatecomment}
          />

          <!-- Nested replies -->
          {#if repliesMap[comment.id]}
            <div class="space-y-2">
              {#each repliesMap[comment.id] as reply (reply.id)}
                <CommentItem
                  comment={reply}
                  isReply={true}
                  {allUsers}
                  {currentUserId}
                  ondelete={ondeletecomment}
                  onupdate={onupdatecomment}
                />
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
