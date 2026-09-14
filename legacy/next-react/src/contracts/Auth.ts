import { z } from 'zod';
import { UserSchema } from './User';

export const LoginRequestSchema = z.object({
  username: z.string().min(1, 'Username é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const RegisterRequestSchema = LoginRequestSchema.extend({
  email: z.string().email('E-mail inválido').optional(), // Se for opcional
});

/**
 * Resposta atualizada conforme "Alteracoes de Retorno para o Front"
 * Sem refreshToken, role ou email obrigatórios no user retornado.
 */
export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  user: z.object({
    id: z.string().uuid().or(z.string()),
    username: z.string(),
  }),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
