import { supabase } from '@/lib/supabase';
import type { ICardRepository, CardRecord, CardUpdatePayload, CardHistoryRecord } from '../interfaces/card.repository';

export class SupabaseCardRepository implements ICardRepository {
  async findById(cardId: string): Promise<CardRecord | null> {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('id', cardId)
      .maybeSingle();

    if (error || !data) return null;

    return data;
  }

  async createCard(data: { listId: string; content: string; position: number; createdBy: string }): Promise<CardRecord> {
    const { data: newCard, error } = await supabase
      .from('cards')
      .insert({ 
        list_id: data.listId, 
        content: data.content, 
        position: data.position,
        created_by: data.createdBy,
        updated_at: new Date().toISOString(),
        updated_by: data.createdBy
      })
      .select()
      .single();

    if (error || !newCard) {
      throw new Error(error?.message || 'Failed to create card');
    }

    return newCard;
  }

  async deleteCard(cardId: string): Promise<void> {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId);

    if (error) throw new Error(error.message);
  }

  async updateCard(cardId: string, payload: CardUpdatePayload, updatedBy: string): Promise<void> {
    // 🛡️ Guard: Postgres/Supabase throws "valid input syntax" errors for empty strings in TIMESTAMPTZ or UUID columns.
    const sanitizedPayload = { 
      ...payload, 
      updated_by: updatedBy,
      updated_at: new Date().toISOString()
    };
    if (sanitizedPayload.due_date === '') sanitizedPayload.due_date = null;
    if (sanitizedPayload.assignee_id === '') sanitizedPayload.assignee_id = null;

    const { error } = await supabase
      .from('cards')
      .update(sanitizedPayload)
      .eq('id', cardId);

    if (error) throw new Error(error.message);
  }

  async updateCardPositions(updates: { id: string; listId: string; position: number }[], updatedBy: string): Promise<void> {
    await Promise.all(
      updates.map(async (update) => {
        const { error } = await supabase
          .from('cards')
          .update({
            list_id: update.listId,
            position: update.position,
            updated_by: updatedBy,
          })
          .eq('id', update.id);
        if (error) throw new Error(error.message);
      }),
    );
  }

  async getHistory(cardId: string): Promise<CardHistoryRecord[]> {
    const { data, error } = await supabase
      .from('card_history')
      .select(`
        *,
        users!created_by ( id, username, display_name, avatar_url )
      `)
      .eq('card_id', cardId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return data || [];
  }

  async insertHistory(logs: Omit<CardHistoryRecord, 'id' | 'created_at' | 'users'>[]): Promise<void> {
    const { error } = await supabase
      .from('card_history')
      .insert(logs);

    if (error) throw new Error(error.message);
  }
}
