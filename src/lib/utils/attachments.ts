export const ATTACHMENT_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

export function attachmentValidationError(file: Pick<File, 'type' | 'size'>): string | null {
  if (!ATTACHMENT_MIME_TYPES.includes(file.type as (typeof ATTACHMENT_MIME_TYPES)[number])) {
    return 'Formato não suportado. Envie uma imagem JPEG, PNG, WebP ou GIF.';
  }
  if (file.size > MAX_ATTACHMENT_SIZE) return 'A imagem deve ter no máximo 10 MiB.';
  return null;
}

export function attachmentMarkdown({ name, url, publicId }: { name: string; url: string; publicId: string }): string {
  return `![${name}](${url} "${publicId}")`;
}
