<script lang="ts">
  import { Send, Loader2, Paperclip, X } from 'lucide-svelte';
  import { attachmentMarkdown, attachmentValidationError } from '$lib/utils/attachments';
  import type { UserModel } from '$lib/contracts/models';
  import { showToast } from '$lib/ui/toast';

  interface Props {
    avatarUrl?: string;
    replyingTo?: { id: string; authorName?: string } | null;
    allUsers?: UserModel[];
    workspaceId: string;
    onpost?: (text: string, parentId?: string | null) => Promise<void> | void;
    oncancelreply?: () => void;
  }

  let {
    avatarUrl = '',
    replyingTo = null,
    allUsers = [],
    workspaceId,
    onpost,
    oncancelreply,
  }: Props = $props();

  let content = $state('');
  let isSending = $state(false);
  let isUploading = $state(false);
  let fileInputEl = $state<HTMLInputElement | null>(null);
  let stagedFiles = $state<Array<{ name: string; url: string; publicId: string }>>([]);

  // Mention autocomplete
  let mentionQuery = $state<string | null>(null);
  let textareaEl = $state<HTMLTextAreaElement | null>(null);

  const matchedUsers = $derived.by(() => {
    if (mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase();
    return allUsers.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        (u.displayName && u.displayName.toLowerCase().includes(q))
    ).slice(0, 5);
  });

  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    content = target.value;

    const caretPos = target.selectionStart;
    const textBefore = content.slice(0, caretPos);
    const mentionMatch = textBefore.match(/@([a-zA-Z0-9_]*)$/);
    if (mentionMatch) {
      mentionQuery = mentionMatch[1];
    } else {
      mentionQuery = null;
    }
  }

  function insertMention(username: string) {
    if (!textareaEl) return;
    const caretPos = textareaEl.selectionStart;
    const textBefore = content.slice(0, caretPos);
    const textAfter = content.slice(caretPos);
    const newBefore = textBefore.replace(/@([a-zA-Z0-9_]*)$/, `@${username} `);
    content = newBefore + textAfter;
    mentionQuery = null;
    textareaEl.focus();
  }

  async function handleFileUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (attachmentValidationError(file)) {
      showToast('Apenas imagens são permitidas (JPEG, PNG, WebP, GIF).', 'error');
      return;
    }

    isUploading = true;
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('workspace_id', workspaceId);

      const res = await fetch('/api/files/attachments', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Falha no upload.');
      const data = await res.json();
      stagedFiles = [...stagedFiles, { name: file.name, url: data.url, publicId: data.publicId }];
    } catch {
      showToast('Erro ao enviar anexo.', 'error');
    } finally {
      isUploading = false;
      if (fileInputEl) fileInputEl.value = '';
    }
  }

  async function handleSubmit() {
    const trimmed = content.trim();
    if (!trimmed && stagedFiles.length === 0) return;

    isSending = true;
    try {
      let finalText = trimmed;
      if (stagedFiles.length > 0) {
        const fileMarkdown = stagedFiles
          .map((file) => `\n${attachmentMarkdown(file)}`)
          .join('');
        finalText = `${finalText}${fileMarkdown}`.trim();
      }

      await onpost?.(finalText, replyingTo?.id);
      content = '';
      stagedFiles = [];
      oncancelreply?.();
    } catch {
      showToast('Erro ao enviar comentário.', 'error');
    } finally {
      isSending = false;
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  }
</script>

<div class="relative space-y-2">
  {#if replyingTo}
    <div class="flex items-center justify-between rounded-sm bg-indigo-500/10 px-3 py-1.5 text-xs text-indigo-300">
      <span>Respondendo a <strong>{replyingTo.authorName || 'comentário'}</strong></span>
      <button type="button" onclick={oncancelreply} class="hover:text-white">
        <X class="h-3.5 w-3.5" />
      </button>
    </div>
  {/if}

  <div
    class="flex items-start gap-3 rounded-sm border p-3 transition-colors focus-within:border-indigo-500/50"
    style="background: var(--app-panel, #212124); border-color: var(--app-border, rgba(255, 255, 255, 0.1));"
  >
    {#if avatarUrl}
      <img
        src={avatarUrl}
        alt=""
        class="mt-1 h-7 w-7 rounded-full object-cover"
        style="border: 1px solid var(--app-border-faint);"
      />
    {/if}

    <div class="min-w-0 flex-1 space-y-2">
      <textarea
        bind:this={textareaEl}
        value={content}
        oninput={handleInput}
        onkeydown={handleKeyDown}
        placeholder="Escreva um comentário... (Ctrl+Enter para enviar, @ para mencionar)"
        rows={2}
        class="w-full resize-none bg-transparent text-[13px] leading-relaxed text-[var(--app-text)] placeholder:opacity-40 focus:outline-none"
      ></textarea>

      <!-- Mention suggestions popup -->
      {#if matchedUsers.length > 0}
        <div
          class="absolute z-50 mt-1 w-48 rounded-sm border border-white/10 bg-[var(--app-elevated)] p-1 shadow-xl"
        >
          {#each matchedUsers as user (user.id)}
            <button
              type="button"
              onclick={() => insertMention(user.username)}
              class="flex w-full items-center gap-2 rounded-xs px-2 py-1 text-left text-xs text-white/80 hover:bg-white/5"
            >
              <img
                src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                alt=""
                class="h-4 w-4 rounded-full object-cover"
              />
              <span class="truncate">{user.displayName || user.username}</span>
            </button>
          {/each}
        </div>
      {/if}

      {#if stagedFiles.length > 0}
        <div class="flex flex-wrap gap-2 pt-1">
          {#each stagedFiles as file, idx (file.url)}
            <div class="flex items-center gap-1.5 rounded-sm bg-white/5 px-2 py-1 text-xs">
              <span class="truncate max-w-[120px]">{file.name}</span>
              <button
                type="button"
                onclick={() => (stagedFiles = stagedFiles.filter((_, i) => i !== idx))}
                class="text-white/40 hover:text-red-400"
              >
                <X class="h-3 w-3" />
              </button>
            </div>
          {/each}
        </div>
      {/if}

      <div class="flex items-center justify-between border-t border-white/5 pt-2">
        <div class="flex items-center gap-2">
          <input
            bind:this={fileInputEl}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            class="hidden"
            id="comment-file-upload"
            onchange={handleFileUpload}
          />
          <label
            for="comment-file-upload"
            class="cursor-pointer rounded-xs p-1 text-white/40 hover:text-white transition-colors"
            title="Anexar imagem"
          >
            {#if isUploading}
              <Loader2 class="h-4 w-4 animate-spin text-indigo-400" />
            {:else}
              <Paperclip class="h-4 w-4" />
            {/if}
          </label>
        </div>

        <button
          type="button"
          onclick={handleSubmit}
          disabled={isSending || (!content.trim() && stagedFiles.length === 0)}
          class="flex items-center gap-1.5 rounded-sm bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-40 transition-all"
        >
          {#if isSending}
            <Loader2 class="h-3.5 w-3.5 animate-spin" />
          {:else}
            <Send class="h-3.5 w-3.5" /> Enviar
          {/if}
        </button>
      </div>
    </div>
  </div>
</div>
