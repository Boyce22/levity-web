<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import {
    Zap,
    Calendar,
    Plus,
    AlertCircle,
    Check,
    Trash2,
    Play,
    X,
    Target,
  } from 'lucide-svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import BoardHeader from '$lib/components/BoardHeader.svelte';
  import ShareWorkspaceModal from '$lib/components/ShareWorkspaceModal.svelte';
  import ProfileModal from '$lib/components/ProfileModal.svelte';
  import type { UserModel, SprintModel } from '$lib/contracts/models';
  import { showToast } from '$lib/ui/toast';

  let { data, form } = $props();

  let isCreating = $state(false);
  let editingSprint = $state<SprintModel | null>(null);
  let completingSprint = $state<SprintModel | null>(null);
  let isShareOpen = $state(false);
  let isProfileOpen = $state(false);
  let currentUser = $derived<UserModel>(data.currentUser);
  let workspaceAvatarUrl = $state<string | undefined>(undefined);
  let lastFormMessage = $state('');

  $effect(() => {
    workspaceAvatarUrl = data.workspaceAvatarUrl;
  });

  const workspaceUser = $derived({
    ...currentUser,
    avatarUrl: workspaceAvatarUrl || currentUser.avatarUrl,
  });

  $effect(() => {
    const message = form?.error || form?.success;
    if (!message || message === lastFormMessage) return;
    lastFormMessage = message;
    showToast(message, form?.error ? 'error' : 'success');
  });

  const currentWorkspace = $derived(
    data.workspaces.find((w) => w.id === data.workspaceId) || {
      id: data.workspaceId,
      name: 'Workspace',
    },
  );

  const currentBoardMeta = $derived(data.boards.find((b) => b.id === data.boardId));
  const currentUserRole = $derived(currentBoardMeta?.role || 'MEMBER');

  const activeSprint = $derived(data.sprints.find((s: SprintModel) => s.status === 'ACTIVE'));
  const planningSprints = $derived(data.sprints.filter((s: SprintModel) => s.status === 'PLANNING'));
  const completedSprints = $derived(data.sprints.filter((s: SprintModel) => s.status === 'COMPLETED'));

  function handleViewChange(view: string) {
    if (view === 'board') {
      goto(`/w/${data.workspaceId}/b/${data.boardId}`);
    } else if (view === 'management') {
      goto(`/w/${data.workspaceId}/b/${data.boardId}/management`);
    }
  }

  function formatDate(dStr: string) {
    try {
      return new Date(dStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dStr;
    }
  }
</script>

<div class="flex h-screen overflow-hidden bg-[var(--app-bg)] font-sans text-slate-200 antialiased">
  <!-- Sidebar -->
  <Sidebar
    workspaces={data.workspaces}
    currentWorkspaceId={data.workspaceId}
    currentWorkspaceName={currentWorkspace?.name}
    boards={data.boards}
    currentBoardId={data.boardId}
    userProfile={workspaceUser}
    userRole={currentUserRole}
    activeView="sprints"
    onOpenProfile={() => (isProfileOpen = true)}
    onViewChange={handleViewChange}
  />

  <!-- Main Content Area -->
  <main class="relative flex min-w-0 flex-1 flex-col overflow-hidden">
    <BoardHeader
      workspaceName={currentWorkspace?.name}
      boardName="Sprints"
      activeView="sprints"
      userRole={currentUserRole}
      onOpenShare={() => (isShareOpen = true)}
    />

    <!-- Sprints Container -->
    <div class="flex-1 overflow-y-auto p-8" style="scrollbar-width: thin; scrollbar-color: var(--app-border) transparent;">
      <div class="mx-auto max-w-5xl space-y-8">
        <!-- Header Banner -->
        <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div class="flex items-center gap-3">
            <div class="rounded-sm border border-amber-500/20 bg-amber-500/10 p-2.5 text-amber-400 shadow-sm">
              <Zap class="h-6 w-6" />
            </div>
            <div>
              <h1 class="text-2xl font-bold tracking-tight text-[var(--app-text)]">Sprints</h1>
              <p class="text-sm text-[var(--app-text-muted)]">
                Planeje ciclos, acompanhe a velocidade e alcance os objetivos do time.
              </p>
            </div>
          </div>

          <button
            type="button"
            onclick={() => (isCreating = true)}
            class="flex items-center gap-2 rounded-sm px-4 py-2.5 text-[13px] font-bold text-white shadow-sm shadow-indigo-950/20 transition-all hover:brightness-110 focus:ring-4 focus:ring-indigo-500/20"
            style="background: linear-gradient(135deg, var(--app-primary, #4f46e5) 0%, #312e81 100%);"
          >
            <Plus class="h-4 w-4" /> Novo sprint
          </button>
        </div>

        {#if form?.error}
          <div class="flex items-center gap-2 rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
            <AlertCircle class="h-4 w-4 shrink-0" />
            <span>{form.error}</span>
          </div>
        {/if}

        {#if form?.success}
          <div class="flex items-center gap-2 rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400">
            <Check class="h-4 w-4 shrink-0" />
            <span>{form.success}</span>
          </div>
        {/if}

        <!-- Active Sprint Hero Card -->
        {#if activeSprint}
          <div class="relative overflow-hidden rounded-sm border border-emerald-500/30 bg-gradient-to-br from-[var(--app-panel)] to-emerald-950/20 p-6 shadow-md">
            <div class="mb-4 flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                  <span class="h-2 w-2 animate-pulse rounded-full bg-emerald-400"></span> Sprint ativo
                </span>
                <h2 class="text-xl font-bold text-[var(--app-text)]">{activeSprint.name}</h2>
              </div>

              <div class="flex items-center gap-2 text-xs text-[var(--app-text-muted)]">
                <Calendar class="h-3.5 w-3.5" />
                <span>{formatDate(activeSprint.startDate)} – {formatDate(activeSprint.endDate)}</span>
              </div>
            </div>

            {#if activeSprint.goal}
              <p class="mb-4 text-sm text-[var(--app-text-muted)]">
                <strong class="text-[var(--app-text)]">Objetivo:</strong> {activeSprint.goal}
              </p>
            {/if}

            <!-- Progress Bar -->
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs font-semibold">
                <span class="text-[var(--app-text-muted)]">
                  Progresso ({activeSprint.completedIssues ?? 0} de {activeSprint.totalIssues ?? 0} tarefas)
                </span>
                <span class="text-emerald-400 font-bold">{activeSprint.progressPercent ?? 0}%</span>
              </div>
              <div class="h-2 w-full overflow-hidden rounded-full bg-[var(--app-bg)]">
                <div
                  class="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style="width: {activeSprint.progressPercent ?? 0}%;"
                ></div>
              </div>
            </div>
            <button
              type="button"
              onclick={() => (completingSprint = activeSprint)}
              class="mt-5 rounded-sm border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-300 transition-colors hover:bg-emerald-500/10"
            >
              Concluir sprint
            </button>
          </div>
        {/if}

        <!-- Planning Sprints Section -->
        <div class="space-y-4">
          <h3 class="text-base font-bold text-[var(--app-text)]">Sprints planejados ({planningSprints.length})</h3>

          {#if planningSprints.length === 0}
            <div class="flex flex-col items-center justify-center rounded-sm border border-dashed border-[var(--app-border)] bg-[var(--app-panel)]/50 p-8 text-center text-[var(--app-text-muted)]">
              <Target class="mb-2 h-6 w-6 opacity-40" />
              <p class="text-sm font-bold text-[var(--app-text)]">Não há sprints planejados</p>
              <p class="text-xs opacity-75">Crie um sprint para organizar os próximos ciclos.</p>
            </div>
          {:else}
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              {#each planningSprints as sprint (sprint.id)}
                <div class="flex flex-col justify-between rounded-sm border border-[var(--app-border)] bg-[var(--app-panel)] p-5 shadow-sm transition-all hover:border-[var(--app-primary)]/40">
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="rounded-xs bg-[var(--app-bg)] px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase text-[var(--app-text-muted)]">
                        Planejamento
                      </span>
                      <span class="flex items-center gap-1 text-[11px] text-[var(--app-text-muted)]">
                        <Calendar class="h-3 w-3" />
                        {formatDate(sprint.startDate)} – {formatDate(sprint.endDate)}
                      </span>
                    </div>

                    <h4 class="text-base font-bold text-[var(--app-text)]">{sprint.name}</h4>
                    {#if sprint.goal}
                      <p class="text-xs text-[var(--app-text-muted)] line-clamp-2">{sprint.goal}</p>
                    {/if}
                  </div>

                  <div class="mt-4 flex items-center justify-between border-t border-[var(--app-border-faint)] pt-3">
                    <span class="text-xs text-[var(--app-text-muted)]">
                      Modo: <strong class="text-[var(--app-text)]">{sprint.trackingMode}</strong>
                    </span>

                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        onclick={() => (editingSprint = sprint)}
                        class="rounded-sm px-2 py-1.5 text-xs font-bold text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-bg)] hover:text-[var(--app-text)]"
                      >
                        Editar
                      </button>
                      <form method="POST" action="?/activate" use:enhance>
                        <input type="hidden" name="id" value={sprint.id} />
                        <button
                          type="submit"
                          class="flex items-center gap-1.5 rounded-sm bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition-all hover:brightness-110"
                        >
                          <Play class="h-3 w-3 fill-white" /> Ativar
                        </button>
                      </form>

                      <form method="POST" action="?/delete" use:enhance>
                        <input type="hidden" name="id" value={sprint.id} />
                        <button
                          type="submit"
                          class="rounded-sm p-1.5 text-[var(--app-text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                          title="Excluir sprint"
                        >
                          <Trash2 class="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Completed Sprints Section -->
        {#if completedSprints.length > 0}
          <div class="space-y-4">
            <h3 class="text-base font-bold text-[var(--app-text)]">Sprints concluídos ({completedSprints.length})</h3>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              {#each completedSprints as sprint (sprint.id)}
                <div class="rounded-sm border border-[var(--app-border-faint)] bg-[var(--app-panel)]/60 p-4 opacity-80">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-emerald-400">Concluído</span>
                    <span class="text-xs text-[var(--app-text-muted)]">
                      {formatDate(sprint.startDate)} – {formatDate(sprint.endDate)}
                    </span>
                  </div>
                  <h4 class="mt-1 font-bold text-[var(--app-text)]">{sprint.name}</h4>
                  <div class="mt-2 text-xs text-[var(--app-text-muted)]">
                    Concluídas: {sprint.completedIssues ?? 0}/{sprint.totalIssues ?? 0} tarefas ({sprint.progressPercent ?? 0}%)
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </main>

  <!-- Create Sprint Modal -->
  {#if isCreating}
    <div class="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        class="absolute inset-0 block h-full w-full cursor-default border-0 p-0"
        style="background: rgba(0,0,0,0.75); backdrop-filter: blur(12px);"
        onclick={() => (isCreating = false)}
        aria-label="Close modal"
      ></button>

      <div class="relative z-10 w-full max-w-lg rounded-sm border border-[var(--app-border)] bg-[var(--app-bg)] p-6 shadow-2xl">
        <div class="mb-5 flex items-center justify-between">
          <h2 class="text-lg font-bold text-[var(--app-text)]">Criar sprint</h2>
          <button
            type="button"
            onclick={() => (isCreating = false)}
            class="rounded-sm p-1 text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <form
          method="POST"
          action="?/create"
          use:enhance={() => async ({ update }) => {
            await update();
            isCreating = false;
          }}
          class="space-y-4"
        >
          <div>
            <label for="sprint-name" class="mb-1 block text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-wider">
              Nome do sprint
            </label>
            <input
              id="sprint-name"
              name="name"
              required
              maxlength="100"
              placeholder="e.g. Sprint 1 - Core MVP"
              class="w-full rounded-sm border border-[var(--app-border)] bg-[var(--app-panel)] px-3 py-2 text-sm text-[var(--app-text)] focus:border-[var(--app-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label for="sprint-goal" class="mb-1 block text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-wider">
              Objetivo do sprint
            </label>
            <textarea
              id="sprint-goal"
              name="goal"
              rows="3"
              maxlength="500"
              placeholder="Qual é o objetivo deste sprint?"
              class="w-full rounded-sm border border-[var(--app-border)] bg-[var(--app-panel)] px-3 py-2 text-sm text-[var(--app-text)] focus:border-[var(--app-primary)] focus:outline-none"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="sprint-start" class="mb-1 block text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-wider">
                Data de início
              </label>
              <input
                id="sprint-start"
                name="start_date"
                type="date"
                required
                class="w-full rounded-sm border border-[var(--app-border)] bg-[var(--app-panel)] px-3 py-2 text-sm text-[var(--app-text)] focus:border-[var(--app-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label for="sprint-end" class="mb-1 block text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-wider">
                Data de término
              </label>
              <input
                id="sprint-end"
                name="end_date"
                type="date"
                required
                class="w-full rounded-sm border border-[var(--app-border)] bg-[var(--app-panel)] px-3 py-2 text-sm text-[var(--app-text)] focus:border-[var(--app-primary)] focus:outline-none"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="sprint-tracking" class="mb-1 block text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-wider">
                Modo de acompanhamento
              </label>
              <select
                id="sprint-tracking"
                name="tracking_mode"
                class="w-full rounded-sm border border-[var(--app-border)] bg-[var(--app-panel)] px-3 py-2 text-sm text-[var(--app-text)] focus:border-[var(--app-primary)] focus:outline-none"
              >
                <option value="POINTS">Story Points</option>
                <option value="COUNT">Issue Count</option>
                <option value="HOURS">Hours</option>
              </select>
            </div>
            <div>
              <label for="sprint-capacity" class="mb-1 block text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-wider">
                Pontos de capacidade
              </label>
              <input
                id="sprint-capacity"
                name="capacity_points"
                type="number"
                min="1"
                placeholder="Opcional"
                class="w-full rounded-sm border border-[var(--app-border)] bg-[var(--app-panel)] px-3 py-2 text-sm text-[var(--app-text)] focus:border-[var(--app-primary)] focus:outline-none"
              />
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3 border-t border-[var(--app-border-faint)] pt-4">
            <button
              type="button"
              onclick={() => (isCreating = false)}
              class="rounded-sm px-4 py-2 text-sm font-medium text-[var(--app-text-muted)] transition-colors hover:text-[var(--app-text)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="rounded-sm px-5 py-2 text-sm font-bold text-white shadow-sm shadow-indigo-950/20 transition-all hover:brightness-110 focus:ring-4 focus:ring-indigo-500/20"
              style="background: linear-gradient(135deg, var(--app-primary, #4f46e5) 0%, #312e81 100%);"
            >
              Criar sprint
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  {#if editingSprint}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" class="absolute inset-0 border-0 bg-black/75" aria-label="Close edit modal" onclick={() => (editingSprint = null)}></button>
      <form method="POST" action="?/update" use:enhance={() => async ({ update }) => { await update(); editingSprint = null; }} class="relative z-10 w-full max-w-lg space-y-4 rounded-sm border border-[var(--app-border)] bg-[var(--app-bg)] p-6 shadow-2xl">
        <input type="hidden" name="id" value={editingSprint.id} />
        <h2 class="text-lg font-bold text-[var(--app-text)]">Editar sprint</h2>
        <input name="name" required maxlength="100" value={editingSprint.name} class="w-full rounded-sm border border-[var(--app-border)] bg-[var(--app-panel)] px-3 py-2 text-sm text-[var(--app-text)]" />
        <textarea name="goal" rows="3" maxlength="500" class="w-full rounded-sm border border-[var(--app-border)] bg-[var(--app-panel)] px-3 py-2 text-sm text-[var(--app-text)]">{editingSprint.goal || ''}</textarea>
        <div class="grid grid-cols-2 gap-4">
          <input name="start_date" type="date" required value={editingSprint.startDate.slice(0, 10)} class="rounded-sm border border-[var(--app-border)] bg-[var(--app-panel)] px-3 py-2 text-sm text-[var(--app-text)]" />
          <input name="end_date" type="date" required value={editingSprint.endDate.slice(0, 10)} class="rounded-sm border border-[var(--app-border)] bg-[var(--app-panel)] px-3 py-2 text-sm text-[var(--app-text)]" />
        </div>
        <select name="tracking_mode" value={editingSprint.trackingMode} class="w-full rounded-sm border border-[var(--app-border)] bg-[var(--app-panel)] px-3 py-2 text-sm text-[var(--app-text)]">
          <option value="POINTS">Story Points</option><option value="COUNT">Issue Count</option><option value="HOURS">Hours</option>
        </select>
        <div class="flex justify-end gap-3"><button type="button" onclick={() => (editingSprint = null)} class="px-4 py-2 text-sm text-[var(--app-text-muted)]">Cancelar</button><button type="submit" class="rounded-sm bg-[var(--app-primary)] px-5 py-2 text-sm font-bold text-white">Salvar</button></div>
      </form>
    </div>
  {/if}

  {#if completingSprint}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" class="absolute inset-0 border-0 bg-black/75" aria-label="Close completion modal" onclick={() => (completingSprint = null)}></button>
      <form method="POST" action="?/complete" use:enhance={() => async ({ update }) => { await update(); completingSprint = null; }} class="relative z-10 w-full max-w-md space-y-4 rounded-sm border border-[var(--app-border)] bg-[var(--app-bg)] p-6 shadow-2xl">
        <input type="hidden" name="id" value={completingSprint.id} />
        <h2 class="text-lg font-bold text-[var(--app-text)]">Concluir {completingSprint.name}</h2>
        <p class="text-sm text-[var(--app-text-muted)]">Opcionalmente, leve tarefas não concluídas para um sprint planejado.</p>
        <select name="to_sprint_id" class="w-full rounded-sm border border-[var(--app-border)] bg-[var(--app-panel)] px-3 py-2 text-sm text-[var(--app-text)]">
          <option value="">Do not carry over issues</option>
          {#each planningSprints as sprint (sprint.id)}<option value={sprint.id}>{sprint.name}</option>{/each}
        </select>
        <div class="flex justify-end gap-3"><button type="button" onclick={() => (completingSprint = null)} class="px-4 py-2 text-sm text-[var(--app-text-muted)]">Cancelar</button><button type="submit" class="rounded-sm bg-emerald-600 px-5 py-2 text-sm font-bold text-white">Concluir</button></div>
      </form>
    </div>
  {/if}

  <ShareWorkspaceModal
    isOpen={isShareOpen}
    workspaceId={data.workspaceId}
    workspaceName={currentWorkspace?.name}
    currentBoardId={data.boardId}
    boards={data.boards}
    onClose={() => (isShareOpen = false)}
  />

  <ProfileModal
    isOpen={isProfileOpen}
    profile={currentUser}
    workspaceId={data.workspaceId}
    workspaceName={currentWorkspace?.name}
    workspaceAvatarUrl={workspaceAvatarUrl}
    onClose={() => (isProfileOpen = false)}
    onProfileUpdated={(updated) => {
      currentUser = updated;
    }}
    onWorkspaceAvatarUpdated={(updated) => {
      workspaceAvatarUrl = updated;
    }}
  />
</div>
