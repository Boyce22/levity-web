'use server';

import { httpPost, httpDelete } from '@/lib/http';
import { revalidatePath } from 'next/cache';

// ─── TAGS Management ──────────────────────────────────────────────

export async function createTagAction(workspaceId: string, name: string, color: string) {
  const data = await httpPost(`/workspaces/${workspaceId}/tags`, { name, color });
  revalidatePath('/');
  return data;
}

export async function deleteTagAction(workspaceId: string, tagId: string) {
  await httpDelete(`/workspaces/${workspaceId}/tags/${tagId}`);
  revalidatePath('/');
}

// ─── PRIORITIES Management ────────────────────────────────────────

export async function createPriorityAction(workspaceId: string, name: string, color: string, icon: string) {
  const data = await httpPost(`/workspaces/${workspaceId}/priorities`, { name, color, icon });
  revalidatePath('/');
  return data;
}

export async function deletePriorityAction(workspaceId: string, priorityId: string) {
  await httpDelete(`/workspaces/${workspaceId}/priorities/${priorityId}`);
  revalidatePath('/');
}
