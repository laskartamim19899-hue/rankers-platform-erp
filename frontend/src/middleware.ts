import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Protect all /admin routes
  if (pathname.startsWith('/admin')) {
    // If they go to /admin/login, redirect to unified login with staff type
    if (pathname === '/admin/login') {
      return NextResponse.redirect(new URL('/login?type=staff', request.url));
    }
    
    if (!token) {
      // Redirect to login if no token is found in cookies
      return NextResponse.redirect(new URL('/login?type=staff', request.url));
    }
  }

  return NextResponse.next();
}

// Config to specify which paths should trigger the middleware
export const config = {
  matcher: ['/admin/:path*'],
};
