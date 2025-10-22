import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth/auth.config'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

// GET /api/navigation - Get navigation items for the current user's role
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)

    // Check authentication
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userRole = session.user.role as UserRole

    // Fetch enabled navigation items for the user's role
    const navigationItems = await prisma.navigationSetting.findMany({
      where: {
        userRole,
        isEnabled: true, // Only return enabled items
      },
      orderBy: {
        displayOrder: 'asc',
      },
      select: {
        navigationKey: true,
        label: true,
        href: true,
        displayOrder: true,
      },
    })

    return NextResponse.json({
      role: userRole,
      navigationItems,
    })
  } catch (error) {
    console.error('Error fetching navigation items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch navigation items' },
      { status: 500 }
    )
  }
}
