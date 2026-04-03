'use server';

import { workspaceRepo } from '@/repositories';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { verifyJwtToken } from '@/lib/auth';
import { assertUserOwnsWorkspace } from './assertions';

async function getUserId() {
  const token = (await cookies()).get('token')?.value;
  if (!token) throw new Error('Unauthorized');
  const payload = await verifyJwtToken(token);
  if (!payload || !payload.id) throw new Error('Unauthorized');
  return payload.id as string;
}

export async function createWorkspaceAction(name: string) {
  const currentUserId = await getUserId();

  const trimmed = name?.trim();
  if (!trimmed || trimmed.length < 3) {
    throw new Error('O nome do workspace deve ter pelo menos 3 caracteres.');
  }

  // 1. cria workspace
  const workspace = await workspaceRepo.create(name, currentUserId);

  try {
    // 2. cria membership (owner)
    await workspaceRepo.addMember(workspace.id, currentUserId, 'owner', currentUserId);

    // 3. Semear prioridades padrão
    await workspaceRepo.seedDefaultPriorities(workspace.id, currentUserId);

  } catch (error: any) {
    // Se falhar ao criar o membro, tentamos limpar o workspace para evitar lixo
    await workspaceRepo.delete(workspace.id);
    throw new Error(error.message);
  }

  revalidatePath('/');
  return workspace;
}

export async function getUserWorkspacesAction() {
  const currentUserId = await getUserId();
  return workspaceRepo.findAllByMember(currentUserId);
}

export async function renameWorkspaceAction(id: string, newName: string) {
  const currentUserId = await getUserId();
  
  // 🛡️ Security Gateway: Verify RBAC
  const member = await assertUserOwnsWorkspace(currentUserId, id);
  if (!['owner', 'admin'].includes(member.role)) {
    throw new Error('403 Forbidden: Permission denied for renaming this workspace.');
  }

  await workspaceRepo.rename(id, newName, currentUserId);
  revalidatePath('/');
}

export async function deleteWorkspaceAction(id: string) {
  const currentUserId = await getUserId();
  
  // 🛡️ Security Gateway: Only owners can delete the entire workspace
  const member = await assertUserOwnsWorkspace(currentUserId, id);
  if (member.role !== 'owner') {
    throw new Error('403 Forbidden: Only the workspace owner can perform this irreversible action.');
  }

  await workspaceRepo.delete(id);
  revalidatePath('/');
}
