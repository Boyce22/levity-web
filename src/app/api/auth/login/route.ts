import { NextResponse } from 'next/server';
import { signJwtToken } from '@/lib/auth';
import { userRepo } from '@/repositories';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    const user = await userRepo.findByUsername(username);

    if (!user) {
      console.warn(`[login] User not found: "${username}"`);
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      console.warn(`[login] Wrong password for user: "${username}"`);
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = await signJwtToken({ id: user.id, user: user.username });

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/'
    });

    return response;
  } catch (err) {
    console.error('[login] Unexpected error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

