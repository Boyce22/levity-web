'use server';

import { workspaceRepo } from '@/repositories';

/**
 * 🛡️ Security Gateway: Asserts the authenticated user explicitly belongs to the Workspace Member matrix.
 * Throws a fatal 403 error preventing IDOR.
 */
export async function assertUserOwnsWorkspace(userId: string, workspaceId: string) {
  const data = await workspaceRepo.findMember(workspaceId, userId);

  if (!data) {
    throw new Error('403 Forbidden: Unauthorized cross-tenant access attempt blocked.');
  }

  return data;
}

/**
 * 🛡️ Security Gateway: Asserts the list belongs to a workspace the user is a member of.
 */
export async function assertUserOwnsList(userId: string, listId: string): Promise<string> {
  const workspaceId = await workspaceRepo.findListWorkspaceId(listId);

  if (!workspaceId) {
    throw new Error('404 Not Found: Target list is completely missing or inaccessible.');
  }

  await assertUserOwnsWorkspace(userId, workspaceId);
  return workspaceId;
}

/**
 * 🛡️ Security Gateway: Asserts the card belongs to a list inside a workspace the user is a member of.
 */
export async function assertUserOwnsCard(userId: string, cardId: string) {
  const list_id = await workspaceRepo.findCardListId(cardId);

  if (!list_id) {
    throw new Error('404 Not Found: Target card is completely missing or inaccessible.');
  }

  const workspaceId = await assertUserOwnsList(userId, list_id);
  return { list_id, workspace_id: workspaceId };
}
