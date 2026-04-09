import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE = (process.env.EXTERNAL_API_URL ?? 'http://localhost:3001').replace(/\/$/, '');

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';
    let body;

    // Forward the body directly
    if (contentType.includes('multipart/form-data')) {
      body = await request.formData();
    } else {
      body = await request.json();
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
    };

    // If JSON, we need to set Content-Type for the external API.
    // If multipart/form-data, we let fetch set it with the boundary.
    if (contentType.includes('application/json')) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE}/users/me`, {
      method: 'PATCH',
      headers,
      body: contentType.includes('application/json') ? JSON.stringify(body) : body,
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      return NextResponse.json({ error: errorText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API Proxy] Error in /api/users/me:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
