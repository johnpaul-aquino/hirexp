'use client'

import { useState } from 'react'
import { useAuth } from './use-auth'
import { Profile } from '@/lib/stores/auth-store'

export interface UpdateProfileData {
  name?: string
  bio?: string
  phone?: string
  location?: string
  avatar?: string
  dateOfBirth?: Date | null
  gender?: string
  languages?: string[]
  skills?: string[]
  experience?: string
  education?: string
  linkedIn?: string
  github?: string
  website?: string
}

export function useProfile() {
  const { profile, updateProfile: storeUpdateProfile, refreshSession } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const updateProfile = async (data: UpdateProfileData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await storeUpdateProfile(data as Partial<Profile>)
      await refreshSession()
      setSuccess(true)
      setIsLoading(false)
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Profile update failed'
      setError(message)
      setIsLoading(false)
      return { success: false, error: message }
    }
  }

  const uploadAvatar = async (file: File) => {
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/auth/avatar', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Avatar upload failed')
      }

      // Update profile with new avatar URL
      await updateProfile({ avatar: result.avatarUrl })

      setIsLoading(false)
      return { success: true, avatarUrl: result.avatarUrl }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Avatar upload failed'
      setError(message)
      setIsLoading(false)
      return { success: false, error: message }
    }
  }

  const clearError = () => setError(null)
  const clearSuccess = () => setSuccess(false)

  return {
    profile,
    updateProfile,
    uploadAvatar,
    isLoading,
    error,
    success,
    clearError,
    clearSuccess,
  }
}
