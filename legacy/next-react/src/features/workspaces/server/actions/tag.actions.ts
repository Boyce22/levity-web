'use server';

import { revalidatePath } from 'next/cache';
import { createTagUseCase, deleteTagUseCase } from '../use-cases/tag.use-cases';

export async function createTagAction(workspaceId: string, payload: unknown) {
  const tag = await createTagUseCase(workspaceId, payload);
  revalidatePath('/');
  return tag;
}

export async function deleteTagAction(workspaceId: string, tagId: string) {
  await deleteTagUseCase(workspaceId, tagId);
  revalidatePath('/');
}
