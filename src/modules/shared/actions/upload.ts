'use server';

import { serverFetchFormData, httpDelete } from '@/lib/http';

export async function uploadImageAction(formData: FormData, workspaceId?: string): Promise<string> {
  if (!workspaceId) throw new Error('Workspace context is required for secure file storage');

  formData.append('workspaceId', workspaceId);
  const res = await serverFetchFormData('/api/files/attachments', formData);
  if (!res.ok) throw new Error(`[API ${res.status}] Upload failed`);
  const data = await res.json();
  return data.url;
}

export async function deleteFileAction(workspaceId: string, key: string): Promise<void> {
  await httpDelete('/files/attachments', { workspaceId, key });
}
