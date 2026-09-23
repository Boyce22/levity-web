<script lang="ts">
  import { goto } from '$app/navigation';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import BoardHeader from '$lib/components/BoardHeader.svelte';
  import BoardFiltersBar from '$lib/components/BoardFiltersBar.svelte';
  import BoardCanvas from '$lib/components/BoardCanvas.svelte';
  import CardModal from '$lib/components/card-modal/CardModal.svelte';
  import ShareWorkspaceModal from '$lib/components/ShareWorkspaceModal.svelte';
  import ProfileModal from '$lib/components/ProfileModal.svelte';
  import CreateWorkspaceModal from '$lib/components/CreateWorkspaceModal.svelte';
  import type { ModalTab } from '$lib/components/card-modal/CardModalTabs.svelte';
  import type { ColumnModel, IssueModel, UserModel, ColumnType } from '$lib/contracts/models';
  import { moveIssueOptimistically } from '$lib/utils/dnd';
  import { showToast } from '$lib/ui/toast';

  let { data } = $props();

  let columns = $state<ColumnModel[]>([]);
  let currentUser = $state<UserModel>({ id: '', username: '' });
  let workspaceUsers = $state<UserModel[]>([]);
  let workspaceAvatarUrl = $state<string | undefined>(undefined);

  // Sync columns from data
  $effect(() => {
    if (data.board?.columns) {
      columns = JSON.parse(JSON.stringify(data.board.columns));
    }
    if (data.currentUser) {
      currentUser = data.currentUser;
    }
    workspaceUsers = data.users;
    workspaceAvatarUrl = data.workspaceAvatarUrl;
  });

  const workspaceUser = $derived({
    ...currentUser,
    avatarUrl: workspaceAvatarUrl || currentUser.avatarUrl,
  });

  const currentWorkspace = $derived(
    data.workspaces.find((w) => w.id === data.board.workspaceId) || {
      id: data.board.workspaceId,
      name: 'Workspace',
    },
  );

  const currentBoardMeta = $derived(data.boards.find((b) => b.id === data.board.id));
  const currentUserRole = $derived(currentBoardMeta?.role || 'MEMBER');
  const canWrite = $derived(currentUserRole !== 'VIEWER');

  // Filters
  let searchQuery = $state('');
  let selectedUserFilters = $state<string[]>([]);
  let priorityFilter = $state<string | null>(null);
  let labelFilter = $state<string | null>(null);

  // Modals state
  let isShareOpen = $state(false);
  let isProfileOpen = $state(false);
  let isCreateWorkspaceOpen = $state(false);
  let editingCard = $state<IssueModel | null>(null);
  let initialCardTab = $state<ModalTab>('description');
  let mutationError = $state<string | null>(null);
  let recentlyCreatedIssueId = $state<string | null>(null);

  const allIssues = $derived(columns.flatMap((c) => c.issues));

  function snapshotColumns() {
    return columns.map((column) => ({ ...column, issues: [...column.issues] }));
  }

  async function responseMessage(response: Response, fallback: string) {
    const payload = await response.json().catch(() => ({}));
    return typeof payload.error === 'string' ? payload.error : fallback;
  }

  const editingCardColumn = $derived(
    editingCard ? columns.find((c) => c.id === editingCard?.columnId) : null,
  );

  // Filtered columns based on search and filters
  const filteredColumns = $derived.by(() => {
    const q = searchQuery.trim().toLowerCase();
    const hasSearch = q.length > 0;
    const hasUser = selectedUserFilters.length > 0;
    const hasPriority = priorityFilter !== null;
    const hasLabel = labelFilter !== null;

    if (!hasSearch && !hasUser && !hasPriority && !hasLabel) {
      return columns;
    }

    return columns.map((col) => ({
      ...col,
      issues: col.issues.filter((issue) => {
        if (hasSearch && !issue.content.toLowerCase().includes(q) && !issue.description?.toLowerCase().includes(q)) {
          return false;
        }
        if (hasUser) {
          const matchUnassigned = selectedUserFilters.includes('unassigned') && !issue.assigneeId;
          const matchUser = issue.assigneeId ? selectedUserFilters.includes(issue.assigneeId) : false;
          if (!matchUnassigned && !matchUser) return false;
        }
        if (hasPriority && issue.priorityId !== priorityFilter) {
          return false;
        }
        if (hasLabel && issue.tagId !== labelFilter) {
          return false;
        }
        return true;
      }),
    }));
  });

  function handleNotificationClick(issueId: string): boolean {
    const found = allIssues.find((i) => i.id === issueId);
    if (found) {
      initialCardTab = 'comments';
      editingCard = found;
      return true;
    }
    return false;
  }

  function handleViewChange(view: string) {
    if (view === 'sprints') {
      goto(`/w/${data.board.workspaceId}/b/${data.board.id}/sprints`);
    } else if (view === 'management') {
      goto(`/w/${data.board.workspaceId}/b/${data.board.id}/management`);
    }
  }

  async function handleCreateWorkspace(name: string) {
    const response = await fetch('/api/workspaces', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || 'Failed to create workspace.');
    }
    const { workspace, board } = await response.json();
    isCreateWorkspaceOpen = false;
    await goto(`/w/${workspace.id}/b/${board.id}`);
  }

  async function handleAddColumn(title: string) {
    mutationError = null;
    try {
      const res = await fetch(`/api/boards/${data.board.id}/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        const newCol = await res.json();
        columns = [
          ...columns,
          {
            id: newCol.id,
            boardId: data.board.id,
            title: newCol.title,
            position: columns.length,
            issues: [],
            wipLimit: null,
            columnType: null,
            createdBy: currentUser.id,
            createdAt: new Date().toISOString(),
          },
        ];
      } else {
        mutationError = await responseMessage(res, 'Não foi possível criar a coluna.');
      }
    } catch {
      mutationError = 'Não foi possível criar a coluna.';
    }
  }

  async function handleDeleteColumn(columnId: string) {
    mutationError = null;
    const prev = snapshotColumns();
    columns = columns.filter((c) => c.id !== columnId);
    try {
      const res = await fetch(`/api/boards/${data.board.id}/columns/${columnId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        columns = prev;
        mutationError = await responseMessage(res, 'Não foi possível excluir a coluna.');
      }
    } catch {
      columns = prev;
      mutationError = 'Não foi possível excluir a coluna.';
    }
  }

  async function handleRenameColumn(columnId: string, newTitle: string) {
    mutationError = null;
    const prev = snapshotColumns();
    columns = columns.map((c) => (c.id === columnId ? { ...c, title: newTitle } : c));
    try {
      const res = await fetch(`/api/boards/${data.board.id}/columns/${columnId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) {
        columns = prev;
        mutationError = await responseMessage(res, 'Não foi possível renomear a coluna.');
      }
    } catch {
      columns = prev;
      mutationError = 'Não foi possível renomear a coluna.';
    }
  }

  async function handleTypeChange(columnId: string, type: ColumnType) {
    mutationError = null;
    const prev = snapshotColumns();
    columns = columns.map((c) => (c.id === columnId ? { ...c, columnType: type } : c));
    try {
      const res = await fetch(`/api/boards/${data.board.id}/columns/${columnId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ column_type: type }),
      });
      if (!res.ok) {
        columns = prev;
        mutationError = await responseMessage(res, 'Não foi possível atualizar o tipo da coluna.');
      }
    } catch {
      columns = prev;
      mutationError = 'Não foi possível atualizar o tipo da coluna.';
    }
  }

  async function handleWipLimitChange(columnId: string, wip: number | null) {
    mutationError = null;
    const prev = snapshotColumns();
    columns = columns.map((c) => (c.id === columnId ? { ...c, wipLimit: wip } : c));
    try {
      const res = await fetch(`/api/boards/${data.board.id}/columns/${columnId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wip_limit: wip }),
      });
      if (!res.ok) {
        columns = prev;
        mutationError = await responseMessage(res, 'Não foi possível atualizar o limite WIP.');
      }
    } catch {
      columns = prev;
      mutationError = 'Não foi possível atualizar o limite WIP.';
    }
  }

  async function handleAddCard(columnId: string, cardContent: string) {
    mutationError = null;
    try {
      const res = await fetch(`/api/boards/${data.board.id}/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: cardContent,
          column_id: columnId,
        }),
      });
      if (res.ok) {
        const newIssue: IssueModel = await res.json();
        columns = columns.map((c) =>
          c.id === columnId ? { ...c, issues: [...c.issues, newIssue] } : c,
        );
        recentlyCreatedIssueId = newIssue.id;
        showToast('Tarefa criada.', 'success');
        window.setTimeout(() => {
          if (recentlyCreatedIssueId === newIssue.id) recentlyCreatedIssueId = null;
        }, 1800);
      } else {
        mutationError = await responseMessage(res, 'Não foi possível criar a issue.');
      }
    } catch {
      mutationError = 'Não foi possível criar a issue.';
    }
  }

  async function handleDeleteCard(cardId: string) {
    mutationError = null;
    const prev = snapshotColumns();
    columns = columns.map((col) => ({
      ...col,
      issues: col.issues.filter((i) => i.id !== cardId),
    }));

    try {
      const res = await fetch(`/api/boards/${data.board.id}/issues/${cardId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        columns = prev;
        mutationError = await responseMessage(res, 'Não foi possível excluir a issue.');
      }
    } catch {
      columns = prev;
      mutationError = 'Não foi possível excluir a issue.';
    }
  }

  async function handleCardUpdate(updatedCard: IssueModel) {
    columns = columns.map((col) => ({
      ...col,
      issues: col.issues.map((i) => (i.id === updatedCard.id ? updatedCard : i)),
    }));
    editingCard = updatedCard;
  }

  async function handleMoveIssue(issueId: string, targetColumnId: string, targetIndex: number) {
    mutationError = null;
    const previousColumns = snapshotColumns();

    const moveResult = moveIssueOptimistically(columns, issueId, targetColumnId, targetIndex);
    if (!moveResult.success) {
      return;
    }

    columns = moveResult.columns;

    try {
      const res = await fetch(`/api/boards/${data.board.id}/issues/positions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          {
            id: issueId,
            position: targetIndex,
            column_id: targetColumnId,
          },
        ]),
      });

      if (!res.ok) {
        columns = previousColumns;
        mutationError = await responseMessage(res, 'Não foi possível mover a issue.');
        showToast(mutationError ?? 'Não foi possível mover a tarefa.', 'error');
      } else {
        showToast('Tarefa movida.', 'success');
      }
    } catch {
      columns = previousColumns;
      mutationError = 'Não foi possível mover a issue.';
      showToast(mutationError, 'error');
    }
  }
