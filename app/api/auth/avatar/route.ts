import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// POST /api/auth/avatar - Upload avatar
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'hirexp/avatars',
            public_id: `user_${session.user.id}`,
            overwrite: true,
            transformation: [
              { width: 400, height: 400, crop: 'fill', gravity: 'face' },
              { quality: 'auto', fetch_format: 'auto' },
            ],
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
        .end(buffer)
    })

    const avatarUrl = uploadResult.secure_url

    // Update profile with new avatar
    await prisma.profile.update({
      where: { userId: session.user.id },
      data: { avatar: avatarUrl },
    })

    // Log avatar change
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'AVATAR_CHANGED',
        details: { avatarUrl },
      },
    })

    return NextResponse.json(
      {
        message: 'Avatar uploaded successfully',
        avatarUrl,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to upload avatar' },
      { status: 500 }
    )
  }
}

// DELETE /api/auth/avatar - Remove avatar
export async function DELETE() {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current profile to get avatar URL
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })

    if (profile?.avatar) {
      // Extract public_id from Cloudinary URL
      const publicId = profile.avatar.split('/').slice(-2).join('/').split('.')[0]

      // Delete from Cloudinary
      await cloudinary.uploader.destroy(publicId)
    }

    // Remove avatar from profile
    await prisma.profile.update({
      where: { userId: session.user.id },
      data: { avatar: null },
    })

    // Log avatar removal
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'AVATAR_CHANGED',
        details: { removed: true },
      },
    })

    return NextResponse.json(
      { message: 'Avatar removed successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Avatar removal error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to remove avatar' },
      { status: 500 }
    )
  }
}
