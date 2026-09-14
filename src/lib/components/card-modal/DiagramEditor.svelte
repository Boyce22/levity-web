<script lang="ts">
  import {
    Pencil,
    Square,
    Circle,
    Database,
    Server,
    ArrowRight,
    Eraser,
    Undo2,
    Redo2,
    Trash2,
    Check,
    Loader2,
  } from 'lucide-svelte';
  import { getStroke } from 'perfect-freehand';
  import rough from 'roughjs';
  import type { DiagramElementModel } from '$lib/contracts/models';

  interface Props {
    isOpen?: boolean;
    initialElements?: DiagramElementModel[];
    isSaving?: boolean;
    onClose?: () => void;
    onSave?: (elements: DiagramElementModel[]) => Promise<void> | void;
  }

  let {
    isOpen = false,
    initialElements = [],
    isSaving = false,
    onClose,
    onSave,
  }: Props = $props();

  type Tool = 'path' | 'rect' | 'circle' | 'db' | 'cloud' | 'server' | 'user' | 'arrow' | 'line' | 'eraser';

  let tool = $state<Tool>('path');
  let color = $state('#818cf8');
  let strokeWidth = $state(2);

  let elements = $state<DiagramElementModel[]>([]);
  let history = $state<DiagramElementModel[][]>([]);
  let historyIndex = $state(-1);

  let isDrawing = $state(false);
  let currentElement = $state<DiagramElementModel | null>(null);
  let svgEl = $state<SVGSVGElement | null>(null);

  const colors = ['#818cf8', '#34d399', '#f87171', '#fbbf24', '#ffffff'];
  const sizes = [1, 2, 4];

  $effect(() => {
    if (isOpen) {
      elements = JSON.parse(JSON.stringify(initialElements));
      history = [JSON.parse(JSON.stringify(initialElements))];
      historyIndex = 0;
    }
  });

  function recordHistory(newElements: DiagramElementModel[]) {
    const updated = history.slice(0, historyIndex + 1);
    updated.push(JSON.parse(JSON.stringify(newElements)));
    history = updated;
    historyIndex = updated.length - 1;
  }

  function handleUndo() {
    if (historyIndex > 0) {
      historyIndex--;
      elements = JSON.parse(JSON.stringify(history[historyIndex]));
    }
  }

  function handleRedo() {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      elements = JSON.parse(JSON.stringify(history[historyIndex]));
    }
  }

  function handleClear() {
    elements = [];
    recordHistory([]);
  }

  function getSvgCoordinates(e: PointerEvent): { x: number; y: number } {
    if (!svgEl) return { x: 0, y: 0 };
    const rect = svgEl.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function handlePointerDown(e: PointerEvent) {
    if (e.button !== 0) return;
    const { x, y } = getSvgCoordinates(e);

    isDrawing = true;
    if (tool === 'eraser') {
      // Find nearest element within radius 15
      const remaining = elements.filter((el) => {
        if (el.points) {
          return !el.points.some((p) => Math.hypot(p.x - x, p.y - y) < 15);
        }
        if (el.x !== undefined && el.y !== undefined && el.width !== undefined && el.height !== undefined) {
          return !(x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height);
        }
        return true;
      });
      if (remaining.length !== elements.length) {
        elements = remaining;
        recordHistory(elements);
      }
      return;
    }

    const id = `el-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    if (tool === 'path') {
      currentElement = {
        id,
        type: 'path',
        points: [{ x, y }],
        color,
        size: strokeWidth,
      };
    } else {
      currentElement = {
        id,
        type: tool,
        x,
        y,
        width: 0,
        height: 0,
        color,
        size: strokeWidth,
      };
    }
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isDrawing) return;
    const { x, y } = getSvgCoordinates(e);

    if (tool === 'eraser') {
      const remaining = elements.filter((el) => {
        if (el.points) {
          return !el.points.some((p) => Math.hypot(p.x - x, p.y - y) < 15);
        }
        if (el.x !== undefined && el.y !== undefined && el.width !== undefined && el.height !== undefined) {
          return !(x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height);
        }
        return true;
      });
      if (remaining.length !== elements.length) {
        elements = remaining;
      }
      return;
    }

    if (!currentElement) return;

    if (currentElement.type === 'path' && currentElement.points) {
      currentElement.points = [...currentElement.points, { x, y }];
    } else if (currentElement.x !== undefined && currentElement.y !== undefined) {
      currentElement.width = x - currentElement.x;
      currentElement.height = y - currentElement.y;
    }
  }

  function handlePointerUp() {
    if (!isDrawing) return;
    isDrawing = false;

    if (currentElement) {
      elements = [...elements, currentElement];
      recordHistory(elements);
      currentElement = null;
    }
  }

  function getPathD(points?: Array<{ x: number; y: number }>, size: number = 2): string {
    if (!points || points.length === 0) return '';
    const stroke = getStroke(points, {
      size,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
    });
    if (!stroke.length) return '';
    return stroke.reduce(
      (acc, [x, y], i) => (i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`),
      ''
    ) + ' Z';
  }

  const generator = rough.generator();

  function getRoughPaths(el: DiagramElementModel): Array<{ d: string }> {
    const x = el.x ?? 0;
    const y = el.y ?? 0;
    const w = el.width ?? 0;
    const h = el.height ?? 0;
    const c = el.color || '#818cf8';
    const s = el.size || 2;

    const normX = w < 0 ? x + w : x;
    const normY = h < 0 ? y + h : y;
    const normW = Math.max(1, Math.abs(w));
    const normH = Math.max(1, Math.abs(h));

    if (el.type === 'rect') {
      const drawable = generator.rectangle(normX, normY, normW, normH, { stroke: c, strokeWidth: s, roughness: 1.2 });
      return generator.toPaths(drawable);
    }
    if (el.type === 'circle') {
      const drawable = generator.ellipse(normX + normW / 2, normY + normH / 2, normW, normH, { stroke: c, strokeWidth: s, roughness: 1.2 });
      return generator.toPaths(drawable);
    }
    if (el.type === 'line') {
      const drawable = generator.line(x, y, x + w, y + h, { stroke: c, strokeWidth: s, roughness: 1.2 });
      return generator.toPaths(drawable);
    }
    if (el.type === 'arrow') {
      const drawable = generator.line(x, y, x + w, y + h, { stroke: c, strokeWidth: s, roughness: 1.2 });
      return generator.toPaths(drawable);
    }
    if (el.type === 'db') {
      const top = generator.ellipse(normX + normW / 2, normY, normW, normH / 4, { stroke: c, strokeWidth: s });
      const btm = generator.ellipse(normX + normW / 2, normY + normH, normW, normH / 4, { stroke: c, strokeWidth: s });
      const sLeft = generator.line(normX, normY, normX, normY + normH, { stroke: c, strokeWidth: s });
      const sRight = generator.line(normX + normW, normY, normX + normW, normY + normH, { stroke: c, strokeWidth: s });
      return [...generator.toPaths(top), ...generator.toPaths(btm), ...generator.toPaths(sLeft), ...generator.toPaths(sRight)];
    }
    if (el.type === 'server') {
      const unit = normH / 3;
      const s1 = generator.rectangle(normX, normY, normW, unit, { stroke: c, strokeWidth: s });
      const s2 = generator.rectangle(normX, normY + unit, normW, unit, { stroke: c, strokeWidth: s });
      const s3 = generator.rectangle(normX, normY + unit * 2, normW, unit, { stroke: c, strokeWidth: s });
      return [...generator.toPaths(s1), ...generator.toPaths(s2), ...generator.toPaths(s3)];
    }

    const drawable = generator.rectangle(normX, normY, normW, normH, { stroke: c, strokeWidth: s });
    return generator.toPaths(drawable);
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 z-100 flex flex-col bg-[#111113] select-none">
    <!-- Top toolbar -->
    <div class="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-[#17171a] px-4">
      <div class="flex items-center gap-1.5">
        <button
          type="button"
          onclick={() => (tool = 'path')}
          class="rounded-sm p-2 transition-colors {tool === 'path' ? 'bg-indigo-600 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}"
          title="Freehand Pen"
        >
          <Pencil class="h-4 w-4" />
        </button>

        <button
          type="button"
          onclick={() => (tool = 'rect')}
          class="rounded-sm p-2 transition-colors {tool === 'rect' ? 'bg-indigo-600 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}"
          title="Rectangle"
        >
          <Square class="h-4 w-4" />
        </button>

        <button
          type="button"
          onclick={() => (tool = 'circle')}
          class="rounded-sm p-2 transition-colors {tool === 'circle' ? 'bg-indigo-600 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}"
          title="Circle"
        >
          <Circle class="h-4 w-4" />
        </button>

        <button
          type="button"
          onclick={() => (tool = 'arrow')}
          class="rounded-sm p-2 transition-colors {tool === 'arrow' ? 'bg-indigo-600 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}"
          title="Arrow"
        >
          <ArrowRight class="h-4 w-4" />
        </button>

        <button
          type="button"
          onclick={() => (tool = 'db')}
          class="rounded-sm p-2 transition-colors {tool === 'db' ? 'bg-indigo-600 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}"
          title="Database"
        >
          <Database class="h-4 w-4" />
        </button>

        <button
          type="button"
          onclick={() => (tool = 'server')}
          class="rounded-sm p-2 transition-colors {tool === 'server' ? 'bg-indigo-600 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}"
          title="Server"
        >
          <Server class="h-4 w-4" />
        </button>

        <button
          type="button"
          onclick={() => (tool = 'eraser')}
          class="rounded-sm p-2 transition-colors {tool === 'eraser' ? 'bg-indigo-600 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}"
          title="Eraser"
        >
          <Eraser class="h-4 w-4" />
        </button>

        <div class="mx-2 h-4 w-px bg-white/10"></div>

        <!-- Color Palette -->
        <div class="flex items-center gap-1">
          {#each colors as c (c)}
            <button
              type="button"
              onclick={() => (color = c)}
              aria-label="Select color {c}"
              class="h-5 w-5 rounded-full border border-white/20 transition-transform {color === c ? 'scale-125 ring-2 ring-white/50' : ''}"
              style="background: {c};"
            ></button>
          {/each}
        </div>

        <div class="mx-2 h-4 w-px bg-white/10"></div>

        <!-- Stroke Width -->
        <div class="flex items-center gap-1">
          {#each sizes as s (s)}
            <button
              type="button"
              onclick={() => (strokeWidth = s)}
              class="flex h-6 w-6 items-center justify-center rounded-xs text-xs {strokeWidth === s ? 'bg-white/20 text-white font-bold' : 'text-white/50 hover:bg-white/5'}"
            >
              {s}
            </button>
          {/each}
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          onclick={handleUndo}
          disabled={historyIndex <= 0}
          aria-label="Undo"
          class="rounded-sm p-2 text-white/60 hover:bg-white/5 hover:text-white disabled:opacity-30"
          title="Undo"
        >
          <Undo2 class="h-4 w-4" />
        </button>

        <button
          type="button"
          onclick={handleRedo}
          disabled={historyIndex >= history.length - 1}
          aria-label="Redo"
          class="rounded-sm p-2 text-white/60 hover:bg-white/5 hover:text-white disabled:opacity-30"
          title="Redo"
        >
          <Redo2 class="h-4 w-4" />
        </button>

        <button
          type="button"
          onclick={handleClear}
          aria-label="Clear diagram"
          class="rounded-sm p-2 text-white/60 hover:bg-red-500/10 hover:text-red-400"
          title="Clear diagram"
        >
          <Trash2 class="h-4 w-4" />
        </button>

        <div class="mx-2 h-4 w-px bg-white/10"></div>

        <button
          type="button"
          onclick={onClose}
          class="rounded-sm px-3 py-1.5 text-xs text-white/70 hover:bg-white/5 hover:text-white"
        >
          Discard
        </button>

        <button
          type="button"
          onclick={() => onSave?.(elements)}
          disabled={isSaving}
          class="flex items-center gap-1.5 rounded-sm bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          {#if isSaving}
            <Loader2 class="h-3.5 w-3.5 animate-spin" />
          {:else}
            <Check class="h-3.5 w-3.5" />
          {/if}
          Save Diagram
        </button>
      </div>
    </div>

    <!-- Drawing Canvas Area -->
    <div
      class="relative flex-1 overflow-hidden"
      style="
        background: #151515;
        background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
        background-size: 20px 20px;
      "
    >
      <svg
        bind:this={svgEl}
        role="application"
        aria-label="Editor de diagrama"
        class="absolute inset-0 h-full w-full cursor-crosshair touch-none"
        onpointerdown={handlePointerDown}
        onpointermove={handlePointerMove}
        onpointerup={handlePointerUp}
      >
        <!-- Existing Elements -->
        {#each elements as el (el.id)}
          {#if el.type === 'path'}
            <path d={getPathD(el.points, el.size)} fill={el.color || '#818cf8'} />
          {:else}
            {#each getRoughPaths(el) as rp (rp.d)}
              <path d={rp.d} stroke={el.color || '#818cf8'} stroke-width={el.size || 2} fill="none" />
            {/each}
          {/if}
        {/each}

        <!-- In-progress Element -->
        {#if currentElement}
          {#if currentElement.type === 'path'}
            <path d={getPathD(currentElement.points, currentElement.size)} fill={currentElement.color || '#818cf8'} />
          {:else}
            {#each getRoughPaths(currentElement) as rp (rp.d)}
              <path d={rp.d} stroke={currentElement.color || '#818cf8'} stroke-width={currentElement.size || 2} fill="none" />
            {/each}
          {/if}
        {/if}
      </svg>
    </div>
  </div>
{/if}
