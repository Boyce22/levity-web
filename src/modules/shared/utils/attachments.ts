/**
 * Extrai URLs de arquivos de um texto (Markdown).
 * Filtra apenas as URLs que pertencem ao nosso domínio de storage.
 */
export interface Attachment {
  name: string;
  url: string;
}

/**
 * Extrai objetos de anexo (nome e URL) de um texto Markdown.
 */
export function extractAttachments(text: string | null | undefined): Attachment[] {
  if (!text) return [];

  // Padrão: [Arquivo: Nome](url) ou [File: Nome](url)
  const attachmentRegex = /\[(?:Arquivo|File):\s*(.*?)\]\(((?:https?:\/\/|\/)\S+)\)/g;
  const attachments: Attachment[] = [];
  
  let match;
  while ((match = attachmentRegex.exec(text)) !== null) {
    const name = match[1] || "Arquivo";
    const url = match[2];
    if (isStorageUrl(url)) {
      attachments.push({ name, url });
    }
  }

  return attachments;
}

/**
 * Extrai apenas as URLs de arquivos de um texto (Markdown).
 */
export function extractStorageUrls(text: string | null | undefined): string[] {
  const attachments = extractAttachments(text);
  return attachments.map(a => a.url);
}

/**
 * Remove todas as tags de anexo do texto Markdown.
 */
export function stripAttachments(text: string | null | undefined): string {
  if (!text) return "";
  const attachmentRegex = /\[(?:Arquivo|File):\s*(.*?)\]\(((?:https?:\/\/|\/)\S+)\)/g;
  return text.replace(attachmentRegex, "").trim();
}

function isStorageUrl(url: string): boolean {
  // Ajuste conforme o domínio do seu bucket (ex: backblazeb2.com ou seu proxy /file/...)
  return url.includes('/file/') || url.includes('backblazeb2.com');
}

/**
 * Verifica se uma URL é de imagem baseada na extensão.
 */
export function isImageUrl(url: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const lowercaseUrl = url.toLowerCase();
  return imageExtensions.some(ext => lowercaseUrl.endsWith(ext) || lowercaseUrl.includes(ext + '?'));
}
