'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useAuth } from './use-auth'

interface LoginFormData {
  email: string
  password: string
}

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshSession } = useAuth()

  const login = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
        return { success: false, error: result.error }
      }

      // Refresh session in Zustand store
      await refreshSession()

      // Redirect to callback URL or dashboard
      const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard'
      router.push(callbackUrl)

      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      setIsLoading(false)
      return { success: false, error: message }
    }
  }

  const loginWithGoogle = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard'
      await signIn('google', { callbackUrl })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google login failed'
      setError(message)
      setIsLoading(false)
    }
  }

  const clearError = () => setError(null)

  return {
    login,
    loginWithGoogle,
    isLoading,
    error,
    clearError,
  }
}
