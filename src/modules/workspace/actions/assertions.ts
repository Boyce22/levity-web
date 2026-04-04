'use server';

import { workspaceRepo } from '@/repositories';

const GENERIC_ERROR = '404 Not Found: The requested resource is missing or you do not have permission to access it.';

/**
 * 🛡️ Security Gateway: Asserts the authenticated user explicitly belongs to the Workspace Member matrix.
 */
export async function assertUserOwnsWorkspace(currentUserId: string, workspaceId: string) {
  const data = await workspaceRepo.findMember(workspaceId, currentUserId);

  if (!data) {
    throw new Error(GENERIC_ERROR);
  }

  return data;
}

/**
 * 🛡️ Security Gateway: Asserts the list belongs to a workspace the user is a member of.
 */
export async function assertUserOwnsList(currentUserId: string, listId: string): Promise<string> {
  const result = await workspaceRepo.findListWorkspaceId(listId);

  if (!result || !result.workspace_id) {
    throw new Error(GENERIC_ERROR);
  }

  await assertUserOwnsWorkspace(currentUserId, result.workspace_id);
  return result.workspace_id;
}

/**
 * 🛡️ Security Gateway: Asserts the card belongs to a list inside a workspace the user is a member of.
 * ⚡ Optimized: Uses Atomic Resolver to fetch context in ONE query (dual-resolve).
 */
export async function assertUserOwnsCard(currentUserId: string, cardId: string) {
  const context = await workspaceRepo.findCardWorkspaceContext(cardId, currentUserId);

  if (!context || !context.workspace_id || !context.role) {
    throw new Error(GENERIC_ERROR);
  }

  return { workspace_id: context.workspace_id, created_by: context.created_by };
}

/**
 * 🛡️ Security Gateway: Asserts the user has one of the specific roles in the workspace.
 * Returns the membership data including the role.
 */
export async function assertHasRole(currentUserId: string, workspaceId: string, allowedRoles: string[]) {
  const member = await assertUserOwnsWorkspace(currentUserId, workspaceId);

  if (!allowedRoles.includes(member.role)) {
    throw new Error(GENERIC_ERROR);
  }

  return member;
}
