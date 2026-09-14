<script lang="ts">
  import { Loader2, Maximize2, Trash2 } from 'lucide-svelte';
  import ConfirmationModal from '$lib/ui/ConfirmationModal.svelte';
  import DiagramEditor from './DiagramEditor.svelte';
  import type { DiagramElementModel } from '$lib/contracts/models';
  import { getStroke } from 'perfect-freehand';

  interface Props {
    elements?: DiagramElementModel[];
    loading?: boolean;
    isSaving?: boolean;
    onSave?: (elements: DiagramElementModel[]) => Promise<void> | void;
    onDelete?: () => Promise<void> | void;
  }

  let {
    elements = [],
    loading = false,
    isSaving = false,
    onSave,
    onDelete,
  }: Props = $props();

  let isEditorOpen = $state(false);
  let isClearConfirmOpen = $state(false);

  let hasData = $derived(elements && elements.length > 0);

  function getSvgPathFromStroke(points: { x: number; y: number }[], size = 2) {
    if (!points || !points.length) return '';
    const stroke = getStroke(points, {
      size: size,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
      easing: (t) => t,
      start: { cap: true },
      end: { cap: true },
    });
    if (!stroke.length) return '';
    return stroke.reduce((acc, [x, y], i) => {
      if (i === 0) return `M ${x} ${y}`;
      return `${acc} L ${x} ${y}`;
    }, '') + ' Z';
  }

  let viewBox = $derived.by(() => {
    if (!elements || elements.length === 0) return '0 0 800 500';

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const el of elements) {
      if (el.type === 'path' && el.points) {
        for (const p of el.points) {
          minX = Math.min(minX, p.x);
          minY = Math.min(minY, p.y);
          maxX = Math.max(maxX, p.x);
          maxY = Math.max(maxY, p.y);
        }
      } else if (el.x !== undefined && el.y !== undefined && el.width !== undefined && el.height !== undefined) {
        minX = Math.min(minX, el.x);
        minY = Math.min(minY, el.y);
        maxX = Math.max(maxX, el.x + el.width);
        maxY = Math.max(maxY, el.y + el.height);
      }
    }

    if (minX === Infinity) return '0 0 800 500';

    const padding = 40;
    const width = Math.max(maxX - minX + padding * 2, 200);
    const height = Math.max(maxY - minY + padding * 2, 150);
    return `${minX - padding} ${minY - padding} ${width} ${height}`;
  });

  async function handleSave(newElements: DiagramElementModel[]) {
    isEditorOpen = false;
    if (onSave) {
      await onSave(newElements);
    }
  }

  async function handleClear() {
    isClearConfirmOpen = false;
    await onDelete?.();
  }
</script>

