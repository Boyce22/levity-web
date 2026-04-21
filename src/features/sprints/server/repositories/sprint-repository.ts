import { serverApiClient } from '@/infra/http/serverApiClient';
import { ApiError } from '@/infra/http/errors';
import {
  Sprint,
  SprintSchema,
  SprintCard,
  SprintCardSchema,
  CreateSprint,
  UpdateSprint,
  CompleteSprint,
} from '@/contracts/Sprint';
import { z } from 'zod';

class SprintRepository {
  async getSprintsByWorkspace(workspaceId: string): Promise<Sprint[]> {
    const data = await serverApiClient.get<unknown>(`/workspaces/${workspaceId}/sprints`);
    return z.array(SprintSchema).parse(data);
  }

  async getSprintById(workspaceId: string, sprintId: string): Promise<Sprint> {
    const data = await serverApiClient.get<unknown>(`/workspaces/${workspaceId}/sprints/${sprintId}`);
    return SprintSchema.parse(data);
  }

  async getActiveSprint(workspaceId: string): Promise<Sprint | null> {
    try {
      const data = await serverApiClient.get<unknown>(`/workspaces/${workspaceId}/sprints/active`);
      if (data == null) return null;
      return SprintSchema.parse(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        return null;
      }
      throw err;
    }
  }

  async createSprint(workspaceId: string, data: CreateSprint): Promise<Sprint> {
    const result = await serverApiClient.post<unknown>(`/workspaces/${workspaceId}/sprints`, data);
    console.log('Sprint created:', result);
    return SprintSchema.parse(result);
  }

  async updateSprint(workspaceId: string, sprintId: string, data: UpdateSprint): Promise<Sprint> {
    const result = await serverApiClient.patch<unknown>(
      `/workspaces/${workspaceId}/sprints/${sprintId}`,
      data,
    );
    return SprintSchema.parse(result);
  }

  async deleteSprint(workspaceId: string, sprintId: string): Promise<void> {
    await serverApiClient.delete(`/workspaces/${workspaceId}/sprints/${sprintId}`);
  }

  async activateSprint(workspaceId: string, sprintId: string): Promise<Sprint> {
    const data = await serverApiClient.post<unknown>(
      `/workspaces/${workspaceId}/sprints/${sprintId}/activate`,
    );
    return SprintSchema.parse(data);
  }

  async completeSprint(workspaceId: string, sprintId: string, data: CompleteSprint): Promise<Sprint> {
    const result = await serverApiClient.post<unknown>(
      `/workspaces/${workspaceId}/sprints/${sprintId}/complete`,
      data,
    );
    return SprintSchema.parse(result);
  }

  async addCardToSprint(workspaceId: string, sprintId: string, cardId: string): Promise<SprintCard> {
    const data = await serverApiClient.post<unknown>(
      `/workspaces/${workspaceId}/sprints/${sprintId}/cards`,
      { cardId },
    );
    return SprintCardSchema.parse(data);
  }

  async removeCardFromSprint(workspaceId: string, sprintId: string, cardId: string): Promise<void> {
    await serverApiClient.delete(
      `/workspaces/${workspaceId}/sprints/${sprintId}/cards/${cardId}`,
    );
  }

  async reorderSprintCards(
    workspaceId: string,
    sprintId: string,
    updates: { id: string; position: number }[],
  ): Promise<void> {
    await serverApiClient.patch(
      `/workspaces/${workspaceId}/sprints/${sprintId}/cards/reorder`,
      updates,
    );
  }
}

export const sprintRepository = new SprintRepository();
