'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Upload, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AvatarUploadProps {
  currentAvatar?: string | null
  onUpload: (file: File) => Promise<{ success: boolean; avatarUrl?: string; error?: string }>
  onRemove?: () => Promise<void>
  userName?: string
}

export function AvatarUpload({ currentAvatar, onUpload, onRemove, userName }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setError(null)

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    setIsUploading(true)
    try {
      const result = await onUpload(file)
      if (!result.success) {
        setError(result.error || 'Upload failed')
        setPreview(currentAvatar || null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setPreview(currentAvatar || null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = async () => {
    if (!onRemove) return

    setIsUploading(true)
    try {
      await onRemove()
      setPreview(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove avatar')
    } finally {
      setIsUploading(false)
    }
  }

  const getInitials = () => {
    if (!userName) return 'U'
    return userName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar preview */}
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={preview || undefined} alt={userName || 'User'} />
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
            {getInitials()}
          </AvatarFallback>
        </Avatar>

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Upload buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {preview ? 'Change' : 'Upload'} Photo
        </Button>

        {preview && onRemove && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
            disabled={isUploading}
          >
            <X className="mr-2 h-4 w-4" />
            Remove
          </Button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      {/* Instructions */}
      <p className="text-xs text-muted-foreground text-center">
        JPG, PNG or WebP. Max 5MB.
      </p>
    </div>
  )
}
