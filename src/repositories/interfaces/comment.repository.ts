export interface CommentRecord {
  id: string;
  card_id: string;
  user_id: string;
  parent_id?: string | null;
  content: string;
  created_at: string;
  users: {
    username: string;
    display_name?: string | null;
    avatar_url?: string | null;
  };
}

export interface ICommentRepository {
  /**
   * Busca comentários raiz de um card (paginados) e seus replies.
   * @param cardId - ID do card
   * @param limit  - Número máximo de comentários raiz
   * @param cursor - ISO datetime: busca comentários criados antes deste cursor
   */
  findByCard(
    cardId: string,
    limit: number,
    cursor: string | null,
  ): Promise<CommentRecord[]>;

  /** Cria um comentário (pode ser reply se parentId fornecido). */
  create(data: {
    cardId: string;
    userId: string;
    content: string;
    parentId?: string | null;
  }): Promise<CommentRecord>;
}
