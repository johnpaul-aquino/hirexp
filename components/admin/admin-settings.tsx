'use client'

import { useState } from 'react'
import { Database, Mail, Bell, Globe, Shield, Lock, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Role = 'TRAINEE' | 'INSTRUCTOR' | 'COMPANY' | 'ADMIN'

interface PagePermission {
  page: string
  path: string
  roles: Role[]
}

export function AdminSettings() {
  const [pagePermissions, setPagePermissions] = useState<PagePermission[]>([
    { page: 'Dashboard', path: '/dashboard', roles: ['TRAINEE', 'INSTRUCTOR', 'COMPANY', 'ADMIN'] },
    { page: 'Trainee Dashboard', path: '/dashboard/trainee', roles: ['TRAINEE', 'ADMIN'] },
    { page: 'Company Dashboard', path: '/dashboard/company', roles: ['COMPANY', 'ADMIN'] },
    { page: 'Admin Dashboard', path: '/dashboard/admin', roles: ['ADMIN'] },
    { page: 'English Assessments', path: '/dashboard/trainee/assessments', roles: ['TRAINEE', 'INSTRUCTOR', 'ADMIN'] },
    { page: 'AI Chat', path: '/dashboard/trainee/chat', roles: ['TRAINEE', 'INSTRUCTOR', 'ADMIN'] },
    { page: 'AI Interview', path: '/dashboard/trainee/interview', roles: ['TRAINEE', 'INSTRUCTOR', 'ADMIN'] },
    { page: 'Typing Test', path: '/dashboard/trainee/typing', roles: ['TRAINEE', 'INSTRUCTOR', 'ADMIN'] },
    { page: 'Mock Call', path: '/dashboard/trainee/mock-call', roles: ['TRAINEE', 'INSTRUCTOR', 'ADMIN'] },
    { page: 'Candidate Pool', path: '/dashboard/company/candidates', roles: ['COMPANY', 'ADMIN'] },
    { page: 'Analytics', path: '/dashboard/company/analytics', roles: ['COMPANY', 'ADMIN'] },
  ])

  const roles: Role[] = ['TRAINEE', 'INSTRUCTOR', 'COMPANY', 'ADMIN']

  const togglePermission = (pageIndex: number, role: Role) => {
    setPagePermissions(prev => {
      const updated = [...prev]
      const currentRoles = updated[pageIndex].roles

      if (currentRoles.includes(role)) {
        updated[pageIndex].roles = currentRoles.filter(r => r !== role)
      } else {
        updated[pageIndex].roles = [...currentRoles, role]
      }

      return updated
    })
  }

  return (
    <div className="space-y-6">
      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Settings
          </CardTitle>
          <CardDescription>
            Configure core system settings and behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="app-name">Application Name</Label>
            <Input id="app-name" defaultValue="HireXp" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-email">Support Email</Label>
            <Input id="support-email" type="email" defaultValue="support@hirexp.com" />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Disable public access for maintenance
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Settings
          </CardTitle>
          <CardDescription>
            Configure email service and templates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="smtp-host">SMTP Host</Label>
            <Input id="smtp-host" placeholder="smtp.example.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-port">SMTP Port</Label>
              <Input id="smtp-port" type="number" defaultValue="587" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-from">From Email</Label>
              <Input id="smtp-from" type="email" defaultValue="noreply@hirexp.com" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Configure system notifications and alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send email notifications to users
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Admin Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Receive alerts for important system events
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Configure security and access control
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
            <Input id="session-timeout" type="number" defaultValue="30" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
            <Input id="max-login-attempts" type="number" defaultValue="5" />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Email Verification</Label>
              <p className="text-sm text-muted-foreground">
                Users must verify email before accessing system
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Role-Based Page Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Role-Based Page Permissions
          </CardTitle>
          <CardDescription>
            Configure which roles can access specific pages in the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Page</TableHead>
                  <TableHead className="w-[200px]">Path</TableHead>
                  <TableHead className="text-center">Trainee</TableHead>
                  <TableHead className="text-center">Instructor</TableHead>
                  <TableHead className="text-center">Company</TableHead>
                  <TableHead className="text-center">Admin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagePermissions.map((permission, index) => (
                  <TableRow key={permission.path}>
                    <TableCell className="font-medium">{permission.page}</TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">
                      {permission.path}
                    </TableCell>
                    {roles.map(role => (
                      <TableCell key={role} className="text-center">
                        <div className="flex justify-center">
                          <Checkbox
                            checked={permission.roles.includes(role)}
                            onCheckedChange={() => togglePermission(index, role)}
                            disabled={role === 'ADMIN' && permission.path === '/dashboard/admin'}
                          />
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <p>
              Check the boxes to grant access to specific pages for each role.
              Admin role always has full access to all pages.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="lg">Save All Settings</Button>
      </div>
    </div>
  )
}
