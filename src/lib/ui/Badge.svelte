<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    color?: string;
    dot?: boolean;
    pulse?: boolean;
    icon?: string;
    class?: string;
    children?: Snippet;
  }

  let {
    color = 'var(--app-primary)',
    dot = false,
    pulse = false,
    icon,
    class: customClass = '',
    children,
  }: Props = $props();
</script>

<span
  class="badge {customClass}"
  style="
    background: color-mix(in srgb, {color} 15%, transparent);
    color: {color};
    border: 1px solid color-mix(in srgb, {color} 25%, transparent);
  "
>
  {#if pulse}
    <span class="badge-dot pulse" style="background: {color};"></span>
  {:else if dot}
    <span class="badge-dot" style="background: {color};"></span>
  {/if}
  {#if icon}
    <span class="badge-icon">{icon}</span>
  {/if}
  {#if children}
    {@render children()}
  {/if}
</span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 2px 7px;
    border-radius: var(--radius-control);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
    line-height: 1.4;
  }

  .badge-dot {
    width: 6px;
    height: 6px;
    border-radius: var(--radius-micro);
    flex-shrink: 0;
  }

  .badge-dot.pulse {
    animation: pulseGlow 1.8s infinite ease-in-out;
  }

  .badge-icon {
    font-size: 11px;
    line-height: 1;
  }

  @keyframes pulseGlow {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.85); }
  }
</style>
