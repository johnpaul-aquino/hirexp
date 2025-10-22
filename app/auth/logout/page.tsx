'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, LogOut, AlertCircle } from 'lucide-react'

export default function LogoutPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSignOut = async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      await signOut({
        redirect: false,
      })

      // Redirect to home page after successful sign out
      router.push('/')
      router.refresh()
    } catch (error) {
      setErrorMessage('Failed to sign out. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <LogOut className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Sign Out</CardTitle>
          <CardDescription className="text-center">
            Are you sure you want to sign out of your account?
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Error Message */}
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {/* Sign Out Button */}
            <Button
              onClick={handleSignOut}
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Yes, sign me out
                </>
              )}
            </Button>

            {/* Cancel Button */}
            <Button
              variant="outline"
              className="w-full"
              disabled={isLoading}
              asChild
            >
              <Link href="/dashboard">
                Cancel
              </Link>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            You can always sign back in anytime
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
