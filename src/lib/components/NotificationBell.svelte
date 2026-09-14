<script lang="ts">
  import { onMount } from 'svelte';
  import { Bell, Sparkles, CheckCheck } from 'lucide-svelte';
  import type { NotificationModel } from '$lib/contracts/models';

  interface Props {
    notifications?: NotificationModel[];
    onNotificationClick?: (issueId: string) => boolean;
  }

  let {
    notifications = $bindable([]),
    onNotificationClick,
  }: Props = $props();

  let isOpen = $state(false);
  let containerEl = $state<HTMLDivElement | null>(null);
  let contextMessage = $state('');

  let unreadCount = $derived(notifications.filter((n) => !n.read).length);

  async function fetchNotifications() {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.items)) {
          notifications = data.items;
        }
      }
    } catch {
      // Ignorar erros de rede transientes em background
    }
  }

  async function markAllRead() {
    const previous = notifications;
    notifications = notifications.map((n) => ({ ...n, read: true }));
    try {
      const res = await fetch('/api/notifications/read-all', { method: 'POST' });
      if (!res.ok) throw new Error('Unable to mark notifications as read.');
    } catch {
      notifications = previous;
    }
  }

  async function handleOpen() {
    isOpen = !isOpen;
    if (isOpen && unreadCount > 0) {
      await markAllRead();
    }
  }

  async function handleItemClick(notif: NotificationModel) {
    contextMessage = '';
    if (notif.issueId && onNotificationClick?.(notif.issueId)) {
      isOpen = false;
    } else if (notif.issueId) {
      contextMessage = 'Open the board that contains this issue to view it.';
    }
    if (!notif.read) {
      const previous = notifications;
      notifications = notifications.map((item) => item.id === notif.id ? { ...item, read: true } : item);
      try {
        const res = await fetch(`/api/notifications/${notif.id}/read`, { method: 'PATCH' });
        if (!res.ok) throw new Error('Unable to mark notification as read.');
      } catch {
        notifications = previous;
      }
    }
  }

  function formatTime(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  }

  onMount(() => {
    fetchNotifications();
    const onFocus = () => fetchNotifications();
    window.addEventListener('focus', onFocus);

    function handleClickOutside(event: MouseEvent) {
      if (containerEl && !containerEl.contains(event.target as Node)) {
        isOpen = false;
      }
    }

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        isOpen = false;
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<div bind:this={containerEl} class="notification-bell relative">
  <!-- Bell button -->
  <button
    type="button"
    onclick={handleOpen}
    aria-label="Notificações"
    aria-expanded={isOpen}
    class="relative flex h-9 w-9 items-center justify-center rounded-xl transition-all"
    style="
      background: {isOpen ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.05)'};
      border: 1px solid {isOpen ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.08)'};
      color: {isOpen ? 'var(--app-primary, #818cf8)' : 'rgba(255, 255, 255, 0.4)'};
    "
  >
    <Bell class="h-4 w-4" />
    {#if unreadCount > 0}
      <span
        class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-sm"
        style="
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.5);
        "
      >
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    {/if}
  </button>

  <!-- Dropdown Popover -->
  {#if isOpen}
    <div
      class="notifications-dropdown absolute top-12 right-0 z-50 flex w-80 flex-col overflow-hidden shadow-2xl"
      style="
        border-radius: 18px;
        background: var(--app-bg, #151515);
        border: 1px solid var(--app-border, rgba(255, 255, 255, 0.1));
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
      "
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between px-4 py-3.5"
        style="border-bottom: 1px solid var(--app-border-faint, rgba(255, 255, 255, 0.06));"
      >
        <div class="flex items-center gap-2">
          <span class="text-[13px] font-semibold text-white/85">
            Notificações
          </span>
          {#if unreadCount > 0}
            <span
              class="rounded-md px-1.5 py-0.5 text-[10px] font-bold"
              style="
                background: rgba(99, 102, 241, 0.15);
                color: #a5b4fc;
                border: 1px solid rgba(99, 102, 241, 0.2);
              "
            >
              {unreadCount} novas
            </span>
          {/if}
        </div>
        {#if unreadCount > 0}
          <button
            type="button"
            onclick={markAllRead}
            class="flex items-center gap-1 text-[11px] font-medium text-white/40 transition-colors hover:text-indigo-400"
          >
            <CheckCheck class="h-3.5 w-3.5" />
            Marcar todas como lidas
          </button>
        {/if}
      </div>

      <!-- Items list -->
      <div class="custom-scrollbar max-h-72 overflow-y-auto p-1.5">
        {#if contextMessage}
          <p role="status" class="mx-2 mt-2 rounded-sm bg-white/5 px-2 py-1.5 text-[11px] text-white/55">{contextMessage}</p>
        {/if}
        {#if notifications.length === 0}
          <div class="flex flex-col items-center justify-center py-8 text-center">
            <Sparkles class="mb-2 h-6 w-6 text-white/20" />
          <p class="text-xs text-white/40 font-medium">Nenhuma notificação ainda</p>
          </div>
        {:else}
          {#each notifications as notif (notif.id)}
            <div
              role="button"
              tabindex="0"
              onclick={() => handleItemClick(notif)}
              onkeydown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleItemClick(notif);
                }
              }}
              class="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors cursor-pointer hover:bg-white/5"
              style="
                background: {notif.read ? 'transparent' : 'rgba(99, 102, 241, 0.07)'};
                opacity: {notif.read ? 0.6 : 1};
              "
            >
              <div class="relative shrink-0">
                <img
                  src={notif.actor?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notif.actorId || notif.userId}`}
                  alt=""
                  class="h-7 w-7 rounded-full object-cover"
                  style="border: 1.5px solid rgba(255, 255, 255, 0.1);"
                />
                {#if !notif.read}
                  <span
                    class="absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full"
                    style="background: #6366f1; box-shadow: 0 0 6px rgba(99, 102, 241, 0.6);"
                  ></span>
                {/if}
              </div>

              <div class="min-w-0 flex-1 text-left">
                <p class="text-[12.5px] leading-snug text-white/75">
                  <span class="font-semibold text-white/90">
                    {notif.actor?.displayName || notif.actor?.username || 'Someone'}
                  </span>
                  {#if notif.type === 'MENTION'}
                    &nbsp;mencionou você em um comentário.
                  {:else if notif.type === 'ASSIGNMENT'}
                    &nbsp;atribuiu uma tarefa a você.
                  {:else if notif.type === 'STATUS_CHANGE'}
                    &nbsp;atualizou o status da tarefa.
                  {:else if notif.type === 'DUE_DATE'}
                    &nbsp;tem prazo próximo.
                  {:else}
                    &nbsp;enviou uma notificação.
                  {/if}
                </p>
                <span class="mt-1 block text-[10px] text-white/30">
                  {formatTime(notif.createdAt)}
                </span>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  {/if}
</div>
