'use client'

import { useState, useRef } from 'react'
import { Upload, Loader2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface AvatarUploadProps {
  currentAvatar?: string | null
  onAvatarChange: (url: string) => void
  userName?: string | null
}

export function AvatarUpload({
  currentAvatar,
  onAvatarChange,
  userName,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState(currentAvatar || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setError('')
    setIsUploading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to Cloudinary
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await response.json()
      onAvatarChange(data.url)
    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Failed to upload avatar')
      setPreviewUrl(currentAvatar || '')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-32 w-32">
        <AvatarImage src={previewUrl || undefined} alt={userName || 'User avatar'} />
        <AvatarFallback className="text-4xl">
          {userName ? userName.charAt(0).toUpperCase() : <User className="h-16 w-16" />}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          variant="outline"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Avatar
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground">
          Max file size: 5MB. Recommended: Square image, at least 400x400px
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="w-full max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
