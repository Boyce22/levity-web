'use server';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';
import { verifyJwtToken } from '@/lib/auth';

import { BackblazeProvider } from '@/lib/storage/backblaze.provider';
import { assertUserOwnsWorkspace } from '@/modules/workspace/actions/assertions';

async function checkAuth() {
  const token = (await cookies()).get('token')?.value;
  if (!token) throw new Error('Unauthorized');
  const payload = await verifyJwtToken(token);
  if (!payload || !payload.id) throw new Error('Unauthorized');
  return payload.id as string;
}

export async function uploadImageAction(formData: FormData, workspaceId?: string) {
  const currentUserId = await checkAuth();

  if (!workspaceId) throw new Error('Workspace context is required for secure file storage');
  
  // 🛡️ Security Gateway: IDOR Protection
  await assertUserOwnsWorkspace(currentUserId, workspaceId);

  const file = formData.get('file') as File;
  if (!file) throw new Error('No file provided');

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const provider = new BackblazeProvider();
  
  const result = await provider.upload(fileBuffer, {
    filename: file.name,
    folder: `${workspaceId}/attachments`,
    mimeType: file.type,
    userId: currentUserId,
  });

  return result.url;
}

export async function deleteFileAction(url: string) {
  try {
    const currentUserId = await checkAuth();
    
    // 🛡️ Security Gateway: IDOR Protection
    // Expected URL format: /file/bucket-name/WORKSPACE_ID/filename.ext
    const urlParts = url.split('/');
    // After split: ["", "file", "bucket-name", "WORKSPACE_ID", "filename.ext"]
    const workspaceId = urlParts[3]; 

    if (workspaceId && workspaceId.length > 20) { // basic uuid length check
      const member = await assertUserOwnsWorkspace(currentUserId, workspaceId);
      
      // 🛡️ Security Check: Extract creatorId from filename
      // Format: .../WORKSPACE_ID/attachments/USERID_UUID.ext
      const fileName = urlParts[urlParts.length - 1]; // "USERID_UUID.ext"
      const creatorIdFromUrl = fileName.split('_')[0];
      
      const isCreator = currentUserId === creatorIdFromUrl;
      const isAdminOrOwner = ['owner', 'admin'].includes(member.role);

      if (!isCreator && !isAdminOrOwner) {
        throw new Error('403 Forbidden: Insufficient permissions to delete this asset. You must be an Admin or the uploader.');
      }
    }

    const provider = new BackblazeProvider();
    await provider.deleteByUrl(url);
  } catch (error) {
    console.error("Failed to delete file from storage:", url, error);
  }
}
