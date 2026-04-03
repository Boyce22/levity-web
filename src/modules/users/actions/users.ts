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
    .select(`
      role,
      created_at,
      users!member_id (
        id,
        username,
        display_name,
        avatar_url,
        email
      )
    `)
    .eq('workspace_id', workspaceId);
    
  if (error) {
    console.error('Failed to fetch workspace users:', error.message);
    return [];
  }
  
  // Unwrap and flatten the joined payload
  const members = (data || []).map(m => {
    const user = Array.isArray(m.users) ? m.users[0] : m.users;
    if (!user) return null;
    return {
      ...user,
      role: m.role,
      joined_at: m.created_at
    };
  }).filter(Boolean) as any[];

  return members.sort((a, b) => (a.display_name || a.username).localeCompare(b.display_name || b.username));
}
