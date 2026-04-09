"use server";

import { httpGet, httpPost, httpPatch, httpDelete } from "@/lib/http";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getUserIdFromToken } from "@/lib/auth";

// Tipos centralizados em @/types/board — importados para uso nas assinaturas das
// funções desta action e re-exportados para compatibilidade com imports legados.
// Novos arquivos devem importar de @/types/board diretamente.
import type { Card, List, ListType } from "@/types/board";

async function getUserId() {
  const token = (await cookies()).get("token")?.value;
  if (!token) throw new Error("Unauthorized");
  const id = getUserIdFromToken(token);
  if (!id) throw new Error("Unauthorized");
  return id;
}

export async function getBoardData(workspaceId?: string) {
  const userId = await getUserId();

  let workspaces = await httpGet<any[]>('/workspaces').catch(() => []);

  if (workspaces.length === 0) {
    const created = await httpPost<any>('/workspaces', { name: 'My Workspace' });
    workspaces = [created];
  }

  const currentWsId = workspaceId || workspaces[0]?.id;
  if (!currentWsId) throw new Error("Could not determine active workspace ID.");

  const data = await httpGet<any>(`/workspaces/${currentWsId}/board`);
  const lists = data.lists || [];
  const cards = data.cards || (data.lists || []).flatMap((l: any) => l.cards || []);
  const rawMembers = data.members || [];
  const tags = data.tags || [];
  const priorities = data.priorities || [];

  const members = rawMembers.map((m: any) => ({
    ...(m.user || {}),
    id: m.userId || m.id,
    role: m.role,
    joinedAt: m.createdAt,
  }));

  const currentMember = rawMembers.find((m: any) => m.userId === userId || m.id === userId);
  const userRole = currentMember?.role ?? 'member';

  // API returns 403 for non-admin/owner — handled gracefully
  const invites = await httpGet<any[]>(`/workspaces/${currentWsId}/invites`).catch(() => []);

  return { lists, cards, workspaces, tags, priorities, members, userRole, invites };
}

export async function createListAction(title: string, position: number, workspaceId: string): Promise<List> {
  const data = await httpPost<List>(`/workspaces/${workspaceId}/lists`, { title, position });
  revalidatePath("/");
  return data;
}

export async function renameListAction(listId: string, title: string, workspaceId: string) {
  await httpPatch(`/workspaces/${workspaceId}/lists/${listId}`, { title });
  revalidatePath("/");
}

export async function deleteListAction(id: string, workspaceId: string) {
  await httpDelete(`/workspaces/${workspaceId}/lists/${id}`);
  revalidatePath("/");
}

export async function updateListTypeAction(listId: string, listType: ListType | null, workspaceId: string) {
  await httpPatch(`/workspaces/${workspaceId}/lists/${listId}`, { listType });
  revalidatePath("/");
}

export async function updateListWipLimitAction(listId: string, wipLimit: number | null, workspaceId: string) {
  await httpPatch(`/workspaces/${workspaceId}/lists/${listId}`, { wipLimit });
  revalidatePath("/");
}

export async function createCardAction(listId: string, content: string, position: number, workspaceId: string): Promise<Card> {
  const data = await httpPost<Card>(`/workspaces/${workspaceId}/cards`, { listId, content, position });
  revalidatePath("/");
  return data;
}

export async function deleteCardAction(id: string, workspaceId: string) {
  await httpDelete(`/workspaces/${workspaceId}/cards/${id}`);
  revalidatePath("/");
}

export async function updateCardDetailsAction(id: string, updates: Partial<Card>, workspaceId: string) {
  const safePayload = {
    ...(updates.content !== undefined && { content: updates.content }),
    ...(updates.description !== undefined && { description: updates.description }),
    ...(updates.coverUrl !== undefined && { coverUrl: updates.coverUrl }),
    ...(updates.assigneeId !== undefined && { assigneeId: updates.assigneeId || null }),
    ...(updates.priority !== undefined && { priority: updates.priority }),
    ...(updates.label !== undefined && { label: updates.label }),
    ...(updates.progress !== undefined && { progress: updates.progress }),
    ...(updates.dueDate !== undefined && { dueDate: updates.dueDate || null }),
  };

  await httpPatch(`/workspaces/${workspaceId}/cards/${id}`, safePayload);
  revalidatePath("/");
}

export async function updateListPositionsAction(
  updates: { id: string; position: number }[],
  workspaceId: string,
) {
  await httpPatch(`/workspaces/${workspaceId}/lists/positions`, updates);
}

export async function updateCardPositionsAction(
  updates: { id: string; listId: string; position: number }[],
  workspaceId: string,
) {
  await httpPatch(`/workspaces/${workspaceId}/cards/positions`,
    updates.map((u) => ({ id: u.id, listId: u.listId, position: u.position })),
  );
}
