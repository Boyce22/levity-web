import sanitizeHtmlLibrary from 'sanitize-html';
import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: true });

const allowedTags = [
  'a', 'blockquote', 'br', 'code', 'del', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'hr', 'img', 'input', 'li', 'ol', 'p', 'pre', 's', 'span', 'strong', 'table', 'tbody',
  'td', 'th', 'thead', 'tr', 'ul'
];

/** Sanitizes the limited HTML emitted by GFM before it reaches the DOM. */
export function sanitizeHtml(html: string): string {
  return sanitizeHtmlLibrary(html, {
    allowedTags,
    allowedAttributes: {
      a: ['href', 'rel', 'target', 'title'],
      img: ['src', 'alt', 'title'],
      input: ['type', 'checked', 'disabled'],
      ol: ['start'],
      code: ['class'],
      pre: ['class'],
      th: ['align'],
      td: ['align']
    },
    allowedSchemes: ['http', 'https'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    allowProtocolRelative: false,
    transformTags: {
      a: sanitizeHtmlLibrary.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' })
    }
  });
}

export function renderMarkdown(markdown: string): string {
  if (!markdown.trim()) return '';
  return sanitizeHtml(marked.parse(markdown) as string);
}

export function parseProgress(markdown: string): number {
  if (!markdown) return 0;
  const total = (markdown.match(/^[\s]*[-*+]\s+\[[ xX]\]/gim) || []).length;
  if (total === 0) return 0;
  const done = (markdown.match(/^[\s]*[-*+]\s+\[[xX]\]/gim) || []).length;
  return Math.round((done / total) * 100);
}

export function parseChecklistCounts(markdown: string): { total: number; done: number } {
  if (!markdown) return { total: 0, done: 0 };
  const total = (markdown.match(/^[\s]*[-*+]\s+\[[ xX]\]/gim) || []).length;
  const done = (markdown.match(/^[\s]*[-*+]\s+\[[xX]\]/gim) || []).length;
  return { total, done };
}
