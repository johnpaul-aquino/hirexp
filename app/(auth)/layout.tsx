import { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background to-muted">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
        {/* Logo/Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary via-blue-500 to-purple-600 bg-clip-text text-transparent">
            HireXp
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            AI-Powered English Training Platform
          </p>
        </div>

        {/* Auth card container */}
        <div className="w-full max-w-md">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 HireXp. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
