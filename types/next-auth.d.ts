import { UserRole } from '@prisma/client'
import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
      email: string
      name?: string | null
      image?: string | null
    } & DefaultSession['user']
    accessToken?: string
    error?: string
  }

  interface User extends DefaultUser {
    role: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    role: UserRole
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
    error?: string
  }
}
