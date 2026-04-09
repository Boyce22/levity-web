import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isTokenStructurallyValid } from '@/lib/auth';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  const isLoginPage =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register');
  const isAuthApi = request.nextUrl.pathname.startsWith('/api/auth');

  if (isLoginPage || isAuthApi) {
    if (token && isTokenStructurallyValid(token)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (!token || !isTokenStructurallyValid(token)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
