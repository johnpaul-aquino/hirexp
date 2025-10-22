'use client'

import { useState, forwardRef } from 'react'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrength?: boolean
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showStrength = false, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [strength, setStrength] = useState(0)

    const calculateStrength = (password: string) => {
      let score = 0
      if (!password) return 0

      // Length check
      if (password.length >= 8) score++
      if (password.length >= 12) score++

      // Character variety checks
      if (/[a-z]/.test(password)) score++
      if (/[A-Z]/.test(password)) score++
      if (/\d/.test(password)) score++
      if (/[@$!%*?&]/.test(password)) score++

      return Math.min(score, 4)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (showStrength) {
        setStrength(calculateStrength(value))
      }
      props.onChange?.(e)
    }

    const getStrengthLabel = () => {
      switch (strength) {
        case 0:
        case 1:
          return 'Weak'
        case 2:
          return 'Fair'
        case 3:
          return 'Good'
        case 4:
          return 'Strong'
        default:
          return ''
      }
    }

    const getStrengthColor = () => {
      switch (strength) {
        case 0:
        case 1:
          return 'bg-red-500'
        case 2:
          return 'bg-yellow-500'
        case 3:
          return 'bg-blue-500'
        case 4:
          return 'bg-green-500'
        default:
          return 'bg-gray-300'
      }
    }

    return (
      <div className="space-y-2">
        <div className="relative">
          <Input
            {...props}
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={cn('pr-10', className)}
            onChange={handleChange}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>

        {showStrength && props.value && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-colors',
                    level <= strength ? getStrengthColor() : 'bg-gray-200 dark:bg-gray-700'
                  )}
                />
              ))}
            </div>
            {strength > 0 && (
              <p className="text-xs text-muted-foreground">
                Password strength: <span className="font-medium">{getStrengthLabel()}</span>
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'
