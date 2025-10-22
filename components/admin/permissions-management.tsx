'use client'

import { Lock, Check, X } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const pagePermissions = [
  {
    page: '/dashboard',
    description: 'Main dashboard selector',
    roles: { ADMIN: true, COMPANY: true, INSTRUCTOR: true, TRAINEE: true },
  },
  {
    page: '/dashboard/trainee',
    description: 'Trainee progress dashboard',
    roles: { ADMIN: true, COMPANY: false, INSTRUCTOR: true, TRAINEE: true },
  },
  {
    page: '/dashboard/company',
    description: 'Company hiring dashboard',
    roles: { ADMIN: true, COMPANY: true, INSTRUCTOR: false, TRAINEE: false },
  },
  {
    page: '/dashboard/admin',
    description: 'Admin control panel',
    roles: { ADMIN: true, COMPANY: false, INSTRUCTOR: false, TRAINEE: false },
  },
  {
    page: '/profile',
    description: 'User profile settings',
    roles: { ADMIN: true, COMPANY: true, INSTRUCTOR: true, TRAINEE: true },
  },
]

export function PermissionsManagement() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center">Admin</TableHead>
              <TableHead className="text-center">Company</TableHead>
              <TableHead className="text-center">Instructor</TableHead>
              <TableHead className="text-center">Trainee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagePermissions.map((permission) => (
              <TableRow key={permission.page}>
                <TableCell className="font-mono text-sm">
                  {permission.page}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {permission.description}
                </TableCell>
                <TableCell className="text-center">
                  {permission.roles.ADMIN ? (
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground mx-auto" />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {permission.roles.COMPANY ? (
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground mx-auto" />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {permission.roles.INSTRUCTOR ? (
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground mx-auto" />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {permission.roles.TRAINEE ? (
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground mx-auto" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-start gap-2 p-4 bg-muted rounded-lg">
        <Lock className="h-4 w-4 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium">Permission Model</p>
          <p className="text-muted-foreground">
            Page permissions are role-based. Users can only access pages that their role has permission for.
            Admin role has full access to all pages.
          </p>
        </div>
      </div>
    </div>
  )
}
