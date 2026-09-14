<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  interface Props {
    id?: string;
    name?: string;
    type?: string;
    value?: string | number;
    placeholder?: string;
    label?: string;
    error?: string;
    hint?: string;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    maxlength?: number;
    minlength?: number;
    autocomplete?: HTMLInputAttributes['autocomplete'];
    class?: string;
    oninput?: (e: Event & { currentTarget: HTMLInputElement }) => void;
    onchange?: (e: Event & { currentTarget: HTMLInputElement }) => void;
    onkeydown?: (e: KeyboardEvent) => void;
  }

  let {
    id = crypto.randomUUID(),
    name,
    type = 'text',
    value = $bindable(''),
    placeholder,
    label,
    error,
    hint,
    required = false,
    disabled = false,
    readonly = false,
    maxlength,
    minlength,
    autocomplete,
    class: customClass = '',
    oninput,
    onchange,
    onkeydown,
  }: Props = $props();
</script>

<div class="field-wrapper {customClass}">
  {#if label}
    <label for={id} class="field-label">
      {label}
      {#if required}<span class="required-star">*</span>{/if}
    </label>
  {/if}

  <input
    {id}
    {name}
    {type}
    bind:value
    {placeholder}
    {required}
    {disabled}
    {readonly}
    {maxlength}
    {minlength}
    {autocomplete}
    class="field-input"
    class:has-error={!!error}
    aria-invalid={!!error}
    aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
    {oninput}
    {onchange}
    {onkeydown}
  />

  {#if error}
    <span id="{id}-error" class="field-error" role="alert">{error}</span>
  {:else if hint}
    <span id="{id}-hint" class="field-hint">{hint}</span>
  {/if}
</div>

<style>
  .field-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    width: 100%;
  }

  .field-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--app-text-muted);
  }

  .required-star {
    color: var(--color-danger);
    margin-left: 2px;
  }

  .field-input {
    width: 100%;
    padding: 0.55rem 0.75rem;
    background: var(--app-panel);
    border: 1px solid var(--app-border);
    border-radius: var(--radius-control);
    color: var(--app-text);
    font-size: 13.5px;
    transition: all var(--motion-fast) var(--ease-standard);
  }

  .field-input::placeholder {
    color: var(--app-text-muted);
    opacity: 0.5;
  }

  .field-input:focus {
    outline: none;
    border-color: var(--app-primary);
    box-shadow: 0 0 0 3px var(--focus-ring);
  }

  .field-input.has-error {
    border-color: var(--color-danger);
  }

  .field-input.has-error:focus {
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
  }

  .field-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--app-bg);
  }

  .field-error {
    font-size: 11.5px;
    color: var(--color-danger);
    font-weight: 500;
  }

  .field-hint {
    font-size: 11.5px;
    color: var(--app-text-muted);
  }
</style>
