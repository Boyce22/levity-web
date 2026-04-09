'use server';

import { httpGet, httpPost, httpPatch, httpDelete } from '@/lib/http';
import { revalidatePath } from 'next/cache';

import type { Workspace } from "@/types/workspace";
export type { Workspace };

export async function createWorkspaceAction(name: string): Promise<Workspace> {
  const trimmed = name?.trim();
  if (!trimmed || trimmed.length < 3) {
    throw new Error('O nome do workspace deve ter pelo menos 3 caracteres.');
  }
  const workspace = await httpPost<Workspace>('/workspaces', { name: trimmed });
  revalidatePath('/');
  return workspace;
}

export async function getUserWorkspacesAction() {
  return httpGet('/workspaces').catch(() => []);
}

export async function renameWorkspaceAction(id: string, newName: string) {
  await httpPatch(`/workspaces/${id}`, { name: newName });
  revalidatePath('/');
}

export async function deleteWorkspaceAction(id: string) {
  await httpDelete(`/workspaces/${id}`);
  revalidatePath('/');
}
