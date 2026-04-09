import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE = (process.env.EXTERNAL_API_URL ?? 'http://localhost:3001').replace(/\/$/, '');

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    // The user said "envie só o file e o token"
    // Usually the external API expects the file in a field like 'file' or 'avatar'.
    // I'll keep the file as is from the incoming request.

    const res = await fetch(`${API_BASE}/users/me/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData, // Forwarding the formData directly
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      return NextResponse.json({ error: errorText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API Proxy] Error in /api/users/me/avatar:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
