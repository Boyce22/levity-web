import { error, redirect } from '@sveltejs/kit';
import { apiRequest, ApiError } from '$lib/server/api-client';
import { HomeBoardWire } from '$lib/contracts/wire';

export async function load(event) {
  if (!event.locals.token) error(401, 'Sessão necessária.');

  try {
    const boards = await apiRequest(event, `/workspaces/${event.params.workspaceId}/boards`, {
      schema: HomeBoardWire.array(),
    });

    const firstBoard = boards[0];
    if (!firstBoard) error(404, 'Nenhum board encontrado neste workspace.');

    redirect(303, `/w/${event.params.workspaceId}/b/${firstBoard.id}`);
  } catch (cause) {
    if (cause instanceof ApiError) error(cause.status, cause.message);
    throw cause;
  }
}
