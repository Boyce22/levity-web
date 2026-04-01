'use server';

import { supabase } from '@/lib/supabase';
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
  const { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .insert({ name })
    .select()
    .single();

  if (wsError) throw new Error(wsError.message);

  // 2. cria membership (owner)
  const { error: memberError } = await supabase
    .from('workspace_members')
    .insert({
      workspace_id: workspace.id,
      user_id: userId,
      role: 'owner',
    });

  if (memberError) {
    await supabase.from('workspaces').delete().eq('id', workspace.id);
    throw new Error(memberError.message);
  }

  // 3. Semear prioridades padrão
  const defaultPriorities = [
    { workspace_id: workspace.id, name: 'Low', color: '#34d399', icon: '↓', position: 0 },
    { workspace_id: workspace.id, name: 'Medium', color: '#fbbf24', icon: '→', position: 1 },
    { workspace_id: workspace.id, name: 'High', color: '#f87171', icon: '↑', position: 2 },
  ];

  const { error: seedError } = await supabase
    .from('workspace_priorities')
    .insert(defaultPriorities);

  if (seedError) {
    console.error('Error seeding priorities:', seedError);
    // Não paramos a criação por causa disso, mas logamos
  }

  revalidatePath('/');
  return workspace;
}

export async function renameWorkspaceAction(id: string, newName: string) {
  const userId = await getUserId();
  
  // 🛡️ Security Gateway: Verify RBAC
  const member = await assertUserOwnsWorkspace(userId, id);
  if (!['owner', 'admin'].includes(member.role)) {
    throw new Error('403 Forbidden: Permission denied for renaming this workspace.');
  }

  const { error } = await supabase
    .from('workspaces')
    .update({ name: newName })
    .eq('id', id);

  if (error) {
    console.error('Error renaming workspace:', error);
    throw new Error('Failed to update workspace name.');
  }

  revalidatePath('/');
}

export async function deleteWorkspaceAction(id: string) {
  const userId = await getUserId();
  
  // 🛡️ Security Gateway: Only owners can delete the entire workspace
  const member = await assertUserOwnsWorkspace(userId, id);
  if (member.role !== 'owner') {
    throw new Error('403 Forbidden: Only the workspace owner can perform this irreversible action.');
  }

  const { error } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting workspace:', error);
    throw new Error('Failed to delete workspace.');
  }

  revalidatePath('/');
}
