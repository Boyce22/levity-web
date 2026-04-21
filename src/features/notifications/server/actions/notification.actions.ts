'use server';

import { revalidatePath } from 'next/cache';
import {
  getNotificationsUseCase,
  markNotificationReadUseCase,
  markAllNotificationsReadUseCase,
} from '../use-cases/notification.use-cases';

// FIX N4: markAllNotificationsReadAction (consistent with use-case name)
export async function getNotificationsAction(cursor?: string) {
  return getNotificationsUseCase(cursor);
}

export async function markNotificationReadAction(id: string) {
  await markNotificationReadUseCase(id);
  revalidatePath('/'); // FIX N5: revalidatePath on mutations
}

export async function markAllNotificationsReadAction() {
  await markAllNotificationsReadUseCase();
  revalidatePath('/'); // FIX N5: revalidatePath on mutations
}
