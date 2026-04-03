import { supabase } from '@/lib/supabase';
import type { IBoardRepository, ListRecord, CardRecord, ListType } from '../interfaces/board.repository';

export class SupabaseBoardRepository implements IBoardRepository {
  async findListsWithCards(workspaceId: string): Promise<{ lists: ListRecord[]; cards: CardRecord[] }> {
    const { data: lists, error } = await supabase
      .from('lists')
      .select('*, cards(*)')
      .eq('workspace_id', workspaceId)
      .order('position');

    if (error) throw new Error(`Failed to load board lists: ${error.message}`);

    const sortedLists: ListRecord[] = [];
    const sortedCards: CardRecord[] = [];

    for (const list of lists || []) {
      const listCards = list.cards || [];
      listCards.sort((a: any, b: any) => a.position - b.position);
      sortedCards.push(...listCards);

      const { cards, ...listData } = list;
      sortedLists.push(listData as ListRecord);
    }

    return { lists: sortedLists, cards: sortedCards };
  }

  async createList(data: { createdBy: string; title: string; position: number; workspaceId: string }): Promise<ListRecord> {
    const { data: newList, error } = await supabase
      .from('lists')
      .insert({
        created_by: data.createdBy,
        title: data.title,
        position: data.position,
        workspace_id: data.workspaceId,
      })
      .select()
      .single();

    if (error || !newList) {
      throw new Error(error?.message || 'Failed to create list');
    }

    return newList;
  }

  async renameList(listId: string, title: string): Promise<void> {
    const { error } = await supabase
      .from('lists')
      .update({ title })
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

  async updateListType(listId: string, listType: ListType | null): Promise<void> {
    const { error } = await supabase
      .from('lists')
      .update({ list_type: listType })
      .eq('id', listId);

    if (error) throw new Error(error.message);
  }

  async updateListPositions(updates: { id: string; position: number }[]): Promise<void> {
    // Note: This is done concurrently in the action, but the repo should handle single updates or we keep the loop in the repo
    // To maintain compatibility with the current action's logic (which does Promise.all), I'll implement a single update here
    // or better, a batch-like approach if possible, but Supabase doesn't have a clean batch update by ID for different values in one call.
    // So we'll keep it simple: the repository defines the single operation, and the action handles parallelism.
    
    // Wait, the interface says `updateListPositions(updates: { id: string; position: number }[])`.
    // I will implement it as a Promise.all here to centralize the implementation details.
    
    await Promise.all(
      updates.map(async (update) => {
        const { error } = await supabase
          .from('lists')
          .update({ position: update.position })
          .eq('id', update.id);
        if (error) throw new Error(error.message);
      })
    );
  }
}
