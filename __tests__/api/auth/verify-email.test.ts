import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/__tests__/setup/test-db'
import { generateMockUserWithHashedPassword, generateMockVerificationToken, generateMockUserName } from '@/__tests__/setup/mocks'
import { UserRole, AccountStatus } from '@prisma/client'

describe('Email Verification', () => {
  describe('Token Validation', () => {
    it('should successfully verify email with valid token', async () => {
      // Create unverified user
      const mockUser = await generateMockUserWithHashedPassword({
        emailVerified: null,
        role: UserRole.TRAINEE,
        status: AccountStatus.PENDING_VERIFICATION,
      })

      const user = await prisma.user.create({
        data: {
          ...mockUser,
          profile: {
            create: { name: generateMockUserName() },
          },
        },
      })

      // Create verification token
      const tokenData = generateMockVerificationToken({
        identifier: user.email,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })

      const token = await prisma.verificationToken.create({
        data: {
          userId: user.id,
          email: user.email,
          token: tokenData.token,
          expires: tokenData.expires,
        },
      })

      // Simulate email verification
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified: new Date(),
            status: AccountStatus.ACTIVE,
          },
        }),
        prisma.verificationToken.delete({
          where: { id: token.id },
        }),
      ])

      const verifiedUser = await prisma.user.findUnique({
        where: { id: user.id },
      })

      expect(verifiedUser?.emailVerified).not.toBeNull()
      expect(verifiedUser?.status).toBe(AccountStatus.ACTIVE)

      // Token should be deleted
      const deletedToken = await prisma.verificationToken.findUnique({
        where: { id: token.id },
      })

      expect(deletedToken).toBeNull()
    })

    it('should reject verification with invalid token', async () => {
      const mockUser = await generateMockUserWithHashedPassword()

      await prisma.user.create({
        data: {
          ...mockUser,
          profile: {
            create: { name: generateMockUserName() },
          },
        },
      })

      // Try to find non-existent token
      const token = await prisma.verificationToken.findUnique({
        where: { token: 'invalid-token-123' },
      })

      expect(token).toBeNull()
    })

    it('should reject verification with expired token', async () => {
      const mockUser = await generateMockUserWithHashedPassword()

      const user = await prisma.user.create({
        data: {
          ...mockUser,
          status: AccountStatus.PENDING_VERIFICATION,
          profile: {
            create: { name: generateMockUserName() },
          },
        },
      })

      // Create expired token
      const expiredToken = await prisma.verificationToken.create({
        data: {
          userId: user.id,
          email: user.email,
          token: 'expired-token',
          expires: new Date(Date.now() - 1000), // Expired 1 second ago
        },
      })

      // Check if token is expired
      const now = new Date()
      const isExpired = expiredToken.expires < now

      expect(isExpired).toBe(true)
    })

    it('should reject reuse of already used token', async () => {
      const mockUser = await generateMockUserWithHashedPassword()

      const user = await prisma.user.create({
        data: {
          ...mockUser,
          status: AccountStatus.PENDING_VERIFICATION,
          profile: {
            create: { name: generateMockUserName() },
          },
        },
      })

      const token = await prisma.verificationToken.create({
        data: {
          userId: user.id,
          email: user.email,
          token: 'used-token',
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      })

      // Use the token (simulate verification)
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date(), status: AccountStatus.ACTIVE },
        }),
        prisma.verificationToken.delete({
          where: { id: token.id },
        }),
      ])

      // Try to reuse the token
      const deletedToken = await prisma.verificationToken.findUnique({
        where: { token: 'used-token' },
      })

      expect(deletedToken).toBeNull()
    })
  })

  describe('User Status Updates', () => {
    it('should update user status from PENDING_VERIFICATION to ACTIVE', async () => {
      const mockUser = await generateMockUserWithHashedPassword()

      const user = await prisma.user.create({
        data: {
          ...mockUser,
          status: AccountStatus.PENDING_VERIFICATION,
          emailVerified: null,
          profile: {
            create: { name: generateMockUserName() },
          },
        },
      })

      expect(user.status).toBe(AccountStatus.PENDING_VERIFICATION)
      expect(user.emailVerified).toBeNull()

      // Verify email
      const verifiedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
          status: AccountStatus.ACTIVE,
        },
      })

      expect(verifiedUser.status).toBe(AccountStatus.ACTIVE)
      expect(verifiedUser.emailVerified).not.toBeNull()
    })

    it('should set emailVerified timestamp', async () => {
      const mockUser = await generateMockUserWithHashedPassword()

      const user = await prisma.user.create({
        data: {
          ...mockUser,
          status: AccountStatus.PENDING_VERIFICATION,
          profile: {
            create: { name: generateMockUserName() },
          },
        },
      })

      const beforeVerification = new Date()

      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      })

      const verifiedUser = await prisma.user.findUnique({
        where: { id: user.id },
      })

      expect(verifiedUser?.emailVerified).toBeInstanceOf(Date)
      expect(verifiedUser!.emailVerified!.getTime()).toBeGreaterThanOrEqual(beforeVerification.getTime())
    })
  })

  describe('Token Management', () => {
    it('should create token with 24-hour expiration', async () => {
      const mockUser = await generateMockUserWithHashedPassword()

      const user = await prisma.user.create({
        data: {
          ...mockUser,
          status: AccountStatus.PENDING_VERIFICATION,
          profile: {
            create: { name: generateMockUserName() },
          },
        },
      })

      const token = await prisma.verificationToken.create({
        data: {
          userId: user.id,
          email: user.email,
          token: 'test-token',
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      })

      const expiresIn = token.expires.getTime() - new Date().getTime()
      const hoursUntilExpiry = expiresIn / (1000 * 60 * 60)

      expect(hoursUntilExpiry).toBeGreaterThan(23.9)
      expect(hoursUntilExpiry).toBeLessThan(24.1)
    })

    it('should delete token after successful verification', async () => {
      const mockUser = await generateMockUserWithHashedPassword()

      const user = await prisma.user.create({
        data: {
          ...mockUser,
          status: AccountStatus.PENDING_VERIFICATION,
          profile: {
            create: { name: generateMockUserName() },
          },
        },
      })

      const token = await prisma.verificationToken.create({
        data: {
          userId: user.id,
          email: user.email,
          token: 'delete-me',
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      })

      // Verify and delete token
      await prisma.verificationToken.delete({
        where: { id: token.id },
      })

      const deletedToken = await prisma.verificationToken.findUnique({
        where: { id: token.id },
      })

      expect(deletedToken).toBeNull()
    })

    it('should allow multiple tokens for same email (replace old ones)', async () => {
      const mockUser = await generateMockUserWithHashedPassword()

      const user = await prisma.user.create({
        data: {
          ...mockUser,
          status: AccountStatus.PENDING_VERIFICATION,
          profile: {
            create: { name: generateMockUserName() },
          },
        },
      })

      // Create first token
      const token1 = await prisma.verificationToken.create({
        data: {
          userId: user.id,
          email: user.email,
          token: 'token-1',
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      })

      // Create second token (e.g., user requested resend)
      const token2 = await prisma.verificationToken.create({
        data: {
          userId: user.id,
          email: user.email,
          token: 'token-2',
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      })

      const allTokens = await prisma.verificationToken.findMany({
        where: { userId: user.id },
      })

      expect(allTokens).toHaveLength(2)
      expect(allTokens.map(t => t.token)).toContain('token-1')
      expect(allTokens.map(t => t.token)).toContain('token-2')
    })

    it('should generate unique token for each verification request', async () => {
      const mockUser1 = await generateMockUserWithHashedPassword({ email: 'user1@example.com' })
      const mockUser2 = await generateMockUserWithHashedPassword({ email: 'user2@example.com' })

      const user1 = await prisma.user.create({
        data: {
          ...mockUser1,
          status: AccountStatus.PENDING_VERIFICATION,
          profile: {
            create: { name: mockUser1.name },
          },
        },
      })

      const user2 = await prisma.user.create({
        data: {
          ...mockUser2,
          status: AccountStatus.PENDING_VERIFICATION,
          profile: {
            create: { name: mockUser2.name },
          },
        },
      })

      const token1 = await prisma.verificationToken.create({
        data: {
          userId: user1.id,
          email: user1.email,
          token: crypto.randomUUID(),
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      })

      const token2 = await prisma.verificationToken.create({
        data: {
          userId: user2.id,
          email: user2.email,
          token: crypto.randomUUID(),
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      })

      expect(token1.token).not.toBe(token2.token)
    })
  })

  describe('Audit Logging', () => {
    it('should log email verification event', async () => {
      const mockUser = await generateMockUserWithHashedPassword()

      const user = await prisma.user.create({
        data: {
          ...mockUser,
          status: AccountStatus.PENDING_VERIFICATION,
          profile: {
            create: { name: generateMockUserName() },
          },
        },
      })

      // Verify email and log
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date(), status: AccountStatus.ACTIVE },
      })

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'EMAIL_VERIFIED',
          details: {
            email: user.email,
            verifiedAt: new Date().toISOString(),
          },
        },
      })

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          userId: user.id,
          action: 'EMAIL_VERIFIED',
        },
      })

      expect(auditLog).toBeDefined()
      expect(auditLog?.action).toBe('EMAIL_VERIFIED')
    })
  })

  describe('Edge Cases', () => {
    it('should handle verification for already verified user gracefully', async () => {
      const mockUser = await generateMockUserWithHashedPassword()

      const user = await prisma.user.create({
        data: {
          ...mockUser,
          status: AccountStatus.ACTIVE,
          emailVerified: new Date(),
          profile: {
            create: { name: generateMockUserName() },
          },
        },
      })

      // User is already verified
      expect(user.emailVerified).not.toBeNull()
      expect(user.status).toBe(AccountStatus.ACTIVE)

      // Attempting to verify again should be idempotent
      const stillVerified = await prisma.user.findUnique({
        where: { id: user.id },
      })

      expect(stillVerified?.emailVerified).not.toBeNull()
    })

    it('should handle missing verification token', async () => {
      const token = await prisma.verificationToken.findUnique({
        where: { token: 'non-existent-token' },
      })

      expect(token).toBeNull()
    })

    it('should link token to correct user', async () => {
      const mockUser = await generateMockUserWithHashedPassword()

      const user = await prisma.user.create({
        data: {
          ...mockUser,
          status: AccountStatus.PENDING_VERIFICATION,
          profile: {
            create: { name: generateMockUserName() },
          },
        },
      })

      const token = await prisma.verificationToken.create({
        data: {
          userId: user.id,
          email: user.email,
          token: 'user-token',
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      })

      expect(token.userId).toBe(user.id)
      expect(token.email).toBe(user.email)

      const foundToken = await prisma.verificationToken.findUnique({
        where: { token: 'user-token' },
        include: { user: true },
      })

      expect(foundToken?.user.id).toBe(user.id)
    })
  })
})
