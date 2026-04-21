'use server';

import { serverApiClient } from '@/infra/http/serverApiClient';
import { DomainError } from '@/infra/http/errors';

export async function uploadImageAction(
  formData: FormData,
  workspaceId?: string,
): Promise<string> {
  if (!workspaceId) {
    throw new DomainError(
      'WORKSPACE_REQUIRED',
      'Workspace context is required for secure file storage',
    );
  }
  formData.append('workspaceId', workspaceId);
  const data = await serverApiClient.post<{ url: string }>('/attachments', formData);
  return data.url;
}

export async function deleteFileAction(workspaceId: string, key: string): Promise<void> {
  await serverApiClient.delete('/attachments', { workspaceId, key });
}
