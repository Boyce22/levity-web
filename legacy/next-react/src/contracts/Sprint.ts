import { z } from 'zod';

export const SprintCardSchema = z.object({
  id: z.string(),
  sprintId: z.string(),
  cardId: z.string(),
  position: z.number(),
  addedAt: z.string(),
  movedToSprintId: z.string().optional().nullable(),
  card: z.object({
    id: z.string(),
    content: z.string(),
    storyPoints: z.number().optional().nullable(),
    estimatedHours: z.number().optional().nullable(),
    listId: z.string(),
  }),
});

export const SprintSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  name: z.string(),
  goal: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  status: z.enum(['planning', 'active', 'completed']),
  trackingMode: z.enum(['points', 'count', 'hours']),
  capacityPoints: z.number().optional().nullable(),
  velocityPoints: z.number().optional().nullable(),
  createdBy: z.string(),
  createdAt: z.string(),
  cards: z.array(SprintCardSchema).optional(),
  totalCards: z.number(),
  completedCards: z.number(),
  progressPercent: z.number(),
});

export const CreateSprintSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  goal: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  trackingMode: z.enum(['points', 'count', 'hours']),
  capacityPoints: z.number().optional(),
});

export const UpdateSprintSchema = CreateSprintSchema.partial();

export const CompleteSprintSchema = z.object({
  toSprintId: z.string().optional(),
});

export type Sprint = z.infer<typeof SprintSchema>;
export type SprintCard = z.infer<typeof SprintCardSchema>;
export type CreateSprint = z.infer<typeof CreateSprintSchema>;
export type UpdateSprint = z.infer<typeof UpdateSprintSchema>;
export type CompleteSprint = z.infer<typeof CompleteSprintSchema>;
