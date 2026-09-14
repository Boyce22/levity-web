import type { ColumnModel, IssueModel } from '$lib/contracts/models';

export interface MoveIssueResult {
  success: boolean;
  error?: string;
  columns: ColumnModel[];
}

export function canMoveIssueToColumn(
  issue: IssueModel,
  targetColumn: ColumnModel,
  currentColumn: ColumnModel
): { allowed: boolean; reason?: string } {
  if (targetColumn.id === currentColumn.id) {
    return { allowed: true };
  }

  if (targetColumn.wipLimit != null && targetColumn.issues.length >= targetColumn.wipLimit) {
    return {
      allowed: false,
      reason: `Limite WIP (${targetColumn.wipLimit}) atingido na coluna "${targetColumn.title}".`,
    };
  }

  return { allowed: true };
}

export function moveIssueOptimistically(
  columns: ColumnModel[],
  issueId: string,
  targetColumnId: string,
  targetIndex: number
): MoveIssueResult {
  // Deep clone current snapshot for rollback capability
  const snapshot: ColumnModel[] = columns.map((col) => ({
    ...col,
    issues: [...col.issues],
  }));

  const sourceCol = snapshot.find((col) => col.issues.some((i) => i.id === issueId));
  const targetCol = snapshot.find((col) => col.id === targetColumnId);

  if (!sourceCol || !targetCol) {
    return { success: false, error: 'Coluna ou card não encontrado.', columns };
  }

  const issueIndex = sourceCol.issues.findIndex((i) => i.id === issueId);
  const [issue] = sourceCol.issues.splice(issueIndex, 1);

  // Check WIP limit if moving to a different column
  if (sourceCol.id !== targetCol.id) {
    if (targetCol.wipLimit != null && targetCol.issues.length >= targetCol.wipLimit) {
      return {
        success: false,
        error: `Limite WIP (${targetCol.wipLimit}) atingido na coluna "${targetCol.title}".`,
        columns, // rollback to untouched state
      };
    }
  }

  // Insert into target column at clamped index
  const safeIndex = Math.max(0, Math.min(targetIndex, targetCol.issues.length));
  const updatedIssue: IssueModel = {
    ...issue,
    columnId: targetCol.id,
    position: safeIndex,
  };
  targetCol.issues.splice(safeIndex, 0, updatedIssue);

  // Re-index positions
  targetCol.issues.forEach((iss, idx) => {
    iss.position = idx;
  });
  if (sourceCol.id !== targetCol.id) {
    sourceCol.issues.forEach((iss, idx) => {
      iss.position = idx;
    });
  }

  return { success: true, columns: snapshot };
}

export function moveColumnOptimistically(
  columns: ColumnModel[],
  sourceIndex: number,
  targetIndex: number
): ColumnModel[] {
  if (sourceIndex === targetIndex || sourceIndex < 0 || targetIndex < 0 || sourceIndex >= columns.length || targetIndex >= columns.length) {
    return columns;
  }

  const copy = [...columns];
  const [moved] = copy.splice(sourceIndex, 1);
  copy.splice(targetIndex, 0, moved);

  return copy.map((col, idx) => ({
    ...col,
    position: idx,
  }));
}
