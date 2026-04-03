export type ListType = 'todo' | 'in_progress' | 'review' | 'done';

export interface ListRecord {
  id: string;
  created_by: string;
  title: string;
  position: number;
  wip_limit?: number | null;
  workspace_id: string;
  list_type?: ListType | null;
}

export interface CardRecord {
  id: string;
  list_id: string;
  content: string;
  position: number;
  description?: string | null;
  cover_url?: string | null;
  assignee_id?: string | null;
  priority?: string | null;
  label?: string | null;
  progress?: number | null;
  due_date?: string | null;
}

export interface IBoardRepository {
  /** Busca todas as listas de um workspace com seus cards, ordenados por position. */
  findListsWithCards(workspaceId: string): Promise<{ lists: ListRecord[]; cards: CardRecord[] }>;

  /** Cria uma nova lista. */
  createList(data: { createdBy: string; title: string; position: number; workspaceId: string }): Promise<ListRecord>;

  /** Renomeia uma lista. */
  renameList(listId: string, title: string): Promise<void>;

  /** Deleta uma lista (e suas cards, via cascade no banco). */
  deleteList(listId: string): Promise<void>;

  /** Atualiza o tipo de uma lista. */
  updateListType(listId: string, listType: ListType | null): Promise<void>;

  /** Atualiza a posição de múltiplas listas. */
  updateListPositions(updates: { id: string; position: number }[]): Promise<void>;
}
