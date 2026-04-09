'use server';

import { httpGet, httpPost, httpPatch, httpDelete } from '@/lib/http';
import { revalidatePath } from 'next/cache';

export type Comment = {
  id: string;
  cardId: string;
  createdBy: string;
  updatedBy?: string | null;
  parentId?: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  users: { username: string; displayName?: string; avatarUrl?: string };
};

export async function getCommentsAction(
  cardId: string,
  limit: number = 3,
  cursor: string | null = null,
): Promise<{ data: Comment[]; nextCursor: string | null }> {
  const params = new URLSearchParams({ cardId, limit: String(limit) });
  if (cursor) params.set('cursor', cursor);
  const result = await httpGet<{ data: Comment[]; nextCursor: string | null }>(`/comments/?${params}`).catch(() => ({ data: [], nextCursor: null }));
  return { data: result.data || [], nextCursor: result.nextCursor || null };
}

export async function createCommentAction(
  cardId: string,
  content: string,
  parentId?: string | null,
) {
  return httpPost<Comment>('/comments', {
    cardId,
    content,
    parentId: parentId ?? null,
  });
}

export async function updateCommentAction(id: string, content: string) {
  const updated = await httpPatch<Comment>(`/comments/${id}`, { content });
  revalidatePath('/');
  return updated;
}

export async function deleteCommentAction(id: string) {
  await httpDelete(`/comments/${id}`);
  revalidatePath('/');
}
