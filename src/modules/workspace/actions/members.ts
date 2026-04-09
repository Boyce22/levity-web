'use server';

import { httpGet, httpPost, httpPatch, httpDelete } from '@/lib/http';
import { revalidatePath } from 'next/cache';

export async function generateInviteAction(
  workspaceId: string,
  maxUses: number = 100,
  expiresInHours: number = 168,
  role: string = 'member',
) {
  const result = await httpPost<{ token: string }>(`/workspaces/${workspaceId}/invites`, {
    maxUses,
    expiresInHours,
    role,
  });
  return `${workspaceId}/${result.token}`;
}

export async function getInviteDetailsAction(workspaceId: string, token: string) {
  const invite = await httpGet<any>(`/workspaces/${workspaceId}/invites/${token}`).catch(() => null);
  if (!invite) return null;

  const isExpired = new Date() > new Date(invite.expiresAt);
  const isFull = invite.usedCount >= invite.maxUses;

  return {
    workspaceName: invite.workspace?.name ?? invite.workspaces?.name,
    workspaceId: invite.workspace?.id ?? invite.workspaces?.id ?? workspaceId,
    isExpired,
    isFull,
    isValid: !isExpired && !isFull,
  };
}

export async function acceptInviteAction(workspaceId: string, token: string) {
  const result = await httpPost<{ workspaceId: string }>(`/workspaces/${workspaceId}/invites/${token}/accept`);
  revalidatePath('/');
  return result.workspaceId ?? workspaceId;
}

export async function getWorkspaceInvitesAction(workspaceId: string) {
  return httpGet<any[]>(`/workspaces/${workspaceId}/invites`).catch(() => []);
}

export async function revokeInviteAction(workspaceId: string, inviteId: string) {
  await httpDelete(`/workspaces/${workspaceId}/invites/${inviteId}`);
  revalidatePath('/');
}

export async function removeMemberAction(workspaceId: string, memberId: string) {
  await httpDelete(`/workspaces/${workspaceId}/members/${memberId}`);
  revalidatePath('/');
}

export async function updateMemberRoleAction(workspaceId: string, memberId: string, newRole: string) {
  await httpPatch(`/workspaces/${workspaceId}/members/${memberId}/role`, { role: newRole });
  revalidatePath('/');
}
