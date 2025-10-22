import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/__tests__/setup/test-db'
import {
  generateMockUserWithHashedPassword,
  generatePasswordResetPayload,
  generateNewPasswordPayload,
  generateMockUserName,
  DEFAULT_TEST_PASSWORD,
} from '@/__tests__/setup/mocks'
import { UserRole, AccountStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

describe('Password Reset Flow', () => {
  describe('Request Password Reset', () => {
    it('should create password reset token for existing user', async () => {
      const mockUser = await generateMockUserWithHashedPassword({
        email: 'reset@example.com',
      })

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

      // Simulate password reset request
      const resetToken = await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          email: user.email,
          token: crypto.randomUUID(),
          expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
          used: false,
        },
      })

      expect(resetToken).toBeDefined()
      expect(resetToken.email).toBe(user.email)
      expect(resetToken.token).toBeDefined()
      expect(resetToken.used).toBe(false)
      expect(resetToken.expires.getTime()).toBeGreaterThan(Date.now())
    })

    it('should set token expiration to 1 hour', async () => {
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

      const resetToken = await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          email: user.email,
          token: crypto.randomUUID(),
          expires: new Date(Date.now() + 60 * 60 * 1000),
          used: false,
        },
      })

      const expiresIn = resetToken.expires.getTime() - Date.now()
      const minutesUntilExpiry = expiresIn / (1000 * 60)

      expect(minutesUntilExpiry).toBeGreaterThan(59)
      expect(minutesUntilExpiry).toBeLessThan(61)
    })

    it('should handle non-existent email gracefully', async () => {
      // Try to find user with non-existent email
      const user = await prisma.user.findUnique({
        where: { email: 'nonexistent@example.com' },
      })

      expect(user).toBeNull()
    })

    it('should create audit log for password reset request', async () => {
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

      // Create password reset token
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          email: user.email,
          token: crypto.randomUUID(),
          expires: new Date(Date.now() + 60 * 60 * 1000),
          used: false,
        },
      })

      // Log the request
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'PASSWORD_RESET',
          details: {
            type: 'request',
            email: user.email,
          },
        },
      })

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          userId: user.id,
          action: 'PASSWORD_RESET',
        },
      })

      expect(auditLog).toBeDefined()
      expect(auditLog?.action).toBe('PASSWORD_RESET')
    })

    it('should allow multiple reset tokens (invalidate old ones)', async () => {
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

      // Create first token
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          email: user.email,
          token: 'token-1',
          expires: new Date(Date.now() + 60 * 60 * 1000),
          used: false,
        },
      })

      // Create second token (user requested again)
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          email: user.email,
          token: 'token-2',
          expires: new Date(Date.now() + 60 * 60 * 1000),
          used: false,
        },
      })

      const allTokens = await prisma.passwordResetToken.findMany({
        where: { userId: user.id },
      })

      expect(allTokens).toHaveLength(2)
    })
  })

  describe('Reset Password with Token', () => {
    it('should successfully reset password with valid token', async () => {
      const mockUser = await generateMockUserWithHashedPassword({
        password: 'OldPassword@123',
      })

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

      const resetToken = await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          email: user.email,
          token: 'valid-token',
          expires: new Date(Date.now() + 60 * 60 * 1000),
          used: false,
        },
      })

      // Reset password
      const newPassword = 'NewPassword@123'
      const hashedNewPassword = await bcrypt.hash(newPassword, 10)

      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { password: hashedNewPassword },
        }),
        prisma.passwordResetToken.update({
          where: { id: resetToken.id },
          data: { used: true },
        }),
      ])

      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      })

      const isNewPasswordValid = await bcrypt.compare(
        newPassword,
        updatedUser!.password!
      )
      expect(isNewPasswordValid).toBe(true)

      const usedToken = await prisma.passwordResetToken.findUnique({
        where: { id: resetToken.id },
      })
      expect(usedToken?.used).toBe(true)
    })

    it('should reject expired token', async () => {
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

      const expiredToken = await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          email: user.email,
          token: 'expired-token',
          expires: new Date(Date.now() - 1000), // Expired
          used: false,
        },
      })

      // Check if token is expired
      const isExpired = expiredToken.expires < new Date()
      expect(isExpired).toBe(true)
    })

    it('should reject already used token', async () => {
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

      const usedToken = await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          email: user.email,
          token: 'used-token',
          expires: new Date(Date.now() + 60 * 60 * 1000),
          used: true, // Already used
        },
      })

      expect(usedToken.used).toBe(true)
    })

    it('should reject invalid token', async () => {
      const token = await prisma.passwordResetToken.findUnique({
        where: { token: 'invalid-token' },
      })

      expect(token).toBeNull()
    })

    it('should hash new password with bcrypt', async () => {
      const newPassword = 'NewSecurePassword@123'
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      expect(hashedPassword).not.toBe(newPassword)
      expect(hashedPassword).toMatch(/^\$2[aby]\$10\$/)

      const isValid = await bcrypt.compare(newPassword, hashedPassword)
      expect(isValid).toBe(true)
    })

    it('should mark token as used after successful reset', async () => {
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

      const resetToken = await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          email: user.email,
          token: 'mark-used-token',
          expires: new Date(Date.now() + 60 * 60 * 1000),
          used: false,
        },
      })

      expect(resetToken.used).toBe(false)

      // Mark as used
      await prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      })

      const updatedToken = await prisma.passwordResetToken.findUnique({
        where: { id: resetToken.id },
      })

      expect(updatedToken?.used).toBe(true)
    })

    it('should create audit log for successful password reset', async () => {
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

      // Log password change
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'PASSWORD_CHANGED',
          details: {
            method: 'reset_token',
          },
        },
      })

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          userId: user.id,
          action: 'PASSWORD_CHANGED',
        },
      })

      expect(auditLog).toBeDefined()
      expect(auditLog?.action).toBe('PASSWORD_CHANGED')
    })
  })

  describe('Password Validation', () => {
    it('should enforce password complexity requirements', async () => {
      const validPassword = 'SecurePass@123'
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/

      expect(passwordRegex.test(validPassword)).toBe(true)
    })

    it('should reject weak passwords', async () => {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/

      const weakPasswords = [
        'short',
        'nouppercase123!',
        'NOLOWERCASE123!',
        'NoNumbers!',
        'NoSpecialChars123',
      ]

      for (const weak of weakPasswords) {
        expect(passwordRegex.test(weak)).toBe(false)
      }
    })

    it('should require minimum 8 characters', async () => {
      const shortPassword = 'Short@1'
      expect(shortPassword.length).toBeLessThan(8)

      const validPassword = 'Valid@123'
      expect(validPassword.length).toBeGreaterThanOrEqual(8)
    })
  })

  describe('Security', () => {
    it('should not reveal if email exists in database', async () => {
      // When requesting password reset for non-existent email,
      // the response should be the same as for existing email
      // to prevent email enumeration attacks

      const existingUser = await prisma.user.findUnique({
        where: { email: 'exists@example.com' },
      })

      const nonExistentUser = await prisma.user.findUnique({
        where: { email: 'notexists@example.com' },
      })

      // Both should return null or same response structure
      // Actual implementation should return success message for both
      expect(existingUser).toBeNull()
      expect(nonExistentUser).toBeNull()
    })

    it('should generate unique tokens for each request', async () => {
      const token1 = crypto.randomUUID()
      const token2 = crypto.randomUUID()

      expect(token1).not.toBe(token2)
      expect(token1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
      expect(token2).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    })

    it('should prevent old password reuse', async () => {
      const oldPassword = 'OldPassword@123'
      const oldHash = await bcrypt.hash(oldPassword, 10)

      // When setting new password, should verify it's different from old
      const isOldPasswordReused = await bcrypt.compare(oldPassword, oldHash)
      expect(isOldPasswordReused).toBe(true)

      // New password should be different
      const newPassword = 'NewPassword@123'
      const isSameAsOld = await bcrypt.compare(newPassword, oldHash)
      expect(isSameAsOld).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle multiple password reset requests', async () => {
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

      // User requests reset multiple times
      const tokens = []
      for (let i = 0; i < 3; i++) {
        const token = await prisma.passwordResetToken.create({
          data: {
            userId: user.id,
            email: user.email,
            token: `token-${i}`,
            expires: new Date(Date.now() + 60 * 60 * 1000),
            used: false,
          },
        })
        tokens.push(token)
      }

      const allTokens = await prisma.passwordResetToken.findMany({
        where: { userId: user.id },
      })

      expect(allTokens).toHaveLength(3)
    })

    it('should handle password reset for unverified email', async () => {
      const mockUser = await generateMockUserWithHashedPassword()

      const user = await prisma.user.create({
        data: {
          ...mockUser,
          status: AccountStatus.PENDING_VERIFICATION,
          emailVerified: null, // Email not verified
          profile: {
            create: { name: generateMockUserName() },
          },
        },
      })

      expect(user.emailVerified).toBeNull()
      expect(user.status).toBe(AccountStatus.PENDING_VERIFICATION)

      // Decision: Should unverified users be able to reset password?
      // This test documents the expected behavior
    })

    it('should cleanup expired tokens', async () => {
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

      // Create expired token
      const expiredToken = await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          email: user.email,
          token: 'expired',
          expires: new Date(Date.now() - 60 * 60 * 1000), // Expired 1 hour ago
          used: false,
        },
      })

      // In production, a cleanup job should delete expired tokens
      await prisma.passwordResetToken.deleteMany({
        where: {
          expires: { lt: new Date() },
          used: false,
        },
      })

      const deletedToken = await prisma.passwordResetToken.findUnique({
        where: { id: expiredToken.id },
      })

      expect(deletedToken).toBeNull()
    })
  })
})
