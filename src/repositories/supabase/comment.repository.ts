import { supabase } from '@/lib/supabase';
import type { ICommentRepository, CommentRecord } from '../interfaces/comment.repository';

export class SupabaseCommentRepository implements ICommentRepository {
  async findByCard(cardId: string, limit: number, cursor: string | null): Promise<CommentRecord[]> {
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
    
    if (!repliesErr && replies) {
       return [...(parents as any[]), ...(replies as any[])];
    }
    
    return parents as any[];
  }

  async create(data: { cardId: string; userId: string; content: string; parentId?: string | null }): Promise<CommentRecord> {
    const { data: newComment, error } = await supabase
      .from('comments')
      .insert({
        card_id: data.cardId,
        user_id: data.userId,
        content: data.content,
        parent_id: data.parentId,
      })
      .select('*, users(username, display_name, avatar_url)')
      .single();

    if (error || !newComment) {
      throw new Error(error?.message || 'Failed to create comment');
    }

    return newComment as any;
  }
}
