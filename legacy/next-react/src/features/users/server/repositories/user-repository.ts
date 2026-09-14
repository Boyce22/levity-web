import { serverApiClient } from '@/infra/http/serverApiClient';
import { User, UserSchema } from '@/contracts/User';
import { z } from 'zod';

export class UserRepository {
  async getMe(): Promise<User> {
    const data = await serverApiClient.get<unknown>('/users/me');
    return UserSchema.parse(data);
  }

  async updateMe(updates: any): Promise<User> {
    const data = await serverApiClient.patch<unknown>('/users/me', updates);
    return UserSchema.parse(data);
  }

  async getAllUsers(workspaceId: string): Promise<User[]> {
    const data = await serverApiClient.get<unknown>(`/users/?workspaceId=${workspaceId}`);
    return z.array(UserSchema).parse(data);
  }

  async uploadAvatar(formData: FormData): Promise<{ avatarUrl: string }> {
    return await serverApiClient.post<{ avatarUrl: string }>('/users/me/avatar', formData);
  }
}

export const userRepository = new UserRepository();
