export interface UserRecord {
  id: string;
  username: string;
  password: string;
  display_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  email?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface IUserRepository {
  /** Busca um usuário pelo username. Retorna null se não encontrar. */
  findByUsername(username: string): Promise<UserRecord | null>;

  /** Busca um usuário pelo id. Retorna null se não encontrar. */
  findById(id: string): Promise<UserRecord | null>;

  /** Busca múltiplos usuários por lista de usernames (para menções). */
  findManyByUsernames(usernames: string[]): Promise<Pick<UserRecord, 'id' | 'username'>[]>;

  /** Cria um novo usuário. Retorna o registro criado. */
  create(data: { username: string; password: string }): Promise<UserRecord>;

  /** Atualiza o perfil de um usuário. */
  updateUserProfile(userId: string, data: { display_name?: string; avatar_url?: string; bio?: string }): Promise<void>;
}
