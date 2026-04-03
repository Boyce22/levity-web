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

  async create(data: { cardId: string; created_by: string; content: string; parentId?: string | null }): Promise<CommentRecord> {
    const { data: newComment, error } = await supabase
      .from('comments')
      .insert({
        card_id: data.cardId,
        created_by: data.created_by,
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

  async findById(id: string): Promise<CommentRecord | null> {
    const { data, error } = await supabase
      .from('comments')
      .select('*, users(username, display_name, avatar_url)')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return data as any;
  }

  async update(id: string, content: string): Promise<CommentRecord> {
    const { data: updated, error } = await supabase
      .from('comments')
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, users(username, display_name, avatar_url)')
      .single();

    if (error || !updated) {
      throw new Error(error?.message || 'Failed to update comment');
    }

    return updated as any;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }
}
