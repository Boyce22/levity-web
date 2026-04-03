import { supabase } from '@/lib/supabase';
import type { IBoardRepository, ListRecord, CardRecord, ListType } from '../interfaces/board.repository';

export class SupabaseBoardRepository implements IBoardRepository {
  async findListsWithCards(workspaceId: string): Promise<{ lists: ListRecord[]; cards: CardRecord[] }> {
    const { data: lists, error } = await supabase
      .from('lists')
      .select('*, cards(*)')
      .eq('workspace_id', workspaceId)
      .order('position');

    if (error) {
      console.error('[SupabaseBoardRepository.findListsWithCards] Error:', error);
      throw new Error(`Failed to load board lists: ${error.message}`);
    }

    const sortedLists: ListRecord[] = [];
    const sortedCards: CardRecord[] = [];

    // 🛡️ Data Sanitization: Ensure lists and cards are properly mapped
    for (const list of lists || []) {
      const { cards, ...listData } = list;
      sortedLists.push(listData as ListRecord);

      if (cards && Array.isArray(cards)) {
        const listCards = [...cards];
        listCards.sort((a, b) => (a.position || 0) - (b.position || 0));
        sortedCards.push(...listCards);
      }
    }

    return { lists: sortedLists, cards: sortedCards };
  }

  async createList(data: { createdBy: string; title: string; position: number; workspace_id: string }): Promise<ListRecord> {
    const { data: newList, error } = await supabase
      .from('lists')
      .insert({
        created_by: data.createdBy,
        title: data.title,
        position: data.position,
        workspace_id: data.workspace_id,
        updated_at: new Date().toISOString(),
        updated_by: data.createdBy
      })
      .select()
      .single();
 
    if (error || !newList) {
      throw new Error(error?.message || 'Failed to create list');
    }
 
    return newList as ListRecord;
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

    return newCard as CardRecord;
  }

  async renameList(listId: string, title: string, updatedBy: string): Promise<void> {
    const { error } = await supabase
      .from('lists')
      .update({ title, updated_by: updatedBy })
      .eq('id', listId);

    if (error) throw new Error(error.message);
  }

  async deleteList(listId: string): Promise<void> {
    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', listId);

    if (error) throw new Error(error.message);
  }

  async updateListType(listId: string, listType: ListType | null, updatedBy: string): Promise<void> {
    const { error } = await supabase
      .from('lists')
      .update({ list_type: listType, updated_by: updatedBy })
      .eq('id', listId);

    if (error) throw new Error(error.message);
  }

  async updateListPositions(updates: { id: string; position: number }[], updatedBy: string): Promise<void> {
    await Promise.all(
      updates.map(async (update) => {
        const { error } = await supabase
          .from('lists')
          .update({ position: update.position, updated_by: updatedBy })
          .eq('id', update.id);
        if (error) throw new Error(error.message);
      })
    );
  }

  async updateListWipLimit(listId: string, wipLimit: number | null, updatedBy: string): Promise<void> {
    const { error } = await supabase
      .from('lists')
      .update({ wip_limit: wipLimit, updated_by: updatedBy })
      .eq('id', listId);

    if (error) throw new Error(error.message);
  }

  async findById(cardId: string): Promise<CardRecord | null> {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('id', cardId)
      .single();

    if (error || !data) return null;
    return data as CardRecord;
  }
}
