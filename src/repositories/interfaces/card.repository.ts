import type { CardRecord } from './board.repository';

export type { CardRecord };

export interface CardHistoryRecord {
  id: string;
  card_id: string;
  user_id: string;
  action_type: string;
  field: string;
  old_val?: string | null;
  new_val?: string | null;
  created_at: string;
  users?: {
    id: string;
    username: string;
    display_name?: string | null;
    avatar_url?: string | null;
  };
}

export type CardUpdatePayload = Partial<
  Pick<
    CardRecord,
    | 'content'
    | 'description'
    | 'cover_url'
    | 'assignee_id'
    | 'priority'
    | 'label'
    | 'progress'
    | 'due_date'
  >
>;

export interface ICardRepository {
  /** Busca um card pelo id. Retorna null se não encontrar. */
  findById(cardId: string): Promise<CardRecord | null>;

  /** Cria um novo card. */
  createCard(data: { listId: string; content: string; position: number }): Promise<CardRecord>;

  /** Deleta um card pelo id. */
  deleteCard(cardId: string): Promise<void>;

  /** Atualiza campos de um card (allowlist seguro). */
  updateCard(cardId: string, payload: CardUpdatePayload): Promise<void>;

  /** Atualiza posições de múltiplos cards (list_id + position). */
  updateCardPositions(updates: { id: string; listId: string; position: number }[]): Promise<void>;

  /** Busca o histórico de alterações de um card. */
  getHistory(cardId: string): Promise<CardHistoryRecord[]>;

  /** Insere registros de histórico. */
  insertHistory(logs: Omit<CardHistoryRecord, 'id' | 'created_at' | 'users'>[]): Promise<void>;
}
