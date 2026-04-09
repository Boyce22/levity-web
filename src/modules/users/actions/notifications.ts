'use server';

import { cookies } from 'next/headers';
import { getUserIdFromToken } from '@/lib/auth';
import { httpGet, httpPatch, httpPost } from '@/lib/http';

async function getUserId() {
  const token = (await cookies()).get('token')?.value;
  if (!token) return null;
  return getUserIdFromToken(token);
}

import type { Notification } from "@/types/notifications";

export async function getNotificationsAction() {
  const userId = await getUserId();
  if (!userId) return [];

  const data = await httpGet<any>('/notifications').catch(() => ({ items: [] }));
  return Array.isArray(data?.items) ? (data.items as Notification[]) : [];
}

export async function markNotificationReadAction(id: string) {
  await httpPatch(`/notifications/${id}/read`).catch(() => null);
}

export async function markNotificationsReadAction() {
  const userId = await getUserId();
  if (!userId) return;

  await httpPost('/notifications/read-all').catch(() => null);
}
