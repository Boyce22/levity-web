'use server';

import { revalidatePath } from 'next/cache';
import {
  removeMemberUseCase,
  updateMemberRoleUseCase,
} from '../use-cases/member.use-cases';

export async function removeMemberAction(workspaceId: string, memberId: string) {
  await removeMemberUseCase(workspaceId, memberId);
  revalidatePath('/');
}

export async function updateMemberRoleAction(
  workspaceId: string,
  memberId: string,
  role: string,
) {
  await updateMemberRoleUseCase(workspaceId, memberId, role);
  revalidatePath('/');
}
