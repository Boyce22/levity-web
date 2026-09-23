import type { z } from 'zod';
import type {
  BoardSnapshot,
  IssueWire,
  UserWire,
  WorkspaceWire,
  HomeBoardWire,
  TagWire,
  PriorityWire,
  CommentWire,
  CommentsPageWire,
  SprintWire,
  WorkspaceMemberWire,
  NotificationWire,
  NotificationsPageWire,
  IssueEventWire,
  DiagramWire,
  DiagramElementWire,
} from './wire';
import type {
  BoardModel,
  IssueModel,
  UserModel,
  WorkspaceModel,
  HomeBoardModel,
  TagModel,
  PriorityModel,
  CommentModel,
  CommentsPageModel,
  SprintModel,
  WorkspaceMemberModel,
  NotificationModel,
  NotificationsPageModel,
  IssueEventModel,
  DiagramModel,
  DiagramElementModel,
} from './models';

export type { BoardModel } from './models';

export function userFromWire(wire: z.infer<typeof UserWire>): UserModel {
  const displayName = [wire.first_name, wire.last_name].filter(Boolean).join(' ') || wire.username;
  return {
    id: wire.id,
    username: wire.username,
    firstName: wire.first_name,
    lastName: wire.last_name,
    displayName,
    avatarUrl: wire.avatar_url,
    bio: wire.bio,
    email: wire.email,
    accountStatus: wire.account_status,
    createdAt: wire.created_at,
  };
}

export function workspaceFromWire(wire: z.infer<typeof WorkspaceWire>): WorkspaceModel {
  return {
    id: wire.id,
    name: wire.name,
    status: wire.status,
    createdBy: wire.created_by,
    createdAt: wire.created_at,
    updatedAt: wire.updated_at,
  };
}

export function homeBoardFromWire(wire: z.infer<typeof HomeBoardWire>): HomeBoardModel {
  return {
    id: wire.id,
    workspaceId: wire.workspace_id,
    name: wire.name,
    position: wire.position,
    role: wire.role,
  };
}

export function issueFromWire(wire: z.infer<typeof IssueWire>): IssueModel {
  return {
    id: wire.id,
    content: wire.content,
    position: wire.position,
    description: wire.description,
    coverUrl: wire.cover_url,
    assigneeId: wire.assignee_id,
    priorityId: wire.priority_id,
    tagId: wire.tag_id,
    progress: wire.progress,
    dueDate: wire.due_date,
    columnId: wire.column_id,
    createdBy: wire.created_by,
    createdAt: wire.created_at,
    commentCount: wire.comment_count,
    storyPoints: wire.story_points,
    estimatedHours: wire.estimated_hours,
  };
}

export function boardFromWire(value: BoardSnapshot): BoardModel {
  return {
    id: value.board.id,
    workspaceId: value.board.workspace_id,
    name: value.board.name,
    position: value.board.position,
    createdBy: value.board.created_by,
    createdAt: value.board.created_at,
    updatedAt: value.board.updated_at,
    columns: value.columns.map((column) => ({
      id: column.id,
      boardId: column.board_id,
      title: column.title,
      position: column.position,
      wipLimit: column.wip_limit,
      columnType: column.column_type,
      createdBy: column.created_by,
      createdAt: column.created_at,
      issues: column.issues.map(issueFromWire),
    })),
  };
}

export function tagFromWire(wire: z.infer<typeof TagWire>): TagModel {
  return {
    id: wire.id,
    workspaceId: wire.workspace_id,
    name: wire.name,
    color: wire.color,
    status: wire.status,
    createdAt: wire.created_at,
    updatedAt: wire.updated_at,
  };
}

export function priorityFromWire(wire: z.infer<typeof PriorityWire>): PriorityModel {
  return {
    id: wire.id,
    workspaceId: wire.workspace_id,
    name: wire.name,
    color: wire.color,
    status: wire.status,
    icon: wire.icon,
    position: wire.position,
    code: wire.code,
    isSystem: wire.is_system,
    createdAt: wire.created_at,
    updatedAt: wire.updated_at,
  };
}

export function commentFromWire(wire: z.infer<typeof CommentWire>): CommentModel {
  return {
    id: wire.id,
    issueId: wire.issue_id,
    createdBy: wire.created_by,
    parentId: wire.parent_id,
    content: wire.content,
    createdAt: wire.created_at,
  };
}

