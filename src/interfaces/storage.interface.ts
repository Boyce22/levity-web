export interface UploadOptions {
  filename?: string;
  folder?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  mimeType?: string;
  userId?: string;
  keepOriginalName?: boolean;
}

export interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  size?: number;
}

export interface IStorageProvider {
  upload(buffer: Buffer, options?: UploadOptions): Promise<UploadResult>;
  uploadMany(files: Buffer[], options?: UploadOptions): Promise<UploadResult[]>;
  delete(publicId: string): Promise<void>;
}
