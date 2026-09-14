import { createSession } from '@/infra/auth/session';
import { authRepository } from '../repositories/auth-repository';
import { LoginRequestSchema, RegisterRequestSchema } from '@/contracts/Auth';

// ─── LOGIN ────────────────────────────────────────────────────────────────────

export async function loginUseCase(payload: unknown) {
  const validData = LoginRequestSchema.parse(payload);
  const authData = await authRepository.login(validData);
  await createSession(authData.accessToken);
  return authData;
}

// ─── REGISTER ─────────────────────────────────────────────────────────────────

export async function registerUseCase(payload: unknown) {
  const validData = RegisterRequestSchema.parse(payload);
  const authData = await authRepository.register(validData);
  await createSession(authData.accessToken);
  return authData;
}
