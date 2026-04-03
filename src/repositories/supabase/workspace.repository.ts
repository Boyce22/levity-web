import { supabase } from '@/lib/supabase';
import type {
  IWorkspaceRepository,
  WorkspaceRecord,
  WorkspaceMemberRecord,
  WorkspaceInviteRecord,
  WorkspaceTagRecord,
  WorkspacePriorityRecord,
} from '../interfaces/workspace.repository';

export class SupabaseWorkspaceRepository implements IWorkspaceRepository {
  // ─── Workspace ────────────────────────────────────────────
  async create(name: string): Promise<WorkspaceRecord> {
    const { data, error } = await supabase
      .from('workspaces')
      .insert({ name })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to create workspace');
    }

    return data;
  }

  async rename(id: string, newName: string): Promise<void> {
    const { error } = await supabase
      .from('workspaces')
      .update({ name: newName })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  // ─── Members ──────────────────────────────────────────────
  async findMember(workspaceId: string, memberId: string): Promise<Pick<WorkspaceMemberRecord, 'role'> | null> {
    const { data, error } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('member_id', memberId)
      .maybeSingle();

    if (error) {
      console.error('[SupabaseWorkspaceRepository.findMember] Error:', error);
      return null;
    }

    return data;
  }

  async addMember(workspaceId: string, memberId: string, role: string): Promise<void> {
    const { error } = await supabase
      .from('workspace_members')
      .insert({ workspace_id: workspaceId, member_id: memberId, role });

    if (error && !error.message.includes('unique constraint')) {
      throw new Error(error.message);
    }
  }

  async findAllByMember(memberId: string): Promise<WorkspaceRecord[]> {
    const { data: members, error } = await supabase
      .from('workspace_members')
      .select('workspace_id, workspaces(*)')
      .eq('member_id', memberId);

    if (error) {
      throw new Error(`Workspace logic failed: ${error.message}`);
    }

    const workspaces = (members || [])
      .map((m) => (Array.isArray(m.workspaces) ? m.workspaces[0] : m.workspaces))
      .filter(Boolean) as WorkspaceRecord[];

    return workspaces.sort(
      (a, b) =>
        new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime(),
    );
  }

  // ─── Invites ──────────────────────────────────────────────
  async createInvite(data: {
    workspaceId: string;
    createdBy: string;
    maxUses: number;
    expiresAt: string;
  }): Promise<string> {
    const { data: invite, error } = await supabase
      .from('workspace_invites')
      .insert({
        workspace_id: data.workspaceId,
        created_by: data.createdBy,
        max_uses: data.maxUses,
        current_uses: 0,
        expires_at: data.expiresAt,
      })
      .select('token')
      .single();

    if (error || !invite) {
      throw new Error(error?.message || 'Failed to generate invite token');
    }

    return invite.token;
  }

  async findInviteByToken(token: string): Promise<(WorkspaceInviteRecord & { workspaces: { id: string; name: string } | null }) | null> {
    const { data: invite, error } = await supabase
      .from('workspace_invites')
      .select(`
        *,
        workspaces (
          id,
          name
        )
      `)
      .eq('token', token)
      .maybeSingle();

    if (error || !invite) return null;

    return invite as any;
  }

  async findInviteByTokenRaw(token: string): Promise<WorkspaceInviteRecord | null> {
    const { data: invite, error } = await supabase
      .from('workspace_invites')
      .select('*')
      .eq('token', token)
      .maybeSingle();

    if (error || !invite) return null;

    return invite;
  }

  async consumeInvite(token: string, currentUses: number, maxUses: number): Promise<WorkspaceInviteRecord> {
    const { data: updatedInvite, error } = await supabase
      .from('workspace_invites')
      .update({ current_uses: currentUses + 1 })
      .eq('token', token)
      .lt('current_uses', maxUses)
      .select()
      .single();

    if (error || !updatedInvite) {
      throw new Error('409 Conflict: Token limit exhausted or concurrent collision mitigated.');
    }

    return updatedInvite;
  }

  // ─── Tags ─────────────────────────────────────────────────
  async createTag(workspaceId: string, name: string, color: string): Promise<WorkspaceTagRecord> {
    const { data, error } = await supabase
      .from('workspace_tags')
      .insert({ workspace_id: workspaceId, name, color })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to create tag');
    }

    return data;
  }

  async deleteTag(workspaceId: string, tagId: string): Promise<void> {
    const { error } = await supabase
      .from('workspace_tags')
      .delete()
      .eq('id', tagId)
      .eq('workspace_id', workspaceId);

    if (error) {
      throw new Error(error.message);
    }
  }

  async findTagsByWorkspace(workspaceId: string): Promise<WorkspaceTagRecord[]> {
    const { data, error } = await supabase
      .from('workspace_tags')
      .select('*')
      .eq('workspace_id', workspaceId);

    if (error) throw new Error(error.message);

    return data || [];
  }

  // ─── Priorities ───────────────────────────────────────────
  async createPriority(workspaceId: string, name: string, color: string, icon: string): Promise<WorkspacePriorityRecord> {
    const { data, error } = await supabase
      .from('workspace_priorities')
      .insert({ workspace_id: workspaceId, name, color, icon })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to create priority');
    }

    return data;
  }

  async deletePriority(workspaceId: string, priorityId: string): Promise<void> {
    const { error } = await supabase
      .from('workspace_priorities')
      .delete()
      .eq('id', priorityId)
      .eq('workspace_id', workspaceId);

    if (error) {
      throw new Error(error.message);
    }
  }

  async findPrioritiesByWorkspace(workspaceId: string): Promise<WorkspacePriorityRecord[]> {
    const { data, error } = await supabase
      .from('workspace_priorities')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('position');

    if (error) throw new Error(error.message);

    return data || [];
  }

  async seedDefaultPriorities(workspaceId: string): Promise<void> {
    const defaultPriorities = [
      { workspace_id: workspaceId, name: 'Low', color: '#34d399', icon: '↓', position: 0 },
      { workspace_id: workspaceId, name: 'Medium', color: '#fbbf24', icon: '→', position: 1 },
      { workspace_id: workspaceId, name: 'High', color: '#f87171', icon: '↑', position: 2 },
    ];

    const { error } = await supabase
      .from('workspace_priorities')
      .insert(defaultPriorities);

    if (error) {
      console.error('Error seeding priorities:', error);
    }
  }

  // ─── Lists (meta — para assertions) ───────────────────────
  async findListWorkspaceId(listId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('lists')
      .select('workspace_id')
      .eq('id', listId)
      .maybeSingle();

    if (error || !data) return null;

    return data.workspace_id;
  }

  // ─── Cards (meta — para assertions) ───────────────────────
  async findCardListId(cardId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('cards')
      .select('list_id')
      .eq('id', cardId)
      .maybeSingle();

    if (error || !data) return null;

    return data.list_id;
  }

  // ─── Legacy migration ──────────────────────────────────────
  async migrateListsWithoutWorkspace(workspaceId: string, createdBy: string): Promise<void> {
    await supabase
      .from('lists')
      .update({ workspace_id: workspaceId })
      .is('workspace_id', null)
      .eq('created_by', createdBy);
  }
}
