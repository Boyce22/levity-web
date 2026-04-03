import { supabase } from '@/lib/supabase';
import type { IUserRepository, UserRecord } from '../interfaces/user.repository';

export class SupabaseUserRepository implements IUserRepository {
  async findByUsername(username: string): Promise<UserRecord | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      console.error('[SupabaseUserRepository.findByUsername] Error:', error);
      return null;
    }

    return data;
  }

  async findById(id: string): Promise<UserRecord | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('[SupabaseUserRepository.findById] Error:', error);
      return null;
    }

    return data;
  }

  async findManyByUsernames(usernames: string[]): Promise<Pick<UserRecord, 'id' | 'username'>[]> {
    const { data, error } = await supabase
      .from('users')
      .select('id, username')
      .in('username', usernames);

    if (error) {
      console.error('[SupabaseUserRepository.findManyByUsernames] Error:', error);
      return [];
    }

    return data || [];
  }

  async create(data: { username: string; password: string }): Promise<UserRecord> {
    const { data: newUser, error } = await supabase
      .from('users')
      .insert(data)
      .select()
      .single();

    if (error || !newUser) {
      console.error('[SupabaseUserRepository.create] Error:', error);
      throw new Error('Failed to create user in Supabase');
    }

    return newUser;
  }

  async updateUserProfile(userId: string, data: { display_name?: string; avatar_url?: string; bio?: string }): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('[SupabaseUserRepository.updateUserProfile] Error:', error);
      throw new Error(error.message);
    }
  }
}
