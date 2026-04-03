/**
 * Parses a Markdown string and calculates the completion percentage
 * based on GFM task list items: `- [ ]` (unchecked) and `- [x]` (checked).
 *
 * Returns 0 if no task items are found.
 */
export function parseProgress(markdown: string): number {
  if (!markdown) return 0;
  // Match - [ ] or * [ ] or + [ ] with optional leading spaces (GFM task lists)
  const total = (markdown.match(/^[\s]*[-*+]\s+\[[ xX]\]/gim) || []).length;
  if (total === 0) return 0;
  const done = (markdown.match(/^[\s]*[-*+]\s+\[[xX]\]/gim) || []).length;
  return Math.round((done / total) * 100);
}

/**
 * Counts total and done task items in a markdown string.
 */
export function parseChecklistCounts(markdown: string): { total: number; done: number } {
  if (!markdown) return { total: 0, done: 0 };
  const total = (markdown.match(/^[\s]*[-*+]\s+\[[ xX]\]/gim) || []).length;
  const done = (markdown.match(/^[\s]*[-*+]\s+\[[xX]\]/gim) || []).length;
  return { total, done };
}
