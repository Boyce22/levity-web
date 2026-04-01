'use server';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';
import { verifyJwtToken } from '@/lib/auth';

import { BackblazeProvider } from '@/lib/storage/backblaze.provider';

async function checkAuth() {
  const token = (await cookies()).get('token')?.value;
  if (!token) throw new Error('Unauthorized');
  const payload = await verifyJwtToken(token);
  if (!payload || !payload.id) throw new Error('Unauthorized');
  return payload.id as string;
}

export async function uploadImageAction(formData: FormData) {
  await checkAuth();

  const file = formData.get('file') as File;
  if (!file) throw new Error('No file provided');

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  
  const provider = new BackblazeProvider();
  const result = await provider.upload(fileBuffer, {
    filename: file.name,
    folder: 'levity'
  });

  return result.url;
}
