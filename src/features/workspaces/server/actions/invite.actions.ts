'use server';

import { revalidatePath } from 'next/cache';
import {
  getWorkspaceInvitesUseCase,
  generateInviteUseCase,
  getInviteDetailsUseCase,
  acceptInviteUseCase,
  revokeInviteUseCase,
} from '../use-cases/invite.use-cases';

export async function getWorkspaceInvitesAction(workspaceId: string) {
  return getWorkspaceInvitesUseCase(workspaceId);
}

export async function generateInviteAction(workspaceId: string, payload: unknown) {
  return generateInviteUseCase(workspaceId, payload);
}

export async function getInviteDetailsAction(workspaceId: string, token: string) {
  return getInviteDetailsUseCase(workspaceId, token);
}

export async function acceptInviteAction(workspaceId: string, token: string) {
  const result = await acceptInviteUseCase(workspaceId, token);
  revalidatePath('/');
  return result;
}

export async function revokeInviteAction(workspaceId: string, inviteId: string) {
  await revokeInviteUseCase(workspaceId, inviteId);
  revalidatePath('/');
}
