import { serverApiClient } from '@/infra/http/serverApiClient';
import { Comment, CommentSchema, CommentResponseSchema } from '@/contracts/Comment';

export const commentRepository = {
  async getComments(
    cardId: string,
    limit: number,
    cursor: string | null,
  ): Promise<{ data: Comment[]; nextCursor: string | null }> {
    const query: Record<string, string | number> = { cardId, limit };
    if (cursor) query.cursor = cursor;
    const data = await serverApiClient.get<unknown>('/comments/', query);
    return CommentResponseSchema.parse(data);
  },

  async createComment(
    cardId: string,
    content: string,
    parentId?: string | null,
  ): Promise<Comment> {
    const data = await serverApiClient.post<unknown>('/comments', {
      cardId,
      content,
      parentId: parentId ?? null,
    });
    return CommentSchema.parse(data);
  },

  async updateComment(id: string, content: string): Promise<Comment> {
    const data = await serverApiClient.patch<unknown>(`/comments/${id}`, { content });
    return CommentSchema.parse(data);
  },

  async deleteComment(id: string): Promise<void> {
    await serverApiClient.delete(`/comments/${id}`);
  },
};
