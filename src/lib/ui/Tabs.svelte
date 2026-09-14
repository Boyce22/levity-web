<script lang="ts">
  import type { Component } from 'svelte';

  export interface TabItem {
    id: string;
    label: string;
    icon?: Component<{ size?: number; strokeWidth?: number; class?: string }>;
    badge?: number;
  }

  interface Props {
    tabs: TabItem[];
    activeTab: string;
    class?: string;
    onchange?: (tabId: string) => void;
  }

  let {
    tabs,
    activeTab = $bindable(),
    class: customClass = '',
    onchange,
  }: Props = $props();

  function selectTab(id: string) {
    activeTab = id;
    onchange?.(id);
  }
</script>

<div class="tabs-container {customClass}" role="tablist">
  {#each tabs as tab (tab.id)}
    {@const isActive = activeTab === tab.id}
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      class="tab-button"
      class:is-active={isActive}
      onclick={() => selectTab(tab.id)}
    >
      {#if tab.icon}
        {@const IconComp = tab.icon}
        <IconComp size={14} strokeWidth={isActive ? 2.5 : 2} class="tab-icon" />
      {/if}
      <span class="tab-label">{tab.label}</span>

      {#if tab.badge != null && tab.badge > 0}
        <span class="tab-badge">{tab.badge}</span>
      {/if}

      {#if isActive}
        <span class="tab-underline"></span>
      {/if}
    </button>
  {/each}
</div>

<style>
  .tabs-container {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    border-bottom: 1px solid var(--app-border-faint);
    width: 100%;
    position: relative;
  }

  .tab-button {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 0.25rem;
    font-size: 13px;
    font-weight: 700;
    color: var(--app-text-muted);
    cursor: pointer;
    background: none;
    border: none;
    transition: color var(--motion-fast) var(--ease-standard);
  }

  .tab-button:hover {
    color: var(--app-text);
  }

  .tab-button.is-active {
    color: var(--app-text);
  }

  .tab-label {
    letter-spacing: -0.01em;
  }

  .tab-badge {
    padding: 1px 6px;
    border-radius: var(--radius-pill);
    background: var(--app-panel);
    border: 1px solid var(--app-border-faint);
    font-size: 10px;
    font-weight: 900;
    opacity: 0.7;
  }

  .tab-underline {
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--app-primary);
    border-radius: 1px;
    animation: slideIn var(--motion-fast) var(--ease-standard);
  }

  @keyframes slideIn {
    from { opacity: 0; transform: scaleX(0.7); }
    to { opacity: 1; transform: scaleX(1); }
  }
</style>
