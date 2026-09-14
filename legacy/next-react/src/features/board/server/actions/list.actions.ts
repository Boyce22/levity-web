'use server';

import { revalidatePath } from 'next/cache';
import {
  createListUseCase,
  renameListUseCase,
  deleteListUseCase,
  updateListTypeUseCase,
  updateListWipLimitUseCase,
  updateListPositionsUseCase,
} from '../use-cases/list.use-cases';

export async function createListAction(
  title: string,
  position: number,
  workspaceId: string,
) {
  const list = await createListUseCase(title, position, workspaceId);
  revalidatePath('/');
  return list;
}

export async function renameListAction(
  listId: string,
  title: string,
  workspaceId: string,
) {
  await renameListUseCase(listId, title, workspaceId);
  revalidatePath('/');
}

export async function deleteListAction(id: string, workspaceId: string) {
  await deleteListUseCase(id, workspaceId);
  revalidatePath('/');
}

export async function updateListTypeAction(
  listId: string,
  listType: Parameters<typeof updateListTypeUseCase>[1],
  workspaceId: string,
) {
  await updateListTypeUseCase(listId, listType, workspaceId);
  revalidatePath('/');
}

export async function updateListWipLimitAction(
  listId: string,
  wipLimit: number | null,
  workspaceId: string,
) {
  await updateListWipLimitUseCase(listId, wipLimit, workspaceId);
  revalidatePath('/');
}

export async function updateListPositionsAction(
  updates: Parameters<typeof updateListPositionsUseCase>[0],
  workspaceId: string,
) {
  await updateListPositionsUseCase(updates, workspaceId);
}
