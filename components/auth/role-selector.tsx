'use client'

import { UserRole } from '@/lib/stores/auth-store'
import { cn } from '@/lib/utils'
import { GraduationCap, Building2 } from 'lucide-react'

interface RoleSelectorProps {
  value: UserRole
  onChange: (role: UserRole) => void
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  const roles = [
    {
      value: 'TRAINEE' as UserRole,
      label: 'Job Seeker / Trainee',
      description: 'Looking for English training and job opportunities',
      icon: GraduationCap,
    },
    {
      value: 'COMPANY' as UserRole,
      label: 'Company',
      description: 'Looking to hire trained candidates',
      icon: Building2,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {roles.map((role) => {
        const Icon = role.icon
        const isSelected = value === role.value

        return (
          <button
            key={role.value}
            type="button"
            onClick={() => onChange(role.value)}
            className={cn(
              'relative flex flex-col items-start gap-3 rounded-lg border-2 p-4 text-left transition-all hover:border-primary/50',
              isSelected
                ? 'border-primary bg-primary/5'
                : 'border-border bg-background'
            )}
          >
            {/* Selection indicator */}
            <div
              className={cn(
                'absolute right-3 top-3 h-4 w-4 rounded-full border-2 transition-all',
                isSelected
                  ? 'border-primary bg-primary'
                  : 'border-muted-foreground/30'
              )}
            >
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              )}
            </div>

            {/* Icon */}
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-md transition-colors',
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
            </div>

            {/* Content */}
            <div className="space-y-1">
              <p
                className={cn(
                  'font-semibold',
                  isSelected ? 'text-primary' : 'text-foreground'
                )}
              >
                {role.label}
              </p>
              <p className="text-sm text-muted-foreground">{role.description}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
