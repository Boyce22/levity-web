<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import {
    Users,
    Mail,
    Trash2,
    Copy,
    Check,
    Plus,
    Tag,
    AlertCircle,
  } from 'lucide-svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import BoardHeader from '$lib/components/BoardHeader.svelte';
  import ShareWorkspaceModal from '$lib/components/ShareWorkspaceModal.svelte';
  import ProfileModal from '$lib/components/ProfileModal.svelte';
  import type { UserModel } from '$lib/contracts/models';
  import { showToast } from '$lib/ui/toast';

  let { data, form } = $props();

  let activeTab = $state<'members' | 'invites' | 'catalog'>('members');
  let isShareOpen = $state(false);
  let isProfileOpen = $state(false);
  let currentUser = $derived<UserModel>(data.currentUser);
  let workspaceAvatarUrl = $state<string | undefined>(undefined);
  let copiedToken = $state<string | null>(null);

  $effect(() => {
    workspaceAvatarUrl = data.workspaceAvatarUrl;
  });

  const workspaceUser = $derived({
    ...currentUser,
    avatarUrl: workspaceAvatarUrl || currentUser.avatarUrl,
  });

  // New tag / priority forms
  let isAddingTag = $state(false);
  let isAddingPriority = $state(false);
  let lastFormMessage = $state('');

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

  function handleViewChange(view: string) {
    if (view === 'board') {
      goto(`/w/${data.workspaceId}/b/${data.boardId}`);
    } else if (view === 'sprints') {
      goto(`/w/${data.workspaceId}/b/${data.boardId}/sprints`);
    }
  }

  function handleCopyInvite(token: string) {
    const url = `${window.location.origin}/invite/${data.workspaceId}/${token}`;
    navigator.clipboard.writeText(url);
    copiedToken = token;
    showToast('Link de convite copiado.', 'success');
    setTimeout(() => (copiedToken = null), 2000);
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
    activeView="management"
    onOpenProfile={() => (isProfileOpen = true)}
    onViewChange={handleViewChange}
  />

  <!-- Main Content Area -->
  <main class="relative flex min-w-0 flex-1 flex-col overflow-hidden">
    <BoardHeader
      workspaceName={currentWorkspace?.name}
      boardName="Gestão do workspace"
      activeView="management"
      userRole={currentUserRole}
      onOpenShare={() => (isShareOpen = true)}
    />

    <!-- Scrollable Workspace Management Body -->
    <div class="flex-1 overflow-y-auto p-8" style="scrollbar-width: thin; scrollbar-color: var(--app-border) transparent;">
      <div class="mx-auto max-w-4xl space-y-8">
        <!-- Header Banner -->
        <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div class="flex items-center gap-3">
            <div class="rounded-sm border border-indigo-500/20 bg-indigo-500/10 p-2.5 text-indigo-400 shadow-sm">
              <Users class="h-6 w-6" />
            </div>
            <div>
              <h1 class="text-2xl font-bold tracking-tight text-[var(--app-text)]">Gestão do workspace</h1>
              <p class="text-sm text-[var(--app-text-muted)]">
                Gerencie membros, links de convite, etiquetas e prioridades.
              </p>
            </div>
          </div>

          <button
            type="button"
            onclick={() => (isShareOpen = true)}
            class="flex items-center gap-2 rounded-sm px-4 py-2.5 text-[13px] font-bold text-white shadow-sm shadow-indigo-950/20 transition-all hover:brightness-110 focus:ring-4 focus:ring-indigo-500/20"
            style="background: linear-gradient(135deg, var(--app-primary, #4f46e5) 0%, #312e81 100%);"
          >
            <Plus class="h-4 w-4" /> Convidar membros
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

        <section class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <form method="POST" action="?/renameWorkspace" use:enhance class="rounded-sm border border-[var(--app-border)] bg-[var(--app-panel)] p-5 shadow-sm">
            <h2 class="mb-4 text-sm font-bold text-[var(--app-text)]">Workspace</h2>
            <label class="text-[11px] font-bold tracking-wider text-[var(--app-text-muted)] uppercase">Nome
              <input name="name" value={currentWorkspace.name} maxlength="100" required class="mt-2 w-full rounded-sm border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-text)] focus:border-[var(--app-primary)] focus:outline-none" />
            </label>
            <button type="submit" class="mt-3 rounded-sm bg-[var(--app-primary)] px-3 py-2 text-xs font-bold text-white hover:brightness-110">Salvar workspace</button>
          </form>

          <div class="rounded-sm border border-[var(--app-border)] bg-[var(--app-panel)] p-5 shadow-sm">
            <h2 class="mb-4 text-sm font-bold text-[var(--app-text)]">Quadros</h2>
            <form method="POST" action="?/createBoard" use:enhance class="flex gap-2">
              <input name="name" maxlength="100" required placeholder="Nome do novo quadro" class="min-w-0 flex-1 rounded-sm border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-text)] focus:border-[var(--app-primary)] focus:outline-none" />
              <button type="submit" class="rounded-sm bg-[var(--app-primary)] px-3 py-2 text-xs font-bold text-white hover:brightness-110">Criar</button>
            </form>
            <div class="mt-4 space-y-2">
              {#each data.boards as board (board.id)}
                <div class="flex items-center gap-2 rounded-sm border border-[var(--app-border-faint)] bg-[var(--app-bg)]/50 p-2">
                  <form method="POST" action="?/renameBoard" use:enhance class="min-w-0 flex flex-1 gap-2">
                    <input type="hidden" name="id" value={board.id} />
                    <input name="name" value={board.name} maxlength="100" required class="min-w-0 flex-1 bg-transparent px-1 text-xs font-bold text-[var(--app-text)] focus:outline-none" />
                    <button type="submit" class="text-xs font-bold text-[var(--app-primary)]">Salvar</button>
                  </form>
                  <form method="POST" action="?/selfGrantBoard" use:enhance>
                    <input type="hidden" name="id" value={board.id} />
                    <button type="submit" class="rounded-sm border border-[var(--app-border)] px-2 py-1 text-[10px] font-bold text-[var(--app-text-muted)] hover:bg-[var(--app-hover)]">Restaurar acesso</button>
                  </form>
                </div>
              {/each}
            </div>
          </div>
        </section>

        <!-- Tabs -->
        <div class="flex border-b border-[var(--app-border-faint)]">
          <button
            type="button"
            onclick={() => (activeTab = 'members')}
            class="relative flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-colors {activeTab === 'members' ? 'border-[var(--app-primary)] text-[var(--app-text)]' : 'border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)]'}"
          >
            <Users class="h-4 w-4" />
            <span>Membros</span>
            <span class="rounded-full bg-[var(--app-panel)] px-2 py-0.5 text-xs font-bold text-[var(--app-text-muted)]">
              {data.members.length}
            </span>
          </button>

          <button
            type="button"
            onclick={() => (activeTab = 'invites')}
            class="relative flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-colors {activeTab === 'invites' ? 'border-[var(--app-primary)] text-[var(--app-text)]' : 'border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)]'}"
          >
            <Mail class="h-4 w-4" />
            <span>Convites pendentes</span>
            <span class="rounded-full bg-[var(--app-panel)] px-2 py-0.5 text-xs font-bold text-[var(--app-text-muted)]">
              {data.invites.length}
            </span>
          </button>

          <button
            type="button"
            onclick={() => (activeTab = 'catalog')}
            class="relative flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-colors {activeTab === 'catalog' ? 'border-[var(--app-primary)] text-[var(--app-text)]' : 'border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)]'}"
          >
            <Tag class="h-4 w-4" />
            <span>Etiquetas e prioridades</span>
          </button>
        </div>

        <!-- Members Tab Content -->
        {#if activeTab === 'members'}
          <div class="rounded-sm border border-[var(--app-border)] bg-[var(--app-panel)] shadow-sm">
            <div class="divide-y divide-[var(--app-border-faint)]">
              {#each data.members as member (member.id)}
                {@const user = member.user}
                <div class="flex items-center justify-between p-4 transition-colors hover:bg-[var(--app-bg)]/40">
                  <div class="flex items-center gap-3">
                    <img
                      src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || member.userId}`}
                      alt={user?.displayName || user?.username || 'Usuário'}
                      class="h-10 w-10 rounded-sm border border-[var(--app-border-faint)] bg-[var(--app-bg)] object-cover"
                    />
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-[var(--app-text)]">
                          {user?.displayName || user?.username || 'Membro do workspace'}
                        </span>
                        {#if member.userId === currentUser.id}
                          <span class="rounded-xs bg-[var(--app-primary)]/15 px-1.5 py-0.5 text-[10px] font-bold text-[var(--app-primary)]">
                            Você
                          </span>
                        {/if}
                      </div>
                      <span class="text-xs text-[var(--app-text-muted)]">
                        {user?.email || `@${user?.username || member.userId}`}
                      </span>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <!-- Role badge / form -->
                    <span class="rounded-sm border border-[var(--app-border)] bg-[var(--app-bg)] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                      {member.role}
                    </span>

                    {#if member.userId !== currentUser.id && member.role !== 'OWNER'}
                      <form method="POST" action="?/removeMember" use:enhance>
                        <input type="hidden" name="id" value={member.id} />
                        <button
                          type="submit"
                          class="rounded-sm p-1.5 text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                          title="Remover membro"
                        >
                          <Trash2 class="h-4 w-4" />
                        </button>
                      </form>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Pending Invites Tab Content -->
        {#if activeTab === 'invites'}
          <div class="rounded-sm border border-[var(--app-border)] bg-[var(--app-panel)] shadow-sm">
            {#if data.invites.length === 0}
              <div class="flex flex-col items-center justify-center p-12 text-center text-[var(--app-text-muted)]">
                <Mail class="mb-3 h-8 w-8 opacity-40" />
                <p class="font-bold text-[var(--app-text)]">Não há convites pendentes</p>
                <p class="text-xs opacity-75">Gere links de convite para receber novos membros.</p>
              </div>
            {:else}
              <div class="divide-y divide-[var(--app-border-faint)]">
                {#each data.invites as invite (invite.id)}
                  <div class="flex items-center justify-between p-4 transition-colors hover:bg-[var(--app-bg)]/40">
                    <div class="space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="rounded-xs border border-[var(--app-border)] bg-[var(--app-bg)] px-2 py-0.5 text-xs font-mono text-[var(--app-text)]">
                          {invite.token.slice(0, 16)}…
                        </span>
                        <span class="text-xs font-semibold text-[var(--app-text-muted)]">
                          Função: {invite.workspace_role || invite.role || 'MEMBER'}
                        </span>
                      </div>
                      <p class="text-xs text-[var(--app-text-muted)]">
                        Usado {invite.current_uses ?? 0} / {invite.max_uses} vezes
                        {#if invite.expires_at}
                          · Expira em {new Date(invite.expires_at).toLocaleDateString('pt-BR')}
                        {/if}
                      </p>
                    </div>

                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        onclick={() => handleCopyInvite(invite.token)}
                        class="flex items-center gap-1.5 rounded-sm border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-1.5 text-xs font-bold text-[var(--app-text)] transition-colors hover:bg-[var(--app-panel)]"
                      >
                        {#if copiedToken === invite.token}
                          <Check class="h-3.5 w-3.5 text-emerald-400" />
                          <span class="text-emerald-400">Copiado!</span>
                        {:else}
                          <Copy class="h-3.5 w-3.5" />
                          <span>Copiar link</span>
                        {/if}
                      </button>

                      <form method="POST" action="?/revokeInvite" use:enhance>
                        <input type="hidden" name="id" value={invite.id} />
                        <button
                          type="submit"
                          class="rounded-sm p-1.5 text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                          title="Revogar convite"
                        >
                          <Trash2 class="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}

        <!-- Tags & Priorities Tab Content -->
        {#if activeTab === 'catalog'}
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <!-- Tags Card -->
            <div class="rounded-sm border border-[var(--app-border)] bg-[var(--app-panel)] p-5 shadow-sm">
              <div class="mb-4 flex items-center justify-between">
                <h3 class="font-bold text-[var(--app-text)]">Catálogo de etiquetas</h3>
                <button
                  type="button"
                  onclick={() => (isAddingTag = !isAddingTag)}
                  class="flex items-center gap-1 text-xs font-bold text-[var(--app-primary)] hover:underline"
                >
                  <Plus class="h-3.5 w-3.5" /> Nova etiqueta
                </button>
              </div>

              {#if isAddingTag}
                <form method="POST" action="?/createTag" use:enhance={() => async ({ update }) => { await update(); isAddingTag = false; }} class="mb-4 flex gap-2">
                  <input
                    name="name"
                    placeholder="Nome da etiqueta..."
                    required
                    class="flex-1 rounded-sm border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-1.5 text-xs text-[var(--app-text)] focus:border-[var(--app-primary)] focus:outline-none"
                  />
                  <input name="color" type="color" value="#818cf8" class="h-8 w-10 cursor-pointer rounded-sm border border-[var(--app-border)] bg-[var(--app-bg)] p-0.5" />
                  <button type="submit" class="rounded-sm bg-[var(--app-primary)] px-3 py-1.5 text-xs font-bold text-white hover:brightness-110">
                    Adicionar
                  </button>
                </form>
              {/if}

              <div class="space-y-2">
                {#each data.tags as tag (tag.id)}
                  <div class="flex items-center justify-between rounded-sm border border-[var(--app-border-faint)] bg-[var(--app-bg)]/50 px-3 py-2">
                    <div class="flex items-center gap-2">
                      <span class="h-3 w-3 rounded-full" style="background: {tag.color || '#818cf8'};"></span>
                      <span class="text-xs font-bold text-[var(--app-text)]">{tag.name}</span>
                    </div>

                    <form method="POST" action="?/deleteTag" use:enhance>
                      <input type="hidden" name="id" value={tag.id} />
                      <button type="submit" class="text-[var(--app-text-muted)] hover:text-red-400" title="Excluir etiqueta">
                        <Trash2 class="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>
                {/each}
              </div>
            </div>

            <!-- Priorities Card -->
            <div class="rounded-sm border border-[var(--app-border)] bg-[var(--app-panel)] p-5 shadow-sm">
              <div class="mb-4 flex items-center justify-between">
                <h3 class="font-bold text-[var(--app-text)]">Prioridades</h3>
                <button
                  type="button"
                  onclick={() => (isAddingPriority = !isAddingPriority)}
                  class="flex items-center gap-1 text-xs font-bold text-[var(--app-primary)] hover:underline"
                >
                  <Plus class="h-3.5 w-3.5" /> Nova prioridade
                </button>
              </div>

              {#if isAddingPriority}
                <form method="POST" action="?/createPriority" use:enhance={() => async ({ update }) => { await update(); isAddingPriority = false; }} class="mb-4 flex gap-2">
                  <input
                    name="name"
                    placeholder="Nome..."
                    required
                    class="flex-1 rounded-sm border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-1.5 text-xs text-[var(--app-text)] focus:border-[var(--app-primary)] focus:outline-none"
                  />
                  <input
                    name="icon"
                    placeholder="Ícone (ex.: ↑)"
                    maxlength="10"
                    required
                    class="w-16 rounded-sm border border-[var(--app-border)] bg-[var(--app-bg)] px-2 py-1.5 text-center text-xs text-[var(--app-text)] focus:border-[var(--app-primary)] focus:outline-none"
                  />
                  <input name="color" type="color" value="#f87171" class="h-8 w-10 cursor-pointer rounded-sm border border-[var(--app-border)] bg-[var(--app-bg)] p-0.5" />
                  <button type="submit" class="rounded-sm bg-[var(--app-primary)] px-3 py-1.5 text-xs font-bold text-white hover:brightness-110">
                    Adicionar
                  </button>
                </form>
              {/if}

              <div class="space-y-2">
                {#each data.priorities as priority (priority.id)}
                  <div class="flex items-center justify-between rounded-sm border border-[var(--app-border-faint)] bg-[var(--app-bg)]/50 px-3 py-2">
                    <div class="flex items-center gap-2">
                      <span class="font-bold" style="color: {priority.color || '#fbbf24'};">{priority.icon || '•'}</span>
                      <span class="text-xs font-bold text-[var(--app-text)]">{priority.name}</span>
                    </div>

                    {#if !priority.isSystem}
                      <form method="POST" action="?/deletePriority" use:enhance>
                        <input type="hidden" name="id" value={priority.id} />
                        <button type="submit" class="text-[var(--app-text-muted)] hover:text-red-400" title="Excluir prioridade">
                          <Trash2 class="h-3.5 w-3.5" />
                        </button>
                      </form>
                    {:else}
                      <span class="rounded-xs bg-[var(--app-panel)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--app-text-muted)] uppercase">
                        Sistema
                      </span>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </main>

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
