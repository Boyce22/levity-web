import { z } from 'zod';

export const CardSchema = z.object({
  id: z.string(),
  listId: z.string(),
  content: z.string(),
  position: z.number(),
  description: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  priority: z.string().optional().nullable(),
  label: z.string().optional().nullable(),
  progress: z.number().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  createdBy: z.string().optional(),
  createdAt: z.string(),
  commentCount: z.number().optional(),
});

export const ListTypeSchema = z.enum(["todo", "inProgress", "review", "done"]);

export const ListSchema = z.object({
  id: z.string(),
  createdBy: z.string().optional(),
  title: z.string(),
  position: z.number(),
  wipLimit: z.number().optional().nullable(),
  workspaceId: z.string(),
  listType: ListTypeSchema.optional().nullable(),
  createdAt: z.string(),
  cards: z.array(CardSchema).default([]),
});

export const BoardDataSchema = z.object({
  lists: z.array(ListSchema).default([]),
  cards: z.array(CardSchema).default([]),
  members: z.array(z.any()).default([]), // Tipagem solta temporária (já temos WorkspaceMember)
  tags: z.array(z.any()).default([]),
  priorities: z.array(z.any()).default([]),
});

export type Card = z.infer<typeof CardSchema>;
export type ListType = z.infer<typeof ListTypeSchema>;
export type List = z.infer<typeof ListSchema>;
export type BoardDataResponse = z.infer<typeof BoardDataSchema>;
