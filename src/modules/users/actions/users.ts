'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { httpGet } from '@/lib/http';

export async function logoutAction() {
  (await cookies()).delete('token');
  redirect('/login');
}

export async function getAllUsersAction(workspaceId?: string) {
  if (!workspaceId) return [];

  try {
    const users = await httpGet<any[]>(`/users/?workspaceId=${workspaceId}`);

    return users
      .sort((a, b) =>
        (a.displayName || a.username).localeCompare(b.displayName || b.username),
      );
  } catch {
    return [];
  }
}
