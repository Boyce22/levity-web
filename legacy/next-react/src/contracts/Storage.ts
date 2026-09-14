import { z } from "zod";

export const uploadOptionsSchema = z.object({
  filename: z.string().optional(),
  folder: z.string().optional(),
  maxWidth: z.number().int().positive().optional(),
  maxHeight: z.number().int().positive().optional(),
  quality: z.number().int().min(1).max(100).optional(),
  thumbnailWidth: z.number().int().positive().optional(),
  thumbnailHeight: z.number().int().positive().optional(),
  mimeType: z.string().optional(),
  userId: z.string().optional(),
  keepOriginalName: z.boolean().optional(),
});

export type UploadOptions = z.infer<typeof uploadOptionsSchema>;

export const uploadResultSchema = z.object({
  url: z.string().url(),
  publicId: z.string(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  format: z.string().optional(),
  size: z.number().int().nonnegative().optional(),
});

export type UploadResult = z.infer<typeof uploadResultSchema>;

export interface IStorageProvider {
  upload(buffer: Buffer, options?: UploadOptions): Promise<UploadResult>;
  uploadMany(
    files: Buffer[],
    options?: UploadOptions,
  ): Promise<UploadResult[]>;
  delete(publicId: string): Promise<void>;
}
