# Authentication Technical Specification

## Architecture Overview

The authentication system is built on NextAuth.js (Auth.js) v5, providing a secure, scalable, and extensible authentication solution with support for multiple providers and role-based access control.

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Browser/Mobile]
        Cookies[Secure Cookies]
    end

    subgraph "Application Layer"
        NextApp[Next.js App]
        Middleware[Auth Middleware]
        API[API Routes]
    end

    subgraph "Authentication Layer"
        NextAuth[NextAuth.js]
        Providers[Auth Providers]
        JWT[JWT Handler]
        Session[Session Manager]
    end

    subgraph "Data Layer"
        Prisma[Prisma ORM]
        PostgreSQL[(PostgreSQL)]
        Redis[(Redis Cache)]
    end

    subgraph "External Services"
        Google[Google OAuth]
        Email[Email Service]
    end

    Browser --> NextApp
    Browser --> Cookies
    NextApp --> Middleware
    Middleware --> NextAuth
    NextAuth --> Providers
    NextAuth --> JWT
    NextAuth --> Session
    Providers --> Google
    NextAuth --> Prisma
    Prisma --> PostgreSQL
    Session --> Redis
    NextAuth --> Email
    API --> Middleware

    style NextAuth fill:#f9f,stroke:#333,stroke-width:2px
    style PostgreSQL fill:#336699,color:#fff
    style Redis fill:#dc382d,color:#fff
```

## Technology Stack

### Core Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "next-auth": "^5.0.0",
    "@auth/prisma-adapter": "^2.0.0",
    "@prisma/client": "^5.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "nodemailer": "^6.9.0",
    "zod": "^3.22.0",
    "@upstash/redis": "^1.28.0",
    "@upstash/ratelimit": "^1.0.0"
  },
  "devDependencies": {
    "prisma": "^5.0.0",
    "@types/bcryptjs": "^2.4.0",
    "@types/jsonwebtoken": "^9.0.0",
    "@types/nodemailer": "^6.4.0"
  }
}
```

## NextAuth.js Configuration

### Main Configuration File

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { UserRole } from "@prisma/client"

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Google OAuth Provider
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),

    // Credentials Provider
    Credentials({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "john@example.com"
        },
        password: {
          label: "Password",
          type: "password"
        }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email.toLowerCase()
          },
          include: {
            profile: true
          }
        })

        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isValid) {
          throw new Error("Invalid credentials")
        }

        if (!user.emailVerified) {
          throw new Error("Please verify your email")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.profile?.name,
          role: user.role,
          image: user.profile?.avatar
        }
      }
    })
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
    newUser: "/auth/welcome"
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google OAuth sign-in
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: profile?.email }
          })

          if (!existingUser) {
            // Create new user with Google account
            await prisma.user.create({
              data: {
                email: profile?.email!,
                emailVerified: new Date(),
                role: UserRole.TRAINEE, // Default role
                profile: {
                  create: {
                    name: profile?.name,
                    avatar: profile?.picture // Google profile picture URL
                  }
                },
                accounts: {
                  create: {
                    type: account.type,
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    access_token: account.access_token,
                    refresh_token: account.refresh_token,
                    expires_at: account.expires_at,
                    token_type: account.token_type,
                    scope: account.scope,
                    id_token: account.id_token
                  }
                }
              }
            })
          }
        } catch (error) {
          console.error("Error during Google sign-in:", error)
          return false
        }
      }

      return true
    },

    async jwt({ token, user, account, trigger, session }) {
      if (trigger === "update" && session) {
        // Handle session updates
        token = { ...token, ...session }
      }

      if (user) {
        token.id = user.id
        token.role = user.role
        token.email = user.email
      }

      // Refresh token rotation
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
      }

      // Check if token needs refresh
      if (Date.now() < (token.expiresAt as number) * 1000 - 5 * 60 * 1000) {
        return token
      }

      // Refresh the token
      return await refreshAccessToken(token)
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.email = token.email as string
      }

      session.accessToken = token.accessToken as string
      session.error = token.error as string

      return session
    },

    async redirect({ url, baseUrl }) {
      // Handle role-based redirects
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl + "/dashboard"
    }
  },

  events: {
    async signIn({ user, account, isNewUser }) {
      // Log authentication events
      await prisma.auditLog.create({
        data: {
          userId: user.id!,
          action: "SIGN_IN",
          details: {
            provider: account?.provider,
            isNewUser
          }
        }
      })
    },

    async signOut({ session, token }) {
      // Clear session from cache
      if (token?.id) {
        await redis.del(`session:${token.id}`)
      }
    },

    async createUser({ user }) {
      // Send welcome email
      await sendWelcomeEmail(user.email!)
    },

    async updateUser({ user }) {
      // Invalidate user cache
      await redis.del(`user:${user.id}`)
    }
  },

  debug: process.env.NODE_ENV === "development"
}

