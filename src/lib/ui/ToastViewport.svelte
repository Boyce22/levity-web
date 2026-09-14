<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { Check, CircleAlert, Info, X } from 'lucide-svelte';
  import { dismissToast, toasts, type ToastKind } from './toast';

  const icons: Record<ToastKind, typeof Check> = { success: Check, error: CircleAlert, info: Info };
</script>

<div class="toast-viewport" aria-live="polite" aria-atomic="true">
  {#each $toasts as toast (toast.id)}
    {@const Icon = icons[toast.kind]}
    <div class="toast toast-{toast.kind}" role={toast.kind === 'error' ? 'alert' : 'status'} in:fly={{ y: 12, duration: 180 }} out:fade={{ duration: 120 }}>
      <Icon size={17} aria-hidden="true" />
      <p>{toast.message}</p>
      {#if toast.actionLabel && toast.onAction}
        <button type="button" onclick={() => { toast.onAction?.(); dismissToast(toast.id); }}>{toast.actionLabel}</button>
      {/if}
      <button class="dismiss" type="button" aria-label="Fechar notificação" onclick={() => dismissToast(toast.id)}><X size={16} /></button>
    </div>
  {/each}
</div>

<style>
  .toast-viewport { position: fixed; right: 1rem; bottom: 1rem; z-index: var(--z-loader); display: grid; width: min(24rem, calc(100vw - 2rem)); gap: .625rem; pointer-events: none; }
  .toast { display: flex; align-items: center; gap: .625rem; padding: .75rem .75rem .75rem 1rem; border: 1px solid var(--app-border); border-radius: var(--radius-panel); background: color-mix(in srgb, var(--app-elevated) 92%, black); box-shadow: var(--shadow-popover); pointer-events: auto; }
  .toast p { flex: 1; margin: 0; font-size: 13px; font-weight: 600; color: var(--app-text); }
  .toast-success { border-color: color-mix(in srgb, var(--color-success) 35%, var(--app-border)); color: var(--color-success); }
  .toast-error { border-color: color-mix(in srgb, var(--color-danger) 45%, var(--app-border)); color: var(--color-danger); }
  .toast-info { color: var(--app-primary); }
  .toast button { color: inherit; font-size: 12px; font-weight: 700; }
  .toast .dismiss { display: grid; place-items: center; padding: .25rem; border-radius: var(--radius-control); color: var(--app-text-muted); }
  .toast .dismiss:hover { background: var(--app-hover); color: var(--app-text); }
</style>
