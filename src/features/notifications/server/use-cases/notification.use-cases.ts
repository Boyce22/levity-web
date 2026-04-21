import { requireSession } from '@/infra/auth/session';
import { notificationRepository } from '../repositories/notification-repository';

// ─── QUERIES ──────────────────────────────────────────────────────────────────

export async function getNotificationsUseCase(cursor?: string) {
  await requireSession();
  return notificationRepository.getNotifications(cursor);
}

// ─── MUTATIONS ────────────────────────────────────────────────────────────────

export async function markNotificationReadUseCase(id: string): Promise<void> {
  await requireSession();
  return notificationRepository.markAsRead(id);
}

export async function markAllNotificationsReadUseCase(): Promise<void> {
  await requireSession();
  return notificationRepository.markAllAsRead();
}
