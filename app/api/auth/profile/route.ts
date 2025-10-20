import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { profileUpdateSchema } from '@/lib/validations/auth'
import { z } from 'zod'

// GET /api/auth/profile - Get current user's profile
export async function GET() {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
            emailVerified: true,
            lastLoginAt: true,
            createdAt: true,
          },
        },
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ profile }, { status: 200 })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PATCH /api/auth/profile - Update current user's profile
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Validate request body
    const validatedData = profileUpdateSchema.parse(body)

    // Update profile
    const updatedProfile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
    })

    // Log profile update
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'PROFILE_UPDATED',
        details: {
          fields: Object.keys(validatedData),
        },
      },
    })

    return NextResponse.json(
      {
        message: 'Profile updated successfully',
        profile: updatedProfile,
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', message: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
