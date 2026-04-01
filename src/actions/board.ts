'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { verifyJwtToken } from '@/lib/auth';

export type List = { id: string; user_id: string; title: string; position: number };
export type Card = { 
  id: string; 
  list_id: string; 
  content: string; 
  position: number; 
  description?: string | null; 
  cover_url?: string | null;
  assignee_id?: string | null;
};

async function getUserId() {
  const token = (await cookies()).get('token')?.value;
  if (!token) throw new Error('Unauthorized');
  const payload = await verifyJwtToken(token);
  if (!payload || !payload.id) throw new Error('Unauthorized');
  return payload.id as string;
}

export async function getBoardData(workspaceId?: string) {
  const userId = await getUserId();
  
  let { data: workspaces, error: wsError } = await supabase.from('workspaces').select('*').eq('user_id', userId).order('created_at');
  
  if (wsError) {
    console.error("DB Error fetching workspaces:", wsError);
    throw new Error(`Workspace table missing or inaccessible. Did you execute the Phase 8 SQL in Supabase? Details: ${wsError.message}`);
  }

  if (!workspaces || workspaces.length === 0) {
     const { data: cw, error: insertError } = await supabase.from('workspaces').insert({ user_id: userId, name: 'My Workspace' }).select().single();
     if (insertError) {
       throw new Error(`Failed to create default workspace. Details: ${insertError.message}`);
     }
     if (cw) workspaces = [cw];
  }
  
  const currentWsId = workspaceId || (workspaces && workspaces[0] ? workspaces[0].id : null);
  if (!currentWsId) throw new Error("Could not determine current workspace ID.");

  // Seamlessly migrate legacy lists missing a workspace_id to the active workspace
  await supabase.from('lists').update({ workspace_id: currentWsId }).is('workspace_id', null).eq('user_id', userId);

  const { data: lists, error: listsErr } = await supabase
    .from('lists')
    .select('*')
    .eq('workspace_id', currentWsId)
    .order('position');

  if (listsErr) {
    console.error('Supabase lists error:', listsErr);
    throw new Error(`Failed to load board lists: ${listsErr.message}`);
  }

  let cards: any[] = [];
  const listIds = lists ? lists.map(l => l.id) : [];

  if (listIds.length > 0) {
    const { data: cardsData, error: cardsErr } = await supabase
      .from('cards')
      .select('*')
      .in('list_id', listIds)
      .order('position');

    if (cardsErr) {
      console.error('Supabase cards error:', cardsErr);
      throw new Error(`Failed to load board cards: ${cardsErr.message}`);
    }
    cards = cardsData || [];
  }

  return { lists: (lists || []) as List[], cards: cards as Card[], workspaces: workspaces || [] };
}
export async function createListAction(title: string, position: number, workspaceId: string) {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('lists')
    .insert({ user_id: userId, title, position, workspace_id: workspaceId })
    .select()
    .single();

  if (error) {
    console.error(error);
    return null;
  }
  revalidatePath('/');
  return data;
}

export async function renameListAction(listId: string, title: string) {
  await supabase.from('lists').update({ title }).eq('id', listId);
  revalidatePath('/');
}

export async function deleteListAction(id: string) {
  await supabase.from('lists').delete().eq('id', id);
  revalidatePath('/');
}

export async function createCardAction(listId: string, content: string, position: number) {
  const { data, error } = await supabase
    .from('cards')
    .insert({ list_id: listId, content, position })
    .select()
    .single();

  if (error) console.error(error);
  revalidatePath('/');
  return data;
}

export async function deleteCardAction(id: string) {
  await supabase.from('cards').delete().eq('id', id);
  revalidatePath('/');
}

export async function updateCardDetailsAction(id: string, updates: Partial<Card>) {
  const userId = await getUserId();
  const { data: oldCard } = await supabase.from('cards').select('*').eq('id', id).single();

  await supabase.from('cards').update({
    content: updates.content,
    description: updates.description,
    cover_url: updates.cover_url,
    assignee_id: updates.assignee_id
  }).eq('id', id);

  const logs = [];
  if (oldCard) {
     if (updates.content !== undefined && oldCard.content !== updates.content) {
        logs.push({ card_id: id, user_id: userId, action_type: 'updated', field: 'title', old_val: oldCard.content, new_val: updates.content });
     }
     if (updates.description !== undefined && oldCard.description !== updates.description) {
        logs.push({ card_id: id, user_id: userId, action_type: 'updated', field: 'description', old_val: oldCard.description ? 'yes' : 'no', new_val: updates.description ? 'yes' : 'no' });
        
        // Mentions diffing logic
        const oldMentions = oldCard.description ? Array.from(oldCard.description.matchAll(/(?:^|\s)@(\w+)/g)).map((m: any) => m[1] as string) : [];
        const newMentions = updates.description ? Array.from(updates.description.matchAll(/(?:^|\s)@(\w+)/g)).map((m: any) => m[1] as string) : [];
        const addedMentions = newMentions.filter(m => !oldMentions.includes(m));
        
        if (addedMentions.length > 0) {
           const { data: mentionedUsers } = await supabase.from('users').select('id, username').in('username', addedMentions);
           if (mentionedUsers && mentionedUsers.length > 0) {
              const notifications = mentionedUsers.map(u => ({
                 user_id: u.id, actor_id: userId, card_id: id, type: 'mention_desc', content: 'You were mentioned in a card description.'
              }));
              if (notifications.length > 0) await supabase.from('notifications').insert(notifications);
           }
        }
     }
     if (updates.assignee_id !== undefined && oldCard.assignee_id !== updates.assignee_id) {
        logs.push({ card_id: id, user_id: userId, action_type: 'assigned', field: 'assignee_id', old_val: oldCard.assignee_id, new_val: updates.assignee_id });
     }
  }
  
  if (logs.length > 0) {
     await supabase.from('card_history').insert(logs);
  }

  revalidatePath('/');
}

export async function updateListPositionsAction(updates: { id: string, position: number }[]) {
  for (const update of updates) {
    await supabase.from('lists').update({ position: update.position }).eq('id', update.id);
  }
}

export async function updateCardPositionsAction(updates: { id: string, list_id: string, position: number }[]) {
  for (const update of updates) {
    await supabase.from('cards').update({ 
      list_id: update.list_id, 
      position: update.position 
    }).eq('id', update.id);
  }
}

