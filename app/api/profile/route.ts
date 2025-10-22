import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth/auth.config'
import { prisma } from '@/lib/prisma'
import { profileSchema } from '@/lib/validations/profile'
import { z } from 'zod'

// GET /api/profile - Get current user's profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const profile = await prisma.profile.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// POST /api/profile - Update current user's profile
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate request body
    const validatedData = profileSchema.parse(body)

    // Update or create profile
    const profile = await prisma.profile.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        name: validatedData.name || null,
        bio: validatedData.bio || null,
        phone: validatedData.phone || null,
        dateOfBirth: validatedData.dateOfBirth || null,
        gender: validatedData.gender || null,
        location: validatedData.location || null,
        timezone: validatedData.timezone || 'UTC',
        skills: validatedData.skills || [],
        languages: validatedData.languages || [],
        experience: validatedData.experience || null,
        education: validatedData.education || null,
        linkedIn: validatedData.linkedIn || null,
        website: validatedData.website || null,
        avatar: validatedData.avatar || null,
      },
      create: {
        userId: session.user.id,
        name: validatedData.name || null,
        bio: validatedData.bio || null,
        phone: validatedData.phone || null,
        dateOfBirth: validatedData.dateOfBirth || null,
        gender: validatedData.gender || null,
        location: validatedData.location || null,
        timezone: validatedData.timezone || 'UTC',
        skills: validatedData.skills || [],
        languages: validatedData.languages || [],
        experience: validatedData.experience || null,
        education: validatedData.education || null,
        linkedIn: validatedData.linkedIn || null,
        website: validatedData.website || null,
        avatar: validatedData.avatar || null,
      },
    })

    // Also update User.name and User.image if they're provided
    if (validatedData.name || validatedData.avatar) {
      await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          ...(validatedData.name && { name: validatedData.name }),
          ...(validatedData.avatar && { image: validatedData.avatar }),
        },
      })
    }

    return NextResponse.json(profile)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
