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
  const userId = await getUserId();

  const trimmed = name?.trim();
  if (!trimmed || trimmed.length < 3) {
    throw new Error('O nome do workspace deve ter pelo menos 3 caracteres.');
  }

  // 1. cria workspace
  const workspace = await workspaceRepo.create(name);

  try {
    // 2. cria membership (owner)
    await workspaceRepo.addMember(workspace.id, userId, 'owner');

    // 3. Semear prioridades padrão
    await workspaceRepo.seedDefaultPriorities(workspace.id);

  } catch (error: any) {
    // Se falhar ao criar o membro, tentamos limpar o workspace para evitar lixo
    await workspaceRepo.delete(workspace.id);
    throw new Error(error.message);
  }

  revalidatePath('/');
  return workspace;
}

export async function getUserWorkspacesAction() {
  const userId = await getUserId();
  return workspaceRepo.findAllByMember(userId);
}

export async function renameWorkspaceAction(id: string, newName: string) {
  const userId = await getUserId();
  
  // 🛡️ Security Gateway: Verify RBAC
  const member = await assertUserOwnsWorkspace(userId, id);
  if (!['owner', 'admin'].includes(member.role)) {
    throw new Error('403 Forbidden: Permission denied for renaming this workspace.');
  }

  await workspaceRepo.rename(id, newName);
  revalidatePath('/');
}

export async function deleteWorkspaceAction(id: string) {
  const userId = await getUserId();
  
  // 🛡️ Security Gateway: Only owners can delete the entire workspace
  const member = await assertUserOwnsWorkspace(userId, id);
  if (member.role !== 'owner') {
    throw new Error('403 Forbidden: Only the workspace owner can perform this irreversible action.');
  }

  await workspaceRepo.delete(id);
  revalidatePath('/');
}
