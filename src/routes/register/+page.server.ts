import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { ApiError, apiRequest } from '$lib/server/api-client';
const register = z.object({ username: z.string().min(3).max(30), password: z.string().min(5), email: z.string().email().optional() });
const auth = z.object({ accessToken: z.string(), user: z.object({ id: z.string(), username: z.string() }) });
export const actions = { default: async (event) => { const parsed = register.safeParse(Object.fromEntries(await event.request.formData())); if (!parsed.success) return fail(400, { error: parsed.error.issues[0]?.message ?? 'Preencha os campos corretamente.' }); try { const result = await apiRequest(event, '/auth/register', { method: 'POST', body: parsed.data, schema: auth, authenticated: false }); event.cookies.set('token', result.accessToken, { httpOnly: true, sameSite: 'lax', secure: !event.url.hostname.includes('localhost'), path: '/' }); redirect(303, '/'); } catch (cause) { if (cause instanceof ApiError) return fail(cause.status, { error: cause.message }); throw cause; } } };
