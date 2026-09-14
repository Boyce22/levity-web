<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { focusTrap } from '$lib/ui/focus-trap';
  import type {
    IssueModel,
    UserModel,
    TagModel,
    PriorityModel,
    CommentModel,
    IssueEventModel,
    DiagramElementModel,
  } from '$lib/contracts/models';
  import { toCommentModel, toIssueEventModel, toDiagramElementModel } from '$lib/contracts/mappers';
  import { parseChecklistCounts } from '$lib/utils/markdown';
  import CardModalCover from './CardModalCover.svelte';
  import CardModalHeader from './CardModalHeader.svelte';
  import CardModalTabs, { type ModalTab } from './CardModalTabs.svelte';
  import ChecklistProgress from './ChecklistProgress.svelte';
  import DescriptionTab from './DescriptionTab.svelte';
  import CommentsTab from './CommentsTab.svelte';
  import DiagramTab from './DiagramTab.svelte';

  interface Props {
    card: IssueModel | null;
    boardId: string;
    workspaceId: string;
    workspaceName: string;
    listName: string;
    allUsers?: UserModel[];
    tags?: TagModel[];
    priorities?: PriorityModel[];
    currentUserId?: string;
    currentUserAvatar?: string;
    initialTab?: ModalTab;
    onClose?: () => void;
    onUpdate?: (updatedCard: IssueModel) => Promise<void> | void;
  }

  let {
    card,
    boardId,
    workspaceId,
    workspaceName,
    listName,
    allUsers = [],
    tags = [],
    priorities = [],
    currentUserId,
    currentUserAvatar = 'https://api.dicebear.com/7.x/bottts/svg?seed=levity',
    initialTab = 'description',
    onClose,
    onUpdate,
  }: Props = $props();

  // Local card state
  let content = $state('');
  let description = $state('');
  let coverUrl = $state<string | null>(null);
  let dueDate = $state<string | null>(null);
  let selectedTagId = $state<string | null>(null);
  let selectedPriorityId = $state<string>('');
  let assigneeId = $state<string | null>(null);

  // Tab and UI states
  let activeTab = $state<ModalTab>('description');
  let savedStatus = $state<'idle' | 'saving' | 'saved'>('idle');
  let isUploadingCover = $state(false);

  // Comments state
  let comments = $state<CommentModel[]>([]);
  let loadingComments = $state(false);

  // History state
  let history = $state<IssueEventModel[]>([]);

  // Diagram state
  let diagramElements = $state<DiagramElementModel[]>([]);
  let loadingDiagram = $state(false);
  let isSavingDiagram = $state(false);

  // Synchronize when card prop changes
  $effect(() => {
    if (card) {
      content = card.content || '';
      description = card.description || '';
      coverUrl = card.coverUrl || null;
      dueDate = card.dueDate || null;
      selectedTagId = card.tagId || null;
      selectedPriorityId = card.priorityId || '';
      assigneeId = card.assigneeId || null;
      activeTab = initialTab;
    }
  });

  // Fetch comments, history, and diagram when modal opens
  $effect(() => {
    if (card?.id) {
      fetchComments(card.id);
      fetchHistory(card.id);
      fetchDiagram(card.id);
    }
  });

  const assignedUser = $derived(allUsers.find((u) => u.id === assigneeId) || null);
  const checklistCounts = $derived(parseChecklistCounts(description));

  async function fetchComments(issueId: string) {
    loadingComments = true;
    try {
      const res = await fetch(`/api/issues/${issueId}/comments`);
      if (res.ok) {
        const data = await res.json();
        const rawItems = data.items || data;
        if (Array.isArray(rawItems)) {
          const rootComments = rawItems.map(toCommentModel);
          const replies = await Promise.all(rootComments.map(async (comment) => {
            const repliesResponse = await fetch(`/api/comments/${comment.id}/replies`);
            return repliesResponse.ok ? (await repliesResponse.json()).map(toCommentModel) : [];
          }));
          comments = [...rootComments, ...replies.flat()];
        }
      }
    } catch {
      // Graceful fallback
    } finally {
      loadingComments = false;
    }
  }

  async function fetchHistory(issueId: string) {
    try {
      const res = await fetch(`/api/boards/${boardId}/issues/${issueId}/history`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          history = data.map(toIssueEventModel);
        }
      }
    } catch {
      // Graceful fallback
    }
  }

  async function fetchDiagram(issueId: string) {
    loadingDiagram = true;
    try {
      const res = await fetch(`/api/diagrams/${issueId}`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.elements)) {
          diagramElements = data.elements.map(toDiagramElementModel);
        }
      }
    } catch {
      // Graceful fallback
    } finally {
      loadingDiagram = false;
    }
  }

  async function handleSave(overrides?: Partial<IssueModel>) {
    if (!card) return;

    savedStatus = 'saving';

    const updated: IssueModel = {
      ...card,
      content: overrides?.content !== undefined ? overrides.content : content,
      description: overrides?.description !== undefined ? overrides.description : description,
      coverUrl: overrides?.coverUrl !== undefined ? overrides.coverUrl : coverUrl,
      dueDate: overrides?.dueDate !== undefined ? overrides.dueDate : dueDate,
      tagId: overrides?.tagId !== undefined ? overrides.tagId : selectedTagId,
      priorityId: overrides?.priorityId !== undefined ? overrides.priorityId : selectedPriorityId,
      assigneeId: overrides?.assigneeId !== undefined ? overrides.assigneeId : assigneeId,
    };

    try {
      const res = await fetch(`/api/boards/${boardId}/issues/${card.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: updated.content,
          description: updated.description,
          cover_url: updated.coverUrl,
          due_date: updated.dueDate,
          tag_id: updated.tagId,
          priority_id: updated.priorityId,
          assignee_id: updated.assigneeId,
        }),
      });

      if (!res.ok) {
        savedStatus = 'idle';
        return;
      }

      await onUpdate?.(updated);
      savedStatus = 'saved';
      setTimeout(() => {
        if (savedStatus === 'saved') savedStatus = 'idle';
      }, 2000);
    } catch {
      savedStatus = 'idle';
    }
  }

  async function handlePostComment(text: string, parentId?: string | null) {
    if (!card) return;
    try {
      const res = await fetch(`/api/issues/${card.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: text,
          parent_id: parentId || undefined,
        }),
      });
      if (res.ok) {
        const raw = await res.json();
        const newComment = toCommentModel(raw);
        comments = [...comments, newComment];
      }
    } catch {
      // Error handling
    }
  }

  async function handleDeleteComment(commentId: string) {
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        comments = comments.filter((c) => c.id !== commentId);
      }
    } catch {
      // Error handling
    }
  }

  async function handleUpdateComment(commentId: string, content: string) {
    const response = await fetch(`/api/comments/${commentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) throw new Error('Falha ao atualizar comentário.');
    const updatedComment = toCommentModel(await response.json());
    comments = comments.map((comment) => comment.id === commentId ? updatedComment : comment);
  }

  async function handleSaveDiagram(newElements: DiagramElementModel[]) {
    if (!card) return;
    isSavingDiagram = true;
    try {
      const res = await fetch(`/api/diagrams`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issue_id: card.id,
          data: {
            elements: newElements.map((el) => ({
              id: el.id,
              type: el.type,
              points: el.points,
              x: el.x,
              y: el.y,
              width: el.width,
              height: el.height,
              color: el.color,
              size: el.size,
            })),
          },
        }),
      });
      if (res.ok) {
        diagramElements = newElements;
      }
    } catch {
      // Error handling
    } finally {
      isSavingDiagram = false;
    }
  }

  async function handleDeleteDiagram() {
    if (!card) return;
    isSavingDiagram = true;
    try {
      const res = await fetch(`/api/diagrams/${card.id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) return;
      diagramElements = [];
    } finally {
      isSavingDiagram = false;
    }
  }

  function handleContentChange(newContent: string) {
    content = newContent;
    handleSave({ content: newContent });
  }

  function handleDescriptionChange(newDesc: string) {
    description = newDesc;
    handleSave({ description: newDesc });
  }

  function handleDueDateSelect(newDate: string | null) {
    dueDate = newDate;
    handleSave({ dueDate: newDate });
  }

  function handlePrioritySelect(newPriorityId: string) {
    selectedPriorityId = newPriorityId;
    handleSave({ priorityId: selectedPriorityId });
  }

  function handleTagSelect(newTagId: string | null) {
    selectedTagId = newTagId === selectedTagId ? null : newTagId;
    handleSave({ tagId: selectedTagId });
  }

  function handleAssigneeSelect(newUserId: string | null) {
    assigneeId = newUserId === assigneeId ? null : newUserId;
    handleSave({ assigneeId });
  }

  function handleCoverUpload(url: string) {
    coverUrl = url;
    handleSave({ coverUrl: url });
  }

  function handleCoverRemove() {
    coverUrl = null;
    handleSave({ coverUrl: null });
  }

  onMount(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Escape') {
        onClose?.();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });
