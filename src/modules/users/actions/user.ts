'use server';

import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { verifyJwtToken } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { BackblazeProvider } from '@/lib/storage/backblaze.provider';

async function getUserId() {
  const token = (await cookies()).get('token')?.value;
  const payload = token ? await verifyJwtToken(token) : null;
  if (!payload || !payload.id) throw new Error('Unauthorized');
  return payload.id as string;
}

export async function getUserProfile() {
  try {
    const userId = await getUserId();
    const { data } = await supabase
      .from('users')
      .select('id, username, display_name, avatar_url, bio, email, created_at')
      .eq('id', userId)
      .single();
    return data;
  } catch {
    return null;
  }
}

export async function updateUserProfile(updates: {
  display_name: string;
  avatar_url: string;
  bio?: string;
}) {
  const userId = await getUserId();
  await supabase
    .from('users')
    .update({
      display_name: updates.display_name,
      avatar_url: updates.avatar_url,
      bio: updates.bio ?? '',
    })
    .eq('id', userId);
  revalidatePath('/');
}

export async function uploadAvatarAction(base64: string): Promise<string> {
  const userId = await getUserId();

  const commaIdx = base64.indexOf(',');
  const meta = commaIdx !== -1 ? base64.slice(0, commaIdx) : '';
  const data = commaIdx !== -1 ? base64.slice(commaIdx + 1) : base64;

  const mimeMatch = meta.match(/data:([^;]+);base64/);
  const mime = mimeMatch?.[1] ?? 'image/jpeg';
  const ext = mime.split('/')[1]?.split('+')[0] ?? 'jpg';

  const buffer = Buffer.from(data, 'base64');
  const provider = new BackblazeProvider();
  const result = await provider.upload(buffer, {
    folder: 'avatars',
    filename: `${userId}.${ext}`,
    maxWidth: 400,
    maxHeight: 400,
    quality: 85,
  });

  return result.url;
}
