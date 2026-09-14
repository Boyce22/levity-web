import { describe, expect, it } from 'vitest';
import { attachmentMarkdown, attachmentValidationError, MAX_ATTACHMENT_SIZE } from './attachments';

describe('attachments', () => {
  it('accepts only the MIME types supported by the API', () => {
    expect(attachmentValidationError({ type: 'image/png', size: 1 })).toBeNull();
    expect(attachmentValidationError({ type: 'application/pdf', size: 1 })).toMatch(/JPEG, PNG, WebP ou GIF/);
  });

  it('rejects an image larger than 10 MiB', () => {
    expect(attachmentValidationError({ type: 'image/gif', size: MAX_ATTACHMENT_SIZE + 1 })).toMatch(/10 MiB/);
  });

  it('persists the upload public ID alongside the Markdown image', () => {
    expect(attachmentMarkdown({ name: 'a.png', url: 'https://cdn.test/a', publicId: 'workspace/attachments/a.png' }))
      .toContain('"workspace/attachments/a.png"');
  });
});
