import { supabase } from '@/lib/supabase';
import type { INotificationRepository, NotificationRecord } from '../interfaces/notification.repository';

export class SupabaseNotificationRepository implements INotificationRepository {
  async insertMany(notifications: Omit<NotificationRecord, 'id'>[]): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) {
      throw new Error(error.message);
    }
  }
}
