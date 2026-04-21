import { z } from 'zod';

export const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  actorId: z.string(),
  type: z.string(),
  workspaceId: z.string(),
  cardId: z.string(),
  content: z.string(),
  read: z.boolean(),
  createdAt: z.string(),
});

export const NotificationResponseSchema = z.object({
  items: z.array(NotificationSchema),
  limit: z.number().optional(),
  nextCursor: z.string().optional().nullable(),
});

export type Notification = z.infer<typeof NotificationSchema>;
export type NotificationResponse = z.infer<typeof NotificationResponseSchema>;