</script>

{#if card}
  <div class="fixed inset-0 z-100 flex items-end justify-center sm:items-center">
    <!-- Backdrop -->
    <button
      type="button"
      class="absolute inset-0 block h-full w-full cursor-default border-0 p-0"
      style="background: rgba(0,0,0,0.75); backdrop-filter: blur(12px);"
      onclick={onClose}
      aria-label="Close card modal"
      in:fade={{ duration: 160 }}
    ></button>

    <!-- Modal Container -->
    <div
      class="relative z-10 flex max-h-[92vh] w-full max-w-[95vw] flex-col sm:mx-4 sm:h-[48rem] sm:w-[68rem]"
      use:focusTrap
      in:fly={{ y: 18, duration: 220 }}
      role="dialog"
      aria-modal="true"
      aria-label="Detalhes da tarefa"
      style="
        border-radius: 6px;
        background: var(--app-bg);
        border: 1px solid var(--app-border);
        box-shadow: 0 32px 80px rgba(0,0,0,0.6);
      "
    >
      <!-- Cover -->
      <CardModalCover
        {coverUrl}
        isUploading={isUploadingCover}
        onRemove={handleCoverRemove}
      />

      <!-- Header -->
      <CardModalHeader
        {content}
        {dueDate}
        {selectedTagId}
        {selectedPriorityId}
        {assigneeId}
        {assignedUser}
        {workspaceName}
        {listName}
        {allUsers}
        {tags}
        {priorities}
        {workspaceId}
        onupdatecontent={handleContentChange}
        onselectduedate={handleDueDateSelect}
        onselectpriority={handlePrioritySelect}
        onselecttag={handleTagSelect}
        onselectassignee={handleAssigneeSelect}
        onuploadcover={handleCoverUpload}
      />

      <!-- Body / Tabs -->
      <div
        class="relative flex-1 overflow-y-auto"
        style="scrollbar-width: thin; scrollbar-color: var(--app-border) transparent;"
      >
        <!-- Sticky Navigation Bar -->
        <div class="sticky top-0 z-30 border-b border-[var(--app-border-faint)] bg-[var(--app-bg)] px-6 pt-1 shadow-sm shadow-black/5">
          <CardModalTabs
            {activeTab}
            commentsCount={comments.length}
            ontabchange={(tab) => (activeTab = tab)}
          />

          <ChecklistProgress
            done={checklistCounts.done}
            total={checklistCounts.total}
          />
        </div>

        <!-- Tab Content -->
        <div class="px-6 py-5">
          {#if activeTab === 'description'}
            <DescriptionTab
              {description}
              {savedStatus}
              {history}
              {allUsers}
              {workspaceId}
              onupdatedescription={handleDescriptionChange}
            />
          {:else if activeTab === 'comments'}
            <CommentsTab
              {comments}
              loading={loadingComments}
              {allUsers}
              {currentUserId}
              {currentUserAvatar}
              {workspaceId}
              onpostcomment={handlePostComment}
              ondeletecomment={handleDeleteComment}
              onupdatecomment={handleUpdateComment}
            />
          {:else if activeTab === 'diagram'}
            <DiagramTab
              elements={diagramElements}
              loading={loadingDiagram}
              isSaving={isSavingDiagram}
              onSave={handleSaveDiagram}
              onDelete={handleDeleteDiagram}
            />
          {/if}
        </div>
      </div>

      <!-- Footer -->
      <div
        class="flex shrink-0 items-center justify-between px-6 py-3.5"
        style="border-top: 1px solid var(--app-border-faint);"
      >
        <div class="flex items-center gap-3">
          <img
            src={currentUserAvatar}
            alt="Current User"
            class="h-6 w-6 rounded-[5px] bg-[var(--app-panel)] object-cover"
            style="border: 1.5px solid var(--app-border-faint);"
          />
          <span class="text-[12px] opacity-80" style="color: var(--app-text-muted);">
            Você está editando esta tarefa
          </span>
        </div>

        <!-- Keyboard Legends (Desktop only) -->
        <div class="hidden items-center gap-4 text-[10px] font-black uppercase tracking-widest opacity-40 md:flex" style="color: var(--app-text-muted);">
          <div class="flex items-center gap-1.5 transition-opacity hover:opacity-100">
            <kbd class="rounded-xs border border-[var(--app-border)] bg-[var(--app-panel)] px-1.5 py-0.5">ESC</kbd>
            <span>Fechar</span>
          </div>
          <div class="flex items-center gap-1.5 transition-opacity hover:opacity-100">
            <kbd class="rounded-xs border border-[var(--app-border)] bg-[var(--app-panel)] px-1.5 py-0.5">CTRL + SHIFT + S</kbd>
            <span>Salvar</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            onclick={onClose}
            class="rounded-sm px-4 py-2 text-[13.5px] font-medium text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-panel)] hover:text-[var(--app-text)] focus:outline-none"
          >
            Fechar
          </button>
          <button
            type="button"
            onclick={async () => {
              await handleSave();
              onClose?.();
            }}
            class="flex items-center justify-center gap-2 rounded-sm px-6 py-2 text-[13.5px] font-bold text-white shadow-sm shadow-indigo-950/20 transition-all hover:brightness-110 focus:ring-4 focus:ring-indigo-500/20 focus:outline-none"
            style="background: linear-gradient(135deg, var(--action-emphasis-start) 0%, var(--action-emphasis-end) 100%);"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
