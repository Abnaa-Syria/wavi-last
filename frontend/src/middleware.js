import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const adminToken = request.cookies.get('wavi_admin_token')?.value;
  const isAdminSession = adminToken === 'authenticated';

  // Keep admins out of customer account pages (cookie is set client-side on login)
  if (pathname.startsWith('/account') && isAdminSession) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*'],
};
