'use server';

import { httpGet, httpPatch, serverPatchFormData } from '@/lib/http';
import { serverFetchFormData } from '@/lib/http';
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
  const response = await fetch(base64);
  const blob = await response.blob();
  const formData = new FormData();
  formData.append('file', blob, 'avatar.png');

  const res = await serverFetchFormData('/users/me/avatar', formData);
  if (!res.ok) throw new Error(`[API ${res.status}] Avatar upload failed`);
  const data = await res.json();
  
  return data.avatarUrl || data.url;
}
