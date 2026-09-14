import { z } from 'zod';

export const MAX_DIAGRAM_SIZE_BYTES = 256 * 1024;
export const MAX_ELEMENTS = 1000;
export const MAX_POINTS_PER_PATH = 2500;

export const DiagramElementSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['path', 'rect', 'circle', 'db', 'cloud', 'server', 'user', 'arrow', 'line', 'eraser']),
  points: z
    .array(z.object({ x: z.number(), y: z.number(), pressure: z.number().optional() }))
    .max(MAX_POINTS_PER_PATH)
    .optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  w: z.number().optional(),
  h: z.number().optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^var\(--app-.*\)$/),
  size: z.number().min(1).max(20),
});

export const DiagramDataSchema = z.object({
  elements: z.array(DiagramElementSchema).max(MAX_ELEMENTS),
});

export const DiagramSchema = z.object({
  id: z.string(),
  cardId: z.string(),
  data: DiagramDataSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type DiagramElement = z.infer<typeof DiagramElementSchema>;
export type DiagramData = z.infer<typeof DiagramDataSchema>;
export type Diagram = z.infer<typeof DiagramSchema>;
