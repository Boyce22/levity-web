'use server';

import { loginUseCase, registerUseCase } from '../use-cases/auth.use-cases';

export async function loginAction(data: unknown) {
  return loginUseCase(data);
}

export async function registerAction(data: unknown) {
  return registerUseCase(data);
}
