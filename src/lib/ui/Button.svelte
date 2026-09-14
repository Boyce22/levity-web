<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'emphasis' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    class?: string;
    title?: string;
    ariaLabel?: string;
    onclick?: (e: MouseEvent) => void;
    children?: Snippet;
  }

  let {
    type = 'button',
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    class: customClass = '',
    title,
    ariaLabel,
    onclick,
    children,
  }: Props = $props();
</script>

<button
  {type}
  disabled={disabled || loading}
  class="btn btn-{variant} btn-{size} {customClass}"
  {title}
  aria-label={ariaLabel}
  aria-busy={loading}
  {onclick}
>
  {#if loading}
    <span class="btn-spinner" aria-hidden="true"></span>
  {/if}
  {#if children}
    {@render children()}
  {/if}
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-radius: var(--radius-control);
    font-weight: 600;
    transition: all var(--motion-fast) var(--ease-standard);
    cursor: pointer;
    white-space: nowrap;
    border: 1px solid transparent;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* Sizes */
  .btn-sm {
    padding: 0.25rem 0.625rem;
    font-size: 11px;
    height: 28px;
  }

  .btn-md {
    padding: 0.5rem 1rem;
    font-size: 13.5px;
    height: 36px;
  }

  .btn-lg {
    padding: 0.75rem 1.5rem;
    font-size: 14px;
    height: 42px;
  }

  /* Variants */
  .btn-primary {
    background: var(--action-primary-solid);
    color: #ffffff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
  .btn-primary:hover:not(:disabled) {
    background: var(--action-primary-hover);
  }

  .btn-emphasis {
    background: linear-gradient(135deg, var(--action-emphasis-start) 0%, var(--action-emphasis-end) 100%);
    color: #ffffff;
    box-shadow: 0 2px 8px rgba(79, 70, 229, 0.25);
  }
  .btn-emphasis:hover:not(:disabled) {
    filter: brightness(1.1);
  }

  .btn-secondary {
    background: var(--app-panel);
    border-color: var(--app-border);
    color: var(--app-text);
  }
  .btn-secondary:hover:not(:disabled) {
    background: var(--app-hover);
  }

  .btn-danger {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.25);
    color: var(--color-danger);
  }
  .btn-danger:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.4);
  }

  .btn-ghost {
    background: transparent;
    color: var(--app-text-muted);
  }
  .btn-ghost:hover:not(:disabled) {
    background: var(--app-hover);
    color: var(--app-text);
  }

  .btn-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
