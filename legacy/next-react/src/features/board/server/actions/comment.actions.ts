'use server';

import { revalidatePath } from 'next/cache';
import {
  getCommentsUseCase,
  createCommentUseCase,
  updateCommentUseCase,
  deleteCommentUseCase,
} from '../use-cases/comment.use-cases';

export async function getCommentsAction(
  cardId: string,
  limit: number = 3,
  cursor: string | null = null,
) {
  return getCommentsUseCase(cardId, limit, cursor);
}

export async function createCommentAction(
  cardId: string,
  content: string,
  parentId?: string | null,
) {
  const comment = await createCommentUseCase(cardId, content, parentId);
  revalidatePath('/');
  return comment;
}

export async function updateCommentAction(id: string, content: string) {
  const comment = await updateCommentUseCase(id, content);
  revalidatePath('/');
  return comment;
}

export async function deleteCommentAction(id: string) {
  await deleteCommentUseCase(id);
  revalidatePath('/');
}
