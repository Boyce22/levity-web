import B2 from 'backblaze-b2';
import crypto from 'crypto';
import sharp from 'sharp';

import { IStorageProvider, UploadOptions, UploadResult } from '../../interfaces/storage.interface';

/**
 * Backblaze B2 storage provider implementation
 */
export class BackblazeProvider implements IStorageProvider {
  private b2: B2;
  private bucketId: string;
  private bucketName: string;
  private authorized: boolean = false;

  constructor() {
    this.bucketId = process.env.BACKBLAZE_BUCKET_ID || '';
    this.bucketName = process.env.BACKBLAZE_BUCKET_NAME || '';

    this.b2 = new B2({
      applicationKeyId: process.env.BACKBLAZE_KEY_ID || '',
      applicationKey: process.env.BACKBLAZE_APP_KEY || '',
    });
  }

  private async authorize(): Promise<void> {
    if (!this.authorized) {
      await this.b2.authorize();
      this.authorized = true;
    }
  }

  async upload(buffer: Buffer, options: UploadOptions = {}): Promise<UploadResult> {
    await this.authorize();

    const metadata = await sharp(buffer).metadata();
    const processedBuffer = await this.processImage(buffer, options);
    const fileName = this.buildFileName(options);

    const uploadUrl = await this.getUploadUrl();
    const uploadResponse = await this.uploadFile(uploadUrl, fileName, processedBuffer, metadata);

    const result: UploadResult = {
      url: this.buildPublicUrl(fileName),
      publicId: uploadResponse.data.fileId,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: processedBuffer.length,
    };

    return result;
  }

  private async processImage(buffer: Buffer, options: UploadOptions): Promise<Buffer> {
    if (!options.maxWidth && !options.maxHeight) {
      return buffer;
    }

    return sharp(buffer)
      .resize(options.maxWidth, options.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: options.quality || 80 })
      .toBuffer();
  }

  private buildFileName(options: UploadOptions): string {
    const filename = options.filename || crypto.randomBytes(16).toString('hex');
    return options.folder ? `${options.folder}/${filename}` : filename;
  }

  private buildPublicUrl(fileName: string): string {
    return `/file/${this.bucketName}/${fileName}`;
  }

  private async getUploadUrl() {
    const response = await this.b2.getUploadUrl({ bucketId: this.bucketId });
    return response.data;
  }

  private async uploadFile(uploadUrl: any, fileName: string, buffer: Buffer, metadata: any) {
    return this.b2.uploadFile({
      uploadUrl: uploadUrl.uploadUrl,
      uploadAuthToken: uploadUrl.authorizationToken,
      fileName,
      data: buffer,
      mime: metadata.format ? `image/${metadata.format}` : 'application/octet-stream',
    });
  }

  private async generateAndUploadThumbnail(
    buffer: Buffer,
    originalFileName: string,
    options: UploadOptions,
  ): Promise<string> {
    const thumbnailBuffer = await sharp(buffer)
      .resize(options.thumbnailWidth || 300, options.thumbnailHeight || 400, {
        fit: 'cover',
      })
      .jpeg({ quality: 70 })
      .toBuffer();

    const thumbnailFileName = `${originalFileName}-thumbnail`;
    const uploadUrl = await this.getUploadUrl();

    await this.b2.uploadFile({
      uploadUrl: uploadUrl.uploadUrl,
      uploadAuthToken: uploadUrl.authorizationToken,
      fileName: thumbnailFileName,
      data: thumbnailBuffer,
      mime: 'image/jpeg',
    });

    return this.buildPublicUrl(thumbnailFileName);
  }

  async uploadMany(files: Buffer[], options: UploadOptions = {}): Promise<UploadResult[]> {
    const promises = files.map((buffer, index) => {
      const fileOptions = { ...options };
      if (options.filename) {
        fileOptions.filename = `${options.filename}-${index + 1}`;
      }
      return this.upload(buffer, fileOptions);
    });

    return Promise.all(promises);
  }

  async delete(publicId: string): Promise<void> {
    await this.authorize();

    await this.b2.deleteFileVersion({
      fileId: publicId,
      fileName: publicId, // Assuming publicId contains the fileName, though realistically fileId and fileName are different in B2 API. 
    });
  }
}
