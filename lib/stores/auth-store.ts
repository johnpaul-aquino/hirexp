import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type UserRole = 'TRAINEE' | 'INSTRUCTOR' | 'COMPANY' | 'ADMIN'
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED' | 'PENDING_VERIFICATION'

export interface User {
  id: string
  email: string
  emailVerified: Date | null
  role: UserRole
  status: AccountStatus
  lastLoginAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Profile {
  id: string
  userId: string
  name: string | null
  avatar: string | null
  bio: string | null
  phone: string | null
  dateOfBirth: Date | null
  gender: string | null
  location: string | null
  timezone: string
  languages: string[]
  skills: string[]
  experience: string | null
  education: string | null
  linkedIn: string | null
  github: string | null
  website: string | null
  preferences: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface Session {
  user: User
  profile: Profile | null
  expires: string
}

interface AuthState {
  // State
  session: Session | null
  isLoading: boolean
  error: string | null

  // Actions
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  login: (email: string, password: string) => Promise<void>
  loginWithOAuth: (provider: 'google') => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Partial<Profile>) => Promise<void>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  verifyEmail: (token: string) => Promise<void>
  refreshSession: () => Promise<void>
  clearSession: () => void
}

export interface RegisterData {
  email: string
  password: string
  name: string
  role: UserRole
}

export interface LoginResponse {
  session: Session
  message?: string
}

export interface ErrorResponse {
  error: string
  message: string
}

// Create the auth store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      session: null,
      isLoading: false,
      error: null,

      // Setters
      setSession: (session) => set({ session, error: null }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      clearSession: () => set({ session: null, error: null }),

      // Login with email/password
      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/auth/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })

          if (!response.ok) {
            const error: ErrorResponse = await response.json()
            throw new Error(error.message || 'Login failed')
          }

          const data: LoginResponse = await response.json()
          set({ session: data.session, isLoading: false })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      // Login with OAuth (Google)
      loginWithOAuth: async (provider) => {
        set({ isLoading: true, error: null })
        try {
          // Redirect to OAuth provider
          window.location.href = `/api/auth/signin/${provider}`
        } catch (error) {
          const message = error instanceof Error ? error.message : 'OAuth login failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      // Register new user
      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })

          if (!response.ok) {
            const error: ErrorResponse = await response.json()
            throw new Error(error.message || 'Registration failed')
          }

          const result = await response.json()
          set({ isLoading: false })

          // Optionally auto-login after registration
          // await get().login(data.email, data.password)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Registration failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      // Logout
      logout: async () => {
        set({ isLoading: true, error: null })
        try {
          await fetch('/api/auth/signout', {
            method: 'POST',
          })

          set({ session: null, isLoading: false })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Logout failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      // Update profile
      updateProfile: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/auth/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })

          if (!response.ok) {
            const error: ErrorResponse = await response.json()
            throw new Error(error.message || 'Profile update failed')
          }

          const { profile } = await response.json()

          // Update session with new profile
          const currentSession = get().session
          if (currentSession) {
            set({
              session: { ...currentSession, profile },
              isLoading: false,
            })
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Profile update failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      // Update password
      updatePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/auth/password', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword }),
          })

          if (!response.ok) {
            const error: ErrorResponse = await response.json()
            throw new Error(error.message || 'Password update failed')
          }

          set({ isLoading: false })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Password update failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      // Request password reset
      requestPasswordReset: async (email) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          })

          if (!response.ok) {
            const error: ErrorResponse = await response.json()
            throw new Error(error.message || 'Password reset request failed')
          }

          set({ isLoading: false })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Password reset request failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      // Reset password with token
      resetPassword: async (token, newPassword) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword }),
          })

          if (!response.ok) {
            const error: ErrorResponse = await response.json()
            throw new Error(error.message || 'Password reset failed')
          }

          set({ isLoading: false })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Password reset failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      // Verify email
      verifyEmail: async (token) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/auth/verify-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          })

          if (!response.ok) {
            const error: ErrorResponse = await response.json()
            throw new Error(error.message || 'Email verification failed')
          }

          // Update session to reflect verified email
          await get().refreshSession()
          set({ isLoading: false })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Email verification failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      // Refresh session from server
      refreshSession: async () => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/auth/session')

          if (!response.ok) {
            set({ session: null, isLoading: false })
            return
          }

          const session: Session = await response.json()
          set({ session, isLoading: false })
        } catch (error) {
          set({ session: null, isLoading: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ session: state.session }),
    }
  )
)

// Selectors for easy access to specific parts of state
export const useUser = () => useAuthStore((state) => state.session?.user ?? null)
export const useProfile = () => useAuthStore((state) => state.session?.profile ?? null)
export const useIsAuthenticated = () => useAuthStore((state) => !!state.session)
export const useIsLoading = () => useAuthStore((state) => state.isLoading)
export const useAuthError = () => useAuthStore((state) => state.error)
