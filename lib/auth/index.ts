import { getServerSession } from 'next-auth'
import { authConfig } from './auth.config'
import { NextResponse } from 'next/server'
import { UserRole } from '@prisma/client'

// Get session helper
export async function getSession() {
  return await getServerSession(authConfig)
}

// API route protection wrapper
export function withAuth(handler: Function, allowedRoles?: UserRole[]) {
  return async function (req: Request, ...args: any[]) {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // @ts-ignore - role exists on user
    if (allowedRoles && !allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return handler(req, ...args, session)
  }
}

// Get current user helper
export async function getCurrentUser() {
  const session = await getSession()
  return session?.user || null
}

// Check if user has role
export async function hasRole(roles: UserRole | UserRole[]) {
  const session = await getSession()
  if (!session?.user) return false

  const allowedRoles = Array.isArray(roles) ? roles : [roles]
  // @ts-ignore - role exists on user
  return allowedRoles.includes(session.user.role)
}

// Require authentication
export async function requireAuth() {
  const session = await getSession()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  return session
}

// Require specific role
export async function requireRole(roles: UserRole | UserRole[]) {
  const session = await requireAuth()
  const allowedRoles = Array.isArray(roles) ? roles : [roles]

  // @ts-ignore - role exists on user
  if (!allowedRoles.includes(session.user.role)) {
    throw new Error('Forbidden')
  }

  return session
}
