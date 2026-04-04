'use server';

import { workspaceRepo } from '@/repositories';

/**
 * 🛡️ Security Gateway: Asserts the authenticated user explicitly belongs to the Workspace Member matrix.
 * Throws a fatal 403 error preventing IDOR.
 */
export async function assertUserOwnsWorkspace(currentUserId: string, workspaceId: string) {
  const data = await workspaceRepo.findMember(workspaceId, currentUserId);

  if (!data) {
    throw new Error('403 Forbidden: Unauthorized cross-tenant access attempt blocked.');
  }

  return data;
}

/**
 * 🛡️ Security Gateway: Asserts the list belongs to a workspace the user is a member of.
 */
export async function assertUserOwnsList(currentUserId: string, listId: string): Promise<string> {
  const result = await workspaceRepo.findListWorkspaceId(listId);

  if (!result) {
    throw new Error(`404 Not Found: Target list ${listId} is completely missing or inaccessible.`);
  }

  // 🛡️ Legacy Fallback: If list has no workspace (orphaned), allow access if the user is the owner
  if (!result.workspace_id) {
    if (result.created_by === currentUserId) {
      console.warn(`[Security] Accessible legacy list ${listId} (orphaned) accessed by owner.`);
      return ''; // No workspace context to return, but access granted
    }
    throw new Error(`403 Forbidden: Legacy list ${listId} has no workspace context and you are not the owner.`);
  }

  await assertUserOwnsWorkspace(currentUserId, result.workspace_id);
  return result.workspace_id;
}

/**
 * 🛡️ Security Gateway: Asserts the card belongs to a list inside a workspace the user is a member of.
 * ⚡ Optimized: Uses Atomic Resolver to fetch context in ONE query.
 */
export async function assertUserOwnsCard(currentUserId: string, cardId: string) {
  const context = await workspaceRepo.findCardWorkspaceContext(cardId, currentUserId);

  if (!context) {
    // We double check if the card exists at all to throw the correct error (404 vs 403)
    // BUT we try to be efficient: if context is null, it's either 404 or 403.
    throw new Error('404 Not Found: Target card is completely missing or inaccessible.');
  }

  const { workspace_id, created_by, role } = context;

  // 🛡️ Legacy Fallback: If card has no workspace context, allow access if the user is the creator
  if (!workspace_id) {
    if (created_by === currentUserId) {
      console.warn(`[Security] Accessible legacy card ${cardId} accessed by owner.`);
      return { list_id: '', workspace_id: '', created_by }; // Return empty context for legacy
    }
    throw new Error(`403 Forbidden: Legacy card ${cardId} has no workspace context and you are not the owner.`);
  }

  // 🛡️ standard membership check
  if (!role) {
    throw new Error('403 Forbidden: Unauthorized cross-tenant access attempt blocked.');
  }

  return { workspace_id, created_by };
}
/**
 * 🛡️ Security Gateway: Asserts the user has one of the specific roles in the workspace.
 * Returns the membership data including the role.
 */
export async function assertHasRole(currentUserId: string, workspaceId: string, allowedRoles: string[]) {
  const member = await assertUserOwnsWorkspace(currentUserId, workspaceId);

  if (!allowedRoles.includes(member.role)) {
    throw new Error(`403 Forbidden: Insufficient permissions. Required one of: ${allowedRoles.join(', ')}`);
  }

  return member;
}
