'use server';

import { supabase } from '@/lib/supabase';

export async function getCardHistoryAction(cardId: string) {
  const { data, error } = await supabase.from('card_history').select(`
    *,
    users ( id, username, display_name, avatar_url )
  `).eq('card_id', cardId).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}
