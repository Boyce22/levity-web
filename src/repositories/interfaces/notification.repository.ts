export interface NotificationRecord {
  id?: string;
  recipient_id: string;
  created_by: string;
  card_id: string;
  type: string;
  content: string;
}

export interface INotificationRepository {
  /** Insere uma ou mais notificações. */
  insertMany(notifications: Omit<NotificationRecord, 'id'>[]): Promise<void>;
}