export function commentsPageFromWire(wire: z.infer<typeof CommentsPageWire>): CommentsPageModel {
  return {
    data: wire.data.map(commentFromWire),
    nextCursor: wire.nextCursor,
  };
}

export function sprintFromWire(wire: z.infer<typeof SprintWire>): SprintModel {
  return {
    id: wire.id,
    boardId: wire.board_id,
    name: wire.name,
    goal: wire.goal,
    startDate: wire.start_date,
    endDate: wire.end_date,
    status: wire.status,
    trackingMode: wire.tracking_mode,
    capacityPoints: wire.capacity_points,
    velocityPoints: wire.velocity_points,
    createdBy: wire.created_by,
    createdAt: wire.created_at,
    totalIssues: wire.total_issues,
    completedIssues: wire.completed_issues,
    progressPercent: wire.progress_percent,
  };
}

export function workspaceMemberFromWire(wire: z.infer<typeof WorkspaceMemberWire>): WorkspaceMemberModel {
  return {
    id: wire.id,
    workspaceId: wire.workspace_id,
    userId: wire.user_id,
    role: wire.role,
    membershipStatus: wire.membership_status,
    joinedAt: wire.joined_at,
    leftAt: wire.left_at,
    lastAccessedAt: wire.last_accessed_at,
    user: wire.user
      ? userFromWire({ ...wire.user, id: wire.user.id ?? wire.user_id })
      : undefined,
  };
}

export function notificationFromWire(wire: z.infer<typeof NotificationWire>): NotificationModel {
  return {
    id: wire.id,
    userId: wire.user_id,
    actorId: wire.actor_id,
    issueId: wire.issue_id,
    type: wire.type,
    read: wire.read,
    createdAt: wire.created_at,
    actor: wire.actor ? userFromWire(wire.actor) : undefined,
  };
}

export function notificationsPageFromWire(wire: z.infer<typeof NotificationsPageWire>): NotificationsPageModel {
  return {
    items: wire.items.map(notificationFromWire),
    total: wire.total,
    nextCursor: wire.nextCursor,
  };
}

export function issueEventFromWire(wire: z.infer<typeof IssueEventWire>): IssueEventModel {
  return {
    id: wire.id,
    issueId: wire.issue_id,
    createdBy: wire.created_by,
    actionType: wire.action_type,
    field: wire.field,
    oldVal: wire.old_val,
    newVal: wire.new_val,
    createdAt: wire.created_at,
    author: wire.users
      ? {
          username: wire.users.username,
          avatarUrl: wire.users.avatar_url,
        }
      : undefined,
  };
}

export function diagramFromWire(wire: z.infer<typeof DiagramWire>): DiagramModel {
  return {
    id: wire.id,
    issueId: wire.issue_id,
    elements: wire.data.elements.map((el) => ({
      id: el.id,
      type: el.type,
      points: el.points,
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      color: el.color,
      size: el.size,
    })),
    createdAt: wire.created_at,
    updatedAt: wire.updated_at,
  };
}

export function diagramToWire(model: DiagramModel): z.infer<typeof DiagramWire> {
  return {
    id: model.id,
    issue_id: model.issueId,
    data: {
      elements: model.elements.map((el) => ({
        id: el.id,
        type: el.type,
        points: el.points,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        color: el.color,
        size: el.size,
      })),
    },
    created_at: model.createdAt,
    updated_at: model.updatedAt,
  };
}

// Convenient aliases for UI / BFF consumption
export const toUserModel = userFromWire;
export const toWorkspaceModel = workspaceFromWire;
export const toBoardModel = boardFromWire;
export const toIssueModel = issueFromWire;
export const toTagModel = tagFromWire;
export const toPriorityModel = priorityFromWire;
export const toCommentModel = commentFromWire;
export const toCommentsPageModel = commentsPageFromWire;
export const toNotificationModel = notificationFromWire;
export const toNotificationsPageModel = notificationsPageFromWire;
export const toIssueEventModel = issueEventFromWire;
export const toDiagramModel = diagramFromWire;
export const toDiagramElementModel = (el: z.infer<typeof DiagramElementWire>): DiagramElementModel => ({
  id: el.id,
  type: el.type,
  points: el.points,
  x: el.x,
  y: el.y,
  width: el.width,
  height: el.height,
  color: el.color,
  size: el.size,
});
