export interface NotificationRecord {
  id?: string;
  user_id: string;
  actor_id: string;
  card_id: string;
  type: string;
  content: string;
}

export interface INotificationRepository {
  /** Insere uma ou mais notificações. */
  insertMany(notifications: Omit<NotificationRecord, 'id'>[]): Promise<void>;
}
