import { z } from 'zod';

export const CardHistoryUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  displayName: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
});

export const CardHistorySchema = z.object({
  id: z.string(),
  createdBy: z.string(),
  actionType: z.string(),
  field: z.string(),
  oldValue: z.string().optional().nullable(),
  newValue: z.string().optional().nullable(),
  createdAt: z.string(),
  users: CardHistoryUserSchema.optional().nullable(),
});

export type CardHistory = z.infer<typeof CardHistorySchema>;
