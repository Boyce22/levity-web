<script lang="ts">
  import {
    Share2,
    Copy,
    Check,
    X,
    Link as LinkIcon,
    AlertCircle,
    Loader2,
    Users,
    Clock,
    Shield,
  } from 'lucide-svelte';
  import Select from '$lib/ui/Select.svelte';
  import type { HomeBoardModel } from '$lib/contracts/models';

  interface Props {
    isOpen?: boolean;
    workspaceId: string;
    workspaceName?: string;
    currentBoardId?: string;
    boards?: HomeBoardModel[];
    onClose?: () => void;
  }

  let {
    isOpen = false,
    workspaceId,
    workspaceName = 'Workspace',
    currentBoardId,
    boards = [],
    onClose,
  }: Props = $props();

  let loading = $state(false);
  let inviteUrl = $state('');
  let copied = $state(false);
  let error = $state('');

  let maxUses = $state<number>(10);
  let duration = $state<number>(168); // 7 days in hours
  let role = $state<string>('MEMBER');

  const maxUsesOptions = [
    { value: 1, label: '1 person' },
    { value: 5, label: '5 people' },
    { value: 10, label: '10 people' },
    { value: 25, label: '25 people' },
    { value: 100, label: '100 people' },
  ];

  const durationOptions = [
    { value: 1, label: '1 hour' },
    { value: 24, label: '1 day' },
    { value: 72, label: '3 days' },
    { value: 168, label: '7 days' },
    { value: 720, label: '30 days' },
  ];

  const roleOptions = [
    {
      value: 'MEMBER',
      label: 'Member',
      color: '#6366f1',
      description: 'Regular team member with editor rights on board.',
    },
    {
      value: 'ADMIN',
      label: 'Admin',
      color: '#818cf8',
      description: 'Can manage members, boards, and settings.',
    },
  ];

  async function handleGenerate() {
    loading = true;
    error = '';
    try {
      // Determine board grants: at least 1 board grant required
      const targetBoardId = currentBoardId || boards[0]?.id;
      if (!targetBoardId) {
        throw new Error('No board available to grant access to.');
      }

      const boardRole = role === 'ADMIN' ? 'ADMIN' : 'EDITOR';
      const boardGrants = boards.length > 0
        ? boards.map((b) => ({ board_id: b.id, board_role: boardRole }))
        : [{ board_id: targetBoardId, board_role: boardRole }];

      const res = await fetch(`/api/workspaces/${workspaceId}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          max_uses: Number(maxUses),
          expires_in_hours: Number(duration),
          workspace_role: role,
          board_grants: boardGrants,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to generate invite link.');
      }

      const data = await res.json();
      const token = data.token || data.id;
      inviteUrl = `${window.location.origin}/invite/${workspaceId}/${token}`;
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : 'Failed to generate invite link.';
    } finally {
      loading = false;
    }
  }

  function handleCopy() {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose?.();
  }
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if isOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    aria-labelledby="share-workspace-title"
  >
    <div
      class="bg-app-bg border-app-border flex w-full max-w-[380px] flex-col overflow-hidden rounded-sm border shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
    >
      <div class="border-app-border-faint flex items-center justify-between border-b px-6 pt-6 pb-5">
        <h2 id="share-workspace-title" class="text-app-text flex items-center gap-3 text-base font-bold tracking-tight">
          <Share2 class="text-app-primary h-5 w-5" /> Share Workspace
        </h2>
        <button
          type="button"
          onclick={onClose}
          aria-label="Close modal"
          class="text-app-text-muted hover:text-app-text hover:bg-app-panel rounded-sm p-1.5 transition-colors"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <div class="px-6 pt-5 pb-6">
        <p class="text-app-text-muted mb-5 text-[13.5px] leading-relaxed opacity-90">
          Invite colleagues to&nbsp;
          <strong class="text-app-text font-semibold">{workspaceName}</strong>. Anyone with this secure cryptographic link will be able to join.
        </p>

        {#if error}
          <div class="mb-5 flex items-start gap-2 rounded-sm border border-red-500/20 bg-red-500/10 p-4 text-[13.5px] font-medium text-red-400">
            <AlertCircle class="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        {/if}

        {#if !inviteUrl}
          <div class="space-y-5">
            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col space-y-1.5">
                <span class="text-app-text-muted flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase opacity-60">
                  <Users class="h-3 w-3" /> Max Uses
                </span>
                <Select
                  bind:value={maxUses}
                  options={maxUsesOptions}
                  class="w-full"
                  triggerClass="w-full"
                />
              </div>

              <div class="flex flex-col space-y-1.5">
                <span class="text-app-text-muted flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase opacity-60">
                  <Clock class="h-3 w-3" /> Expiration
                </span>
                <Select
                  bind:value={duration}
                  options={durationOptions}
                  class="w-full"
                  triggerClass="w-full"
                />
              </div>
            </div>

            <div class="flex flex-col space-y-1.5">
              <span class="text-app-text-muted flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase opacity-60">
                <Shield class="h-3 w-3" /> Assign Role
              </span>
              <Select
                bind:value={role}
                options={roleOptions}
                class="w-full"
                triggerClass="w-full"
              />
            </div>

            <button
              type="button"
              onclick={handleGenerate}
              disabled={loading}
              class="mt-2 flex w-full items-center justify-center gap-2 rounded-sm px-6 py-3 text-[13.5px] font-bold text-white shadow-lg transition-all hover:brightness-110 focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              style="background: linear-gradient(135deg, var(--action-emphasis-start, #4f46e5) 0%, var(--action-emphasis-end, #312e81) 100%);"
            >
              {#if loading}
                <Loader2 class="h-5 w-5 animate-spin" /> Generating...
              {:else}
                <LinkIcon class="h-4 w-4" /> Create Secure Link
              {/if}
            </button>
          </div>
        {:else}
          <div class="space-y-5">
            <div class="bg-app-panel border-app-border-faint flex items-center gap-2 rounded-sm border p-1.5 shadow-sm transition-all">
              <input
                readonly
                value={inviteUrl}
                class="text-app-text min-w-0 flex-1 bg-transparent px-3 py-2 text-[13.5px] focus:outline-none"
              />
              <button
                type="button"
                onclick={handleCopy}
                class="flex shrink-0 items-center gap-2 rounded-sm px-4 py-2 text-[14px] font-medium transition-colors {copied ? 'bg-emerald-500/10 text-emerald-400' : 'bg-app-bg hover:bg-app-border-faint text-app-text'}"
              >
                {#if copied}
                  <Check class="h-4 w-4" /> Copied!
                {:else}
                  <Copy class="h-4 w-4" /> Copy
                {/if}
              </button>
            </div>
            <p class="text-app-text-muted text-center text-[12px] font-medium italic opacity-80">
              This link allows up to {maxUses} uses and expires in {duration >= 24 ? `${duration / 24} day(s)` : `${duration} hour(s)`}.
            </p>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
