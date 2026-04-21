import { serverApiClient } from '@/infra/http/serverApiClient';
import { NotificationResponse, NotificationResponseSchema } from '@/contracts/Notification';

export class NotificationRepository {
  async getNotifications(cursor?: string, limit: number = 20): Promise<NotificationResponse> {
    const query: Record<string, string | number> = { limit };
    if (cursor) {
      query.cursor = cursor;
    }
    
    // Devolve { items, limit, nextCursor }
    const data = await serverApiClient.get<unknown>('/notifications', query);
    return NotificationResponseSchema.parse(data);
  }

  async markAsRead(id: string): Promise<void> {
    await serverApiClient.patch(`/notifications/${id}/read`);
  }

  async markAllAsRead(): Promise<void> {
    await serverApiClient.post('/notifications/read-all');
  }
}

export const notificationRepository = new NotificationRepository();
