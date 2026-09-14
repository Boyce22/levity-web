import { renderMarkdown } from './markdown';

export function sanitizedMarkdown(node: HTMLElement, markdown: string) {
  node.innerHTML = renderMarkdown(markdown);
  return {
    update(nextMarkdown: string) {
      node.innerHTML = renderMarkdown(nextMarkdown);
    }
  };
}
