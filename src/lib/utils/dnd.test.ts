import { describe, expect, it } from 'vitest';
import { moveIssueOptimistically, moveColumnOptimistically, canMoveIssueToColumn } from './dnd';
import type { ColumnModel, IssueModel } from '$lib/contracts/models';

function createMockIssue(id: string, columnId: string, position: number): IssueModel {
  return {
    id,
    columnId,
    content: `Issue ${id}`,
    position,
    priorityId: 'p-1',
    createdBy: 'u-1',
    createdAt: new Date().toISOString(),
    commentCount: 0,
  };
}

function createMockColumn(id: string, title: string, position: number, issues: IssueModel[], wipLimit?: number | null): ColumnModel {
  return {
    id,
    boardId: 'b-1',
    title,
    position,
    wipLimit,
    createdBy: 'u-1',
    createdAt: new Date().toISOString(),
    issues,
  };
}

describe('Drag & Drop Spike: Validation, Reordering, WIP Limits & Rollbacks', () => {
  it('allows moving an issue within the same column and updates positions', () => {
    const col1 = createMockColumn('col-1', 'Todo', 0, [
      createMockIssue('i-1', 'col-1', 0),
      createMockIssue('i-2', 'col-1', 1),
      createMockIssue('i-3', 'col-1', 2),
    ]);
    const columns = [col1];

    const result = moveIssueOptimistically(columns, 'i-1', 'col-1', 2);
    expect(result.success).toBe(true);
    expect(result.columns[0].issues.map((i) => i.id)).toEqual(['i-2', 'i-3', 'i-1']);
    expect(result.columns[0].issues.map((i) => i.position)).toEqual([0, 1, 2]);
  });

  it('allows moving an issue across columns when target WIP limit is not reached', () => {
    const col1 = createMockColumn('col-1', 'Todo', 0, [createMockIssue('i-1', 'col-1', 0)]);
    const col2 = createMockColumn('col-2', 'In Progress', 1, [createMockIssue('i-2', 'col-2', 0)], 2);
    const columns = [col1, col2];

    const result = moveIssueOptimistically(columns, 'i-1', 'col-2', 0);
    expect(result.success).toBe(true);
    expect(result.columns[0].issues.length).toBe(0);
    expect(result.columns[1].issues.length).toBe(2);
    expect(result.columns[1].issues[0].id).toBe('i-1');
    expect(result.columns[1].issues[0].columnId).toBe('col-2');
    expect(result.columns[1].issues[0].position).toBe(0);
    expect(result.columns[1].issues[1].position).toBe(1);
  });

  it('prevents moving an issue across columns when target WIP limit IS reached (WIP rollback)', () => {
    const col1 = createMockColumn('col-1', 'Todo', 0, [createMockIssue('i-1', 'col-1', 0)]);
    const col2 = createMockColumn(
      'col-2',
      'In Progress',
      1,
      [createMockIssue('i-2', 'col-2', 0), createMockIssue('i-3', 'col-2', 1)],
      2 // WIP Limit = 2, already reached!
    );
    const columns = [col1, col2];

    const check = canMoveIssueToColumn(col1.issues[0], col2, col1);
    expect(check.allowed).toBe(false);
    expect(check.reason).toContain('Limite WIP (2) atingido');

    const result = moveIssueOptimistically(columns, 'i-1', 'col-2', 0);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Limite WIP (2) atingido');
    // Original columns remain untouched (rollback)
    expect(result.columns[0].issues.length).toBe(1);
    expect(result.columns[1].issues.length).toBe(2);
  });

  it('reorders columns horizontally and updates their positions', () => {
    const col1 = createMockColumn('col-1', 'Todo', 0, []);
    const col2 = createMockColumn('col-2', 'In Progress', 1, []);
    const col3 = createMockColumn('col-3', 'Done', 2, []);
    const columns = [col1, col2, col3];

    const reordered = moveColumnOptimistically(columns, 0, 2);
    expect(reordered.map((c) => c.id)).toEqual(['col-2', 'col-3', 'col-1']);
    expect(reordered.map((c) => c.position)).toEqual([0, 1, 2]);
  });
});
