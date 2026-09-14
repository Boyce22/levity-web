<script lang="ts">
  import { onMount } from 'svelte';
  import { AlertTriangle, X, Loader2 } from 'lucide-svelte';
  import { focusTrap } from './focus-trap';

  interface Props {
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'primary';
    loading?: boolean;
    onClose: () => void;
    onConfirm: () => void;
  }

  let {
    isOpen = false,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    loading = false,
    onClose,
    onConfirm,
  }: Props = $props();

  let dialogEl = $state<HTMLDivElement | null>(null);

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && isOpen && !loading) {
      e.preventDefault();
      onClose();
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

{#if isOpen}
  <div class="modal-root">
    <button
      type="button"
      class="modal-backdrop"
      onclick={onClose}
      aria-label="Close dialog backdrop"
      tabindex="-1"
    ></button>

    <div
      bind:this={dialogEl}
      use:focusTrap
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      tabindex="-1"
      class="modal-box"
    >
      <div class="modal-header">
        <div class="title-row">
          <span class="icon-wrap icon-{variant}">
            <AlertTriangle size={18} />
          </span>
          <h2 id="confirm-dialog-title" class="title-text">{title}</h2>
        </div>
        <button type="button" class="close-btn" onclick={onClose} disabled={loading} aria-label="Close modal">
          <X size={18} />
        </button>
      </div>

      <div class="modal-body">
        <p class="desc-text">{description}</p>

        <div class="actions-col">
          <button
            type="button"
            class="confirm-btn confirm-{variant}"
            disabled={loading}
            onclick={onConfirm}
          >
            {#if loading}
              <Loader2 size={16} class="spinner" />
              <span>Processing...</span>
            {:else}
              {confirmText}
            {/if}
          </button>

          <button
            type="button"
            class="cancel-btn"
            disabled={loading}
            onclick={onClose}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-root {
    position: fixed;
    inset: 0;
    z-index: var(--z-modal);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    animation: fadeIn var(--motion-fast) var(--ease-standard);
  }

  .modal-backdrop {
    position: absolute;
    inset: 0;
    background: var(--overlay-standard);
    backdrop-filter: blur(8px);
    border: none;
    cursor: default;
  }

  .modal-box {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 380px;
    background: var(--app-bg);
    border: 1px solid var(--app-border);
    border-radius: var(--radius-control);
    box-shadow: var(--shadow-modal);
    overflow: hidden;
    animation: scaleIn var(--motion-panel) var(--ease-out);
    outline: none;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.5rem 1rem;
    border-bottom: 1px solid var(--app-border-faint);
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  .title-text {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: var(--app-text);
  }

  .icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .icon-danger { color: var(--color-danger); }
  .icon-warning { color: var(--color-warning); }
  .icon-primary { color: var(--app-primary); }

  .close-btn {
    color: var(--app-text-muted);
    border-radius: var(--radius-micro);
    padding: 4px;
    transition: all var(--motion-fast) var(--ease-standard);
  }
  .close-btn:hover:not(:disabled) {
    background: var(--app-hover);
    color: var(--app-text);
  }

  .modal-body {
    padding: 1.25rem 1.5rem 1.5rem;
  }

  .desc-text {
    margin: 0 0 1.5rem;
    font-size: 13.5px;
    line-height: 1.55;
    color: var(--app-text-muted);
  }

  .actions-col {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }

  .confirm-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.65rem 1rem;
    font-size: 13.5px;
    font-weight: 700;
    border-radius: var(--radius-control);
    border: 1px solid transparent;
    cursor: pointer;
    transition: all var(--motion-fast) var(--ease-standard);
  }

  .confirm-danger {
    background: rgba(239, 68, 68, 0.12);
    border-color: rgba(239, 68, 68, 0.3);
    color: var(--color-danger);
  }
  .confirm-danger:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.22);
    border-color: rgba(239, 68, 68, 0.5);
  }

  .confirm-warning {
    background: rgba(245, 158, 11, 0.12);
    border-color: rgba(245, 158, 11, 0.3);
    color: var(--color-warning);
  }
  .confirm-warning:hover:not(:disabled) {
    background: rgba(245, 158, 11, 0.22);
  }

  .confirm-primary {
    background: var(--action-primary-solid);
    color: #ffffff;
  }
  .confirm-primary:hover:not(:disabled) {
    background: var(--action-primary-hover);
  }

  .confirm-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cancel-btn {
    width: 100%;
    padding: 0.65rem 1rem;
    font-size: 13.5px;
    font-weight: 500;
    border-radius: var(--radius-control);
    background: var(--app-panel);
    border: 1px solid var(--app-border-faint);
    color: var(--app-text-muted);
    cursor: pointer;
    transition: all var(--motion-fast) var(--ease-standard);
  }
  .cancel-btn:hover:not(:disabled) {
    background: var(--app-hover);
    color: var(--app-text);
  }

  :global(.spinner) {
    animation: spin 0.6s linear infinite;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.96) translateY(8px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
