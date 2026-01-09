import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes (har kim kiradigan)
  const publicRoutes = ['/', '/login', '/register'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Auth routes
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.includes(pathname);

  // Check if user is authenticated (cookie orqali)
  // Firebase auth token cookies da saqlanadi
  const authCookie = request.cookies.get('__session');
  const isAuthenticated = !!authCookie;

  console.log('Middleware:', {
    pathname,
    isAuthenticated,
    isPublicRoute,
    isAuthRoute,
  });

  // Agar login qilgan va auth route ga kirayotgan bo'lsa -> admin'ga
  if (isAuthenticated && isAuthRoute) {
    console.log('Already logged in, redirecting to /admin');
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Agar login qilmagan va protected route ga kirayotgan bo'lsa -> login'ga
  if (!isAuthenticated && !isPublicRoute) {
    console.log('Not logged in, redirecting to /login');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};