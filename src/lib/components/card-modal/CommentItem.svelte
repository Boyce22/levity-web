<script lang="ts">
  import { Edit2, Trash2, Check, Loader2, CornerDownRight } from 'lucide-svelte';
  import SanitizedMarkdown from '$lib/ui/SanitizedMarkdown.svelte';
  import ConfirmationModal from '$lib/ui/ConfirmationModal.svelte';
  import type { CommentModel, UserModel } from '$lib/contracts/models';
  import { showToast } from '$lib/ui/toast';

  interface Props {
    comment: CommentModel;
    isReply?: boolean;
    allUsers?: UserModel[];
    currentUserId?: string;
    onreply?: (parent: CommentModel) => void;
    ondelete?: (commentId: string) => void;
    onupdate?: (commentId: string, newContent: string) => void;
  }

  let {
    comment,
    isReply = false,
    allUsers = [],
    currentUserId,
    onreply,
    ondelete,
    onupdate,
  }: Props = $props();

  let isEditing = $state(false);
  let editContent = $derived(comment.content);
  let isSaving = $state(false);
  let isDeleteModalOpen = $state(false);

  const author = $derived(
    comment.author || allUsers.find((u) => u.id === comment.createdBy)
  );

  const isOwner = $derived(currentUserId === comment.createdBy);
  function formatTime(dateStr: string): string {
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

  async function handleSave() {
    const trimmed = editContent.trim();
    if (!trimmed || trimmed === comment.content) {
      isEditing = false;
      return;
    }
    isSaving = true;
    try {
      await onupdate?.(comment.id, trimmed);
      isEditing = false;
    } catch {
      showToast('Erro ao salvar comentário.', 'error');
    } finally {
      isSaving = false;
    }
  }
</script>

<div class="group flex items-start gap-3 rounded-sm p-3 transition-colors hover:bg-white/2 {isReply ? 'ml-6 border-l border-white/10 pl-4' : ''}">
  <img
    src={author?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author?.username || comment.createdBy}`}
    alt=""
    class="mt-0.5 h-7 w-7 shrink-0 rounded-full object-cover"
    style="border: 1.5px solid var(--app-border-faint);"
  />

  <div class="min-w-0 flex-1 space-y-1">
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-white/90">
          {author?.displayName || author?.username || 'Usuário'}
        </span>
        <span class="text-[10px] text-white/30">
          {formatTime(comment.createdAt)}
        </span>
      </div>

      <div class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {#if !isReply}
          <button
            type="button"
            onclick={() => onreply?.(comment)}
            class="rounded-xs p-1 text-white/40 hover:text-white transition-colors"
            title="Responder"
          >
            <CornerDownRight class="h-3.5 w-3.5" />
          </button>
        {/if}

        {#if isOwner}
          <button
            type="button"
            onclick={() => (isEditing = !isEditing)}
            class="rounded-xs p-1 text-white/40 hover:text-white transition-colors"
            title="Editar"
          >
            <Edit2 class="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onclick={() => (isDeleteModalOpen = true)}
            class="rounded-xs p-1 text-white/40 hover:text-red-400 transition-colors"
            title="Excluir"
          >
            <Trash2 class="h-3.5 w-3.5" />
          </button>
        {/if}
      </div>
    </div>

    {#if isEditing}
      <div class="space-y-2 pt-1">
        <textarea
          bind:value={editContent}
          rows={2}
          class="w-full resize-none rounded-sm border border-indigo-500/50 bg-[var(--app-bg)] p-2 text-xs text-white focus:outline-none"
        ></textarea>
        <div class="flex items-center gap-2">
          <button
            type="button"
            onclick={handleSave}
            disabled={isSaving}
            class="flex items-center gap-1 rounded-xs bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-indigo-700"
          >
            {#if isSaving}
              <Loader2 class="h-3 w-3 animate-spin" />
            {:else}
              <Check class="h-3 w-3" /> Salvar
            {/if}
          </button>
          <button
            type="button"
            onclick={() => (isEditing = false)}
            class="rounded-xs px-2 py-1 text-xs text-white/50 hover:text-white"
          >
            Cancelar
          </button>
        </div>
      </div>
    {:else}
      <div class="prose-content text-xs leading-relaxed text-white/80">
        <SanitizedMarkdown markdown={comment.content} />
      </div>
    {/if}
  </div>
</div>

<ConfirmationModal
  isOpen={isDeleteModalOpen}
  onClose={() => (isDeleteModalOpen = false)}
  onConfirm={() => {
    isDeleteModalOpen = false;
    ondelete?.(comment.id);
  }}
  title="Excluir Comentário"
  description="Tem certeza de que deseja excluir este comentário? Esta ação não pode ser desfeita."
  confirmText="Excluir"
  variant="danger"
/>
