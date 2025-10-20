'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserRole } from '@/lib/stores/auth-store'

export interface RegisterFormData {
  email: string
  password: string
  confirmPassword?: string
  name: string
  role: UserRole
}

export function useRegister() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const register = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate passwords match
      if (data.confirmPassword && data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
          role: data.role,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed')
      }

      setSuccess(true)
      setIsLoading(false)

      // Redirect to login with success message
      setTimeout(() => {
        router.push('/auth/login?registered=true')
      }, 2000)

      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      setError(message)
      setIsLoading(false)
      return { success: false, error: message }
    }
  }

  const clearError = () => setError(null)

  return {
    register,
    isLoading,
    error,
    success,
    clearError,
  }
}
