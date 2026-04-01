'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { verifyJwtToken } from '@/lib/auth';
import { assertUserOwnsWorkspace } from './assertions';

async function getUserId() {
  const token = (await cookies()).get('token')?.value;
  if (!token) throw new Error('Unauthorized');
  const payload = await verifyJwtToken(token);
  if (!payload || !payload.id) throw new Error('Unauthorized');
  return payload.id as string;
}

// ─── TAGS Management ──────────────────────────────────────────────

export async function createTagAction(workspaceId: string, name: string, color: string) {
  const userId = await getUserId();
  await assertUserOwnsWorkspace(userId, workspaceId);

  const { data, error } = await supabase
    .from('workspace_tags')
    .insert({ workspace_id: workspaceId, name, color })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/');
  return data;
}

export async function deleteTagAction(workspaceId: string, tagId: string) {
  const userId = await getUserId();
  await assertUserOwnsWorkspace(userId, workspaceId);

  const { error } = await supabase
    .from('workspace_tags')
    .delete()
    .eq('id', tagId)
    .eq('workspace_id', workspaceId);

  if (error) throw new Error(error.message);
  revalidatePath('/');
}

// ─── PRIORITIES Management ────────────────────────────────────────

export async function createPriorityAction(workspaceId: string, name: string, color: string, icon: string) {
  const userId = await getUserId();
  await assertUserOwnsWorkspace(userId, workspaceId);

  const { data, error } = await supabase
    .from('workspace_priorities')
    .insert({ workspace_id: workspaceId, name, color, icon })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/');
  return data;
}

export async function deletePriorityAction(workspaceId: string, priorityId: string) {
  const userId = await getUserId();
  await assertUserOwnsWorkspace(userId, workspaceId);

  const { error } = await supabase
    .from('workspace_priorities')
    .delete()
    .eq('id', priorityId)
    .eq('workspace_id', workspaceId);

  if (error) throw new Error(error.message);
  revalidatePath('/');
}
