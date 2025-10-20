import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'
import { refreshAccessToken } from './refresh-token'

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Google OAuth Provider
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),

    // Credentials Provider
    Credentials({
      name: 'credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'john@example.com',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: {
            email: (credentials.email as string).toLowerCase(),
          },
          include: {
            profile: true,
          },
        })

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        // Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error('Account is locked. Please try again later.')
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) {
          // Increment failed login attempts
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: {
                increment: 1,
              },
              // Lock account after 5 failed attempts for 15 minutes
              lockedUntil:
                user.failedLoginAttempts >= 4
                  ? new Date(Date.now() + 15 * 60 * 1000)
                  : undefined,
            },
          })
          throw new Error('Invalid credentials')
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error('Please verify your email address before logging in')
        }

        // Check if account is active
        if (user.status !== 'ACTIVE' && user.status !== 'PENDING_VERIFICATION') {
          throw new Error('Your account has been suspended. Please contact support.')
        }

        // Reset failed login attempts on successful login
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
          },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.profile?.name,
          role: user.role,
          image: user.profile?.avatar,
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
    newUser: '/dashboard',
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google OAuth sign-in
      if (account?.provider === 'google') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: profile?.email },
          })

          if (!existingUser) {
            // Create new user with Google account
            await prisma.user.create({
              data: {
                email: profile?.email!,
                emailVerified: new Date(),
                role: UserRole.TRAINEE, // Default role
                status: 'ACTIVE',
                profile: {
                  create: {
                    name: profile?.name,
                    avatar: (profile as any)?.picture,
                  },
                },
              },
            })
          } else {
            // Update last login for existing user
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { lastLoginAt: new Date() },
            })
          }

          // Log the sign-in
          await prisma.auditLog.create({
            data: {
              userId: existingUser?.id || user.id,
              action: 'SIGN_IN',
              details: {
                provider: account.provider,
                isNewUser: !existingUser,
              },
            },
          })
        } catch (error) {
          console.error('Error during Google sign-in:', error)
          return false
        }
      }

      return true
    },

    async jwt({ token, user, account, trigger, session }) {
      if (trigger === 'update' && session) {
        // Handle session updates
        token = { ...token, ...session }
      }

      if (user) {
        token.id = user.id
        token.role = user.role
        token.email = user.email
      }

      // Refresh token rotation for OAuth
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
      }

      // Check if token needs refresh (for OAuth)
      if (token.expiresAt && token.refreshToken) {
        if (Date.now() < (token.expiresAt as number) * 1000 - 5 * 60 * 1000) {
          return token
        }

        // Refresh the token
        return await refreshAccessToken(token)
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.email = token.email as string
      }

      // Add custom properties to session
      ;(session as any).accessToken = token.accessToken as string
      ;(session as any).error = token.error as string

      return session
    },

    async redirect({ url, baseUrl }) {
      // Handle role-based redirects after login
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url

      // Default redirect to dashboard
      return baseUrl + '/dashboard'
    },
  },

  events: {
    async signIn({ user, account, isNewUser }) {
      // Log authentication event
      try {
        await prisma.auditLog.create({
          data: {
            userId: user.id!,
            action: 'SIGN_IN',
            details: {
              provider: account?.provider || 'credentials',
              isNewUser: !!isNewUser,
            },
          },
        })
      } catch (error) {
        console.error('Error logging sign-in event:', error)
      }
    },

    async signOut({ token }) {
      // Log sign-out event
      try {
        if (token?.id) {
          await prisma.auditLog.create({
            data: {
              userId: token.id as string,
              action: 'SIGN_OUT',
              details: {},
            },
          })
        }
      } catch (error) {
        console.error('Error logging sign-out event:', error)
      }
    },

    async createUser({ user }) {
      // You can send a welcome email here
      console.log('New user created:', user.email)
    },

    async updateUser({ user }) {
      console.log('User updated:', user.id)
    },
  },

  debug: process.env.NODE_ENV === 'development',
}
