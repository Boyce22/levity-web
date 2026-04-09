"use server";

import { httpGet, httpPut } from "@/lib/http";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const MAX_DIAGRAM_SIZE_BYTES = 256 * 1024; // 256KB
const MAX_ELEMENTS = 1000;
const MAX_POINTS_PER_PATH = 2500;

// 🛡️ Data Integrity Schema
const ElementSchema = z.object({
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

const DiagramSchema = z.object({
  elements: z.array(ElementSchema).max(MAX_ELEMENTS),
});

export type Diagram = {
  id: string;
  cardId: string;
  data: any;
  createdAt: string;
  updatedAt: string;
};

export async function getDiagramAction(cardId: string): Promise<Diagram | null> {
  return httpGet<Diagram>(`/diagrams/${cardId}`).catch(() => null);
}

export async function saveDiagramAction(cardId: string, diagramData: any) {
  const payloadString = JSON.stringify(diagramData);
  if (payloadString.length > MAX_DIAGRAM_SIZE_BYTES) {
    throw new Error(`413 Payload Too Large: Diagram exceeds the ${MAX_DIAGRAM_SIZE_BYTES / 1024}KB limit.`);
  }

  try {
    const validatedData = DiagramSchema.parse(diagramData);
    const diagram = await httpPut(`/diagrams`, { cardId, data: validatedData });
    revalidatePath("/");
    return diagram;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `400 Bad Request: Data validation failed. ${error.issues[0]?.message || 'Invalid format'}`,
      );
    }
    throw error;
  }
}
