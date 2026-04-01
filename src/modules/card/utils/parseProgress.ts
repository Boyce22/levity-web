/**
 * Parses a Markdown string and calculates the completion percentage
 * based on GFM task list items: `- [ ]` (unchecked) and `- [x]` (checked).
 *
 * Returns 0 if no task items are found.
 */
export function parseProgress(markdown: string): number {
  if (!markdown) return 0;
  const total = (markdown.match(/- \[[ x]\]/gi) || []).length;
  if (total === 0) return 0;
  const done = (markdown.match(/- \[x\]/gi) || []).length;
  return Math.round((done / total) * 100);
}

/**
 * Counts total and done task items in a markdown string.
 */
export function parseChecklistCounts(markdown: string): { total: number; done: number } {
  if (!markdown) return { total: 0, done: 0 };
  const total = (markdown.match(/- \[[ x]\]/gi) || []).length;
  const done = (markdown.match(/- \[x\]/gi) || []).length;
  return { total, done };
}
