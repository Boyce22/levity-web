import { describe, expect, it } from 'vitest';
import { renderMarkdown, sanitizeHtml } from './markdown';

describe('Markdown sanitization', () => {
  it('renders normal GFM including tables and task lists', () => {
    const html = renderMarkdown('**bold**\n\n- [x] done\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n[link](https://example.com)');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toMatch(/<input[^>]*checked[^>]*disabled[^>]*type="checkbox"/);
    expect(html).toContain('<table>');
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('removes executable HTML, event handlers, styles and unapproved tags', () => {
    const html = sanitizeHtml('<script>alert(1)</script><iframe src="https://evil.test"></iframe><p onclick="alert(1)" style="color:red">ok</p>');
    expect(html).not.toMatch(/script|iframe|onclick|style=|alert\(/i);
    expect(html).toContain('<p>ok</p>');
  });

  it.each(['javascript:alert(1)', 'vbscript:msgbox(1)', 'data:text/html;base64,PHNjcmlwdD4='])('removes dangerous URLs: %s', (url) => {
    const html = sanitizeHtml(`<a href="${url}">x</a><img src="${url}">`);
    expect(html).not.toContain(url);
    expect(html).not.toMatch(/href=|src=/);
  });

  it('keeps only HTTP(S) Markdown images', () => {
    expect(renderMarkdown('![ok](https://example.com/image.png)')).toContain('src="https://example.com/image.png"');
    expect(renderMarkdown('![bad](data:image/png;base64,AAAA)')).not.toContain('src=');
  });
});
