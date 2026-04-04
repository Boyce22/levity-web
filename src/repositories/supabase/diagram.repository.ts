import { supabase } from '@/lib/supabase';
import type { IDiagramRepository, DiagramRecord } from '../interfaces/diagram.repository';

export class SupabaseDiagramRepository implements IDiagramRepository {
  async findByCardId(cardId: string): Promise<DiagramRecord | null> {
    const { data, error } = await supabase
      .from('diagrams')
      .select('*')
      .eq('card_id', cardId)
      .maybeSingle();

    if (error || !data) return null;

    return data;
  }

  async save(cardId: string, diagramData: any): Promise<DiagramRecord> {
    // 🛡️ BFLA/IDOR check should be performed in the Action layer, 
    // but here we ensure the record is created or updated.
    const now = new Date().toISOString();

    // Check if it already exists to update
    const { data: existing } = await supabase
      .from('diagrams')
      .select('id')
      .eq('card_id', cardId)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('diagrams')
        .update({
          data: diagramData,
          updated_at: now,
        })
        .eq('card_id', cardId)
        .select()
        .single();

      if (error || !data) throw new Error(error?.message || 'Failed to update diagram');
      return data;
    } else {
      const { data, error } = await supabase
        .from('diagrams')
        .insert({
          card_id: cardId,
          data: diagramData,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error || !data) throw new Error(error?.message || 'Failed to create diagram');
      return data;
    }
  }

  async deleteByCardId(cardId: string): Promise<void> {
    const { error } = await supabase
      .from('diagrams')
      .delete()
      .eq('card_id', cardId);

    if (error) throw new Error(error.message);
  }
}
