import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { ApiError, apiRequest } from '$lib/server/api-client';
const credentials = z.object({ username: z.string().min(3), password: z.string().min(5) });
const auth = z.object({ accessToken: z.string(), user: z.object({ id: z.string(), username: z.string() }) });
function callback(value: FormDataEntryValue | null) { const path = typeof value === 'string' ? value : '/'; return path.startsWith('/') && !path.startsWith('//') ? path : '/'; }
export const actions = { default: async (event) => { const form = await event.request.formData(); const parsed = credentials.safeParse(Object.fromEntries(form)); if (!parsed.success) return fail(400, { error: 'Usuário deve ter ao menos 3 caracteres e a senha ao menos 5.' }); try { const result = await apiRequest(event, '/auth/login', { method: 'POST', body: parsed.data, schema: auth, authenticated: false }); event.cookies.set('token', result.accessToken, { httpOnly: true, sameSite: 'lax', secure: !event.url.hostname.includes('localhost'), path: '/' }); redirect(303, callback(form.get('callbackUrl'))); } catch (cause) { if (cause instanceof ApiError) return fail(cause.status, { error: cause.message }); throw cause; } } };
