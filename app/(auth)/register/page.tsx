'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { AuthFormCard } from '@/components/auth/auth-form-card'
import { OAuthButton } from '@/components/auth/oauth-button'
import { PasswordInput } from '@/components/auth/password-input'
import { RoleSelector } from '@/components/auth/role-selector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useRegister, type RegisterFormData } from '@/hooks/use-register'
import { useLogin } from '@/hooks/use-login'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { UserRole } from '@/lib/stores/auth-store'

export default function RegisterPage() {
  const { register: registerUser, isLoading, error, success, clearError } = useRegister()
  const { loginWithGoogle, isLoading: oAuthLoading } = useLogin()
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      role: 'TRAINEE' as UserRole,
    },
  })

  const selectedRole = watch('role')
  const password = watch('password')

  // Clear error when unmounting
  useEffect(() => {
    return () => clearError()
  }, [clearError])

  const onSubmit = async (data: RegisterInput) => {
    if (!agreedToTerms) {
      return
    }

    await registerUser(data as RegisterFormData)
  }

  return (
    <AuthFormCard
      title="Create your account"
      description="Start your journey with HireXp"
      footer={
        <div className="text-center text-sm">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="font-semibold text-primary hover:underline"
          >
            Sign in
          </Link>
        </div>
      }
    >
      {/* Success message */}
      {success && (
        <Alert className="mb-4 border-green-500/50 bg-green-50 dark:bg-green-950/20">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700 dark:text-green-400">
            Account created successfully! Redirecting to login...
          </AlertDescription>
        </Alert>
      )}

      {/* Error message */}
      {error && (
        <Alert className="mb-4 border-destructive/50" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Registration form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role selection */}
        <div className="space-y-2">
          <Label>I am a...</Label>
          <RoleSelector
            value={selectedRole}
            onChange={(role) => setValue('role', role)}
          />
          {errors.role && (
            <p className="text-sm text-destructive">{errors.role.message}</p>
          )}
        </div>

        {/* Full name */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            {...register('name')}
            disabled={isLoading}
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Email field */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            {...register('email')}
            disabled={isLoading}
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            placeholder="Create a strong password"
            {...register('password')}
            disabled={isLoading}
            showStrength
            className={errors.password ? 'border-destructive' : ''}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <PasswordInput
            id="confirmPassword"
            placeholder="Confirm your password"
            {...register('confirmPassword')}
            disabled={isLoading}
            className={errors.confirmPassword ? 'border-destructive' : ''}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms and conditions */}
        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
          />
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I agree to the{' '}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </label>
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !agreedToTerms}
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-4">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 px-2 text-xs text-muted-foreground">
          OR
        </span>
      </div>

      {/* OAuth */}
      <OAuthButton
        provider="google"
        onClick={loginWithGoogle}
        isLoading={oAuthLoading}
      />

      {/* Info message */}
      <p className="text-xs text-muted-foreground text-center mt-4">
        By signing up, you&apos;ll receive a verification email. Please verify your email address to complete registration.
      </p>
    </AuthFormCard>
  )
}
