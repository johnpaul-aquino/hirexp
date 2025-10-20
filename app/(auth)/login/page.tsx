'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { AuthFormCard } from '@/components/auth/auth-form-card'
import { OAuthButton } from '@/components/auth/oauth-button'
import { PasswordInput } from '@/components/auth/password-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useLogin } from '@/hooks/use-login'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams?.get('registered') === 'true'
  const callbackUrl = searchParams?.get('callbackUrl')

  const { login, loginWithGoogle, isLoading, error, clearError } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Clear error when unmounting
  useEffect(() => {
    return () => clearError()
  }, [clearError])

  const onSubmit = async (data: LoginInput) => {
    const result = await login(data)
    // Navigation is handled in useLogin hook
  }

  return (
    <AuthFormCard
      title="Welcome back"
      description="Sign in to your account to continue"
      footer={
        <div className="text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/register"
            className="font-semibold text-primary hover:underline"
          >
            Sign up
          </Link>
        </div>
      }
    >
      {/* Success message after registration */}
      {registered && (
        <Alert className="mb-4 border-green-500/50 bg-green-50 dark:bg-green-950/20">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700 dark:text-green-400">
            Registration successful! Please check your email to verify your account, then log in.
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

      {/* Login form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            placeholder="Enter your password"
            {...register('password')}
            disabled={isLoading}
            className={errors.password ? 'border-destructive' : ''}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        {/* Remember me */}
        <div className="flex items-center space-x-2">
          <Checkbox id="remember" />
          <label
            htmlFor="remember"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Remember me
          </label>
        </div>

        {/* Submit button */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
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
        isLoading={isLoading}
      />
    </AuthFormCard>
  )
}
