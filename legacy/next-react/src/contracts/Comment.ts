import { z } from 'zod';

export const CommentUserSchema = z.object({
  username: z.string(),
  displayName: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
});

export const CommentSchema = z.object({
  id: z.string(),
  cardId: z.string(),
  createdBy: z.string(),
  updatedBy: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  content: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  users: CommentUserSchema,
});

export const CommentResponseSchema = z.object({
  data: z.array(CommentSchema),
  nextCursor: z.string().nullable(),
});

export const CreateCommentDTOSchema = z.object({
  cardId: z.string(),
  content: z.string().min(1),
  parentId: z.string().nullable().optional(),
});

export type Comment = z.infer<typeof CommentSchema>;
export type CommentResponse = z.infer<typeof CommentResponseSchema>;
