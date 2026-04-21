import { z } from 'zod';
import { UserSchema } from './User';

export const WorkspaceMemberSchema = z.object({
  id: z.string(),
  userId: z.string(),
  role: z.string(),
  joinedAt: z.string().optional(),
  user: UserSchema.optional(),
});

export const WorkspaceSchema = z.object({
  id: z.string(),
  name: z.string().default('Untitled Workspace'),
  members: z.array(WorkspaceMemberSchema).optional(),
});

export type WorkspaceMember = z.infer<typeof WorkspaceMemberSchema>;
export type Workspace = z.infer<typeof WorkspaceSchema>;

export const CreateWorkspaceDTOSchema = z.object({
  name: z.string().min(3),
});

export const UpdateWorkspaceDTOSchema = z.object({
  name: z.string().min(1),
});

// ...Existing Schemas...

export const InviteSchema = z.object({
  id: z.string(),
  token: z.string(),
  workspaceId: z.string(),
  maxUses: z.number(),
  usedCount: z.number(),
  expiresAt: z.string(),
  role: z.string(),
  workspace: z.object({ id: z.string(), name: z.string() }).optional(),
});

export type Invite = z.infer<typeof InviteSchema>;

export const CreateInviteDTOSchema = z.object({
  maxUses: z.number().default(100),
  expiresInHours: z.number().default(168),
  role: z.string().default('member'),
});

export const TagSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
});

export const CreateTagDTOSchema = z.object({
  name: z.string().min(1),
  color: z.string(),
});

export const PrioritySchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  icon: z.string(),
});

export const CreatePriorityDTOSchema = z.object({
  name: z.string().min(1),
  color: z.string(),
  icon: z.string(),
});
