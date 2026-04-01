'use server';

import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { verifyJwtToken } from '@/lib/auth';

async function getUserId() {
  const token = (await cookies()).get('token')?.value;
  if (!token) throw new Error('Unauthorized');
  const payload = await verifyJwtToken(token);
  if (!payload) throw new Error('Unauthorized');
  const { data } = await supabase.from('users').select('id').eq('username', payload.username).single();
  if (!data) throw new Error('User not found');
  return data.id;
}

export async function createWorkspaceAction(name: string) {
  const user_id = await getUserId();
  const { data, error } = await supabase.from('workspaces').insert([{ user_id, name }]).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getWorkspacesAction() {
  const user_id = await getUserId();
  const { data, error } = await supabase.from('workspaces').select('*').eq('user_id', user_id).order('created_at');
  if (error) throw new Error(error.message);
  return data || [];
}
