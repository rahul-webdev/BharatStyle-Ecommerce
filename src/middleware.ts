import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const { token } = req.nextauth;

    // Protect /admin routes
    if (pathname.startsWith('/admin')) {
      if (pathname === '/admin/login') {
        if (token?.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', req.url));
        }
        return NextResponse.next();
      }

      // If no token or role is not admin, NextAuth middleware will handle redirect to signIn page
      // which is now set to /admin/login in authOptions
      if (!token || token.role !== 'admin') {
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // Public routes
        if (
          pathname === '/' ||
          pathname.startsWith('/auth') ||
          pathname.startsWith('/shop') ||
          pathname.startsWith('/api') ||
          pathname === '/about' ||
          pathname === '/admin/login'
        ) {
          return true;
        }
        // Protected routes require token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*', '/orders/:path*'],
};