</script>

<div class="flex h-screen overflow-hidden bg-[var(--app-bg)] font-sans text-slate-200 antialiased">
  <!-- Sidebar -->
  <Sidebar
    workspaces={data.workspaces}
    currentWorkspaceId={data.board.workspaceId}
    currentWorkspaceName={currentWorkspace?.name}
    boards={data.boards}
    currentBoardId={data.board.id}
    userProfile={workspaceUser}
    userRole={currentUserRole}
    activeView="board"
    onOpenProfile={() => (isProfileOpen = true)}
    onOpenCreateWorkspace={() => (isCreateWorkspaceOpen = true)}
    onViewChange={handleViewChange}
  />

  <!-- Main Canvas Area -->
  <main class="relative flex min-w-0 flex-1 flex-col overflow-hidden">
    <!-- Header -->
    <BoardHeader
      workspaceName={currentWorkspace?.name}
      boardName={data.board.name}
      {columns}
      issues={allIssues}
      activeView="board"
      userRole={currentUserRole}
      onOpenShare={() => (isShareOpen = true)}
      onNotificationClick={handleNotificationClick}
    />

    <!-- Filters Bar -->
    <div class="relative flex flex-1 flex-col overflow-hidden">
      {#if mutationError}
        <p role="alert" class="mx-6 mt-3 rounded-sm border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {mutationError}
        </p>
      {/if}
      <BoardFiltersBar
        bind:searchQuery
        bind:selectedUserFilters
        bind:priorityFilter
        bind:labelFilter
        allUsers={workspaceUsers}
        tags={data.tags}
        priorities={data.priorities}
      />

      <!-- Kanban Canvas -->
      <BoardCanvas
        columns={filteredColumns}
        priorities={data.priorities}
        tags={data.tags}
        allUsers={workspaceUsers}
        {canWrite}
        {recentlyCreatedIssueId}
        oncardclick={(card) => {
          initialCardTab = 'description';
          editingCard = card;
        }}
        oncarddelete={handleDeleteCard}
        onaddcard={handleAddCard}
        onaddcolumn={handleAddColumn}
        ondeletecolumn={handleDeleteColumn}
        onrenamecolumn={handleRenameColumn}
        ontypechange={handleTypeChange}
        onwiplimitchange={handleWipLimitChange}
        onmoveissue={handleMoveIssue}
      />
    </div>
  </main>

  <!-- Modals -->
  {#if editingCard}
    <CardModal
      card={editingCard}
      boardId={data.board.id}
      workspaceId={data.board.workspaceId}
      workspaceName={currentWorkspace?.name ?? 'Workspace'}
      listName={editingCardColumn?.title ?? 'List'}
      allUsers={workspaceUsers}
      tags={data.tags}
      priorities={data.priorities}
      currentUserId={currentUser.id}
      currentUserAvatar={workspaceUser.avatarUrl}
      initialTab={initialCardTab}
      onClose={() => (editingCard = null)}
      onUpdate={handleCardUpdate}
    />
  {/if}

  <ShareWorkspaceModal
    isOpen={isShareOpen}
    workspaceId={data.board.workspaceId}
    workspaceName={currentWorkspace?.name}
    currentBoardId={data.board.id}
    boards={data.boards}
    onClose={() => (isShareOpen = false)}
  />

  <ProfileModal
    isOpen={isProfileOpen}
    profile={currentUser}
    workspaceId={data.board.workspaceId}
    workspaceName={currentWorkspace?.name}
    workspaceAvatarUrl={workspaceAvatarUrl}
    onClose={() => (isProfileOpen = false)}
    onProfileUpdated={(updated) => {
      currentUser = updated;
    }}
    onWorkspaceAvatarUpdated={(updated) => {
      workspaceAvatarUrl = updated;
      workspaceUsers = workspaceUsers.map((user) =>
        user.id === currentUser.id ? { ...user, avatarUrl: updated } : user,
      );
    }}
  />

  <CreateWorkspaceModal isOpen={isCreateWorkspaceOpen} onclose={() => (isCreateWorkspaceOpen = false)} oncreate={handleCreateWorkspace} />
</div>
