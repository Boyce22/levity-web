'use server';

import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logoutAction() {
  (await cookies()).delete('token');
  redirect('/login');
}

export async function getAllUsersAction() {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, display_name, avatar_url')
    .order('username');
    
  if (error) {
    console.error('Failed to fetch all users:', error.message);
    return [];
  }
  return data || [];
}
