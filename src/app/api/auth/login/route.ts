import { NextResponse } from 'next/server';
import { signJwtToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
       console.log("Supabase error fetching user: ", error);
    }

    if (user && user.password === password) {
      const token = await signJwtToken({ id: user.id, user: user.username });
      
      const response = NextResponse.json({ success: true });
      response.cookies.set({
        name: 'token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/'
      });
      
      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
