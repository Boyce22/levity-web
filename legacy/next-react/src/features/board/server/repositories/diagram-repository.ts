import { serverApiClient } from '@/infra/http/serverApiClient';
import { ApiError } from '@/infra/http/errors';
import { Diagram, DiagramSchema, DiagramData } from '@/contracts/Diagram';

export const diagramRepository = {
  async getDiagram(cardId: string): Promise<Diagram | null> {
    try {
      const data = await serverApiClient.get<unknown>(`/diagrams/${cardId}`);
      return DiagramSchema.parse(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  },

  async saveDiagram(cardId: string, data: DiagramData): Promise<Diagram> {
    const result = await serverApiClient.put<unknown>('/diagrams', { cardId, data });
    return DiagramSchema.parse(result);
  },
};
