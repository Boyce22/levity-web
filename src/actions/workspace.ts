'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { verifyJwtToken } from '@/lib/auth';

async function getUserId() {
  const token = (await cookies()).get('token')?.value;
  if (!token) throw new Error('Unauthorized');
  const payload = await verifyJwtToken(token);
  if (!payload || !payload.id) throw new Error('Unauthorized');
  return payload.id as string;
}

export async function createWorkspaceAction(name: string) {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('workspaces')
    .insert({ user_id: userId, name })
    .select()
    .single();

  if (error) {
    console.error('Error creating workspace:', error);
    throw new Error(error.message);
  }
  
  revalidatePath('/');
  return data;
}

export async function renameWorkspaceAction(id: string, newName: string) {
  await getUserId(); // Verify auth
  const { error } = await supabase
    .from('workspaces')
    .update({ name: newName })
    .eq('id', id);

  if (error) {
    console.error('Error renaming workspace:', error);
    throw new Error(error.message);
  }

  revalidatePath('/');
}

export async function deleteWorkspaceAction(id: string) {
  await getUserId(); // Verify auth
  const { error } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting workspace:', error);
    throw new Error(error.message);
  }

  revalidatePath('/');
}
