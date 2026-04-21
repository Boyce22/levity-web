import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DomainError } from '@/infra/http/errors';

export interface SessionPayload {
  id: string;
  sub?: string;
  userId?: string;
  [key: string]: unknown;
}

/**
 * Decodes the JWT payload without verifying the signature.
 * Safe to use on the server since the middleware + external API enforce validity.
 */
export function decodeJwtPayload(token: string): SessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = typeof Buffer !== 'undefined' 
      ? Buffer.from(base64, 'base64').toString('utf-8')
      : decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Retorna o access token dos cookies se existir.
 */
export async function getAccessToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get('token')?.value;
}

/**
 * Retorna as informações base da sessão atual a partir do token.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const token = await getAccessToken();
  if (!token) return null;
  
  return decodeJwtPayload(token);
}

/**
 * Garante que a sessão exista, caso contrário levanta um erro ou redireciona.
 */
export async function requireSession(redirectToLogin = false): Promise<SessionPayload> {
  const session = await getSession();
  
  if (!session) {
    if (redirectToLogin) {
      redirect('/login');
    }
    throw new DomainError('UNAUTHORIZED', 'Authentication required');
  }
  
  return session;
}

/**
 * Configura o cookie de sessão com o token recebido.
 */
export async function createSession(token: string): Promise<void> {
  const store = await cookies();
  store.set({
    name: 'token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
}

/**
 * Remove a sessão atual.
 */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete('token');
}

/**
 * Validação estrutural do token utilizada primariamente pelo middleware.
 */
export function isTokenStructurallyValid(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = typeof Buffer !== 'undefined' 
      ? Buffer.from(base64, 'base64').toString('utf-8')
      : decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    JSON.parse(json);
    return true;
  } catch {
    return false;
  }
}
