import { serverApiClient } from '@/infra/http/serverApiClient';
import { BoardDataResponse, BoardDataSchema, Card, CardSchema, List, ListSchema, ListType } from '@/contracts/Board';

export class BoardRepository {
  async getBoardByWorkspace(workspaceId: string): Promise<BoardDataResponse> {
    const data = await serverApiClient.get<unknown>(`/workspaces/${workspaceId}/board`);
    return BoardDataSchema.parse(data);
  }

  async createList(workspaceId: string, title: string, position: number): Promise<List> {
    const data = await serverApiClient.post<unknown>(`/workspaces/${workspaceId}/lists`, { title, position });
    return ListSchema.parse(data);
  }

  async updateList(workspaceId: string, listId: string, updates: Partial<List>): Promise<void> {
    await serverApiClient.patch(`/workspaces/${workspaceId}/lists/${listId}`, updates);
  }

  async deleteList(workspaceId: string, listId: string): Promise<void> {
    await serverApiClient.delete(`/workspaces/${workspaceId}/lists/${listId}`);
  }

  async updateListPositions(workspaceId: string, updates: { id: string; position: number }[]): Promise<void> {
    await serverApiClient.patch(`/workspaces/${workspaceId}/lists/positions`, updates);
  }

  async createCard(workspaceId: string, listId: string, content: string, position: number): Promise<Card> {
    const data = await serverApiClient.post<unknown>(`/workspaces/${workspaceId}/cards`, { listId, content, position });
    return CardSchema.parse(data);
  }

  async updateCard(workspaceId: string, cardId: string, updates: Partial<Card>): Promise<void> {
    await serverApiClient.patch(`/workspaces/${workspaceId}/cards/${cardId}`, updates);
  }

  async deleteCard(workspaceId: string, cardId: string): Promise<void> {
    await serverApiClient.delete(`/workspaces/${workspaceId}/cards/${cardId}`);
  }

  async updateCardPositions(workspaceId: string, updates: { id: string; listId: string; position: number }[]): Promise<void> {
    await serverApiClient.patch(`/workspaces/${workspaceId}/cards/positions`, updates);
  }
}

export const boardRepository = new BoardRepository();
