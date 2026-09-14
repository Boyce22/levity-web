import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { ApiError, apiRequest } from '$lib/server/api-client';
import { attachmentValidationError } from '$lib/utils/attachments';

export async function POST(event) {
  try {
    const formData = await event.request.formData();
    const file = formData.get('file');
    const workspaceId = formData.get('workspace_id');

    if (!workspaceId || typeof workspaceId !== 'string') {
      return json({ error: 'workspace_id é obrigatório.' }, { status: 400 });
    }
    if (!file || !(file instanceof Blob)) {
      return json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const validationError = attachmentValidationError(file);
    if (validationError) return json({ error: validationError }, { status: 400 });

    const data = await apiRequest(event, '/files/attachments', { method: 'POST', body: formData });
    return json(data, { status: 201 });
  } catch (cause) {
    if (cause instanceof ApiError) return json({ error: cause.message, code: cause.code }, { status: cause.status });
    throw cause;
  }
}

const deleteFileSchema = z.object({ workspace_id: z.string().uuid(), key: z.string().min(1) });

export async function DELETE(event) {
  const parsed = deleteFileSchema.safeParse(await event.request.json().catch(() => ({})));
  if (!parsed.success) return json({ error: 'Parâmetros inválidos para exclusão.' }, { status: 400 });

  try {
    await apiRequest(event, '/files/attachments', { method: 'DELETE', body: parsed.data });
    return new Response(null, { status: 204 });
  } catch (cause) {
    if (cause instanceof ApiError) return json({ error: cause.message, code: cause.code }, { status: cause.status });
    throw cause;
  }
}
