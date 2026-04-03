"use server";

import {
  boardRepo,
  workspaceRepo,
  cardRepo,
  userRepo,
  notificationRepo,
} from "@/repositories";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifyJwtToken } from "@/lib/auth";
import {
  assertUserOwnsWorkspace,
  assertUserOwnsList,
  assertUserOwnsCard,
} from "@/modules/workspace/actions/assertions";

export type ListType = 'todo' | 'in_progress' | 'review' | 'done';

export type List = {
  id: string;
  user_id: string;
  title: string;
  position: number;
  wip_limit?: number | null;
  workspace_id: string;
  list_type?: ListType | null;
};

export type Card = {
  id: string;
  list_id: string;
  content: string;
  position: number;
  description?: string | null;
  cover_url?: string | null;
  assignee_id?: string | null;
  priority?: string | null;
  label?: string | null;
  progress?: number | null;
  due_date?: string | null;
};

async function getUserId() {
  const token = (await cookies()).get("token")?.value;
  if (!token) throw new Error("Unauthorized");
  const payload = await verifyJwtToken(token);
  if (!payload || !payload.id) throw new Error("Unauthorized");
  return payload.id as string;
}

async function fetchUserWorkspaces(userId: string) {
  return workspaceRepo.findAllByMember(userId);
}

async function ensureDefaultWorkspace(userId: string, workspaces: any[]) {
  if (workspaces.length > 0) return workspaces;

  const cw = await workspaceRepo.create("My Workspace");
  await workspaceRepo.addMember(cw.id, userId, "owner");
  return [cw];
}

async function fetchBoardLists(workspaceId: string) {
  return boardRepo.findListsWithCards(workspaceId);
}

/**
 * Main Orchestrator: Combines isolated data queries to fulfill a complete Board Payload.
 */
export async function getBoardData(workspaceId?: string) {
  const userId = await getUserId();

  let workspaces = await fetchUserWorkspaces(userId);
  workspaces = await ensureDefaultWorkspace(userId, workspaces);

  const currentWsId = workspaceId || workspaces[0]?.id;
  if (!currentWsId) throw new Error("Could not determine active workspace ID.");

  // 🛡️ Security Boundary: Explicitly verify membership for the active workspace
  await assertUserOwnsWorkspace(userId, currentWsId);

  // Seamlessly migrate legacy lists missing a workspace_id mapping
  await workspaceRepo.migrateListsWithoutWorkspace(currentWsId, userId);

  const { lists, cards } = await fetchBoardLists(currentWsId);

  // 4. Fetch dynamic settings
  const tags = await workspaceRepo.findTagsByWorkspace(currentWsId);
  const priorities = await workspaceRepo.findPrioritiesByWorkspace(currentWsId);

  return { lists, cards, workspaces, tags, priorities };
}
export async function createListAction(
  title: string,
  position: number,
  workspaceId: string,
) {
  const userId = await getUserId();

  // 🛡️ Security Boundary: BFLA / IDOR Check
  await assertUserOwnsWorkspace(userId, workspaceId);

  const data = await boardRepo.createList({
    userId,
    title,
    position,
    workspaceId,
  });

  revalidatePath("/");
  return data;
}

export async function renameListAction(listId: string, title: string) {
  const userId = await getUserId();
  await assertUserOwnsList(userId, listId);

  await boardRepo.renameList(listId, title);
  revalidatePath("/");
}

export async function deleteListAction(id: string) {
  const userId = await getUserId();
  await assertUserOwnsList(userId, id);

  await boardRepo.deleteList(id);
  revalidatePath("/");
}

export async function updateListTypeAction(listId: string, listType: ListType | null) {
  const userId = await getUserId();
  await assertUserOwnsList(userId, listId);

  await boardRepo.updateListType(listId, listType);
  revalidatePath("/");
}

export async function createCardAction(
  listId: string,
  content: string,
  position: number,
) {
  const userId = await getUserId();
  await assertUserOwnsList(userId, listId);

  const data = await cardRepo.createCard({
    listId,
    content,
    position,
  });

  revalidatePath("/");
  return data;
}

export async function deleteCardAction(id: string) {
  const userId = await getUserId();
  await assertUserOwnsCard(userId, id);

  await cardRepo.deleteCard(id);
  revalidatePath("/");
}