const handler = NextAuth(authConfig)
export { handler as GET, handler as POST }
```

### Token Refresh Logic

```typescript
// lib/auth/refresh-token.ts
async function refreshAccessToken(token: JWT) {
  try {
    const url = "https://oauth2.googleapis.com/token"
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken as string,
      }),
      method: "POST",
    })

    const tokens = await response.json()

    if (!response.ok) {
      throw tokens
    }

    return {
      ...token,
      accessToken: tokens.access_token,
      expiresAt: Date.now() + tokens.expires_in * 1000,
      refreshToken: tokens.refresh_token ?? token.refreshToken,
    }
  } catch (error) {
    console.error("Error refreshing access token", error)

    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}
```

## Authentication Middleware

### Route Protection Middleware

```typescript
// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { UserRole } from "@prisma/client"

// Define protected routes and their required roles
const protectedRoutes: Record<string, UserRole[]> = {
  "/dashboard/trainee": [UserRole.TRAINEE, UserRole.ADMIN],
  "/dashboard/instructor": [UserRole.INSTRUCTOR, UserRole.ADMIN],
  "/dashboard/company": [UserRole.COMPANY, UserRole.ADMIN],
  "/dashboard/admin": [UserRole.ADMIN],
  "/training": [UserRole.TRAINEE, UserRole.INSTRUCTOR, UserRole.ADMIN],
  "/candidates": [UserRole.COMPANY, UserRole.ADMIN],
  "/content-management": [UserRole.INSTRUCTOR, UserRole.ADMIN],
}

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const { pathname } = request.nextUrl

  // Check if route is protected
  const protectedRoute = Object.keys(protectedRoutes).find(route =>
    pathname.startsWith(route)
  )

  if (protectedRoute) {
    // User not authenticated
    if (!token) {
      const url = new URL("/auth/login", request.url)
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }

    // Check role-based access
    const requiredRoles = protectedRoutes[protectedRoute]
    const userRole = token.role as UserRole

    if (!requiredRoles.includes(userRole)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }
  }

  // Add security headers
  const response = NextResponse.next()
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  return response
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
}
```

### API Route Protection

```typescript
// lib/auth/protect-api.ts
import { getServerSession } from "next-auth"
import { authConfig } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { UserRole } from "@prisma/client"

export async function withAuth(
  handler: Function,
  allowedRoles?: UserRole[]
) {
  return async function (req: Request, ...args: any[]) {
    const session = await getServerSession(authConfig)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (allowedRoles && !allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    return handler(req, ...args, session)
  }
}

// Usage example
export const GET = withAuth(
  async (req: Request, { params }: any, session: any) => {
    // Your protected API logic here
    return NextResponse.json({ data: "Protected data" })
  },
  [UserRole.ADMIN, UserRole.INSTRUCTOR]
)
```

## User Registration System

### Registration API

```typescript
// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { sendVerificationEmail } from "@/lib/email"
import { generateVerificationToken } from "@/lib/auth/tokens"

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    "Password must contain uppercase, lowercase, number and special character"
  ),
  name: z.string().min(2),
  role: z.enum(["TRAINEE", "INSTRUCTOR", "COMPANY"]),
  agreedToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions"
  })
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = registerSchema.parse(body)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email.toLowerCase(),
        password: hashedPassword,
        role: validatedData.role as any,
        profile: {
          create: {
            name: validatedData.name
          }
        }
      }
    })

    // Generate verification token
    const verificationToken = await generateVerificationToken(user.email)

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken.token)

    // Log registration
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_REGISTERED",
        details: {
          role: validatedData.role,
          provider: "credentials"
        }
      }
    })

    return NextResponse.json({
      message: "Registration successful. Please check your email to verify your account.",
      userId: user.id
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }

    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    )
  }
}
```

### Email Verification

```typescript
// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")

  if (!token) {
    return NextResponse.redirect("/auth/error?error=InvalidToken")
  }

  try {
    // Find verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    })

    if (!verificationToken) {
      return NextResponse.redirect("/auth/error?error=InvalidToken")
    }

    // Check if token expired
    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id }
      })
      return NextResponse.redirect("/auth/error?error=TokenExpired")
    }

    // Update user
    await prisma.user.update({
      where: { email: verificationToken.email },
      data: { emailVerified: new Date() }
    })

    // Delete token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id }
    })

    return NextResponse.redirect("/auth/login?verified=true")
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.redirect("/auth/error?error=VerificationFailed")
  }
}
```

## Profile Management

### Profile Update API

```typescript
// app/api/user/profile/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { cloudinary } from "@/lib/cloudinary"

const profileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  languages: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
  linkedIn: z.string().url().optional(),
  preferences: z.object({
    emailNotifications: z.boolean(),
    smsNotifications: z.boolean(),
    marketingEmails: z.boolean()
  }).optional()
})

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authConfig)

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const formData = await req.formData()
    const avatar = formData.get("avatar") as File | null
    const data = JSON.parse(formData.get("data") as string)

    const validatedData = profileUpdateSchema.parse(data)

    let avatarUrl: string | undefined

    // Handle avatar upload to Cloudinary
    if (avatar) {
      const buffer = Buffer.from(await avatar.arrayBuffer())
      const base64 = buffer.toString('base64')
      const dataUri = `data:${avatar.type};base64,${base64}`

      const uploadResult = await cloudinary.uploader.upload(dataUri, {
        folder: `hirexp/avatars/${session.user.id}`,
        public_id: `${Date.now()}-avatar`,
        resource_type: 'image',
        transformation: [
          { width: 500, height: 500, crop: 'fill', gravity: 'face' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      })

      avatarUrl = uploadResult.secure_url
    }

    // Update profile
    const updatedProfile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        ...validatedData,
        ...(avatarUrl && { avatar: avatarUrl })
      }
    })

    // Invalidate cache
    await redis.del(`user:${session.user.id}`)

    // Log update
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "PROFILE_UPDATED",
        details: {
          updatedFields: Object.keys(validatedData)
        }
      }
    })

    return NextResponse.json({
      message: "Profile updated successfully",
      profile: updatedProfile
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }

    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
```

## Admin Role Management

### Role Assignment API

```typescript
// app/api/admin/users/[userId]/role/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"
import { z } from "zod"
import { sendRoleChangeNotification } from "@/lib/email"

const roleUpdateSchema = z.object({
  role: z.enum(["TRAINEE", "INSTRUCTOR", "COMPANY", "ADMIN"]),
  reason: z.string().min(10)
})

export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authConfig)

  // Only admins can change roles
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 403 }
    )
  }

  try {
    const body = await req.json()
    const validatedData = roleUpdateSchema.parse(body)

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      include: { profile: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const previousRole = user.role

    // Update role
    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: { role: validatedData.role as UserRole }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "ROLE_CHANGED",
        details: {
          targetUserId: params.userId,
          previousRole,
          newRole: validatedData.role,
          reason: validatedData.reason
        }
      }
    })

    // Send notification to user
    await sendRoleChangeNotification(
      user.email,
      user.profile?.name || "User",
      previousRole,
      validatedData.role as UserRole
    )

    // Invalidate user sessions
    await redis.del(`session:${params.userId}`)

    return NextResponse.json({
      message: "Role updated successfully",
      user: updatedUser
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }

    console.error("Role update error:", error)
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    )
  }
}
```

## Security Implementation

### Rate Limiting

```typescript
// lib/auth/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!
})

export const loginRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 attempts per 15 minutes
  analytics: true,
  prefix: "login"
})

export const registrationRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"), // 3 registrations per hour
  analytics: true,
  prefix: "register"
})

export const passwordResetRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"), // 3 reset attempts per hour
  analytics: true,
  prefix: "password-reset"
})

// Usage in API route
export async function POST(req: NextRequest) {
  const ip = req.ip || "127.0.0.1"
  const { success } = await loginRateLimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 }
    )
  }

  // Continue with login logic...
}
```

### Password Reset Flow

```typescript
// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generatePasswordResetToken } from "@/lib/auth/tokens"
import { sendPasswordResetEmail } from "@/lib/email"
import { z } from "zod"

