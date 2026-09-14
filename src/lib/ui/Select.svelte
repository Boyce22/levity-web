<script lang="ts">
  import { onMount } from 'svelte';
  import { ChevronDown, Check, Loader2 } from 'lucide-svelte';

  export interface SelectOption {
    value: string | number;
    label: string;
    icon?: string;
    color?: string;
    description?: string;
    disabled?: boolean;
  }

  interface Props {
    value?: string | number;
    options: SelectOption[];
    placeholder?: string;
    size?: 'sm' | 'md';
    disabled?: boolean;
    loading?: boolean;
    minWidth?: number;
    class?: string;
    triggerClass?: string;
    onchange?: (value: string | number) => void;
  }

  let {
    value = $bindable(''),
    options,
    placeholder = 'Select...',
    size = 'md',
    disabled = false,
    loading = false,
    minWidth,
    class: customClass = '',
    triggerClass = '',
    onchange,
  }: Props = $props();

  let isOpen = $state(false);
  let triggerEl = $state<HTMLButtonElement | null>(null);
  let menuEl = $state<HTMLDivElement | null>(null);
  let focusedIndex = $state(-1);

  let selectedOption = $derived(options.find((o) => o.value === value));

  function toggle() {
    if (disabled || loading) return;
    isOpen = !isOpen;
    if (isOpen) {
      focusedIndex = options.findIndex((o) => o.value === value);
      if (focusedIndex === -1) focusedIndex = 0;
    }
  }

  function selectOption(option: SelectOption) {
    if (option.disabled) return;
    value = option.value;
    isOpen = false;
    onchange?.(option.value);
    triggerEl?.focus();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        isOpen = false;
        triggerEl?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        focusedIndex = (focusedIndex + 1) % options.length;
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusedIndex = (focusedIndex - 1 + options.length) % options.length;
        break;
      case 'Home':
        e.preventDefault();
        focusedIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        focusedIndex = options.length - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (options[focusedIndex] && !options[focusedIndex].disabled) {
          selectOption(options[focusedIndex]);
        }
        break;
    }
  }

  onMount(() => {
    function handleClickOutside(event: MouseEvent) {
      if (triggerEl && !triggerEl.contains(event.target as Node) && menuEl && !menuEl.contains(event.target as Node)) {
        isOpen = false;
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  });
</script>

<div class="select-container {customClass}">
  <button
    bind:this={triggerEl}
    type="button"
    aria-haspopup="listbox"
    aria-expanded={isOpen}
    {disabled}
    onclick={toggle}
    onkeydown={handleKeydown}
    class="select-trigger select-{size} {triggerClass}"
    class:is-open={isOpen}
  >
    <div class="trigger-content">
      {#if selectedOption?.icon}
        <span class="trigger-icon" style={selectedOption.color ? `color: ${selectedOption.color};` : ''}>
          {selectedOption.icon}
        </span>
      {/if}
      <span class="trigger-label">
        {selectedOption ? selectedOption.label : placeholder}
      </span>
    </div>

    {#if loading}
      <Loader2 size={size === 'sm' ? 12 : 14} class="spinner" />
    {:else}
      <ChevronDown size={size === 'sm' ? 14 : 16} class="chevron {isOpen ? 'rotate' : ''}" />
    {/if}
  </button>

  {#if isOpen}
    <div
      bind:this={menuEl}
      role="listbox"
      tabindex="-1"
      class="select-dropdown"
      style={minWidth ? `min-width: ${minWidth}px;` : ''}
    >
      <div class="dropdown-list">
        {#each options as option, i (option.value)}
          <button
            type="button"
            role="option"
            aria-selected={option.value === value}
            disabled={option.disabled}
            class="select-item"
            class:is-selected={option.value === value}
            class:is-focused={focusedIndex === i}
            onclick={() => selectOption(option)}
          >
            <div class="item-content">
              {#if option.icon}
                <span class="item-icon" style={option.color ? `color: ${option.color};` : ''}>
                  {option.icon}
                </span>
              {/if}
              <div class="item-text">
                <span class="item-label">{option.label}</span>
                {#if option.description}
                  <span class="item-desc">{option.description}</span>
                {/if}
              </div>
            </div>
            {#if option.value === value}
              <Check size={14} class="check-icon" />
            {/if}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .select-container {
    position: relative;
    display: inline-block;
    width: 100%;
  }

  .select-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    width: 100%;
    background: var(--app-panel);
    border: 1px solid var(--app-border-faint);
    border-radius: var(--radius-control);
    color: var(--app-text);
    cursor: pointer;
    transition: all var(--motion-fast) var(--ease-standard);
  }

  .select-trigger:hover:not(:disabled) {
    background: var(--app-hover);
    border-color: var(--app-border);
  }

  .select-trigger:focus-visible {
    border-color: var(--app-primary);
    box-shadow: 0 0 0 3px var(--focus-ring);
    outline: none;
  }

  .select-trigger:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .select-sm {
    padding: 0.25rem 0.5rem;
    font-size: 11px;
    height: 28px;
  }

  .select-md {
    padding: 0.45rem 0.75rem;
    font-size: 13px;
    height: 36px;
  }

  .trigger-content {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .trigger-icon {
    font-size: 13px;
    display: flex;
    align-items: center;
  }

  .trigger-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  :global(.chevron) {
    transition: transform var(--motion-fast) var(--ease-standard);
    opacity: 0.6;
    flex-shrink: 0;
  }

  :global(.chevron.rotate) {
    transform: rotate(180deg);
  }

  :global(.spinner) {
    animation: spin 0.6s linear infinite;
    color: var(--app-primary);
    flex-shrink: 0;
  }

  .select-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: var(--app-bg);
    border: 1px solid var(--app-border);
    border-radius: var(--radius-control);
    box-shadow: var(--shadow-popover);
    z-index: var(--z-dropdown);
    overflow: hidden;
    padding: 4px;
    animation: fadeIn var(--motion-fast) var(--ease-standard);
  }

  .dropdown-list {
    max-height: 260px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .select-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 6px 10px;
    border-radius: var(--radius-control);
    text-align: left;
    color: var(--app-text-muted);
    font-size: 13px;
    cursor: pointer;
    border: none;
    background: none;
    transition: all var(--motion-fast) var(--ease-standard);
  }

  .select-item:hover, .select-item.is-focused {
    background: var(--app-hover);
    color: var(--app-text);
  }

  .select-item.is-selected {
    background: var(--app-primary-muted);
    color: var(--app-primary);
    font-weight: 600;
  }

  .select-item:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .item-content {
    display: flex;
    align-items: center;
    gap: 8px;
    overflow: hidden;
  }

  .item-icon {
    font-size: 13px;
    flex-shrink: 0;
  }

  .item-text {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .item-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-desc {
    font-size: 10px;
    opacity: 0.6;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :global(.check-icon) {
    color: var(--app-primary);
    flex-shrink: 0;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
