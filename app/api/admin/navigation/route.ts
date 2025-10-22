import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth/auth.config'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

// GET /api/admin/navigation - Get navigation items for a specific role
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

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    // Get role from query params (default to TRAINEE)
    const { searchParams } = new URL(request.url)
    const role = (searchParams.get('role') || 'TRAINEE') as UserRole

    // Fetch navigation items for the specified role
    const navigationItems = await prisma.navigationSetting.findMany({
      where: {
        userRole: role,
      },
      orderBy: {
        displayOrder: 'asc',
      },
    })

    return NextResponse.json({
      role,
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

// PATCH /api/admin/navigation - Update navigation item visibility
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)

    // Check authentication
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { role, navigationKey, isEnabled } = body

    // Validate required fields
    if (!role || !navigationKey || typeof isEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Role, navigationKey, and isEnabled are required' },
        { status: 400 }
      )
    }

    // Update navigation setting
    const updatedNav = await prisma.navigationSetting.update({
      where: {
        userRole_navigationKey: {
          userRole: role as UserRole,
          navigationKey,
        },
      },
      data: {
        isEnabled,
      },
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'SETTINGS_CHANGED',
        details: {
          type: 'navigation_visibility',
          role,
          navigationKey,
          isEnabled,
        },
      },
    })

    return NextResponse.json({
      success: true,
      navigationItem: updatedNav,
    })
  } catch (error) {
    console.error('Error updating navigation item:', error)
    return NextResponse.json(
      { error: 'Failed to update navigation item' },
      { status: 500 }
    )
  }
}
