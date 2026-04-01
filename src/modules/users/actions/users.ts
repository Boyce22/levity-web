'use server';

import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logoutAction() {
  (await cookies()).delete('token');
  redirect('/login');
}

export async function getAllUsersAction(workspaceId?: string) {
  if (!workspaceId) return [];

  const { data, error } = await supabase
    .from('workspace_members')
    .select('users(id, username, display_name, avatar_url)')
    .eq('workspace_id', workspaceId);
    
  if (error) {
    console.error('Failed to fetch workspace users:', error.message);
    return [];
  }
  
  // Unwrap the joined users payload
  const users = (data || []).map(m => Array.isArray(m.users) ? m.users[0] : m.users).filter(Boolean) as any[];
  return users.sort((a: any, b: any) => a.username.localeCompare(b.username));
}
