'use server';
import { commentRepo, userRepo, notificationRepo } from '@/repositories';
import { cookies } from 'next/headers';
import { verifyJwtToken } from '@/lib/auth';
import { assertUserOwnsCard } from '@/modules/workspace/actions/assertions';

export type Comment = { 
  id: string; 
  card_id: string; 
  user_id: string; 
  parent_id?: string | null;
  content: string; 
  created_at: string; 
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
  const userId = await getUserId();
  
  // 🛡️ Security Gateway: Verify access to the card
  await assertUserOwnsCard(userId, cardId);

  return commentRepo.findByCard(cardId, limit, cursor) as Promise<Comment[]>;
}

export async function createCommentAction(cardId: string, content: string, parentId?: string | null) {
  const userId = await getUserId();

  // 🛡️ Security Gateway: Verify access to the card
  await assertUserOwnsCard(userId, cardId);

  const newComment = await commentRepo.create({
    cardId,
    userId,
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
          user_id: u.id,
          actor_id: userId,
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
