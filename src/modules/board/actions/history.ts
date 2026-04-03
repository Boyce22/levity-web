'use server';

import { cardRepo } from '@/repositories';

export async function getCardHistoryAction(cardId: string) {
  return cardRepo.getHistory(cardId);
}
