import { NextResponse } from 'next/server';

const API_BASE = (process.env.EXTERNAL_API_URL ?? 'http://localhost:3001').replace(/\/$/, '');

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || username.length < 3) {
      return NextResponse.json(
        { success: false, message: 'Username must be at least 3 characters' },
        { status: 400 },
      );
    }
    if (!password || password.length < 5) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 5 characters' },
        { status: 400 },
      );
    }

    const apiRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      return NextResponse.json(
        { success: false, message: data.message ?? 'Registration failed' },
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
      console.error('[register] External API did not return a token:', data);
      return NextResponse.json({ success: false, message: 'Registration failed' }, { status: 500 });
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
  } catch {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
