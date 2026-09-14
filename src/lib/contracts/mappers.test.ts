import { describe, expect, it } from 'vitest';
import { BoardSnapshotWire } from './wire';
import { boardFromWire, userFromWire, issueEventFromWire, diagramFromWire, diagramToWire, notificationFromWire } from './mappers';

const id = '11111111-1111-4111-8111-111111111111';
const now = '2026-09-14T12:00:00.000Z';
describe('board wire contract', () => {
  it('maps snake_case board snapshots without conflating workspace and board ids', () => {
    const wire = BoardSnapshotWire.parse({ board: { id, workspace_id: '22222222-2222-4222-8222-222222222222', name: 'Board', position: 0, created_by: id, created_at: now, updated_at: now }, columns: [{ id: '33333333-3333-4333-8333-333333333333', board_id: id, title: 'Todo', position: 0, created_by: id, created_at: now, issues: [{ id: '44444444-4444-4444-8444-444444444444', content: 'Issue', position: 0, priority_id: id, column_id: '33333333-3333-4333-8333-333333333333', created_by: id, created_at: now, comment_count: 0 }] }] });
    const board = boardFromWire(wire);
    expect(board.workspaceId).toBe('22222222-2222-4222-8222-222222222222');
    expect(board.columns[0].issues[0]).toMatchObject({ columnId: '33333333-3333-4333-8333-333333333333', commentCount: 0 });
  });
  it('rejects obsolete camelCase payloads', () => expect(() => BoardSnapshotWire.parse({ lists: [] })).toThrow());
});

describe('additional wire mappers', () => {
  it('maps issue events correctly preserving old_val / new_val into oldVal / newVal', () => {
    const event = issueEventFromWire({
      id,
      issue_id: id,
      created_by: id,
      action_type: 'UPDATE',
      field: 'status',
      old_val: 'TODO',
      new_val: 'IN_PROGRESS',
      created_at: now,
      users: { username: 'davi', avatar_url: null },
    });
    expect(event.oldVal).toBe('TODO');
    expect(event.newVal).toBe('IN_PROGRESS');
    expect(event.author?.username).toBe('davi');
  });

  it('maps diagram bidirectionally without loss', () => {
    const wire = {
      id,
      issue_id: id,
      data: {
        elements: [
          {
            id: 'elem-1',
            type: 'rect' as const,
            x: 10,
            y: 20,
            width: 100,
            height: 50,
            color: '#4f46e5',
            size: 2,
          },
        ],
      },
      created_at: now,
      updated_at: now,
    };
    const model = diagramFromWire(wire);
    expect(model.elements[0].width).toBe(100);
    expect(model.elements[0].height).toBe(50);
    const backToWire = diagramToWire(model);
    expect(backToWire.data.elements[0]).toEqual(wire.data.elements[0]);
  });

  it('maps notifications and users correctly', () => {
    const user = userFromWire({
      id,
      username: 'johndoe',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
    });
    expect(user.displayName).toBe('John Doe');

    const notif = notificationFromWire({
      id,
      user_id: id,
      actor_id: id,
      issue_id: id,
      type: 'MENTION',
      read: false,
      created_at: now,
      actor: {
        id,
        username: 'johndoe',
        first_name: 'John',
        last_name: 'Doe',
      },
    });
    expect(notif.type).toBe('MENTION');
    expect(notif.actor?.displayName).toBe('John Doe');
  });
});
