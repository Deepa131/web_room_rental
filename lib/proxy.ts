import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, getUserData } from "@/lib/cookie";

const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/',
];

const adminRoutes = ['/admin'];
const ownerRoutes = ['/owner'];
const renterRoutes = ['/renter'];
const userRoutes = ['/user'];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getAuthToken();
  const user = token ? await getUserData() : null;
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  const isOwnerRoute = ownerRoutes.some(route => pathname.startsWith(route));
  const isRenterRoute = renterRoutes.some(route => pathname.startsWith(route));
  const isUserRoute = userRoutes.some(route => pathname.startsWith(route));

  // Redirect to login if not authenticated and trying to access protected route
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // If authenticated and has user data
  if (token && user) {
    // Admin route protection
    if (isAdminRoute && user.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Owner route protection
    if (isOwnerRoute && user.role !== 'owner') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Renter route protection
    if (isRenterRoute && user.role !== 'renter') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // User routes accessible by all authenticated users
    if (isUserRoute && !token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Redirect authenticated users away from auth pages
    if (isPublicRoute && ['/login', '/register'].includes(pathname)) {
      if (user.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      } else if (user.role === 'owner') {
        return NextResponse.redirect(new URL('/owner/dashboard', req.url));
      } else if (user.role === 'renter') {
        return NextResponse.redirect(new URL('/renter/dashboard', req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/owner/:path*',
    '/renter/:path*',
    '/user/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ],
};
