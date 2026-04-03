'use server';

import { workspaceRepo } from '@/repositories';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { verifyJwtToken } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { assertUserOwnsWorkspace } from '@/modules/workspace/actions/assertions';

async function getUserId() {
  const token = (await cookies()).get('token')?.value;
  if (!token) throw new Error('Unauthorized');
  const payload = await verifyJwtToken(token);
  if (!payload || !payload.id) throw new Error('Unauthorized');
  return payload.id as string;
}

async function createInviteRecord(workspaceId: string, userId: string, maxUses: number, expiresInHours: number) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);

  return workspaceRepo.createInvite({
    workspaceId,
    createdBy: userId,
    maxUses,
    expiresAt: expiresAt.toISOString()
  });
}

export async function generateInviteAction(
  workspaceId: string, 
  maxUses: number = 100,
  expiresInHours: number = 168 // 7 days default
) {
  const userId = await getUserId();

  // 🛡️ Security Boundary: DoS Rate Limiting (Max 5/minute)
  await rateLimit(`gen_inv_${userId}`, 5, 60000);

  // 1. RBAC: Verify explicitly
  const member = await assertUserOwnsWorkspace(userId, workspaceId);

  if (!['owner', 'admin'].includes(member.role)) {
    throw new Error('403 Forbidden: You lack permission to generate invites for this workspace.');
  }

  return await createInviteRecord(workspaceId, userId, maxUses, expiresInHours);
}

export async function getInviteDetailsAction(token: string) {
  const invite = await workspaceRepo.findInviteByToken(token);

  if (!invite) return null;

  const isExpired = new Date() > new Date(invite.expires_at);
  const isFull = invite.current_uses >= invite.max_uses;

  return {
    workspaceName: invite.workspaces?.name,
    workspaceId: invite.workspaces?.id,
    isExpired,
    isFull,
    isValid: !isExpired && !isFull
  };
}

async function validateInviteToken(token: string) {
  const invite = await workspaceRepo.findInviteByTokenRaw(token);
  if (!invite) throw new Error('Invalid or non-existent invitation token.');
  if (new Date() > new Date(invite.expires_at)) throw new Error('This invitation token has permanently expired.');
  return invite;
}

async function consumeInviteToken(token: string, currentUses: number, maxUses: number) {
  return workspaceRepo.consumeInvite(token, currentUses, maxUses);
}

async function bindUserToWorkspace(userId: string, workspaceId: string) {
  await workspaceRepo.addMember(workspaceId, userId, 'member');
}

export async function acceptInviteAction(token: string) {
  const userId = await getUserId();
  
  // 🛡️ Security Boundary: Bruteforce Mitigator (Max 10/minute)
  await rateLimit(`acc_inv_${userId}`, 10, 60000);

  const invite = await validateInviteToken(token);
  await consumeInviteToken(token, invite.current_uses, invite.max_uses);
  await bindUserToWorkspace(userId, invite.workspace_id);

  revalidatePath('/');
  return invite.workspace_id;
}