<div class="flex h-full flex-col gap-4">
  {#if loading}
    <div class="flex h-64 flex-col items-center justify-center gap-3">
      <Loader2 class="h-8 w-8 animate-spin text-[var(--app-primary)]" />
      <span class="text-sm font-medium text-[var(--app-text-muted)]">Loading architecture...</span>
    </div>
  {:else}
    <!-- Preview Area -->
    <div
      class="group relative min-h-[450px] flex-1 overflow-hidden rounded-sm border border-dashed border-[var(--app-border)] transition-all hover:border-[var(--app-primary)]/30"
      style="background: var(--app-bg-canvas, var(--app-panel)); background-image: radial-gradient(var(--app-border) 1px, transparent 1px); background-size: 20px 20px;"
    >
      {#if hasData}
        <button
          type="button"
          class="absolute inset-0 block h-full w-full cursor-zoom-in p-4 text-left border-0 bg-transparent"
          onclick={() => (isEditorOpen = true)}
          aria-label="Open diagram editor"
        >
          <svg
            {viewBox}
            preserveAspectRatio="xMidYMid meet"
            class="relative z-10 h-full w-full select-none"
          >
            {#each elements as el (el.id)}
              {#if el.type === 'path' && el.points}
                <path
                  d={getSvgPathFromStroke(el.points, el.size || 2)}
                  fill={el.color || '#818cf8'}
                />
              {:else if el.type === 'rect' && el.x !== undefined && el.y !== undefined && el.width !== undefined && el.height !== undefined}
                <rect
                  x={el.x}
                  y={el.y}
                  width={el.width}
                  height={el.height}
                  fill="none"
                  stroke={el.color || '#818cf8'}
                  stroke-width={el.size || 2}
                  rx="6"
                />
              {:else if el.type === 'circle' && el.x !== undefined && el.y !== undefined && el.width !== undefined && el.height !== undefined}
                <ellipse
                  cx={el.x + el.width / 2}
                  cy={el.y + el.height / 2}
                  rx={el.width / 2}
                  ry={el.height / 2}
                  fill="none"
                  stroke={el.color || '#818cf8'}
                  stroke-width={el.size || 2}
                />
              {:else if el.type === 'line' && el.x !== undefined && el.y !== undefined && el.width !== undefined && el.height !== undefined}
                <line
                  x1={el.x}
                  y1={el.y}
                  x2={el.x + el.width}
                  y2={el.y + el.height}
                  stroke={el.color || '#818cf8'}
                  stroke-width={el.size || 2}
                />
              {:else if el.type === 'arrow' && el.x !== undefined && el.y !== undefined && el.width !== undefined && el.height !== undefined}
                <line
                  x1={el.x}
                  y1={el.y}
                  x2={el.x + el.width}
                  y2={el.y + el.height}
                  stroke={el.color || '#818cf8'}
                  stroke-width={el.size || 2}
                  marker-end="url(#arrowhead)"
                />
              {:else if el.x !== undefined && el.y !== undefined && el.width !== undefined && el.height !== undefined}
                <!-- Default shape placeholder -->
                <rect
                  x={el.x}
                  y={el.y}
                  width={el.width}
                  height={el.height}
                  fill="none"
                  stroke={el.color || '#818cf8'}
                  stroke-width={el.size || 2}
                  rx="4"
                />
              {/if}
            {/each}
          </svg>
        </button>
      {:else}
        <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 text-[var(--app-text-muted)]">
          <div class="flex h-16 w-16 items-center justify-center rounded-sm border border-[var(--app-border-faint)] bg-[var(--app-panel)]">
            <Maximize2 size={32} strokeWidth={1.5} />
          </div>
          <div class="text-center">
            <p class="text-sm font-bold text-[var(--app-text)]">No Architecture Diagram</p>
            <p class="text-[12px] opacity-60">Click to start designing your system</p>
          </div>
        </div>
      {/if}

      <!-- Hover Overlay -->
      <div class="pointer-events-none absolute inset-0 bg-[var(--app-primary)]/5 opacity-0 transition-opacity group-hover:opacity-100"></div>

      <!-- Action Button -->
      <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <button
          type="button"
          onclick={() => (isEditorOpen = true)}
          class="flex items-center gap-2 rounded-sm px-6 py-2.5 text-[13.5px] font-bold text-white shadow-lg shadow-indigo-950/20 transition-all hover:brightness-110 focus:ring-4 focus:ring-indigo-500/20"
          style="background: linear-gradient(135deg, var(--app-primary, #4f46e5) 0%, #312e81 100%);"
        >
          <Maximize2 size={16} />
          {hasData ? 'Edit Diagram' : 'Create Diagram'}
        </button>
      </div>
    </div>

    <!-- Status Bar -->
    <div class="flex items-center justify-between px-2">
      <div class="flex items-center gap-2">
        <div class="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></div>
        <span class="text-[11px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
          {hasData ? 'Live Sync Active' : 'Waiting for design'}
        </span>
      </div>

      {#if hasData}
        <button
          type="button"
          onclick={() => (isClearConfirmOpen = true)}
          class="flex items-center gap-1.5 text-[11px] font-medium text-red-400 transition-colors hover:text-red-300"
        >
          <Trash2 size={12} /> Clear Diagram
        </button>
      {/if}
    </div>
  {/if}

  <!-- Full Screen Editor Modal -->
  <DiagramEditor
    isOpen={isEditorOpen}
    initialElements={elements}
    {isSaving}
    onClose={() => (isEditorOpen = false)}
    onSave={handleSave}
  />

  <ConfirmationModal
    isOpen={isClearConfirmOpen}
    onClose={() => (isClearConfirmOpen = false)}
    onConfirm={handleClear}
    title="Clear Diagram"
    description="Are you sure you want to clear this entire diagram? This will permanently delete all architecture elements and cannot be undone."
    confirmText="Clear Everything"
    variant="danger"
  />
</div>
