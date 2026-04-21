import { serverApiClient } from '@/infra/http/serverApiClient';
import { Workspace, WorkspaceSchema } from '@/contracts/Workspace';
import { z } from 'zod';

export class WorkspaceRepository {
  async getWorkspaces(): Promise<Workspace[]> {
    const data = await serverApiClient.get<unknown>('/workspaces');
    return z.array(WorkspaceSchema).parse(data);
  }

  async createWorkspace(name: string): Promise<Workspace> {
    const data = await serverApiClient.post<unknown>('/workspaces', { name });
    return WorkspaceSchema.parse(data);
  }

  async updateWorkspace(id: string, name: string): Promise<Workspace> {
    const data = await serverApiClient.patch<unknown>(`/workspaces/${id}`, { name });
    return WorkspaceSchema.parse(data);
  }

  async deleteWorkspace(id: string): Promise<void> {
    await serverApiClient.delete(`/workspaces/${id}`);
  }

  async getWorkspaceInvites(workspaceId: string): Promise<any[]> {
    return await serverApiClient.get<any[]>(`/workspaces/${workspaceId}/invites`);
  }

  async generateInvite(workspaceId: string, payload: any): Promise<{ token: string }> {
    return await serverApiClient.post<{ token: string }>(`/workspaces/${workspaceId}/invites`, payload);
  }

  async getInviteDetails(workspaceId: string, token: string): Promise<any> {
    return await serverApiClient.get<any>(`/workspaces/${workspaceId}/invites/${token}`);
  }

  async acceptInvite(workspaceId: string, token: string): Promise<{ workspaceId: string }> {
    return await serverApiClient.post<{ workspaceId: string }>(`/workspaces/${workspaceId}/invites/${token}/accept`);
  }

  async revokeInvite(workspaceId: string, inviteId: string): Promise<void> {
    await serverApiClient.delete(`/workspaces/${workspaceId}/invites/${inviteId}`);
  }

  async removeMember(workspaceId: string, memberId: string): Promise<void> {
    await serverApiClient.delete(`/workspaces/${workspaceId}/members/${memberId}`);
  }

  async updateMemberRole(workspaceId: string, memberId: string, role: string): Promise<void> {
    await serverApiClient.patch(`/workspaces/${workspaceId}/members/${memberId}/role`, { role });
  }

  async createTag(workspaceId: string, payload: any): Promise<any> {
    return await serverApiClient.post(`/workspaces/${workspaceId}/tags`, payload);
  }

  async deleteTag(workspaceId: string, tagId: string): Promise<void> {
    await serverApiClient.delete(`/workspaces/${workspaceId}/tags/${tagId}`);
  }

  async createPriority(workspaceId: string, payload: any): Promise<any> {
    return await serverApiClient.post(`/workspaces/${workspaceId}/priorities`, payload);
  }

  async deletePriority(workspaceId: string, priorityId: string): Promise<void> {
    await serverApiClient.delete(`/workspaces/${workspaceId}/priorities/${priorityId}`);
  }
}

export const workspaceRepository = new WorkspaceRepository();
