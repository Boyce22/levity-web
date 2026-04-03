export interface CommentRecord {
  id: string;
  card_id: string;
  created_by: string;
  parent_id?: string | null;
  content: string;
  created_at: string;
  updated_at?: string | null;
  users: {
    username: string;
    display_name?: string | null;
    avatar_url?: string | null;
  };
}

export interface ICommentRepository {
  /**
   * Busca comentários raiz de um card (paginados) e seus replies.
   */
  findByCard(
    cardId: string,
    limit: number,
    cursor: string | null,
  ): Promise<CommentRecord[]>;

  /** Cria um comentário (pode ser reply se parentId fornecido). */
  create(data: {
    cardId: string;
    created_by: string;
    content: string;
    parentId?: string | null;
  }): Promise<CommentRecord>;

  /** Busca um comentário por ID. */
  findById(id: string): Promise<CommentRecord | null>;

  /** Atualiza o conteúdo de um comentário. */
  update(id: string, content: string): Promise<CommentRecord>;

  /** Exclui um comentário. */
  delete(id: string): Promise<void>;
}
