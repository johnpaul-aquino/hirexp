'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminSettings } from '@/components/admin/admin-settings'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated') {
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
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            System Settings
          </h1>
          <p className="text-muted-foreground text-lg">
            Configure system-wide settings and preferences
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admin Configuration</CardTitle>
            <CardDescription>
              Manage platform settings, integrations, and role-based page permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminSettings />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
