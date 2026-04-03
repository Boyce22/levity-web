'use server';

import { cardRepo } from '@/repositories';
import { cookies } from 'next/headers';
import { verifyJwtToken } from '@/lib/auth';
import { assertUserOwnsCard } from '@/modules/workspace/actions/assertions';

async function getUserId() {
  const token = (await cookies()).get('token')?.value;
  if (!token) throw new Error('Unauthorized');
  const payload = await verifyJwtToken(token);
  if (!payload || !payload.id) throw new Error('Unauthorized');
  return payload.id as string;
}

export async function getCardHistoryAction(cardId: string) {
  const currentUserId = await getUserId();
  
  // 🛡️ Security Gateway: IDOR Protection
  await assertUserOwnsCard(currentUserId, cardId);

  return cardRepo.getHistory(cardId);
}
