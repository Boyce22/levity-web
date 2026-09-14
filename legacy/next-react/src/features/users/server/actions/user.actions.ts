'use server';

import { clearSession } from '@/infra/auth/session';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  getUserProfileUseCase,
  updateUserProfileUseCase,
  uploadAvatarUseCase,
  getAllUsersUseCase,
} from '../use-cases/user.use-cases';

export async function getUserProfileAction() {
  return getUserProfileUseCase();
}

export async function updateUserProfileAction(payload: unknown) {
  await updateUserProfileUseCase(payload);
  revalidatePath('/');
}

// FIX U3: action now passes base64 directly — no transformation here
export async function uploadAvatarAction(base64: string): Promise<string> {
  return uploadAvatarUseCase(base64);
}

// FIX U4 / U5: no sorting, no guard — use-case owns them
export async function getAllUsersAction(workspaceId: string) {
  return getAllUsersUseCase(workspaceId);
}

// FIX U7: logoutAction stays as thin infra call — clearSession + redirect
// No use-case needed: no domain logic, only infrastructure tear-down
export async function logoutAction() {
  await clearSession();
  redirect('/login');
}
