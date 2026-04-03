export interface WorkspaceRecord {
  id: string;
  name: string;
  created_at?: string;
}

export interface WorkspaceMemberRecord {
  workspace_id: string;
  member_id: string;
  role: string;
}

export interface WorkspaceInviteRecord {
  id: string;
  workspace_id: string;
  created_by: string;
  token: string;
  max_uses: number;
  current_uses: number;
  expires_at: string;
}

export interface WorkspaceTagRecord {
  id: string;
  workspace_id: string;
  name: string;
  color: string;
}

export interface WorkspacePriorityRecord {
  id: string;
  workspace_id: string;
  name: string;
  color: string;
  icon: string;
  position: number;
}

export interface IWorkspaceRepository {
  // ─── Workspace ────────────────────────────────────────────
  create(name: string): Promise<WorkspaceRecord>;
  rename(id: string, newName: string): Promise<void>;
  delete(id: string): Promise<void>;

  // ─── Members ──────────────────────────────────────────────
  findMember(workspaceId: string, memberId: string): Promise<Pick<WorkspaceMemberRecord, 'role'> | null>;
  addMember(workspaceId: string, memberId: string, role: string): Promise<void>;

  /** Retorna todos os workspaces onde o memberId é membro, ordenados por created_at. */
  findAllByMember(memberId: string): Promise<WorkspaceRecord[]>;

  // ─── Invites ──────────────────────────────────────────────
  createInvite(data: {
    workspaceId: string;
    createdBy: string;
    maxUses: number;
    expiresAt: string;
  }): Promise<string>; // retorna token

  findInviteByToken(token: string): Promise<(WorkspaceInviteRecord & { workspaces: { id: string; name: string } | null }) | null>;
  findInviteByTokenRaw(token: string): Promise<WorkspaceInviteRecord | null>;

  consumeInvite(token: string, currentUses: number, maxUses: number): Promise<WorkspaceInviteRecord>;

  // ─── Tags ─────────────────────────────────────────────────
  createTag(workspaceId: string, name: string, color: string): Promise<WorkspaceTagRecord>;
  deleteTag(workspaceId: string, tagId: string): Promise<void>;
  findTagsByWorkspace(workspaceId: string): Promise<WorkspaceTagRecord[]>;

  // ─── Priorities ───────────────────────────────────────────
  createPriority(workspaceId: string, name: string, color: string, icon: string): Promise<WorkspacePriorityRecord>;
  deletePriority(workspaceId: string, priorityId: string): Promise<void>;
  findPrioritiesByWorkspace(workspaceId: string): Promise<WorkspacePriorityRecord[]>;
  seedDefaultPriorities(workspaceId: string): Promise<void>;

  // ─── Lists (meta — para assertions) ───────────────────────
  findListWorkspaceId(listId: string): Promise<string | null>;

  // ─── Cards (meta — para assertions) ───────────────────────
  findCardListId(cardId: string): Promise<string | null>;

  // ─── Legacy migration ──────────────────────────────────────
  migrateListsWithoutWorkspace(workspaceId: string, createdBy: string): Promise<void>;
}
