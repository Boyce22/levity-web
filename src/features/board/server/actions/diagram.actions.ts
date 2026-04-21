'use server';

import { revalidatePath } from 'next/cache';
import { getDiagramUseCase, saveDiagramUseCase } from '../use-cases/diagram.use-cases';

export async function getDiagramAction(cardId: string) {
  return getDiagramUseCase(cardId);
}

export async function saveDiagramAction(cardId: string, diagramData: unknown) {
  const diagram = await saveDiagramUseCase(cardId, diagramData);
  revalidatePath('/');
  return diagram;
}
