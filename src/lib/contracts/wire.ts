import { z } from 'zod';

const iso = z.string().datetime();
export const WorkspaceRole = z.enum(['OWNER', 'ADMIN', 'MEMBER']);
export const BoardRole = z.enum(['ADMIN', 'EDITOR', 'VIEWER']);
export const ColumnType = z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']);
export const WorkspaceWire = z.object({ id: z.string().uuid(), name: z.string(), status: z.enum(['ACTIVE', 'ARCHIVED']), created_by: z.string().uuid(), created_at: iso, updated_at: iso });
export const HomeBoardWire = z.object({ id: z.string().uuid(), workspace_id: z.string().uuid(), name: z.string(), position: z.number(), role: BoardRole });
export const UserWire = z.object({ id: z.string().uuid(), username: z.string(), first_name: z.string().optional(), last_name: z.string().optional(), avatar_url: z.string().optional(), bio: z.string().optional(), email: z.string().email().optional(), account_status: z.enum(['ACTIVE', 'SUSPENDED']).optional(), updated_at: iso.optional(), last_login_at: iso.optional(), created_at: iso.optional() });
export const IssueWire = z.object({ id: z.string().uuid(), content: z.string(), position: z.number(), description: z.string().nullable().optional(), cover_url: z.string().nullable().optional(), assignee_id: z.string().uuid().nullable().optional(), priority_id: z.string().uuid(), tag_id: z.string().uuid().nullable().optional(), progress: z.number().int().min(0).max(100).nullable().optional(), due_date: iso.nullable().optional(), column_id: z.string().uuid(), created_by: z.string().uuid(), created_at: iso, comment_count: z.number().int(), story_points: z.number().int().nullable().optional(), estimated_hours: z.number().nullable().optional() });
export const ColumnWire = z.object({ id: z.string().uuid(), board_id: z.string().uuid(), title: z.string(), position: z.number(), wip_limit: z.number().int().positive().nullable().optional(), column_type: ColumnType.nullable().optional(), created_by: z.string().uuid(), created_at: iso, issues: z.array(IssueWire) });
export const BoardSnapshotWire = z.object({ board: z.object({ id: z.string().uuid(), workspace_id: z.string().uuid(), name: z.string(), position: z.number(), created_by: z.string().uuid(), created_at: iso, updated_at: iso }), columns: z.array(ColumnWire) });
export const TagWire = z.object({ id: z.string().uuid(), workspace_id: z.string().uuid(), name: z.string(), color: z.string(), status: z.string(), created_at: iso, updated_at: iso });
export const PriorityWire = TagWire.extend({ icon: z.string(), position: z.number(), code: z.string().optional(), is_system: z.boolean() });
export const CommentWire = z.object({ id: z.string().uuid(), issue_id: z.string().uuid(), created_by: z.string().uuid(), parent_id: z.string().uuid().nullable().optional(), content: z.string(), created_at: iso });
export const CommentsPageWire = z.object({ data: z.array(CommentWire), nextCursor: z.string().optional() });
export const SprintWire = z.object({ id: z.string().uuid(), board_id: z.string().uuid(), name: z.string(), goal: z.string().optional(), start_date: z.string(), end_date: z.string(), status: z.enum(['PLANNING', 'ACTIVE', 'COMPLETED']), tracking_mode: z.enum(['POINTS', 'COUNT', 'HOURS']), capacity_points: z.number().nullable().optional(), velocity_points: z.number().nullable().optional(), created_by: z.string().uuid(), created_at: iso, total_issues: z.number().int(), completed_issues: z.number().int(), progress_percent: z.number() });
export const WorkspaceMemberWire = z.object({ id: z.string().uuid(), workspace_id: z.string().uuid(), user_id: z.string().uuid(), role: WorkspaceRole, membership_status: z.enum(['ACTIVE', 'LEFT', 'REMOVED']), joined_at: iso, left_at: iso.optional(), last_accessed_at: iso.optional(), user: UserWire.optional() });

export const NotificationTypeWire = z.enum(['ASSIGNMENT', 'MENTION', 'STATUS_CHANGE', 'DUE_DATE']);
export const NotificationWire = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  actor_id: z.string().uuid().optional(),
  issue_id: z.string().uuid().optional(),
  type: NotificationTypeWire,
  read: z.boolean(),
  created_at: iso,
  actor: UserWire.optional(),
});
export const NotificationsPageWire = z.object({
  items: z.array(NotificationWire),
  total: z.number().int().optional(),
  nextCursor: z.string().nullable().optional(),
});

export const IssueEventWire = z.object({
  id: z.string().uuid(),
  issue_id: z.string().uuid(),
  created_by: z.string().uuid(),
  action_type: z.string(),
  field: z.string().nullable().optional(),
  old_val: z.string().nullable().optional(),
  new_val: z.string().nullable().optional(),
  created_at: iso,
  users: z.object({
    username: z.string(),
    avatar_url: z.string().nullable().optional(),
  }).optional(),
});

export const DiagramElementWire = z.object({
  id: z.string(),
  type: z.enum(['path', 'rect', 'circle', 'db', 'cloud', 'server', 'user', 'arrow', 'line', 'eraser']),
  points: z.array(z.object({ x: z.number(), y: z.number() })).optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  color: z.string().optional(),
  size: z.number().optional(),
});

export const DiagramDataWire = z.object({
  elements: z.array(DiagramElementWire).max(1000).superRefine((elements, context) => {
    elements.forEach((element, index) => {
      if (element.points && element.points.length > 2500) {
        context.addIssue({
          code: z.ZodIssueCode.too_big,
          maximum: 2500,
          inclusive: true,
          origin: 'array',
          path: [index, 'points'],
          message: 'Um elemento pode ter no máximo 2500 pontos.'
        });
      }
    });
  })
});

export const DiagramWire = z.object({
  id: z.string().uuid().optional(),
  issue_id: z.string().uuid(),
  data: DiagramDataWire,
  created_at: iso.optional(),
  updated_at: iso.optional(),
});

export type BoardSnapshot = z.infer<typeof BoardSnapshotWire>;
export type NotificationWireType = z.infer<typeof NotificationWire>;
export type IssueEventWireType = z.infer<typeof IssueEventWire>;
export type DiagramWireType = z.infer<typeof DiagramWire>;
export type DiagramElementWireType = z.infer<typeof DiagramElementWire>;
