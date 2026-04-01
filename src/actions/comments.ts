'use server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { verifyJwtToken } from '@/lib/auth';

export type Comment = { 
  id: string; 
  card_id: string; 
  user_id: string; 
  parent_id?: string | null;
  content: string; 
  created_at: string; 
  users: { username: string; display_name?: string; avatar_url?: string } 
};

async function getUserId() {
  const token = (await cookies()).get('token')?.value;
  if (!token) throw new Error('Unauthorized');
  const payload = await verifyJwtToken(token);
  if (!payload || !payload.id) throw new Error('Unauthorized');
  return payload.id as string;
}

export async function getCommentsAction(cardId: string, limit: number = 3, cursor: string | null = null) {
  let query = supabase
    .from('comments')
    .select('*, users(username, display_name, avatar_url)')
    .eq('card_id', cardId)
    .is('parent_id', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data: parents, error: parentsErr } = await query;
  
  if (parentsErr || !parents || parents.length === 0) return [];
  
  const parentIds = parents.map(p => p.id);
  const { data: replies, error: repliesErr } = await supabase
    .from('comments')
    .select('*, users(username, display_name, avatar_url)')
    .in('parent_id', parentIds)
    .order('created_at', { ascending: true });
    
  const reversedParents = parents.reverse() as Comment[];
  
  if (!repliesErr && replies) {
     return [...reversedParents, ...(replies as Comment[])];
  }
  
  return reversedParents;
}

export async function createCommentAction(cardId: string, content: string, parentId?: string | null) {
  const userId = await getUserId();
  const { data: newComment, error } = await supabase
    .from('comments')
    .insert({ card_id: cardId, user_id: userId, content, parent_id: parentId })
    .select('*, users(username, display_name, avatar_url)')
    .single();
  
  if (error) throw new Error(error.message);

  // Mentions logic: find @usernames in content
  const matches = content.match(/@(\w+)/g);
  if (matches) {
    const usernames = matches.map(m => m.slice(1));
    const { data: mentionedUsers } = await supabase
      .from('users')
      .select('id, username')
      .in('username', usernames);
      
    if (mentionedUsers && mentionedUsers.length > 0) {
      const notifications = mentionedUsers
        .map(u => ({
          user_id: u.id,
          actor_id: userId,
          card_id: cardId,
          type: 'mention',
          content: content
        }));
      if (notifications.length > 0) {
        await supabase.from('notifications').insert(notifications);
      }
    }
  }

  return newComment as Comment;
}
