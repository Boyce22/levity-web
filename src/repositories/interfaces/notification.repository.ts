export interface NotificationRecord {
  id?: string;
  recipient_id: string;
  created_by: string;
  updated_by?: string | null;
  card_id: string;
  type: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

export interface INotificationRepository {
  /** Insere uma ou mais notificações. */
  insertMany(notifications: Omit<NotificationRecord, 'id' | 'created_at' | 'updated_at'>[]): Promise<void>;
}
