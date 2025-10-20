import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { UserRole } from '@prisma/client'

// Define protected routes and their required roles
const protectedRoutes: Record<string, UserRole[]> = {
  '/dashboard/trainee': [UserRole.TRAINEE, UserRole.ADMIN],
  '/dashboard/instructor': [UserRole.INSTRUCTOR, UserRole.ADMIN],
  '/dashboard/company': [UserRole.COMPANY, UserRole.ADMIN],
  '/dashboard/admin': [UserRole.ADMIN],
  '/dashboard/profile': [UserRole.TRAINEE, UserRole.INSTRUCTOR, UserRole.COMPANY, UserRole.ADMIN],
  '/dashboard/settings': [UserRole.TRAINEE, UserRole.INSTRUCTOR, UserRole.COMPANY, UserRole.ADMIN],
  '/training': [UserRole.TRAINEE, UserRole.INSTRUCTOR, UserRole.ADMIN],
  '/candidates': [UserRole.COMPANY, UserRole.ADMIN],
  '/content-management': [UserRole.INSTRUCTOR, UserRole.ADMIN],
}

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/auth/login', '/auth/register']

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const { pathname } = request.nextUrl

  // Redirect authenticated users away from auth pages
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Check if route is protected
  const protectedRoute = Object.keys(protectedRoutes).find((route) =>
    pathname.startsWith(route)
  )

  if (protectedRoute) {
    // User not authenticated
    if (!token) {
      const url = new URL('/auth/login', request.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }

    // Check role-based access
    const requiredRoles = protectedRoutes[protectedRoute]
    const userRole = token.role as UserRole

    if (!requiredRoles.includes(userRole)) {
      // Redirect to appropriate dashboard based on user role
      let redirectPath = '/dashboard'

      switch (userRole) {
        case UserRole.TRAINEE:
          redirectPath = '/dashboard/trainee'
          break
        case UserRole.INSTRUCTOR:
          redirectPath = '/dashboard/instructor'
          break
        case UserRole.COMPANY:
          redirectPath = '/dashboard/company'
          break
        case UserRole.ADMIN:
          redirectPath = '/dashboard/admin'
          break
      }

      return NextResponse.redirect(new URL(redirectPath, request.url))
    }
  }

  // Add security headers
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'X-Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  )

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.gif).*)',
  ],
}
