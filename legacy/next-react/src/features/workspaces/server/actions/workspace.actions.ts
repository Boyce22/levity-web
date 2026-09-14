'use server';

import { revalidatePath } from 'next/cache';
import {
  getWorkspacesUseCase,
  createWorkspaceUseCase,
  updateWorkspaceUseCase,
  deleteWorkspaceUseCase,
} from '../use-cases/workspace.use-cases';

export async function getWorkspacesAction() {
  return getWorkspacesUseCase();
}

export async function createWorkspaceAction(payload: unknown) {
  const workspace = await createWorkspaceUseCase(payload);
  revalidatePath('/');
  return workspace;
}

export async function updateWorkspaceAction(id: string, payload: unknown) {
  const workspace = await updateWorkspaceUseCase(id, payload);
  revalidatePath('/');
  return workspace;
}

export async function deleteWorkspaceAction(id: string) {
  await deleteWorkspaceUseCase(id);
  revalidatePath('/');
}
