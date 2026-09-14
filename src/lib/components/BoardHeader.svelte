<script lang="ts">
  import { Share2, ChevronRight, Layout, Zap, Users, BarChart3 } from 'lucide-svelte';
  import NotificationBell from './NotificationBell.svelte';
  import type { ColumnModel, IssueModel } from '$lib/contracts/models';

  interface Props {
    workspaceName?: string;
    boardName?: string;
    columns?: ColumnModel[];
    issues?: IssueModel[];
    activeView?: string;
    userRole?: string;
    onOpenShare?: () => void;
    onNotificationClick?: (issueId: string) => boolean;
  }

  let {
    workspaceName = 'Workspace',
    boardName = 'Project Board',
    columns = [],
    issues = [],
    activeView = 'board',
    userRole = 'member',
    onOpenShare,
    onNotificationClick,
  }: Props = $props();

  const totalIssues = $derived(issues.length);

  // Helper to map column type to effective progress if issue doesn't have custom progress
  const progressPct = $derived.by(() => {
    if (totalIssues === 0) return 0;
    const colTypeMap = Object.fromEntries(columns.map((col) => [col.id, col.columnType?.toLowerCase() || 'todo']));

    const totalSum = issues.reduce((sum, issue) => {
      if (typeof issue.progress === 'number') return sum + issue.progress;
      const type = colTypeMap[issue.columnId] || 'todo';
      if (type === 'done') return sum + 100;
      if (type === 'review') return sum + 75;
      if (type === 'in_progress') return sum + 50;
      return sum;
    }, 0);

    return Math.round(totalSum / totalIssues);
  });

  const viewLabels: Record<string, string> = {
    board: 'Quadro do projeto',
    sprints: 'Sprints',
    management: 'Gestão do workspace',
    dashboard: 'Painel analítico',
  };

  const isAdmin = $derived(['owner', 'admin'].includes(userRole.toLowerCase()));
</script>

<header class="bg-app-header border-app-border-faint sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between border-b px-6">
  <div class="flex items-center gap-2 overflow-hidden">
    <span class="text-app-text-muted max-w-[150px] truncate text-sm font-medium">
      {workspaceName}
    </span>
    <ChevronRight class="text-app-text-muted h-3.5 w-3.5 shrink-0 opacity-40" />
    <div class="bg-app-primary-muted/30 border-app-border-faint flex items-center gap-2 rounded-sm border px-2 py-1">
      {#if activeView === 'sprints'}
        <Zap class="text-app-primary h-3.5 w-3.5" />
      {:else if activeView === 'management'}
        <Users class="text-app-primary h-3.5 w-3.5" />
      {:else if activeView === 'dashboard'}
        <BarChart3 class="text-app-primary h-3.5 w-3.5" />
      {:else}
        <Layout class="text-app-primary h-3.5 w-3.5" />
      {/if}
      <span class="text-app-text text-sm font-bold whitespace-nowrap">
        {boardName && activeView === 'board' ? boardName : (viewLabels[activeView] || 'Quadro do projeto')}
      </span>
    </div>
  </div>

  <div class="flex items-center gap-4">
    <!-- Sprint / Board progress pill - visible in board view -->
    {#if activeView === 'board' && totalIssues > 0}
      <div class="bg-app-hover border-app-border hidden items-center gap-2.5 rounded-sm border px-3 py-1.5 text-[11px] font-bold transition-all md:flex">
        <div class="bg-app-border-faint h-1.5 w-20 overflow-hidden rounded-full">
          <div
            class="h-full transition-all duration-700 ease-out"
            style="
              width: {progressPct}%;
              background: {progressPct === 100 ? 'var(--color-success-strong, #10b981)' : 'var(--app-primary)'};
            "
          ></div>
        </div>
        <span class="text-app-text opacity-90">{progressPct}%</span>
      </div>
    {/if}

    <div class="flex items-center gap-2">
      <NotificationBell {onNotificationClick} />

      {#if isAdmin}
        <div class="bg-app-border-faint mx-1 h-4 w-[1px]"></div>
        <button
          type="button"
          onclick={onOpenShare}
          class="bg-app-primary flex items-center gap-2 rounded-sm px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:brightness-110"
        >
          <Share2 class="h-3.5 w-3.5" />
          <span class="hidden sm:inline">Compartilhar</span>
        </button>
      {/if}
    </div>
  </div>
</header>
