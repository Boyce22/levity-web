'use server';

import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { verifyJwtToken } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function getUserId() {
  const token = (await cookies()).get('token')?.value;
  const payload = token ? await verifyJwtToken(token) : null;
  if (!payload || !payload.id) throw new Error('Unauthorized');
  return payload.id as string;
}

export async function getUserProfile() {
  try {
    const userId = await getUserId();
    const { data } = await supabase.from('users').select('username, display_name, avatar_url').eq('id', userId).single();
    return data;
  } catch (err) {
    return null;
  }
}

export async function updateUserProfile(updates: { display_name: string; avatar_url: string }) {
  const userId = await getUserId();
  await supabase.from('users').update(updates).eq('id', userId);
  revalidatePath('/');
}
