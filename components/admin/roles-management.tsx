'use client'

import { Shield, Users, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const roles = [
  {
    name: 'ADMIN',
    description: 'Full system access with all permissions',
    userCount: 2,
    permissions: ['All Permissions'],
    color: 'destructive' as const,
  },
  {
    name: 'COMPANY',
    description: 'Access to candidate pool and hiring features',
    userCount: 15,
    permissions: ['View Candidates', 'Hire Candidates', 'View Analytics'],
    color: 'default' as const,
  },
  {
    name: 'INSTRUCTOR',
    description: 'Create and manage training content',
    userCount: 8,
    permissions: ['Create Content', 'View Trainees', 'Grade Assessments'],
    color: 'secondary' as const,
  },
  {
    name: 'TRAINEE',
    description: 'Access to training modules and personal dashboard',
    userCount: 450,
    permissions: ['View Training', 'Take Assessments', 'Track Progress'],
    color: 'outline' as const,
  },
]

export function RolesManagement() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {roles.map((role) => (
        <Card key={role.name}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {role.name}
              </CardTitle>
              <Badge variant={role.color}>{role.name}</Badge>
            </div>
            <CardDescription>{role.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{role.userCount} users</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Permissions:</p>
              <div className="space-y-1">
                {role.permissions.map((permission) => (
                  <div key={permission} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span>{permission}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
