import { NextResponse } from 'next/server';
import { userRepo } from '@/repositories';
import { signJwtToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || username.length < 3) {
      return NextResponse.json({ success: false, message: 'Username must be at least 3 characters' }, { status: 400 });
    }
    if (!password || password.length < 5) {
      return NextResponse.json({ success: false, message: 'Password must be at least 5 characters' }, { status: 400 });
    }

    const existingUser = await userRepo.findByUsername(username);
    if (existingUser) {
      return NextResponse.json({ success: false, message: 'Username already taken.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await userRepo.create({ username, password: hashedPassword });

    if (!newUser) {
      return NextResponse.json({ success: false, message: 'Failed to create user.' }, { status: 500 });
    }

    const token = await signJwtToken({ id: newUser.id, user: newUser.username });
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
  } catch {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
