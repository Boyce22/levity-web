"use server";

import { supabase } from "@/lib/supabase";
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
  priority?: "low" | "medium" | "high" | null;
  label?: "feature" | "bug" | "infra" | "design" | "research" | null;
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
  const { data: members, error } = await supabase
    .from("workspace_members")
    .select("workspace_id, workspaces(*)")
    .eq("user_id", userId);

  if (error) throw new Error(`Workspace logic failed: ${error.message}`);

  const workspaces = (members || [])
    .map((m) => (Array.isArray(m.workspaces) ? m.workspaces[0] : m.workspaces))
    .filter(Boolean) as any[];

  return workspaces.sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

async function ensureDefaultWorkspace(userId: string, workspaces: any[]) {
  if (workspaces.length > 0) return workspaces;

  const { data: cw, error } = await supabase
    .from("workspaces")
    .insert({ name: "My Workspace" })
    .select()
    .single();
  if (error)
    throw new Error(`Failed to generate default workspace: ${error.message}`);

  await supabase
    .from("workspace_members")
    .insert({ workspace_id: cw.id, user_id: userId, role: "owner" });
  return [cw];
}

async function fetchBoardLists(workspaceId: string) {
  // 🛡️ Performance Boundary: PostgREST Embedded Join (Fetches Lists + Cards in identical sub-second DB execution)
  const { data: lists, error } = await supabase
    .from("lists")
    .select("*, cards(*)")
    .eq("workspace_id", workspaceId)
    .order("position");

  if (error) throw new Error(`Failed to load board lists: ${error.message}`);

  const flatLists: List[] = [];
  const flatCards: Card[] = [];

  for (const list of lists || []) {
    const listCards = list.cards || [];
    listCards.sort((a: any, b: any) => a.position - b.position);
    flatCards.push(...listCards);

    const { cards, ...listData } = list;
    flatLists.push(listData as List);
  }

  return { lists: flatLists, cards: flatCards };
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
  await supabase
    .from("lists")
    .update({ workspace_id: currentWsId })
    .is("workspace_id", null)
    .eq("user_id", userId);

  const { lists, cards } = await fetchBoardLists(currentWsId);

  return { lists, cards, workspaces };
}
export async function createListAction(
  title: string,
  position: number,
  workspaceId: string,
) {
  const userId = await getUserId();

  // 🛡️ Security Boundary: BFLA / IDOR Check
  await assertUserOwnsWorkspace(userId, workspaceId);

  const { data, error } = await supabase
    .from("lists")
    .insert({ user_id: userId, title, position, workspace_id: workspaceId })
    .select()
    .single();

  if (error) {
    console.error(error);
    return null;
  }
  revalidatePath("/");
  return data;
}

export async function renameListAction(listId: string, title: string) {
  const userId = await getUserId();
  await assertUserOwnsList(userId, listId);

  await supabase.from("lists").update({ title }).eq("id", listId);
  revalidatePath("/");
}

export async function deleteListAction(id: string) {
  const userId = await getUserId();
  await assertUserOwnsList(userId, id);

  await supabase.from("lists").delete().eq("id", id);
  revalidatePath("/");
}

export async function updateListTypeAction(listId: string, listType: ListType | null) {
  const userId = await getUserId();
  await assertUserOwnsList(userId, listId);

  await supabase.from("lists").update({ list_type: listType }).eq("id", listId);
  revalidatePath("/");
}

export async function createCardAction(
  listId: string,
  content: string,
  position: number,
) {
  const userId = await getUserId();
  await assertUserOwnsList(userId, listId);

  const { data, error } = await supabase
    .from("cards")
    .insert({ list_id: listId, content, position })
    .select()
    .single();

  if (error) console.error(error);
  revalidatePath("/");
  return data;
}

export async function deleteCardAction(id: string) {
  const userId = await getUserId();
  await assertUserOwnsCard(userId, id);

  await supabase.from("cards").delete().eq("id", id);
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

  const { data: users } = await supabase
    .from("users")
    .select("id, username")
    .in("username", addedMentions);
  if (!users || users.length === 0) return;

  const notifications = users.map((u) => ({
    user_id: u.id,
    actor_id: userId,
    card_id: cardId,
    type: "mention_desc",
    content: "You were mentioned in a card description.",
  }));
  await supabase.from("notifications").insert(notifications);
}

export async function updateCardDetailsAction(
  id: string,
  updates: Partial<Card>,
) {
  const userId = await getUserId();
  await assertUserOwnsCard(userId, id);

  const { data: oldCard } = await supabase
    .from("cards")
    .select("*")
    .eq("id", id)
    .single();

  // 🛡️ Security Boundary: Mass Assignment Protection
  // Strict Allowlist: Dropping unpredictable metadata like list_id or ids.
  const safePayload = {
    ...(updates.content !== undefined && { content: updates.content }),
    ...(updates.description !== undefined && {
      description: updates.description,
    }),
    ...(updates.cover_url !== undefined && { cover_url: updates.cover_url }),
    ...(updates.assignee_id !== undefined && {
      assignee_id: updates.assignee_id,
    }),
    ...(updates.priority !== undefined && { priority: updates.priority }),
    ...(updates.label !== undefined && { label: updates.label }),
    ...(updates.progress !== undefined && { progress: updates.progress }),
    ...(updates.due_date !== undefined && { due_date: updates.due_date }),
  };

  await supabase.from("cards").update(safePayload).eq("id", id);

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
    await supabase.from("card_history").insert(logs);
  }

  revalidatePath("/");
}

export async function updateListPositionsAction(
  updates: { id: string; position: number }[],
) {
  const userId = await getUserId();

  // 🛡️ Performance Boundary: Concurrency parallelism instead of O(N) sequential awaits
  await Promise.all(
    updates.map(async (update) => {
      await assertUserOwnsList(userId, update.id);
      await supabase
        .from("lists")
        .update({ position: update.position })
        .eq("id", update.id);
    }),
  );
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
  await Promise.all(
    updates.map(async (update) => {
      await assertUserOwnsCard(userId, update.id);
      await supabase
        .from("cards")
        .update({
          list_id: update.list_id,
          position: update.position,
        })
        .eq("id", update.id);
    }),
  );
}
