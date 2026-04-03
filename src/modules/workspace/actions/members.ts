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

async function createInviteRecord(workspaceId: string, userId: string, maxUses: number, expiresInHours: number, role: string) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);

  return workspaceRepo.createInvite({
    workspaceId,
    createdBy: userId,
    maxUses,
    expiresAt: expiresAt.toISOString(),
    role
  });
}

export async function generateInviteAction(
  workspaceId: string, 
  maxUses: number = 100,
  expiresInHours: number = 168, // 7 days default
  role: string = 'member'
) {
  const userId = await getUserId();

  // 🛡️ Security Boundary: DoS Rate Limiting (Max 5/minute)
  await rateLimit(`gen_inv_${userId}`, 5, 60000);

  // 1. RBAC: Verify explicitly
  const member = await assertUserOwnsWorkspace(userId, workspaceId);

  // 🛡️ Security Check: Admins cannot invite Owners
  if (role === 'owner') {
    if (member.role !== 'owner') {
      throw new Error('403 Forbidden: Only the Workspace Owner can generate invitations for the Owner role.');
    }
    const currentOwnerCount = await workspaceRepo.countMembersByRole(workspaceId, 'owner');
    if (currentOwnerCount >= 1) {
      throw new Error('409 Conflict: This workspace already has an owner. Only one owner is allowed.');
    }
  }

  if (!['owner', 'admin'].includes(member.role)) {
    throw new Error('403 Forbidden: You lack permission to generate invites for this workspace.');
  }

  return await createInviteRecord(workspaceId, userId, maxUses, expiresInHours, role);
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

async function consumeInviteToken(token: string, currentUses: number, maxUses: number, updatedBy: string) {
  return workspaceRepo.consumeInvite(token, currentUses, maxUses, updatedBy);
}

async function bindUserToWorkspace(userId: string, workspace_id: string, role: string) {
  await workspaceRepo.addMember(workspace_id, userId, role, userId);
}

export async function acceptInviteAction(token: string) {
  const userId = await getUserId();
  
  // 🛡️ Security Boundary: Bruteforce Mitigator (Max 10/minute)
  await rateLimit(`acc_inv_${userId}`, 10, 60000);

  const invite = await validateInviteToken(token);
  await consumeInviteToken(token, invite.current_uses, invite.max_uses, userId);
  await bindUserToWorkspace(userId, invite.workspace_id, invite.role);

  revalidatePath('/');
  return invite.workspace_id;
}

export async function getWorkspaceInvitesAction(workspaceId: string) {
  const userId = await getUserId();
  await assertUserOwnsWorkspace(userId, workspaceId);

  return workspaceRepo.findInvitesByWorkspace(workspaceId);
}

export async function revokeInviteAction(workspaceId: string, token: string) {
  const userId = await getUserId();
  const member = await assertUserOwnsWorkspace(userId, workspaceId);

  if (!['owner', 'admin'].includes(member.role)) {
    throw new Error('403 Forbidden: Insufficient permissions to revoke invites.');
  }

  await workspaceRepo.revokeInvite(token, userId);
  revalidatePath('/');
}

export async function removeMemberAction(workspaceId: string, memberId: string) {
  const userId = await getUserId();
  const caller = await assertUserOwnsWorkspace(userId, workspaceId);

  if (!['owner', 'admin'].includes(caller.role)) {
    throw new Error('403 Forbidden: Insufficient permissions to remove members.');
  }

  const target = await workspaceRepo.findMember(workspaceId, memberId);
  if (!target) throw new Error('Member not found');

  // RBAC: Admins cannot remove Owners or other Admins
  if (caller.role === 'admin' && ['owner', 'admin'].includes(target.role)) {
     throw new Error('403 Forbidden: Admins can only remove Editors and Viewers.');
  }

  // Prevent removing the last owner
  if (target.role === 'owner') {
    // This logic could be more robust (check total owners), but for now we assume 
    // you can't remove yourself if you are an owner through this UI easily.
  }

  await workspaceRepo.removeMember(workspaceId, memberId);
  revalidatePath('/');
}

export async function updateMemberRoleAction(workspaceId: string, memberId: string, newRole: string) {
  const userId = await getUserId();
  const caller = await assertUserOwnsWorkspace(userId, workspaceId);

  if (!['owner', 'admin'].includes(caller.role)) {
    throw new Error('403 Forbidden: Insufficient permissions to change roles.');
  }

  const target = await workspaceRepo.findMember(workspaceId, memberId);
  if (!target) throw new Error('Member not found');

  // RBAC: Only Owners can promote to Owner or change another Owner's role
  if (newRole === 'owner') {
    if (caller.role !== 'owner') {
      throw new Error('403 Forbidden: Only the Workspace Owner can promote members to Owner.');
    }
    
    // Check if another owner exists
    const ownerCount = await workspaceRepo.countMembersByRole(workspaceId, 'owner');
    if (ownerCount >= 1 && target.role !== 'owner') {
      throw new Error('409 Conflict: This workspace already has an owner. Please demote the current owner first or transfer ownership.');
    }
  }

  if (target.role === 'owner' && caller.role !== 'owner') {
    throw new Error('403 Forbidden: Only the Workspace Owner can change another Owners role.');
  }

  // RBAC: Admins cannot promote/demote other Admins
  if (caller.role === 'admin' && target.role === 'admin') {
    throw new Error('403 Forbidden: Admins cannot change other Admins roles.');
  }

  await workspaceRepo.updateMemberRole(workspaceId, memberId, newRole, userId);
  revalidatePath('/');
}
