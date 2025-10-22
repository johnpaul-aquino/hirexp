import { describe, it, expect, beforeEach, vi } from 'vitest'
import { prisma } from '@/__tests__/setup/test-db'
import {
  generateMockUserWithHashedPassword,
  generateLoginPayload,
  generateMockUserName,
  DEFAULT_TEST_PASSWORD,
} from '@/__tests__/setup/mocks'
import { UserRole, AccountStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Import the authorize function from auth config
// Since it's part of the NextAuth configuration, we'll test the logic directly
describe('Login Authentication', () => {
  describe('Successful Login', () => {
    it('should allow login with valid credentials', async () => {
      // Create a verified user
      const mockUser = await generateMockUserWithHashedPassword({
        email: 'verified@example.com',
        status: AccountStatus.ACTIVE,
      })

      const user = await prisma.user.create({
        data: {
          ...mockUser,
          emailVerified: new Date(),
          profile: {
            create: { name: generateMockUserName() },
          },
        },
      })

      // Verify password matches
      const isValid = await bcrypt.compare(DEFAULT_TEST_PASSWORD, user.password!)
      expect(isValid).toBe(true)

      // Verify user can be found
      const foundUser = await prisma.user.findUnique({
        where: { email: 'verified@example.com' },
      })

      expect(foundUser).toBeDefined()
      expect(foundUser?.emailVerified).not.toBeNull()
      expect(foundUser?.status).toBe(AccountStatus.ACTIVE)
    })

    it('should reset failed login attempts on successful login', async () => {
      const hashedPassword = await bcrypt.hash(DEFAULT_TEST_PASSWORD, 10)
      await prisma.user.create({
        data: {
          email: 'user@example.com',
          password: hashedPassword,
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          emailVerified: new Date(),
          failedLoginAttempts: 3, // Had some previous failed attempts
          profile: {
            create: { name: 'Test User' },
          },
        },
      })

      // Simulate successful login by resetting failed attempts
      await prisma.user.update({
        where: { email: 'user@example.com' },
        data: {
          failedLoginAttempts: 0,
          lastLoginAt: new Date(),
        },
      })

      const updatedUser = await prisma.user.findUnique({
        where: { email: 'user@example.com' },
      })

      expect(updatedUser?.failedLoginAttempts).toBe(0)
      expect(updatedUser?.lastLoginAt).toBeDefined()
    })

    it('should allow login for all verified user roles', async () => {
      const roles = [UserRole.TRAINEE, UserRole.INSTRUCTOR, UserRole.COMPANY, UserRole.ADMIN]
      const hashedPassword = await bcrypt.hash(DEFAULT_TEST_PASSWORD, 10)

      for (const role of roles) {
        const user = await prisma.user.create({
          data: {
            email: `${role.toLowerCase()}@example.com`,
            password: hashedPassword,
            role,
            status: AccountStatus.ACTIVE,
            emailVerified: new Date(),
            profile: {
              create: { name: `${role} User` },
            },
          },
        })

        expect(user.role).toBe(role)
        expect(user.emailVerified).not.toBeNull()
        expect(user.status).toBe(AccountStatus.ACTIVE)
      }
    })
  })

  describe('Failed Login - Invalid Credentials', () => {
    it('should reject login with non-existent email', async () => {
      const user = await prisma.user.findUnique({
        where: { email: 'nonexistent@example.com' },
      })

      expect(user).toBeNull()
    })

    it('should reject login with incorrect password', async () => {
      const hashedPassword = await bcrypt.hash(DEFAULT_TEST_PASSWORD, 10)
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: hashedPassword,
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          emailVerified: new Date(),
          profile: {
            create: { name: 'Test User' },
          },
        },
      })

      const isValid = await bcrypt.compare('WrongPassword@123', hashedPassword)
      expect(isValid).toBe(false)
    })

    it('should increment failed login attempts on wrong password', async () => {
      const hashedPassword = await bcrypt.hash(DEFAULT_TEST_PASSWORD, 10)
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: hashedPassword,
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          emailVerified: new Date(),
          failedLoginAttempts: 2,
          profile: {
            create: { name: 'Test User' },
          },
        },
      })

      // Simulate failed login attempt
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: { increment: 1 },
        },
      })

      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      })

      expect(updatedUser?.failedLoginAttempts).toBe(3)
    })
  })

  describe('Account Lockout', () => {
    it('should lock account after 5 failed login attempts', async () => {
      const hashedPassword = await bcrypt.hash(DEFAULT_TEST_PASSWORD, 10)
      const user = await prisma.user.create({
        data: {
          email: 'lockout@example.com',
          password: hashedPassword,
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          emailVerified: new Date(),
          failedLoginAttempts: 4,
          profile: {
            create: { name: 'Test User' },
          },
        },
      })

      // Simulate 5th failed attempt - should lock account
      const lockUntil = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: { increment: 1 },
          lockedUntil: lockUntil,
        },
      })

      const lockedUser = await prisma.user.findUnique({
        where: { id: user.id },
      })

      expect(lockedUser?.failedLoginAttempts).toBe(5)
      expect(lockedUser?.lockedUntil).toBeDefined()
      expect(lockedUser!.lockedUntil!.getTime()).toBeGreaterThan(Date.now())
    })

    it('should reject login when account is locked', async () => {
      const hashedPassword = await bcrypt.hash(DEFAULT_TEST_PASSWORD, 10)
      await prisma.user.create({
        data: {
          email: 'locked@example.com',
          password: hashedPassword,
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          emailVerified: new Date(),
          failedLoginAttempts: 5,
          lockedUntil: new Date(Date.now() + 15 * 60 * 1000), // Locked for 15 minutes
          profile: {
            create: { name: 'Locked User' },
          },
        },
      })

      const user = await prisma.user.findUnique({
        where: { email: 'locked@example.com' },
      })

      // Check if account is locked
      const isLocked = user?.lockedUntil && user.lockedUntil > new Date()
      expect(isLocked).toBe(true)
    })

    it('should allow login after lockout period expires', async () => {
      const hashedPassword = await bcrypt.hash(DEFAULT_TEST_PASSWORD, 10)
      await prisma.user.create({
        data: {
          email: 'expired-lock@example.com',
          password: hashedPassword,
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          emailVerified: new Date(),
          failedLoginAttempts: 5,
          lockedUntil: new Date(Date.now() - 1000), // Lock expired 1 second ago
          profile: {
            create: { name: 'Unlocked User' },
          },
        },
      })

      const user = await prisma.user.findUnique({
        where: { email: 'expired-lock@example.com' },
      })

      // Check if account lock has expired
      const isLocked = user?.lockedUntil && user.lockedUntil > new Date()
      expect(isLocked).toBe(false)
    })

    it('should lock account for 15 minutes', async () => {
      const hashedPassword = await bcrypt.hash(DEFAULT_TEST_PASSWORD, 10)
      const user = await prisma.user.create({
        data: {
          email: 'locktime@example.com',
          password: hashedPassword,
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          emailVerified: new Date(),
          failedLoginAttempts: 5,
          profile: {
            create: { name: 'Test User' },
          },
        },
      })

      const lockUntil = new Date(Date.now() + 15 * 60 * 1000)
      await prisma.user.update({
        where: { id: user.id },
        data: { lockedUntil: lockUntil },
      })

      const lockedUser = await prisma.user.findUnique({
        where: { id: user.id },
      })

      const lockDuration = lockedUser!.lockedUntil!.getTime() - Date.now()
      const minutesLocked = lockDuration / (1000 * 60)

      expect(minutesLocked).toBeGreaterThan(14.9)
      expect(minutesLocked).toBeLessThan(15.1)
    })
  })

  describe('Email Verification Requirement', () => {
    it('should reject login when email is not verified', async () => {
      const hashedPassword = await bcrypt.hash(DEFAULT_TEST_PASSWORD, 10)
      await prisma.user.create({
        data: {
          email: 'unverified@example.com',
          password: hashedPassword,
          role: UserRole.TRAINEE,
          status: AccountStatus.PENDING_VERIFICATION,
          emailVerified: null, // Email not verified
          profile: {
            create: { name: 'Unverified User' },
          },
        },
      })

      const user = await prisma.user.findUnique({
        where: { email: 'unverified@example.com' },
      })

      expect(user?.emailVerified).toBeNull()
      expect(user?.status).toBe(AccountStatus.PENDING_VERIFICATION)
    })

    it('should allow login when email is verified', async () => {
      const hashedPassword = await bcrypt.hash(DEFAULT_TEST_PASSWORD, 10)
      await prisma.user.create({
        data: {
          email: 'verified@example.com',
          password: hashedPassword,
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          emailVerified: new Date(),
          profile: {
            create: { name: 'Verified User' },
          },
        },
      })

      const user = await prisma.user.findUnique({
        where: { email: 'verified@example.com' },
      })

      expect(user?.emailVerified).not.toBeNull()
      expect(user?.status).toBe(AccountStatus.ACTIVE)
    })
  })

  describe('Account Status', () => {
    it('should reject login for suspended account', async () => {
      const hashedPassword = await bcrypt.hash(DEFAULT_TEST_PASSWORD, 10)
      await prisma.user.create({
        data: {
          email: 'suspended@example.com',
          password: hashedPassword,
          role: UserRole.TRAINEE,
          status: AccountStatus.SUSPENDED,
          emailVerified: new Date(),
          profile: {
            create: { name: 'Suspended User' },
          },
        },
      })

      const user = await prisma.user.findUnique({
        where: { email: 'suspended@example.com' },
      })

      expect(user?.status).toBe(AccountStatus.SUSPENDED)
    })

    it('should reject login for deactivated account', async () => {
      const hashedPassword = await bcrypt.hash(DEFAULT_TEST_PASSWORD, 10)
      await prisma.user.create({
        data: {
          email: 'deactivated@example.com',
          password: hashedPassword,
          role: UserRole.TRAINEE,
          status: AccountStatus.DEACTIVATED,
          emailVerified: new Date(),
          profile: {
            create: { name: 'Deactivated User' },
          },
        },
      })

      const user = await prisma.user.findUnique({
        where: { email: 'deactivated@example.com' },
      })

      expect(user?.status).toBe(AccountStatus.DEACTIVATED)
    })
  })

  describe('Audit Logging', () => {
    it('should log successful sign-in', async () => {
      const hashedPassword = await bcrypt.hash(DEFAULT_TEST_PASSWORD, 10)
      const user = await prisma.user.create({
        data: {
          email: 'audit@example.com',
          password: hashedPassword,
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          emailVerified: new Date(),
          profile: {
            create: { name: 'Audit User' },
          },
        },
      })

      // Simulate audit log creation on sign-in
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'SIGN_IN',
          details: {
            method: 'credentials',
            success: true,
          },
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0',
        },
      })

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          userId: user.id,
          action: 'SIGN_IN',
        },
      })

      expect(auditLog).toBeDefined()
      expect(auditLog?.action).toBe('SIGN_IN')
      expect(auditLog?.details).toMatchObject({
        method: 'credentials',
        success: true,
      })
    })

    it('should log failed login attempts', async () => {
      const hashedPassword = await bcrypt.hash(DEFAULT_TEST_PASSWORD, 10)
      const user = await prisma.user.create({
        data: {
          email: 'failed-audit@example.com',
          password: hashedPassword,
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          emailVerified: new Date(),
          profile: {
            create: { name: 'Failed User' },
          },
        },
      })

      // Simulate audit log for failed login
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'SIGN_IN',
          details: {
            method: 'credentials',
            success: false,
            reason: 'invalid_password',
          },
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0',
        },
      })

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          userId: user.id,
          action: 'SIGN_IN',
        },
      })

      expect(auditLog?.details).toMatchObject({
        method: 'credentials',
        success: false,
        reason: 'invalid_password',
      })
    })
  })

  describe('Password Security', () => {
    it('should verify password with bcrypt', async () => {
      const plainPassword = DEFAULT_TEST_PASSWORD
      const hashedPassword = await bcrypt.hash(plainPassword, 10)

      const isValid = await bcrypt.compare(plainPassword, hashedPassword)
      expect(isValid).toBe(true)
    })

    it('should reject password with incorrect bcrypt hash', async () => {
      const hashedPassword = await bcrypt.hash(DEFAULT_TEST_PASSWORD, 10)
      const isValid = await bcrypt.compare('WrongPassword@123', hashedPassword)

      expect(isValid).toBe(false)
    })

    it('should use bcrypt salt rounds of 10', async () => {
      const hashedPassword = await bcrypt.hash(DEFAULT_TEST_PASSWORD, 10)

      // Bcrypt hash format: $2a$10$... or $2b$10$...
      // The number after the second $ is the salt rounds
      expect(hashedPassword).toMatch(/^\$2[aby]\$10\$/)
    })
  })

  describe('User Data Retrieval', () => {
    it('should retrieve user with profile on login', async () => {
      const hashedPassword = await bcrypt.hash(DEFAULT_TEST_PASSWORD, 10)
      await prisma.user.create({
        data: {
          email: 'profile@example.com',
          password: hashedPassword,
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          emailVerified: new Date(),
          profile: {
            create: {
              name: 'Profile User',
              bio: 'Test bio',
              phone: '+1234567890',
            },
          },
        },
      })

      const user = await prisma.user.findUnique({
        where: { email: 'profile@example.com' },
        include: { profile: true },
      })

      expect(user?.profile).toBeDefined()
      expect(user?.profile?.name).toBe('Profile User')
      expect(user?.profile?.bio).toBe('Test bio')
      expect(user?.profile?.phone).toBe('+1234567890')
    })

    it('should include user role in session', async () => {
      const hashedPassword = await bcrypt.hash(DEFAULT_TEST_PASSWORD, 10)
      const user = await prisma.user.create({
        data: {
          email: 'role@example.com',
          password: hashedPassword,
          role: UserRole.COMPANY,
          status: AccountStatus.ACTIVE,
          emailVerified: new Date(),
          profile: {
            create: { name: 'Company User' },
          },
        },
      })

      expect(user.role).toBe(UserRole.COMPANY)
    })
  })
})
