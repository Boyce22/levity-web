import { NextResponse } from 'next/server';

const API_BASE = process.env.EXTERNAL_API_URL

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 },
      );
    }

    const apiRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      return NextResponse.json(
        { success: false, message: data.message ?? 'Invalid credentials' },
        { status: apiRes.status },
      );
    }

    // Support flexible token shapes: accessToken, token, accessToken, or raw string
    let token: string | undefined;
    if (typeof data === 'string') {
      token = data;
    } else if (data && typeof data === 'object') {
      token = data.accessToken ?? data.token ?? data.accessToken;
    }

    if (!token) {
      console.error('[login] External API did not return a token:', data);
      return NextResponse.json({ success: false, message: 'Authentication failed' }, { status: 500 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('[login] Unexpected error:', err);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
