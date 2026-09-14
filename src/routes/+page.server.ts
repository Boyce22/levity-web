import { fail, redirect } from '@sveltejs/kit';
import { apiRequest } from '$lib/server/api-client';
import { HomeBoardWire, WorkspaceWire } from '$lib/contracts/wire';

export async function load(event) {
  if (!event.locals.token) redirect(303, '/login');
  const workspaces = await apiRequest(event, '/workspaces/', { schema: WorkspaceWire.array() });
  for (const workspace of workspaces) {
    const boards = await apiRequest(event, `/workspaces/${workspace.id}/boards`, { schema: HomeBoardWire.array() });
    if (boards[0]) redirect(303, `/w/${workspace.id}/b/${boards[0].id}`);
  }
  return { empty: true };
}

export const actions = {
  createWorkspace: async (event) => {
    const name = String((await event.request.formData()).get('name') ?? '').trim();
    if (!name || name.length > 100) return fail(400, { error: 'Informe um nome entre 1 e 100 caracteres.' });
    const workspace = await apiRequest(event, '/workspaces/', { method: 'POST', body: { name }, schema: WorkspaceWire });
    const boards = await apiRequest(event, `/workspaces/${workspace.id}/boards`, { schema: HomeBoardWire.array() });
    if (!boards[0]) return fail(500, { error: 'O workspace foi criado, mas o board inicial não foi disponibilizado.' });
    redirect(303, `/w/${workspace.id}/b/${boards[0].id}`);
  }
};
