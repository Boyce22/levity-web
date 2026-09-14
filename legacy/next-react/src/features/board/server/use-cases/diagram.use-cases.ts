import { requireSession } from '@/infra/auth/session';
import { diagramRepository } from '../repositories/diagram-repository';
import { DiagramDataSchema, MAX_DIAGRAM_SIZE_BYTES } from '@/contracts/Diagram';
import { DomainError } from '@/infra/http/errors';

// ─── QUERIES ──────────────────────────────────────────────────────────────────

export async function getDiagramUseCase(cardId: string) {
  if (!cardId || typeof cardId !== 'string' || cardId.trim() === '') {
    throw new DomainError('INVALID_INPUT', 'Diagram requires a linked cardId.');
  }

  await requireSession();
  return diagramRepository.getDiagram(cardId);
}

// ─── MUTATIONS ────────────────────────────────────────────────────────────────

export async function saveDiagramUseCase(cardId: string, rawData: unknown) {
  if (!cardId || typeof cardId !== 'string' || cardId.trim() === '') {
    throw new DomainError('INVALID_INPUT', 'Diagram requires a linked cardId.');
  }

  await requireSession();

  const payloadString = JSON.stringify(rawData);
  if (payloadString.length > MAX_DIAGRAM_SIZE_BYTES) {
    throw new DomainError(
      'DIAGRAM_TOO_LARGE',
      `Diagram exceeds the ${MAX_DIAGRAM_SIZE_BYTES / 1024}KB limit.`,
    );
  }

  const validData = DiagramDataSchema.parse(rawData);
  return diagramRepository.saveDiagram(cardId, validData);
}
