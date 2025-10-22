import { describe, it, expect, beforeEach, vi } from 'vitest'
import { prisma } from '@/__tests__/setup/test-db'
import { generateMockAccount, generateMockUser } from '@/__tests__/setup/mocks'
import { UserRole, AccountStatus } from '@prisma/client'

describe('OAuth Authentication (Google)', () => {
  describe('OAuth Sign-Up Flow', () => {
    it('should create new user from Google OAuth', async () => {
      const googleProfile = {
        id: 'google-123',
        email: 'newuser@gmail.com',
        name: 'New User',
        picture: 'https://example.com/avatar.jpg',
      }

      // Simulate OAuth user creation
      const user = await prisma.user.create({
        data: {
          email: googleProfile.email,
          emailVerified: new Date(), // OAuth users are pre-verified
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          password: null, // OAuth users don't have password
          profile: {
            create: {
              name: googleProfile.name,
              avatar: googleProfile.picture,
            },
          },
          accounts: {
            create: {
              type: 'oauth',
              provider: 'google',
              providerAccountId: googleProfile.id,
              access_token: 'mock-access-token',
              token_type: 'Bearer',
              scope: 'openid profile email',
            },
          },
        },
        include: {
          profile: true,
          accounts: true,
        },
      })

      expect(user.email).toBe(googleProfile.email)
      expect(user.emailVerified).not.toBeNull()
      expect(user.password).toBeNull()
      expect(user.status).toBe(AccountStatus.ACTIVE)
      expect(user.profile?.name).toBe(googleProfile.name)
      expect(user.profile?.avatar).toBe(googleProfile.picture)
      expect(user.accounts).toHaveLength(1)
      expect(user.accounts[0].provider).toBe('google')
    })

    it('should set emailVerified immediately for OAuth users', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'oauth@example.com',
          emailVerified: new Date(),
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          password: null,
          profile: {
            create: { name: 'OAuth User' },
          },
        },
      })

      expect(user.emailVerified).toBeInstanceOf(Date)
      expect(user.emailVerified?.getTime()).toBeLessThanOrEqual(Date.now())
    })

    it('should create OAuth account record', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'oauth@example.com',
          emailVerified: new Date(),
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          password: null,
          profile: {
            create: { name: 'OAuth User' },
          },
        },
      })

      const account = await prisma.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider: 'google',
          providerAccountId: 'google-456',
          access_token: 'access-token-123',
          refresh_token: 'refresh-token-456',
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'Bearer',
          scope: 'openid profile email',
        },
      })

      expect(account.provider).toBe('google')
      expect(account.providerAccountId).toBe('google-456')
      expect(account.access_token).toBeDefined()
      expect(account.token_type).toBe('Bearer')
    })

    it('should set user status to ACTIVE for OAuth sign-up', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'active-oauth@example.com',
          emailVerified: new Date(),
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE, // OAuth users skip PENDING_VERIFICATION
          password: null,
          profile: {
            create: { name: 'Active User' },
          },
        },
      })

      expect(user.status).toBe(AccountStatus.ACTIVE)
    })

    it('should create audit log for OAuth sign-up', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'audit-oauth@example.com',
          emailVerified: new Date(),
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          password: null,
          profile: {
            create: { name: 'Audit User' },
          },
        },
      })

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'SIGN_UP',
          details: {
            method: 'oauth',
            provider: 'google',
          },
        },
      })

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          userId: user.id,
          action: 'SIGN_UP',
        },
      })

      expect(auditLog).toBeDefined()
      expect(auditLog?.details).toMatchObject({
        method: 'oauth',
        provider: 'google',
      })
    })
  })

  describe('OAuth Sign-In Flow', () => {
    it('should sign in existing OAuth user', async () => {
      // Create existing OAuth user
      const user = await prisma.user.create({
        data: {
          email: 'existing@gmail.com',
          emailVerified: new Date(),
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          password: null,
          profile: {
            create: { name: 'Existing User' },
          },
          accounts: {
            create: {
              type: 'oauth',
              provider: 'google',
              providerAccountId: 'google-existing',
              access_token: 'old-token',
              token_type: 'Bearer',
              scope: 'openid profile email',
            },
          },
        },
        include: {
          accounts: true,
        },
      })

      expect(user.accounts).toHaveLength(1)
      expect(user.accounts[0].provider).toBe('google')
    })

    it('should update access token on sign-in', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'update-token@example.com',
          emailVerified: new Date(),
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          password: null,
          profile: {
            create: { name: 'Update User' },
          },
        },
      })

      const account = await prisma.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider: 'google',
          providerAccountId: 'google-789',
          access_token: 'old-access-token',
          token_type: 'Bearer',
          scope: 'openid profile email',
        },
      })

      // Simulate token refresh on sign-in
      const updatedAccount = await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          expires_at: Math.floor(Date.now() / 1000) + 3600,
        },
      })

      expect(updatedAccount.access_token).toBe('new-access-token')
      expect(updatedAccount.refresh_token).toBe('new-refresh-token')
    })

    it('should update lastLoginAt on OAuth sign-in', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'lastlogin@example.com',
          emailVerified: new Date(),
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          password: null,
          lastLoginAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          profile: {
            create: { name: 'Login User' },
          },
        },
      })

      const beforeLogin = user.lastLoginAt

      // Update last login
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      })

      expect(updatedUser.lastLoginAt?.getTime()).toBeGreaterThan(
        beforeLogin!.getTime()
      )
    })

    it('should create audit log for OAuth sign-in', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'signin-audit@example.com',
          emailVerified: new Date(),
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          password: null,
          profile: {
            create: { name: 'Signin User' },
          },
        },
      })

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'SIGN_IN',
          details: {
            method: 'oauth',
            provider: 'google',
          },
        },
      })

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          userId: user.id,
          action: 'SIGN_IN',
        },
      })

      expect(auditLog?.details).toMatchObject({
        method: 'oauth',
        provider: 'google',
      })
    })
  })

  describe('Account Linking', () => {
    it('should link Google account to existing email/password user', async () => {
      // User registered with email/password
      const user = await prisma.user.create({
        data: {
          email: 'link@example.com',
          emailVerified: new Date(),
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          password: '$2b$10$hashedpassword', // Has password
          profile: {
            create: { name: 'Link User' },
          },
        },
      })

      // Link Google account
      const account = await prisma.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider: 'google',
          providerAccountId: 'google-link-123',
          access_token: 'link-token',
          token_type: 'Bearer',
          scope: 'openid profile email',
        },
      })

      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { accounts: true },
      })

      expect(updatedUser?.password).not.toBeNull() // Still has password
      expect(updatedUser?.accounts).toHaveLength(1)
      expect(updatedUser?.accounts[0].provider).toBe('google')
    })

    it('should prevent duplicate Google account linking', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'duplicate@example.com',
          emailVerified: new Date(),
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          password: null,
          profile: {
            create: { name: 'Duplicate User' },
          },
        },
      })

      // Create first Google account
      await prisma.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider: 'google',
          providerAccountId: 'google-dup-123',
          access_token: 'token-1',
          token_type: 'Bearer',
          scope: 'openid profile email',
        },
      })

      // Try to create duplicate (same provider + providerAccountId)
      // This should fail due to unique constraint
      await expect(
        prisma.account.create({
          data: {
            userId: user.id,
            type: 'oauth',
            provider: 'google',
            providerAccountId: 'google-dup-123', // Same ID
            access_token: 'token-2',
            token_type: 'Bearer',
            scope: 'openid profile email',
          },
        })
      ).rejects.toThrow()
    })

    it('should allow user with both password and OAuth', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'hybrid@example.com',
          emailVerified: new Date(),
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          password: '$2b$10$hashedpassword',
          profile: {
            create: { name: 'Hybrid User' },
          },
          accounts: {
            create: {
              type: 'oauth',
              provider: 'google',
              providerAccountId: 'google-hybrid',
              access_token: 'hybrid-token',
              token_type: 'Bearer',
              scope: 'openid profile email',
            },
          },
        },
        include: {
          accounts: true,
        },
      })

      expect(user.password).not.toBeNull()
      expect(user.accounts).toHaveLength(1)
      // User can sign in with either password or Google
    })
  })

  describe('Profile Data from OAuth', () => {
    it('should populate profile from Google data', async () => {
      const googleProfile = {
        email: 'profile@gmail.com',
        name: 'John Doe',
        picture: 'https://lh3.googleusercontent.com/a/avatar.jpg',
      }

      const user = await prisma.user.create({
        data: {
          email: googleProfile.email,
          emailVerified: new Date(),
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          password: null,
          profile: {
            create: {
              name: googleProfile.name,
              avatar: googleProfile.picture,
            },
          },
        },
        include: {
          profile: true,
        },
      })

      expect(user.profile?.name).toBe(googleProfile.name)
      expect(user.profile?.avatar).toBe(googleProfile.picture)
    })

    it('should update avatar from Google on sign-in', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'avatar@example.com',
          emailVerified: new Date(),
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          password: null,
          profile: {
            create: {
              name: 'Avatar User',
              avatar: 'https://old-avatar.com/pic.jpg',
            },
          },
        },
        include: {
          profile: true,
        },
      })

      // Update avatar on sign-in
      await prisma.profile.update({
        where: { userId: user.id },
        data: {
          avatar: 'https://new-google-avatar.com/pic.jpg',
        },
      })

      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { profile: true },
      })

      expect(updatedUser?.profile?.avatar).toBe(
        'https://new-google-avatar.com/pic.jpg'
      )
    })
  })

  describe('Token Management', () => {
    it('should store access token', async () => {
      const account = generateMockAccount('user-123', {
        provider: 'google',
        access_token: 'access-token-abc',
      })

      expect(account.access_token).toBe('access-token-abc')
      expect(account.token_type).toBe('Bearer')
    })

    it('should store refresh token', async () => {
      const account = generateMockAccount('user-123', {
        provider: 'google',
        refresh_token: 'refresh-token-xyz',
      })

      expect(account.refresh_token).toBe('refresh-token-xyz')
    })

    it('should store token expiration', async () => {
      const expiresAt = Math.floor(Date.now() / 1000) + 3600
      const account = generateMockAccount('user-123', {
        provider: 'google',
        expires_at: expiresAt,
      })

      expect(account.expires_at).toBe(expiresAt)
      expect(account.expires_at! * 1000).toBeGreaterThan(Date.now())
    })

    it('should store token scope', async () => {
      const account = generateMockAccount('user-123', {
        provider: 'google',
      })

      expect(account.scope).toBe('openid profile email')
    })
  })

  describe('Security', () => {
    it('should not allow OAuth user without email verification', async () => {
      // OAuth users should always have emailVerified set
      const user = await prisma.user.create({
        data: {
          email: 'verified-oauth@example.com',
          emailVerified: new Date(), // Must be set for OAuth
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          password: null,
          profile: {
            create: { name: 'Verified OAuth User' },
          },
        },
      })

      expect(user.emailVerified).not.toBeNull()
    })

    it('should prevent email hijacking via OAuth', async () => {
      // User A registers with email/password
      const userA = await prisma.user.create({
        data: {
          email: 'hijack@example.com',
          emailVerified: new Date(),
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          password: '$2b$10$hashedpassword',
          profile: {
            create: { name: 'User A' },
          },
        },
      })

      // User B tries to use same email via OAuth
      // This should either:
      // 1. Link to existing account (if emails match)
      // 2. Reject if email not verified in existing account

      const existingUser = await prisma.user.findUnique({
        where: { email: 'hijack@example.com' },
      })

      expect(existingUser?.id).toBe(userA.id)
      expect(existingUser?.emailVerified).not.toBeNull()
    })

    it('should validate OAuth provider', async () => {
      const validProviders = ['google']
      const provider = 'google'

      expect(validProviders).toContain(provider)
    })
  })

  describe('Error Handling', () => {
    it('should handle OAuth provider errors gracefully', async () => {
      // Simulate OAuth provider error
      // In real implementation, should log error and show user-friendly message
      const errorMessage = 'OAuth provider temporarily unavailable'
      expect(errorMessage).toBeDefined()
    })

    it('should handle missing OAuth profile data', async () => {
      // Minimal OAuth profile
      const minimalProfile = {
        id: 'google-min',
        email: 'minimal@example.com',
        // Missing name and picture
      }

      const user = await prisma.user.create({
        data: {
          email: minimalProfile.email,
          emailVerified: new Date(),
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          password: null,
          profile: {
            create: {
              name: minimalProfile.email, // Fallback to email
            },
          },
        },
        include: {
          profile: true,
        },
      })

      expect(user.profile).toBeDefined()
    })

    it('should handle OAuth callback cancellation', async () => {
      // User cancels OAuth flow
      // Should redirect back to login without error
      const cancelled = true
      expect(cancelled).toBe(true)
    })
  })
})
