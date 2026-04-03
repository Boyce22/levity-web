'use server';

import { workspaceRepo } from '@/repositories';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { verifyJwtToken } from '@/lib/auth';
import { assertUserOwnsWorkspace } from './assertions';

async function getUserId() {
  const token = (await cookies()).get('token')?.value;
  if (!token) throw new Error('Unauthorized');
  const payload = await verifyJwtToken(token);
  if (!payload || !payload.id) throw new Error('Unauthorized');
  return payload.id as string;
}

// ─── TAGS Management ──────────────────────────────────────────────

export async function createTagAction(workspaceId: string, name: string, color: string) {
  const userId = await getUserId();
  await assertUserOwnsWorkspace(userId, workspaceId);

  const data = await workspaceRepo.createTag(workspaceId, name, color, userId);

  revalidatePath('/');
  return data;
}

export async function deleteTagAction(workspaceId: string, tagId: string) {
  const userId = await getUserId();
  await assertUserOwnsWorkspace(userId, workspaceId);

  await workspaceRepo.deleteTag(workspaceId, tagId);
  revalidatePath('/');
}

// ─── PRIORITIES Management ────────────────────────────────────────

export async function createPriorityAction(workspaceId: string, name: string, color: string, icon: string) {
  const userId = await getUserId();
  await assertUserOwnsWorkspace(userId, workspaceId);

  const data = await workspaceRepo.createPriority(workspaceId, name, color, icon, userId);

  revalidatePath('/');
  return data;
}

export async function deletePriorityAction(workspaceId: string, priorityId: string) {
  const userId = await getUserId();
  await assertUserOwnsWorkspace(userId, workspaceId);

  await workspaceRepo.deletePriority(workspaceId, priorityId);
  revalidatePath('/');
}
