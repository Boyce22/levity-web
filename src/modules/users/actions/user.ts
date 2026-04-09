'use server';

import { httpGet, httpPatch, serverFetchFormData } from '@/lib/http';
import { revalidatePath } from 'next/cache';

export async function getUserProfile() {
  return httpGet('/users/me').catch(() => null);
}

export async function updateUserProfile(updates: {
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  email?: string;
}) {
  await httpPatch('/users/me', updates);
  revalidatePath('/');
}

export async function uploadAvatarAction(base64: string): Promise<string> {
  // Node.js não suporta o protocolo data: no fetch global — converter via Buffer
  // evita falha silenciosa em ambientes de server action (SSR/Edge).
  const commaIdx = base64.indexOf(',');
  const meta = base64.slice(0, commaIdx);
  const b64 = base64.slice(commaIdx + 1);
  const mimeMatch = meta.match(/data:(.*?);/);
  const mime = mimeMatch?.[1] ?? 'image/png';
  const buffer = Buffer.from(b64, 'base64');
  const blob = new Blob([buffer], { type: mime });
  const formData = new FormData();
  formData.append('file', blob, 'avatar.png');

  const res = await serverFetchFormData('/users/me/avatar', formData);
  if (!res.ok) throw new Error(`[API ${res.status}] Avatar upload failed`);
  const body = await res.json() as { avatarUrl?: string; url?: string };

  return body.avatarUrl ?? body.url ?? '';
}
