'use server';

import { getBoardUseCase } from '../use-cases/board.use-cases';

export async function getBoardDataAction(workspaceId?: string) {
  return getBoardUseCase(workspaceId);
}
