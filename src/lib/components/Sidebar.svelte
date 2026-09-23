<script lang="ts">
  import { onMount } from 'svelte';
  import {
    Plus,
    ChevronDown,
    Layout,
    Users,
    BarChart3,
    Settings,
    LogOut,
    Zap,
    Menu,
    X,
  } from 'lucide-svelte';
  import LevityLogo from '$lib/ui/LevityLogo.svelte';
  import type { WorkspaceModel, UserModel, HomeBoardModel } from '$lib/contracts/models';

  interface Props {
    workspaces?: WorkspaceModel[];
    currentWorkspaceId: string;
    currentWorkspaceName?: string;
    boards?: HomeBoardModel[];
    currentBoardId?: string;
    userProfile?: UserModel;
    userRole?: string;
    activeView?: string;
    onOpenSettings?: () => void;
    onOpenProfile?: () => void;
    onOpenCreateWorkspace?: () => void;
    onViewChange?: (view: string) => void;
  }

  let {
    workspaces = [],
    currentWorkspaceId,
    currentWorkspaceName = 'Workspace',
    boards = [],
    userProfile = { id: '', username: 'User' },
    userRole = 'MEMBER',
    activeView = 'board',
    onOpenSettings,
    onOpenProfile,
    onOpenCreateWorkspace,
    onViewChange,
  }: Props = $props();

  // A sidebar que muda de largura ao passar o mouse perde o hover durante a troca de rota.
  // No desktop ela permanece aberta; no mobile o drawer é a única forma de recolhimento.
  let isCollapsed = $state(false);
  let isWsOpen = $state(false);
  let isMobile = $state(false);
  let isMobileOpen = $state(false);

  const displayAvatar = $derived(
    userProfile.avatarUrl ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.username}`
  );

  const isAdmin = $derived(['owner', 'admin'].includes(userRole.toLowerCase()));
  const isOwner = $derived(userRole.toLowerCase() === 'owner');

  const navItems = $derived([
    { id: 'board', label: 'Project Board', icon: Layout, disabled: false },
    { id: 'sprints', label: 'Sprints', icon: Zap, disabled: false },
    ...(isAdmin ? [{ id: 'management', label: 'Workspace Management', icon: Users, disabled: false }] : []),
    { id: 'dashboard', label: 'Analytics', icon: BarChart3, disabled: true },
  ]);

  function toggleWorkspaceMenu() {
    isWsOpen = !isWsOpen;
  }

  function closeMobileMenu() {
    isMobileOpen = false;
    isWsOpen = false;
  }

  onMount(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const sync = () => {
      isMobile = media.matches;
      if (!isMobile) isMobileOpen = false;
    };
    sync();
    media.addEventListener('change', sync);
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMobileMenu();
    };
    window.addEventListener('keydown', onKeydown);
    return () => {
      media.removeEventListener('change', sync);
      window.removeEventListener('keydown', onKeydown);
    };
  });
</script>

{#if isMobile}
  <button class="mobile-menu-trigger" type="button" aria-label={isMobileOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={isMobileOpen} onclick={() => (isMobileOpen = !isMobileOpen)}>
    {#if isMobileOpen}<X size={20} />{:else}<Menu size={20} />{/if}
  </button>
  {#if isMobileOpen}
    <button class="mobile-menu-backdrop" type="button" aria-label="Fechar menu" onclick={closeMobileMenu}></button>
  {/if}
{/if}

<aside
  class="sidebar bg-app-bg border-app-border-faint sticky top-0 left-0 z-40 flex h-screen shrink-0 flex-col border-r transition-all duration-200"
  class:mobile-open={isMobileOpen}
  style="
    width: {isCollapsed ? '72px' : '260px'};
    box-shadow: rgba(0, 0, 0, 0.15) 0px 4px 12px;
  "
>
  <!-- Header / Logo -->
  <div class="border-app-border-faint flex h-16 items-center justify-between overflow-hidden border-b px-4">
    <div class="flex min-w-0 items-center gap-3">
      <div class="bg-app-primary-muted/30 border-app-border-faint relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-sm border shadow-sm">
        <LevityLogo size={22} />
      </div>
      <span
        class="text-app-text overflow-hidden text-lg font-bold tracking-tight whitespace-nowrap transition-opacity duration-200"
        style="
          opacity: {isCollapsed ? 0 : 1};
          width: {isCollapsed ? 0 : 'auto'};
          margin-left: {isCollapsed ? 0 : '4px'};
        "
      >
        Levity
      </span>
    </div>
  </div>

  <!-- Workspace Switcher -->
  <div class="space-y-1 px-3 py-4">
    <div class="relative">
      <button
        type="button"
        onclick={toggleWorkspaceMenu}
        class="group flex w-full items-center gap-3 rounded-sm px-3 py-2.5 transition-all {isWsOpen ? 'bg-app-panel' : 'hover:bg-app-hover'}"
      >
        <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-indigo-500 to-indigo-700 text-[10px] font-bold text-white shadow-sm">
          {currentWorkspaceName.charAt(0).toUpperCase() || 'W'}
        </div>
        <div
          class="flex flex-1 items-center justify-between overflow-hidden whitespace-nowrap transition-opacity duration-200"
          style="
            opacity: {isCollapsed ? 0 : 1};
            width: {isCollapsed ? 0 : 'auto'};
          "
        >
          <span class="text-app-text truncate text-left text-sm font-semibold">
            {currentWorkspaceName}
          </span>
          <ChevronDown
            size={14}
            class="text-app-text-muted shrink-0 transition-transform {isWsOpen ? 'rotate-180' : ''}"
          />
        </div>
      </button>

      {#if isWsOpen && !isCollapsed}
        <div class="bg-app-elevated border-app-border-faint absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-sm border p-1 shadow-xl">
          <div class="custom-scrollbar max-h-60 overflow-y-auto">
            {#each workspaces as w (w.id)}
              {@const isCurrent = w.id === currentWorkspaceId}
              <a
                href="/w/{w.id}"
                class="mb-0.5 flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors {isCurrent ? 'bg-app-primary-muted text-app-primary font-bold' : 'text-app-text-muted hover:bg-app-hover hover:text-app-text'}"
              >
                <div
                  class="flex h-5 w-5 items-center justify-center rounded-sm text-[9px] font-bold {isCurrent ? 'bg-app-primary text-white' : 'bg-app-border-faint text-app-text-muted'}"
                >
                  {w.name.charAt(0).toUpperCase()}
                </div>
                <span class="truncate">{w.name}</span>
              </a>
            {/each}
          </div>

          <div class="border-app-border-faint mt-1 border-t pt-1">
            {#if isAdmin && onOpenCreateWorkspace}
              <button
                type="button"
                onclick={() => {
                  isWsOpen = false;
                  onOpenCreateWorkspace?.();
                }}
                class="text-app-primary hover:bg-app-primary-muted flex w-full items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium transition-colors"
              >
                <Plus size={16} />
                <span>Create Workspace</span>
              </button>
            {/if}
            {#if isOwner}
              <button
                type="button"
                onclick={() => {
                  isWsOpen = false;
                  onOpenSettings?.();
                }}
                class="text-app-text-muted hover:bg-app-hover hover:text-app-text flex w-full items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium transition-colors"
              >
                <Settings size={16} />
                <span>Settings</span>
              </button>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>

  <div class="px-3 py-2 opacity-40">
    <div class="bg-app-border-faint h-px"></div>
  </div>

  <!-- Main Nav -->
  <nav class="custom-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-4">
    {#each navItems as item (item.id)}
      {@const isActive = activeView === item.id}
      <button
        type="button"
        onclick={() => {
          if (item.disabled) return;
          closeMobileMenu();
          onViewChange?.(item.id);
        }}
        disabled={item.disabled}
        title={isCollapsed ? item.label : undefined}
        class="group relative flex w-full items-center gap-3 rounded-sm px-3 py-2.5 transition-all {isActive ? 'bg-app-primary-muted text-app-primary font-bold' : 'text-app-text-muted hover:bg-app-hover hover:text-app-text'} {item.disabled ? 'cursor-not-allowed opacity-40 grayscale' : ''}"
      >
        <item.icon size={isCollapsed ? 20 : 18} class="shrink-0" />
        <span
          class="flex-1 overflow-hidden text-left text-sm tracking-tight whitespace-nowrap transition-opacity duration-200"
          style="
            opacity: {isCollapsed ? 0 : 1};
            width: {isCollapsed ? 0 : 'auto'};
          "
        >
          {item.label}
        </span>
        {#if isActive}
          <div class="bg-app-primary absolute right-0 h-5 w-1 rounded-l-full"></div>
        {/if}
        {#if item.disabled && !isCollapsed}
          <span class="bg-app-panel ml-auto rounded-sm px-1.5 py-0.5 text-[9px] font-bold tracking-widest uppercase">
            Soon
          </span>
        {/if}
      </button>
    {/each}
  </nav>

  <!-- Footer / Profile -->
  <div class="border-app-border-faint bg-app-header/30 border-t p-3">
    <div class="flex items-center gap-3 {isCollapsed ? 'justify-center' : 'px-3 py-2'}">
      <button
        type="button"
        onclick={onOpenProfile}
        aria-label="Open profile"
        class="flex shrink-0 items-center transition-transform hover:scale-105"
      >
        <img
          src={displayAvatar}
          alt={userProfile.displayName || userProfile.username}
          class="border-app-border-faint h-8 w-8 rounded-sm border object-cover shadow-sm"
        />
      </button>

      <div
        class="min-w-0 flex-1 overflow-hidden whitespace-nowrap transition-opacity duration-200"
        style="
          opacity: {isCollapsed ? 0 : 1};
          width: {isCollapsed ? 0 : 'auto'};
        "
      >
        <p class="text-app-text truncate text-sm font-bold tracking-tight">
          {userProfile.displayName || userProfile.username}
        </p>
        <p class="text-app-text-muted truncate text-[11px] capitalize opacity-60">
          {userRole.toLowerCase()}
        </p>
      </div>

      {#if !isCollapsed}
        <form action="/logout" method="POST" class="overflow-hidden whitespace-nowrap">
          <button
            type="submit"
            title="Logout"
            aria-label="Logout"
            class="text-app-text-muted rounded-sm p-1.5 transition-all hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={16} />
          </button>
        </form>
      {/if}
    </div>
  </div>
</aside>

<style>
  .mobile-menu-trigger { position: fixed; top: 12px; left: 12px; z-index: 60; display: none; place-items: center; width: 40px; height: 40px; border: 1px solid var(--app-border); border-radius: var(--radius-control); background: var(--app-header); color: var(--app-text); box-shadow: var(--shadow-popover); }
  .mobile-menu-backdrop { position: fixed; inset: 0; z-index: 39; display: none; background: var(--overlay-standard); backdrop-filter: blur(2px); }
  @media (max-width: 767px) {
    .mobile-menu-trigger, .mobile-menu-backdrop { display: grid; }
    .sidebar { position: fixed !important; width: min(280px, calc(100vw - 3rem)) !important; transform: translateX(-105%); transition: transform var(--motion-panel) var(--ease-out) !important; }
    .sidebar.mobile-open { transform: translateX(0); }
  }
</style>
