<script lang="ts">
  import { ImagePlus, Loader2, Link as LinkIcon, Check } from 'lucide-svelte';
  import PriorityPicker from './pickers/PriorityPicker.svelte';
  import LabelPicker from './pickers/LabelPicker.svelte';
  import MemberPicker from './pickers/MemberPicker.svelte';
  import DueDatePicker from './pickers/DueDatePicker.svelte';
  import type { PriorityModel, TagModel, UserModel } from '$lib/contracts/models';
  import { attachmentValidationError } from '$lib/utils/attachments';
  import { showToast } from '$lib/ui/toast';

  interface Props {
    dueDate?: string | null;
    selectedTagId?: string | null;
    selectedPriorityId?: string | null;
    assigneeId?: string | null;
    allUsers?: UserModel[];
    tags?: TagModel[];
    priorities?: PriorityModel[];
    workspaceId: string;
    onselectduedate?: (date: string | null) => void;
    onselectpriority?: (priorityId: string) => void;
    onselecttag?: (tagId: string | null) => void;
    onselectassignee?: (userId: string | null) => void;
    onuploadcover?: (url: string) => void;
  }

  let {
    dueDate = null,
    selectedTagId = null,
    selectedPriorityId = null,
    assigneeId = null,
    allUsers = [],
    tags = [],
    priorities = [],
    workspaceId,
    onselectduedate,
    onselectpriority,
    onselecttag,
    onselectassignee,
    onuploadcover,
  }: Props = $props();

  let isUploading = $state(false);
  let copied = $state(false);
  let fileInputEl = $state<HTMLInputElement | null>(null);

  async function handleFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (attachmentValidationError(file)) {
      showToast('Selecione apenas arquivos de imagem (JPEG, PNG, WebP, GIF).', 'error');
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

      if (!res.ok) {
        throw new Error('Falha no envio da imagem.');
      }

      const data = await res.json();
      if (data.url) {
        onuploadcover?.(data.url);
      }
    } catch (err) {
      console.error(err);
      showToast('Erro ao carregar capa.', 'error');
    } finally {
      isUploading = false;
      if (fileInputEl) fileInputEl.value = '';
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }
</script>

<div class="relative mt-1 flex shrink-0 items-center gap-2">
  <!-- Cover Upload (Restricted to images only) -->
  <input
    bind:this={fileInputEl}
    type="file"
    accept="image/jpeg,image/png,image/webp,image/gif"
    class="hidden"
    id="cover-upload-input"
    onchange={handleFileChange}
  />
  <label
    for="cover-upload-input"
    class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-sm transition-all"
    style="
      background: {isUploading ? 'var(--app-primary-muted)' : 'var(--app-hover)'};
      border: 1px solid {isUploading ? 'var(--app-primary)' : 'var(--app-border)'};
      color: {isUploading ? 'var(--app-primary)' : 'var(--app-text-muted)'};
      pointer-events: {isUploading ? 'none' : 'auto'};
    "
    title="Adicionar capa (imagem)"
  >
    {#if isUploading}
      <Loader2 class="h-4 w-4 animate-spin" />
    {:else}
      <ImagePlus class="h-4 w-4" />
    {/if}
  </label>

  <!-- Copy Link -->
  <button
    type="button"
    onclick={handleCopyLink}
    aria-label="Copiar link"
    class="relative flex h-9 w-9 items-center justify-center rounded-sm transition-all"
    style="
      background: var(--app-hover);
      border: 1px solid var(--app-border);
      color: {copied ? 'var(--app-primary)' : 'var(--app-text-muted)'};
    "
    title="Copiar link"
  >
    {#if copied}
      <span class="bg-app-primary pointer-events-none absolute -top-7 rounded-xs px-1.5 py-0.5 text-[9px] font-black text-white uppercase shadow-md">
        Copiado!
      </span>
      <Check class="h-4 w-4 text-emerald-400" />
    {:else}
      <LinkIcon class="h-4 w-4" />
    {/if}
  </button>

  <PriorityPicker
    {selectedPriorityId}
    {priorities}
    {workspaceId}
    onselect={onselectpriority}
  />

  <LabelPicker
    {selectedTagId}
    {tags}
    {workspaceId}
    onselect={onselecttag}
  />

  <MemberPicker
    {assigneeId}
    {allUsers}
    onselect={onselectassignee}
  />

  <DueDatePicker
    {dueDate}
    onselect={onselectduedate}
  />
</div>
