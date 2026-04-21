import { serverApiClient } from '@/infra/http/serverApiClient';
import { CardHistory, CardHistorySchema } from '@/contracts/CardHistory';
import { z } from 'zod';

export const historyRepository = {
  async getCardHistory(workspaceId: string, cardId: string): Promise<CardHistory[]> {
    const data = await serverApiClient.get<unknown>(
      `/workspaces/${workspaceId}/cards/${cardId}/history`,
    );
    return z.array(CardHistorySchema).parse(data);
  },
};
