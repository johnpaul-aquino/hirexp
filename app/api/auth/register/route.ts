import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validations/auth'
import { z } from 'zod'
import { UserRole } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate request body
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists', message: 'A user with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
        status: 'PENDING_VERIFICATION',
        profile: {
          create: {
            name: validatedData.name,
          },
        },
      },
      include: {
        profile: true,
      },
    })

    // Generate verification token
    const verificationToken = await prisma.verificationToken.create({
      data: {
        userId: user.id,
        email: user.email,
        token: crypto.randomUUID(),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    })

    // TODO: Send verification email
    // await sendVerificationEmail(user.email, verificationToken.token)

    // Log registration
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'SIGN_UP',
        details: {
          role: user.role,
          method: 'credentials',
        },
      },
    })

    return NextResponse.json(
      {
        message: 'Registration successful! Please check your email to verify your account.',
        user: {
          id: user.id,
          email: user.email,
          name: user.profile?.name,
          role: user.role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', message: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
