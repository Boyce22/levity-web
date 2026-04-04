import { useState, useCallback, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export type ElementType = 'path' | 'rect' | 'circle' | 'db' | 'cloud' | 'server' | 'user' | 'arrow' | 'line' | 'eraser';

export interface DiagramElement {
  id: string;
  type: ElementType;
  points?: Point[];
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  color: string;
  size: number;
}

const MIN_SEGMENT_POINTS = 3; // Fragmentos com menos pontos são descartados

// Verifica se o segmento de linha (p1→p2) passa dentro do raio da borracha
function segmentIntersectsCircle(
  p1: Point,
  p2: Point,
  cx: number,
  cy: number,
  r: number,
  strokeHalfWidth: number
): boolean {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const lenSq = dx * dx + dy * dy;

  let t = 0;
  if (lenSq > 0) {
    t = ((cx - p1.x) * dx + (cy - p1.y) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
  }

  const nearestX = p1.x + t * dx;
  const nearestY = p1.y + t * dy;
  const dist = Math.sqrt((nearestX - cx) ** 2 + (nearestY - cy) ** 2);

  return dist <= r + strokeHalfWidth;
}

// Verifica se ponto (px, py) está dentro do raio da borracha
function pointInCircle(px: number, py: number, cx: number, cy: number, r: number): boolean {
  return (px - cx) ** 2 + (py - cy) ** 2 <= r * r;
}

// Distância de ponto a retângulo AABB
function pointToRectDistance(px: number, py: number, rx: number, ry: number, rw: number, rh: number): number {
  const minX = Math.min(rx, rx + rw);
  const maxX = Math.max(rx, rx + rw);
  const minY = Math.min(ry, ry + rh);
  const maxY = Math.max(ry, ry + rh);
  const dx = Math.max(minX - px, 0, px - maxX);
  const dy = Math.max(minY - py, 0, py - maxY);
  return Math.sqrt(dx * dx + dy * dy);
}

// Encontra os índices de pontos cujo SEGMENTO com o próximo ponto toca o círculo de apagamento
function findErasedIndices(
  points: Point[],
  cx: number,
  cy: number,
  radius: number,
  strokeHalfWidth: number
): Set<number> {
  const erased = new Set<number>();
  for (let i = 0; i < points.length; i++) {
    // Apaga o ponto se ele próprio está dentro do raio
    if (pointInCircle(points[i].x, points[i].y, cx, cy, radius + strokeHalfWidth)) {
      erased.add(i);
      continue;
    }
    // Apaga se o segmento até o próximo ponto intercepta o círculo
    if (i < points.length - 1) {
      if (segmentIntersectsCircle(points[i], points[i + 1], cx, cy, radius, strokeHalfWidth)) {
        erased.add(i);
        erased.add(i + 1);
      }
    }
  }
  return erased;
}

// Divide um array de pontos em segmentos contínuos, removendo os índices apagados
function splitIntoSegments(points: Point[], erasedIndices: Set<number>): Point[][] {
  const segments: Point[][] = [];
  let current: Point[] = [];

  for (let i = 0; i < points.length; i++) {
    if (erasedIndices.has(i)) {
      if (current.length >= MIN_SEGMENT_POINTS) {
        segments.push(current);
      }
      current = [];
    } else {
      current.push(points[i]);
    }
  }

  if (current.length >= MIN_SEGMENT_POINTS) {
    segments.push(current);
  }

  return segments;
}

function applyEraser(
  elements: DiagramElement[],
  cx: number,
  cy: number,
  radius: number
): { elements: DiagramElement[]; changed: boolean } {
  let changed = false;
  const result: DiagramElement[] = [];

  for (const el of elements) {
    if (el.type === 'path') {
      const points = el.points ?? [];
      if (points.length === 0) {
        result.push(el);
        continue;
      }

      const strokeHalfWidth = el.size / 2;
      const erased = findErasedIndices(points, cx, cy, radius, strokeHalfWidth);

      if (erased.size === 0) {
        result.push(el);
        continue;
      }

      changed = true;
      const segments = splitIntoSegments(points, erased);

      for (const seg of segments) {
        result.push({ ...el, id: uuidv4(), points: seg });
      }
      // Segmentos com menos de MIN_SEGMENT_POINTS pontos são simplesmente descartados
    } else {
      // Shapes: apagar se a borracha toca a bounding box
      const ex = el.x ?? 0;
      const ey = el.y ?? 0;
      const ew = el.w ?? 0;
      const eh = el.h ?? 0;
      const dist = pointToRectDistance(cx, cy, ex, ey, ew, eh);

      if (dist <= radius) {
        changed = true;
        // Não adiciona ao resultado = apagado
      } else {
        result.push(el);
      }
    }
  }

  return { elements: result, changed };
}

export function useDiagram(initialData?: any) {
  const migratedElements = useMemo(() => {
    if (initialData?.elements) return initialData.elements as DiagramElement[];
    if (initialData?.strokes) {
      return (initialData.strokes as any[]).map((s) => ({
        id: uuidv4(),
        type: 'path' as const,
        points: s.points,
        color: s.color,
        size: s.size,
      })) as DiagramElement[];
    }
    return [] as DiagramElement[];
  }, [initialData]);

  const [elements, setElements] = useState<DiagramElement[]>(migratedElements);
  const [currentElement, setCurrentElement] = useState<DiagramElement | null>(null);
  const [history, setHistory] = useState<DiagramElement[][]>([]);
  const [redoStack, setRedoStack] = useState<DiagramElement[][]>([]);

  // Controla se um snapshot de histórico já foi salvo para o gesto atual da borracha
  const eraserHistorySaved = useRef(false);

  // Salva snapshot do histórico apenas uma vez por gesto (pointerdown → pointerup)
  const saveHistory = useCallback((current: DiagramElement[]) => {
    setHistory((prev) => [...prev, current]);
    setRedoStack([]);
  }, []);

  const handleEraser = useCallback(
    (x: number, y: number, radius: number, isFirstPoint: boolean) => {
      setElements((prev) => {
        // Salva histórico apenas no primeiro ponto do gesto
        if (isFirstPoint && !eraserHistorySaved.current) {
          eraserHistorySaved.current = true;
          setHistory((h) => [...h, prev]);
          setRedoStack([]);
        }

        const { elements: next, changed } = applyEraser(prev, x, y, radius);
        return changed ? next : prev;
      });
    },
    []
  );

  const startElement = useCallback(
    (type: ElementType, x: number, y: number, color: string, size: number) => {
      if (type === 'eraser') {
        eraserHistorySaved.current = false; // Reseta flag para novo gesto
        handleEraser(x, y, size * 3.8, true);
        return;
      }

      // Para outros tipos, salva o histórico normalmente
      setElements((prev) => {
        setHistory((h) => [...h, prev]);
        setRedoStack([]);
        return prev;
      });

      const id = uuidv4();
      if (type === 'path') {
        setCurrentElement({
          id,
          type: 'path',
          points: [{ x, y, pressure: 0.5 }],
          color,
          size,
        });
      } else {
        setCurrentElement({ id, type, x, y, w: 0, h: 0, color, size });
      }
    },
    [handleEraser]
  );

  const updateElement = useCallback(
    (x: number, y: number, tool?: ElementType, eraserSize?: number) => {
      // Continua apagando enquanto o ponteiro se move
      if (tool === 'eraser' && eraserSize !== undefined) {
        handleEraser(x, y, eraserSize * 3.8, false);
        return;
      }

      if (!currentElement) return;

      setCurrentElement((prev) => {
        if (!prev) return null;
        if (prev.type === 'path') {
          return {
            ...prev,
            points: [...(prev.points ?? []), { x, y, pressure: 0.5 }],
          };
        } else {
          return { ...prev, w: x - (prev.x ?? 0), h: y - (prev.y ?? 0) };
        }
      });
    },
    [currentElement, handleEraser]
  );

  const endElement = useCallback(() => {
    if (!currentElement) return;
    setElements((prev) => [...prev, currentElement]);
    setCurrentElement(null);
  }, [currentElement]);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setRedoStack((prev) => [...prev, elements]);
    setElements(lastState);
    setHistory((prev) => prev.slice(0, -1));
  }, [history, elements]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setHistory((prev) => [...prev, elements]);
    setElements(nextState);
    setRedoStack((prev) => prev.slice(0, -1));
  }, [redoStack, elements]);

  const clear = useCallback(() => {
    setHistory((prev) => [...prev, elements]);
    setElements([]);
  }, [elements]);

  return {
    elements,
    setElements,
    currentElement,
    startElement,
    updateElement,
    handleEraser,
    endElement,
    undo,
    redo,
    clear,
  };
}