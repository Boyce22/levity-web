'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { verifyJwtToken } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { assertUserOwnsWorkspace } from '@/modules/workspace/actions/assertions';

async function getUserId() {
  const token = (await cookies()).get('token')?.value;
  if (!token) throw new Error('Unauthorized');
  const payload = await verifyJwtToken(token);
  if (!payload || !payload.id) throw new Error('Unauthorized');
  return payload.id as string;
}

async function createInviteRecord(workspaceId: string, userId: string, maxUses: number) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { data, error } = await supabase
    .from('workspace_invites')
    .insert({
      workspace_id: workspaceId,
      created_by: userId,
      max_uses: maxUses,
      current_uses: 0,
      expires_at: expiresAt.toISOString()
    })
    .select('token')
    .single();

  if (error || !data) {
    console.error('Invite Generation DB error:', error);
    throw new Error('Failed to generate invite token securely.');
  }

  return data.token;
}

export async function generateInviteAction(workspaceId: string, maxUses: number = 100) {
  const userId = await getUserId();

  // 🛡️ Security Boundary: DoS Rate Limiting (Max 5/minute)
  await rateLimit(`gen_inv_${userId}`, 5, 60000);

  // 1. RBAC: Verify explicitly
  const member = await assertUserOwnsWorkspace(userId, workspaceId);

  if (!['owner', 'admin'].includes(member.role)) {
    throw new Error('403 Forbidden: You lack permission to generate invites for this workspace.');
  }

  return await createInviteRecord(workspaceId, userId, maxUses);
}

async function validateInviteToken(token: string) {
  const { data: invite, error } = await supabase.from('workspace_invites').select('*').eq('token', token).single();
  if (error || !invite) throw new Error('Invalid or non-existent invitation token.');
  if (new Date() > new Date(invite.expires_at)) throw new Error('This invitation token has permanently expired.');
  return invite;
}

async function consumeInviteToken(token: string, currentUses: number, maxUses: number) {
  const { data: updatedInvite, error } = await supabase
    .from('workspace_invites')
    .update({ current_uses: currentUses + 1 })
    .eq('token', token)
    .lt('current_uses', maxUses)
    .select()
    .single();

  if (error || !updatedInvite) throw new Error('409 Conflict: Token limit exhausted or concurrent collision mitigated.');
  return updatedInvite;
}

async function bindUserToWorkspace(userId: string, workspaceId: string) {
  const { error } = await supabase
    .from('workspace_members')
    .insert({ workspace_id: workspaceId, user_id: userId, role: 'member' });

  // Disregard unique constraint alerts if the user is merely clicking the link twice
  if (error && !error.message.includes('unique constraint')) {
    console.error('Binding Error:', error);
    throw new Error('Failed to securely join the workspace.');
  }
}

export async function acceptInviteAction(token: string) {
  const userId = await getUserId();
  
  // 🛡️ Security Boundary: Bruteforce Mitigator (Max 10/minute)
  await rateLimit(`acc_inv_${userId}`, 10, 60000);

  const invite = await validateInviteToken(token);
  await consumeInviteToken(token, invite.current_uses, invite.max_uses);
  await bindUserToWorkspace(userId, invite.workspace_id);

  revalidatePath('/');
  return invite.workspace_id;
}
