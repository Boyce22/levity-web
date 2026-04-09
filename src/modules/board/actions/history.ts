'use server';

import { httpGet } from '@/lib/http';

interface CardHistoryResponse {
  id: string;
  createdBy: string;
  actionType: string;
  field: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
  users?: {
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
}

export async function getCardHistoryAction(workspaceId: string, cardId: string): Promise<CardHistoryResponse[]> {
  try {
    const result = await httpGet<CardHistoryResponse[]>(`/workspaces/${workspaceId}/cards/${cardId}/history`);
    return result || [];
  } catch (error) {
    console.error('Failed to fetch card history:', error);
    return [];
  }
}

