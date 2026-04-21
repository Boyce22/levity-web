import { serverApiClient } from '@/infra/http/serverApiClient';
import { LoginRequest, RegisterRequest, AuthResponse, AuthResponseSchema } from '@/contracts/Auth';

export class AuthRepository {
  /**
   * Realiza login e retorna dados já validados de Auth.
   */
  async login(payload: LoginRequest): Promise<AuthResponse> {
    const data = await serverApiClient.post<unknown>('/auth/login', payload);
    
    // Zod validation (Anti-corruption)
    return AuthResponseSchema.parse(data);
  }

  /**
   * Realiza o registro e retorna dados já validados de Auth.
   */
  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const data = await serverApiClient.post<unknown>('/auth/register', payload);
    
    // Zod validation (Anti-corruption)
    return AuthResponseSchema.parse(data);
  }
}

export const authRepository = new AuthRepository();
