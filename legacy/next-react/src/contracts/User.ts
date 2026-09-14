import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  displayName: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  role: z.string().optional().nullable(),
  // avatarUrl: z.string().url().optional().nullable(),
  bio: z.string().optional().nullable(),
});

export type User = z.infer<typeof UserSchema>;

export const UpdateUserProfileDTOSchema = z.object({
  displayName: z.string().optional(),
  avatarUrl: z.string().optional(),
  bio: z.string().optional(),
  email: z.string().email().optional(),
});
