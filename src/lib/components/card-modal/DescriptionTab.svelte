<script lang="ts">
  import SanitizedMarkdown from '$lib/ui/SanitizedMarkdown.svelte';
  import { attachmentMarkdown } from '$lib/utils/attachments';
  import AttachmentCard from './AttachmentCard.svelte';
  import HistorySection from './HistorySection.svelte';
  import type { AttachmentModel, IssueEventModel, UserModel } from '$lib/contracts/models';

  interface Props {
    description?: string;
    isEditing?: boolean;
    savedStatus?: 'idle' | 'saving' | 'saved';
    history?: IssueEventModel[];
    allUsers?: UserModel[];
    workspaceId: string;
    onupdatedescription?: (desc: string) => void;
  }

  let {
    description = '',
    isEditing = $bindable(false),
    savedStatus = 'idle',
    history = [],
    allUsers = [],
    workspaceId,
    onupdatedescription,
  }: Props = $props();

  let localDesc = $derived(description);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let deletingUrl = $state<string | null>(null);

  const attachments = $derived.by(() => {
    const values: AttachmentModel[] = [];
    const regex = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)(?:\s+["']([^"']+)["'])?\)/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(description)) !== null) {
      if (match[2] && match[3]) values.push({ name: match[1], url: match[2], publicId: match[3] });
    }
    return values;
  });

  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    localDesc = target.value;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      onupdatedescription?.(localDesc);
    }, 1500);
  }

  function handleChecklistClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' && target.getAttribute('type') === 'checkbox') {
      const container = target.closest('.description-preview');
      if (!container) return;
      const checkboxes = Array.from(container.querySelectorAll('input[type="checkbox"]'));
      const index = checkboxes.indexOf(target as HTMLInputElement);
      if (index !== -1) {
        toggleChecklistIndex(index, (target as HTMLInputElement).checked);
      }
    }
  }

  function toggleChecklistIndex(targetIndex: number, checked: boolean) {
    let count = 0;
    const lines = description.split('\n');
    const newLines = lines.map((line) => {
      const match = line.match(/^([\s]*[-*+]\s+\[)[ xX](\].*)/i);
      if (match) {
        if (count === targetIndex) {
          count++;
          return `${match[1]}${checked ? 'x' : ' '}${match[2]}`;
        }
        count++;
      }
      return line;
    });
    const updated = newLines.join('\n');
    onupdatedescription?.(updated);
  }

  async function handleDeleteAttachment(attachment: AttachmentModel) {
    deletingUrl = attachment.url;
    try {
      // The public ID comes from the upload response and is persisted in the image title.
      const response = await fetch('/api/files/attachments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace_id: workspaceId, key: attachment.publicId }),
      });
      if (!response.ok) throw new Error('Falha ao excluir anexo.');
      const cleanDesc = description.replace(attachmentMarkdown(attachment), '').trim();
      onupdatedescription?.(cleanDesc);
    } catch {
      // Falha silenciosa de deleção remota
    } finally {
      deletingUrl = null;
    }
  }
</script>

<div class="space-y-4">
  {#if isEditing}
    <div class="relative z-20 space-y-3">
      <textarea
        value={localDesc}
        oninput={handleInput}
        rows={8}
        placeholder="Adicione uma descrição mais detalhada em Markdown..."
        class="w-full resize-y rounded-sm border border-[var(--app-primary)] bg-[var(--app-panel)] p-3.5 font-mono text-[13px] leading-relaxed text-[var(--app-text)] focus:outline-none"
      ></textarea>

      <div class="flex items-center justify-between">
        <span class="px-1 text-[11px] font-bold tracking-widest uppercase opacity-50">
          {#if savedStatus === 'saving'}
            <span class="animate-pulse" style="color: var(--color-warning, #fbbf24);">
              Saving
            </span>
          {:else if savedStatus === 'saved'}
            <span style="color: var(--color-success, #34d399);">✓ Saved</span>
          {:else}
            <span>Markdown · Auto-save</span>
          {/if}
        </span>
        <button
          type="button"
          onclick={() => {
            if (debounceTimer) clearTimeout(debounceTimer);
            onupdatedescription?.(localDesc);
            isEditing = false;
          }}
          class="text-app-text-muted hover:text-app-text hover:bg-app-panel rounded-sm px-3 py-1 text-[12px] font-bold tracking-wider uppercase transition-all"
        >
          Close editor
        </button>
      </div>
    </div>
  {:else}
    <div
      role="button"
      tabindex="0"
      onclick={() => (isEditing = true)}
      onkeydown={(e) => {
        if (e.key === 'Enter') isEditing = true;
      }}
      class="group cursor-text rounded-sm p-4 transition-all"
      style="border: 1px dashed var(--app-border, rgba(255, 255, 255, 0.15));"
    >
      {#if description.trim()}
        <!-- Intercept checklist clicks -->
        <div
          class="description-preview prose-content"
          role="presentation"
          onclick={handleChecklistClick}
        >
          <SanitizedMarkdown markdown={description} />
        </div>
      {:else}
        <p class="text-sm italic" style="color: var(--app-text-muted); opacity: 0.5;">
          Click to add a detailed description (Markdown supported)...
        </p>
      {/if}
    </div>
  {/if}

  <!-- Attachments section -->
  {#if attachments.length > 0}
    <div class="space-y-2 pt-2">
      <h3 class="text-[11px] font-bold tracking-wider text-[var(--app-text-muted)] uppercase">
        Anexos ({attachments.length})
      </h3>
      <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {#each attachments as attachment (attachment.publicId)}
          <AttachmentCard
            url={attachment.url}
            publicId={attachment.publicId}
            name={attachment.name}
            isDeleting={deletingUrl === attachment.url}
            ondelete={() => handleDeleteAttachment(attachment)}
          />
        {/each}
      </div>
    </div>
  {/if}

  <!-- History Section -->
  <div class="pt-2">
    <HistorySection {history} {allUsers} />
  </div>
</div>
