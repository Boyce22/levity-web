import { SupabaseUserRepository } from './supabase/user.repository';
import { SupabaseWorkspaceRepository } from './supabase/workspace.repository';
import { SupabaseBoardRepository } from './supabase/board.repository';
import { SupabaseCardRepository } from './supabase/card.repository';
import { SupabaseCommentRepository } from './supabase/comment.repository';
import { SupabaseNotificationRepository } from './supabase/notification.repository';

import type { IUserRepository } from './interfaces/user.repository';
import type { IWorkspaceRepository } from './interfaces/workspace.repository';
import type { IBoardRepository } from './interfaces/board.repository';
import type { ICardRepository } from './interfaces/card.repository';
import type { ICommentRepository } from './interfaces/comment.repository';
import type { INotificationRepository } from './interfaces/notification.repository';

// Singletons
export const userRepo: IUserRepository = new SupabaseUserRepository();
export const workspaceRepo: IWorkspaceRepository = new SupabaseWorkspaceRepository();
export const boardRepo: IBoardRepository = new SupabaseBoardRepository();
export const cardRepo: ICardRepository = new SupabaseCardRepository();
export const commentRepo: ICommentRepository = new SupabaseCommentRepository();
export const notificationRepo: INotificationRepository = new SupabaseNotificationRepository();

// Re-export interfaces for convenience
export * from './interfaces/user.repository';
export * from './interfaces/workspace.repository';
export * from './interfaces/board.repository';
export * from './interfaces/card.repository';
export * from './interfaces/comment.repository';
export * from './interfaces/notification.repository';
