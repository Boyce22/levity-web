export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type BoardRole = 'ADMIN' | 'EDITOR' | 'VIEWER';
export type ColumnType = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export interface WorkspaceModel {
  id: string;
  name: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface HomeBoardModel {
  id: string;
  workspaceId: string;
  name: string;
  position: number;
  role: BoardRole;
}

export interface UserModel {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  email?: string;
  accountStatus?: 'ACTIVE' | 'SUSPENDED';
  createdAt?: string;
}

export interface IssueModel {
  id: string;
  content: string;
  position: number;
  description?: string | null;
  coverUrl?: string | null;
  assigneeId?: string | null;
  priorityId: string;
  tagId?: string | null;
  progress?: number | null;
  dueDate?: string | null;
  columnId: string;
  createdBy: string;
  createdAt: string;
  commentCount: number;
  storyPoints?: number | null;
  estimatedHours?: number | null;
}

export interface AttachmentModel {
  url: string;
  publicId: string;
  name: string;
}

export interface ColumnModel {
  id: string;
  boardId: string;
  title: string;
  position: number;
  wipLimit?: number | null;
  columnType?: ColumnType | null;
  createdBy: string;
  createdAt: string;
  issues: IssueModel[];
}

export interface BoardModel {
  id: string;
  workspaceId: string;
  name: string;
  position: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  columns: ColumnModel[];
}

export interface TagModel {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PriorityModel extends TagModel {
  icon: string;
  position: number;
  code?: string;
  isSystem: boolean;
}

export interface CommentModel {
  id: string;
  issueId: string;
  createdBy: string;
  parentId?: string | null;
  content: string;
  createdAt: string;
  author?: UserModel;
  replies?: CommentModel[];
}

export interface CommentsPageModel {
  data: CommentModel[];
  nextCursor?: string;
}

export interface SprintModel {
  id: string;
  boardId: string;
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED';
  trackingMode: 'POINTS' | 'COUNT' | 'HOURS';
  capacityPoints?: number | null;
  velocityPoints?: number | null;
  createdBy: string;
  createdAt: string;
  totalIssues: number;
  completedIssues: number;
  progressPercent: number;
}

export interface WorkspaceMemberModel {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  membershipStatus: 'ACTIVE' | 'LEFT' | 'REMOVED';
  joinedAt: string;
  leftAt?: string;
  lastAccessedAt?: string;
  user?: UserModel;
}

export interface NotificationModel {
  id: string;
  userId: string;
  actorId?: string;
  issueId?: string;
  type: 'ASSIGNMENT' | 'MENTION' | 'STATUS_CHANGE' | 'DUE_DATE';
  read: boolean;
  createdAt: string;
  actor?: UserModel;
}

export interface NotificationsPageModel {
  items: NotificationModel[];
  total?: number;
  nextCursor?: string | null;
}

export interface IssueEventModel {
  id: string;
  issueId: string;
  createdBy: string;
  actionType: string;
  field?: string | null;
  oldVal?: string | null;
  newVal?: string | null;
  createdAt: string;
  author?: {
    username: string;
    avatarUrl?: string | null;
  };
}

export interface DiagramElementModel {
  id: string;
  type: 'path' | 'rect' | 'circle' | 'db' | 'cloud' | 'server' | 'user' | 'arrow' | 'line' | 'eraser';
  points?: Array<{ x: number; y: number }>;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
  size?: number;
}

export interface DiagramModel {
  id?: string;
  issueId: string;
  elements: DiagramElementModel[];
  createdAt?: string;
  updatedAt?: string;
}
