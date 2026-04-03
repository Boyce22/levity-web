'use server';
import { commentRepo, userRepo, notificationRepo } from '@/repositories';
import { cookies } from 'next/headers';
import { verifyJwtToken } from '@/lib/auth';
import { assertUserOwnsCard } from '@/modules/workspace/actions/assertions';
import { revalidatePath } from 'next/cache';
import { extractStorageUrls } from '@/modules/shared/utils/attachments';
import { deleteFileAction } from '@/modules/shared/actions/upload';

export type Comment = { 
  id: string; 
  card_id: string; 
  created_by: string; 
  parent_id?: string | null;
  content: string; 
  created_at: string; 
  updated_at?: string | null;
  users: { username: string; display_name?: string; avatar_url?: string } 
};

async function getUserId() {
  const token = (await cookies()).get('token')?.value;
  if (!token) throw new Error('Unauthorized');
  const payload = await verifyJwtToken(token);
  if (!payload || !payload.id) throw new Error('Unauthorized');
  return payload.id as string;
}

export async function getCommentsAction(cardId: string, limit: number = 3, cursor: string | null = null) {
  const currentUserId = await getUserId();
  
  // 🛡️ Security Gateway: Verify access to the card
  await assertUserOwnsCard(currentUserId, cardId);

  return commentRepo.findByCard(cardId, limit, cursor) as Promise<Comment[]>;
}

export async function createCommentAction(cardId: string, content: string, parentId?: string | null) {
  const currentUserId = await getUserId();

  // 🛡️ Security Gateway: Verify access to the card
  await assertUserOwnsCard(currentUserId, cardId);

  const newComment = await commentRepo.create({
    cardId,
    created_by: currentUserId,
    content,
    parentId,
  });
  
  // Mentions logic: find @usernames in content
  const matches = content.match(/@(\w+)/g);
  if (matches) {
    const usernames = matches.map(m => m.slice(1));
    const mentionedUsers = await userRepo.findManyByUsernames(usernames);
      
    if (mentionedUsers && mentionedUsers.length > 0) {
      const notifications = mentionedUsers
        .map(u => ({
          recipient_id: u.id,
          created_by: currentUserId,
          card_id: cardId,
          type: 'mention',
          content: content
        }));
      if (notifications.length > 0) {
        await notificationRepo.insertMany(notifications);
      }
    }
  }

  return newComment as Comment;
}

export async function updateCommentAction(id: string, content: string) {
  const currentUserId = await getUserId();
  
  const comment = await commentRepo.findById(id);
  if (!comment) throw new Error('Comment not found');

  // 🛡️ Security Gateway 1: Ownership Check (Only author can edit)
  if (comment.created_by !== currentUserId) {
    throw new Error('403 Forbidden: Only the original author can modify this comment.');
  }

  // 🛡️ Security Gateway 2: Workspace Membership Check (Must still belong to workspace)
  await assertUserOwnsCard(currentUserId, comment.card_id);

  // Find removed attachments for cleanup
  const oldUrls = extractStorageUrls(comment.content);
  const newUrls = extractStorageUrls(content);
  const orphanUrls = oldUrls.filter(url => !newUrls.includes(url));
  orphanUrls.forEach(u => deleteFileAction(u));

  const updated = await commentRepo.update(id, content);
  revalidatePath('/');
  return updated as Comment;
}

export async function deleteCommentAction(id: string) {
  const currentUserId = await getUserId();

  const comment = await commentRepo.findById(id);
  if (!comment) throw new Error('Comment not found');

  // 🛡️ Security Gateway 1: Ownership Check
  if (comment.created_by !== currentUserId) {
    throw new Error('403 Forbidden: Only the original author can delete this comment.');
  }

  // 🛡️ Security Gateway 2: Workspace Membership Check
  await assertUserOwnsCard(currentUserId, comment.card_id);

  // Async Cleanup: Find attachments in the comment content
  const urls = extractStorageUrls(comment.content);
  urls.forEach(u => deleteFileAction(u));

  await commentRepo.delete(id);
  revalidatePath('/');
}
