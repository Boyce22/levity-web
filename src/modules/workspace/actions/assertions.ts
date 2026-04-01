'use server';

import { supabase } from '@/lib/supabase';

/**
 * 🛡️ Security Gateway: Asserts the authenticated user explicitly belongs to the Workspace Member matrix.
 * Throws a fatal 403 error preventing IDOR.
 */
export async function assertUserOwnsWorkspace(userId: string, workspaceId: string) {
  const { data, error } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new Error('403 Forbidden: Unauthorized cross-tenant access attempt blocked.');
  }

  return data;
}

/**
 * 🛡️ Security Gateway: Asserts the list belongs to a workspace the user is a member of.
 */
export async function assertUserOwnsList(userId: string, listId: string): Promise<string> {
  const { data: list, error: listErr } = await supabase
    .from('lists')
    .select('workspace_id')
    .eq('id', listId)
    .single();

  if (listErr || !list || !list.workspace_id) {
    throw new Error('404 Not Found: Target list is completely missing or inaccessible.');
  }

  await assertUserOwnsWorkspace(userId, list.workspace_id);
  return list.workspace_id;
}

/**
 * 🛡️ Security Gateway: Asserts the card belongs to a list inside a workspace the user is a member of.
 */
export async function assertUserOwnsCard(userId: string, cardId: string) {
  const { data: card, error: cardErr } = await supabase
    .from('cards')
    .select('list_id')
    .eq('id', cardId)
    .single();

  if (cardErr || !card || !card.list_id) {
    throw new Error('404 Not Found: Target card is completely missing or inaccessible.');
  }

  const workspaceId = await assertUserOwnsList(userId, card.list_id);
  return { list_id: card.list_id, workspace_id: workspaceId };
}