const requestResetSchema = z.object({
  email: z.string().email()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = requestResetSchema.parse(body)

    // Rate limiting
    const ip = req.ip || "127.0.0.1"
    const { success } = await passwordResetRateLimit.limit(ip)

    if (!success) {
      return NextResponse.json(
        { error: "Too many reset attempts" },
        { status: 429 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: "If an account exists, a reset email has been sent."
      })
    }

    // Generate reset token
    const resetToken = await generatePasswordResetToken(user.email)

    // Send email
    await sendPasswordResetEmail(user.email, resetToken.token)

    return NextResponse.json({
      message: "If an account exists, a reset email has been sent."
    })
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}
```

## Session Management

### Session Storage with Redis

```typescript
// lib/auth/session-store.ts
import { Redis } from "@upstash/redis"
import { Session } from "next-auth"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!
})

export class SessionStore {
  private static TTL = 60 * 60 * 24 * 30 // 30 days

  static async save(sessionToken: string, session: Session) {
    await redis.setex(
      `session:${sessionToken}`,
      this.TTL,
      JSON.stringify(session)
    )
  }

  static async get(sessionToken: string): Promise<Session | null> {
    const session = await redis.get(`session:${sessionToken}`)
    return session ? JSON.parse(session as string) : null
  }

  static async delete(sessionToken: string) {
    await redis.del(`session:${sessionToken}`)
  }

  static async deleteUserSessions(userId: string) {
    const keys = await redis.keys(`session:*`)

    for (const key of keys) {
      const session = await redis.get(key)
      if (session) {
        const parsed = JSON.parse(session as string)
        if (parsed.user?.id === userId) {
          await redis.del(key)
        }
      }
    }
  }
}
```

## Client-Side Utilities

### Auth Hooks

```typescript
// hooks/use-auth.ts
import { useSession } from "next-auth/react"
import { UserRole } from "@prisma/client"

export function useAuth() {
  const { data: session, status } = useSession()

  return {
    user: session?.user,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    role: session?.user?.role as UserRole | undefined
  }
}

export function useRole(allowedRoles: UserRole[]) {
  const { role } = useAuth()

  if (!role) return false
  return allowedRoles.includes(role)
}

export function useRequireAuth(redirectUrl = "/auth/login") {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectUrl)
    }
  }, [isAuthenticated, isLoading, router, redirectUrl])

  return { isAuthenticated, isLoading }
}
```

### Protected Components

```typescript
// components/auth/protected.tsx
import { UserRole } from "@prisma/client"
import { useRole } from "@/hooks/use-auth"

interface ProtectedComponentProps {
  children: React.ReactNode
  roles: UserRole[]
  fallback?: React.ReactNode
}

export function ProtectedComponent({
  children,
  roles,
  fallback = null
}: ProtectedComponentProps) {
  const hasAccess = useRole(roles)

  if (!hasAccess) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Usage
<ProtectedComponent roles={[UserRole.ADMIN, UserRole.INSTRUCTOR]}>
  <AdminPanel />
</ProtectedComponent>
```

## Environment Variables

```bash
# .env.local
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-min-32-chars

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/hirexp

# Redis (Upstash)
UPSTASH_REDIS_URL=https://your-redis-url
UPSTASH_REDIS_TOKEN=your-redis-token

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@hirexp.com

# Cloudinary (for avatars and media storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

## Testing Strategy

### Unit Tests

```typescript
// __tests__/auth/registration.test.ts
import { POST } from "@/app/api/auth/register/route"
import { prisma } from "@/lib/prisma"

describe("User Registration", () => {
  it("creates new user with valid data", async () => {
    const request = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "Test123!@#",
        name: "Test User",
        role: "TRAINEE",
        agreedToTerms: true
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.userId).toBeDefined()
  })

  it("rejects weak passwords", async () => {
    const request = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "weak",
        name: "Test User",
        role: "TRAINEE",
        agreedToTerms: true
      })
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })
})
```

## Deployment Considerations

1. **Environment Security**
   - Use strong NEXTAUTH_SECRET (min 32 characters)
   - Rotate secrets regularly
   - Use environment-specific OAuth credentials

2. **Database Security**
   - Enable SSL for PostgreSQL connections
   - Use connection pooling
   - Implement database backups

3. **Session Security**
   - Use secure cookies (httpOnly, secure, sameSite)
   - Implement CSRF protection
   - Regular session cleanup

4. **Monitoring**
   - Track authentication metrics
   - Monitor failed login attempts
   - Alert on suspicious activities