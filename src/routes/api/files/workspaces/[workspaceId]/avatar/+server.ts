import { json } from '@sveltejs/kit';
import { ApiError, apiRequest } from '$lib/server/api-client';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(event) {
  try {
    const formData = await event.request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return json(
        { error: 'Formato não suportado. Envie apenas imagens (JPEG, PNG, WebP, GIF).' },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return json({ error: 'O arquivo deve ter no máximo 10 MiB.' }, { status: 400 });
    }

    const data = await apiRequest(event, `/files/workspaces/${event.params.workspaceId}/avatar`, {
      method: 'POST',
      body: formData,
    });

    return json(data, { status: 201 });
  } catch (cause) {
    if (cause instanceof ApiError) {
      return json({ error: cause.message, code: cause.code }, { status: cause.status });
    }
    throw cause;
  }
}
