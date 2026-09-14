'use server';

import { revalidatePath } from 'next/cache';
import { createPriorityUseCase, deletePriorityUseCase } from '../use-cases/priority.use-cases';

export async function createPriorityAction(workspaceId: string, payload: unknown) {
  const priority = await createPriorityUseCase(workspaceId, payload);
  revalidatePath('/');
  return priority;
}

export async function deletePriorityAction(workspaceId: string, priorityId: string) {
  await deletePriorityUseCase(workspaceId, priorityId);
  revalidatePath('/');
}
