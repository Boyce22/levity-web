import { requireSession } from '@/infra/auth/session';
import { commentRepository } from '../repositories/comment-repository';

// ─── CREATE ───────────────────────────────────────────────────────────────────

export async function createCommentUseCase(
  cardId: string,
  content: string,
  parentId?: string | null,
) {
  await requireSession();
  return commentRepository.createComment(cardId, content, parentId);
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

export async function updateCommentUseCase(id: string, content: string) {
  await requireSession();
  return commentRepository.updateComment(id, content);
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function deleteCommentUseCase(id: string) {
  await requireSession();
  return commentRepository.deleteComment(id);
}

// ─── QUERIES ──────────────────────────────────────────────────────────────────

export async function getCommentsUseCase(
  cardId: string,
  limit: number,
  cursor: string | null,
) {
  await requireSession();
  return commentRepository.getComments(cardId, limit, cursor);
}
