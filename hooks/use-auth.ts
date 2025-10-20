'use client'

import { useAuthStore, useUser, useProfile, useIsAuthenticated, useIsLoading, useAuthError } from '@/lib/stores/auth-store'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

/**
 * Main authentication hook
 * Provides access to auth state and actions from Zustand store
 * Also syncs with NextAuth session
 */
export function useAuth() {
  const store = useAuthStore()
  const { data: nextAuthSession, status } = useSession()

  // Sync NextAuth session with Zustand store
  useEffect(() => {
    if (status === 'authenticated' && nextAuthSession) {
      // Convert NextAuth session to our session format
      const session = {
        user: {
          id: nextAuthSession.user.id,
          email: nextAuthSession.user.email!,
          emailVerified: null,
          role: nextAuthSession.user.role,
          status: 'ACTIVE' as const,
          lastLoginAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        profile: nextAuthSession.user.name
          ? {
              id: '',
              userId: nextAuthSession.user.id,
              name: nextAuthSession.user.name,
              avatar: nextAuthSession.user.image,
              bio: null,
              phone: null,
              dateOfBirth: null,
              gender: null,
              location: null,
              timezone: 'UTC',
              languages: [],
              skills: [],
              experience: null,
              education: null,
              linkedIn: null,
              github: null,
              website: null,
              preferences: {},
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          : null,
        expires: nextAuthSession.expires,
      }

      store.setSession(session)
    } else if (status === 'unauthenticated') {
      store.clearSession()
    }
  }, [nextAuthSession, status, store])

  return {
    // State
    session: store.session,
    user: store.session?.user ?? null,
    profile: store.session?.profile ?? null,
    isAuthenticated: !!store.session,
    isLoading: store.isLoading || status === 'loading',
    error: store.error,

    // Actions
    login: store.login,
    loginWithOAuth: store.loginWithOAuth,
    register: store.register,
    logout: store.logout,
    updateProfile: store.updateProfile,
    updatePassword: store.updatePassword,
    requestPasswordReset: store.requestPasswordReset,
    resetPassword: store.resetPassword,
    verifyEmail: store.verifyEmail,
    refreshSession: store.refreshSession,
    clearError: store.clearError,
  }
}

// Export individual selectors for optimization
export { useUser, useProfile, useIsAuthenticated, useIsLoading, useAuthError }