async function extractNewMentions(
  oldDesc: string | null | undefined,
  newDesc: string | null | undefined,
) {
  const oldMentions = oldDesc
    ? Array.from(oldDesc.matchAll(/(?:^|\s)@(\w+)/g)).map((m) => m[1])
    : [];
  const newMentions = newDesc
    ? Array.from(newDesc.matchAll(/(?:^|\s)@(\w+)/g)).map((m) => m[1])
    : [];
  return newMentions.filter((m) => !oldMentions.includes(m));
}

async function notifyMentionedUsers(
  addedMentions: string[],
  userId: string,
  cardId: string,
) {
  if (addedMentions.length === 0) return;

  const users = await userRepo.findManyByUsernames(addedMentions);
  if (!users || users.length === 0) return;

  const notifications = users.map((u) => ({
    user_id: u.id,
    actor_id: userId,
    card_id: cardId,
    type: "mention_desc",
    content: "You were mentioned in a card description.",
  }));
  await notificationRepo.insertMany(notifications);
}

export async function updateCardDetailsAction(
  id: string,
  updates: Partial<Card>,
) {
  const userId = await getUserId();
  await assertUserOwnsCard(userId, id);

  const oldCard = await cardRepo.findById(id);

  // 🛡️ Security Boundary: Mass Assignment Protection
  // Strict Allowlist: Dropping unpredictable metadata like list_id or ids.
  const safePayload = {
    ...(updates.content !== undefined && { content: updates.content }),
    ...(updates.description !== undefined && {
      description: updates.description,
    }),
    ...(updates.cover_url !== undefined && { cover_url: updates.cover_url }),
    ...(updates.assignee_id !== undefined && {
      assignee_id: updates.assignee_id || null,
    }),
    ...(updates.priority !== undefined && { priority: updates.priority }),
    ...(updates.label !== undefined && { label: updates.label }),
    ...(updates.progress !== undefined && { progress: updates.progress }),
    ...(updates.due_date !== undefined && { due_date: updates.due_date || null }),
  };

  await cardRepo.updateCard(id, safePayload);

  const logs = [];
  if (oldCard) {
    if (updates.content !== undefined && oldCard.content !== updates.content) {
      logs.push({
        card_id: id,
        user_id: userId,
        action_type: "updated",
        field: "title",
        old_val: oldCard.content,
        new_val: updates.content,
      });
    }
    if (
      updates.description !== undefined &&
      oldCard.description !== updates.description
    ) {
      logs.push({
        card_id: id,
        user_id: userId,
        action_type: "updated",
        field: "description",
        old_val: oldCard.description ? "yes" : "no",
        new_val: updates.description ? "yes" : "no",
      });

      const addedMentions = await extractNewMentions(
        oldCard.description,
        updates.description,
      );
      await notifyMentionedUsers(addedMentions, userId, id);
    }
    if (
      updates.assignee_id !== undefined &&
      oldCard.assignee_id !== updates.assignee_id
    ) {
      logs.push({
        card_id: id,
        user_id: userId,
        action_type: "assigned",
        field: "assignee_id",
        old_val: oldCard.assignee_id,
        new_val: updates.assignee_id,
      });
    }
  }

  if (logs.length > 0) {
    await cardRepo.insertHistory(logs);
  }

  revalidatePath("/");
}

export async function updateListPositionsAction(
  updates: { id: string; position: number }[],
) {
  const userId = await getUserId();

  // 🛡️ Performance Boundary: Concurrency parallelism instead of O(N) sequential awaits
  await Promise.all(
    updates.map((update) => assertUserOwnsList(userId, update.id))
  );

  await boardRepo.updateListPositions(updates);
}

export async function updateCardPositionsAction(
  updates: { id: string; list_id: string; position: number }[],
) {
  const userId = await getUserId();

  // Isolate distinct destination lists to limit redundant Trust Assertions
  const uniqueListIds = Array.from(new Set(updates.map((u) => u.list_id)));
  await Promise.all(
    uniqueListIds.map((listId) => assertUserOwnsList(userId, listId)),
  );

  // Execute massive card position changes concurrently
  // Note: We still need to verify ownership of each card before updating
  await Promise.all(
    updates.map((update) => assertUserOwnsCard(userId, update.id))
  );

  await cardRepo.updateCardPositions(
    updates.map((u) => ({ id: u.id, listId: u.list_id, position: u.position }))
  );
}
