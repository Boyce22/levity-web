'use server';

import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { verifyJwtToken } from '@/lib/auth';

async function getUserId() {
  const token = (await cookies()).get('token')?.value;
  if (!token) return null;
  const payload = await verifyJwtToken(token);
  return payload?.id as string | null;
}

export type Notification = {
  id: string;
  user_id: string;
  actor_id: string;
  card_id: string;
  type: string;
  content: string;
  read: boolean;
  created_at: string;
  actor: {
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
};

export async function getNotificationsAction() {
  const userId = await getUserId();
  if (!userId) return [];
  
  // Use inner join syntax
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      actor:users!actor_id(username, display_name, avatar_url)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Failed to fetch notifications:', error.message);
    return [];
  }
  return data as any as Notification[];
}

export async function markNotificationsReadAction() {
  const userId = await getUserId();
  if (!userId) return;
  await supabase.from('notifications').update({ read: true }).eq('user_id', userId);
}
