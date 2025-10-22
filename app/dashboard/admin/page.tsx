'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Users, Shield, Lock, Settings, Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileAvatar } from '@/components/dashboard/profile-avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { UsersManagement } from '@/components/admin/users-management'
import { RolesManagement } from '@/components/admin/roles-management'
import { PermissionsManagement } from '@/components/admin/permissions-management'
import { AdminSettings } from '@/components/admin/admin-settings'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated') {
      // Check if user is admin
      if (session?.user?.role !== 'ADMIN') {
        router.push('/dashboard')
      } else {
        setIsLoading(false)
      }
    }
  }, [status, session, router])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage users, roles, permissions, and system settings
            </p>
          </div>
          <ProfileAvatar />
        </div>

        {/* Admin Info Alert */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You have administrative access. Changes made here will affect all users and system behavior.
          </AlertDescription>
        </Alert>

        {/* Main Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">
              <Users className="mr-2 h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="roles">
              <Shield className="mr-2 h-4 w-4" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="permissions">
              <Lock className="mr-2 h-4 w-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Users Management</CardTitle>
                <CardDescription>
                  View, create, edit, and delete user accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UsersManagement />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <CardTitle>Roles Management</CardTitle>
                <CardDescription>
                  Manage user roles and their permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RolesManagement />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle>Page Permissions</CardTitle>
                <CardDescription>
                  Configure which roles can access specific pages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PermissionsManagement />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure system-wide settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminSettings />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
