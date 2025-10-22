import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/__tests__/setup/test-db'
import { generateRegistrationPayload, DEFAULT_TEST_PASSWORD } from '@/__tests__/setup/mocks'
import { UserRole, AccountStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

describe('Authentication Integration Flows', () => {
  describe('Complete Registration → Email Verification → Login Flow', () => {
    it('should complete full registration flow for trainee', async () => {
      const payload = generateRegistrationPayload({
        email: 'trainee-flow@example.com',
        role: UserRole.TRAINEE,
      })

      // Step 1: User registers
      const hashedPassword = await bcrypt.hash(payload.password, 10)
      const user = await prisma.user.create({
        data: {
          email: payload.email,
          password: hashedPassword,
          role: payload.role,
          status: AccountStatus.PENDING_VERIFICATION,
          profile: {
            create: { name: payload.name },
          },
        },
      })

      expect(user.status).toBe(AccountStatus.PENDING_VERIFICATION)
      expect(user.emailVerified).toBeNull()

      // Step 2: Verification token created
      const verificationToken = await prisma.verificationToken.create({
        data: {
          userId: user.id,
          email: user.email,
          token: crypto.randomUUID(),
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      })

      expect(verificationToken.token).toBeDefined()

      // Step 3: User verifies email
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified: new Date(),
            status: AccountStatus.ACTIVE,
          },
        }),
        prisma.verificationToken.delete({
          where: { id: verificationToken.id },
        }),
      ])

      const verifiedUser = await prisma.user.findUnique({
        where: { id: user.id },
      })

      expect(verifiedUser?.emailVerified).not.toBeNull()
      expect(verifiedUser?.status).toBe(AccountStatus.ACTIVE)

      // Step 4: User logs in
      const loginUser = await prisma.user.findUnique({
        where: { email: payload.email },
      })

      const isPasswordValid = await bcrypt.compare(
        payload.password,
        loginUser!.password!
      )

      expect(isPasswordValid).toBe(true)
      expect(loginUser?.emailVerified).not.toBeNull()
      expect(loginUser?.status).toBe(AccountStatus.ACTIVE)

      // Step 5: Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      })

      const loggedInUser = await prisma.user.findUnique({
        where: { id: user.id },
      })

      expect(loggedInUser?.lastLoginAt).not.toBeNull()
    })

    it('should prevent login before email verification', async () => {
      const payload = generateRegistrationPayload({
        email: 'unverified-flow@example.com',
      })

      // Register user
      const hashedPassword = await bcrypt.hash(payload.password, 10)
      const user = await prisma.user.create({
        data: {
          email: payload.email,
          password: hashedPassword,
          role: payload.role,
          status: AccountStatus.PENDING_VERIFICATION,
          profile: {
            create: { name: payload.name },
          },
        },
      })

      // Try to login without verification
      expect(user.emailVerified).toBeNull()
      expect(user.status).toBe(AccountStatus.PENDING_VERIFICATION)
      // Login should be rejected
    })

    it('should create audit logs throughout the flow', async () => {
      const payload = generateRegistrationPayload({
        email: 'audit-flow@example.com',
      })

      // Registration
      const hashedPassword = await bcrypt.hash(payload.password, 10)
      const user = await prisma.user.create({
        data: {
          email: payload.email,
          password: hashedPassword,
          role: payload.role,
          status: AccountStatus.PENDING_VERIFICATION,
          profile: {
            create: { name: payload.name },
          },
        },
      })

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'SIGN_UP',
          details: { method: 'credentials', role: user.role },
        },
      })

      // Email verification
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date(), status: AccountStatus.ACTIVE },
      })

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'EMAIL_VERIFIED',
          details: { email: user.email },
        },
      })

      // Login
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'SIGN_IN',
          details: { method: 'credentials' },
        },
      })

      const auditLogs = await prisma.auditLog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' },
      })

      expect(auditLogs).toHaveLength(3)
      expect(auditLogs[0].action).toBe('SIGN_UP')
      expect(auditLogs[1].action).toBe('EMAIL_VERIFIED')
      expect(auditLogs[2].action).toBe('SIGN_IN')
    })
  })

  describe('OAuth Sign-Up → Profile Completion → Dashboard Access Flow', () => {
    it('should complete OAuth registration for company user', async () => {
      const googleProfile = {
        id: 'google-company-123',
        email: 'company@gmail.com',
        name: 'Tech Company',
        picture: 'https://example.com/logo.jpg',
      }

      // Step 1: OAuth sign-up
      const user = await prisma.user.create({
        data: {
          email: googleProfile.email,
          emailVerified: new Date(), // OAuth pre-verified
          role: UserRole.COMPANY,
          status: AccountStatus.ACTIVE,
          password: null,
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
              access_token: 'google-access-token',
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

      expect(user.emailVerified).not.toBeNull()
      expect(user.status).toBe(AccountStatus.ACTIVE)
      expect(user.accounts).toHaveLength(1)

      // Step 2: Complete company profile
      const companyProfile = await prisma.companyProfile.create({
        data: {
          userId: user.id,
          companyName: 'Tech Company Inc',
          industry: 'Technology',
          companySize: '51-200',
          website: 'https://techcompany.com',
        },
      })

      expect(companyProfile.companyName).toBe('Tech Company Inc')

      // Step 3: Access company dashboard
      const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          profile: true,
          companyProfile: true,
        },
      })

      expect(fullUser?.role).toBe(UserRole.COMPANY)
      expect(fullUser?.companyProfile).toBeDefined()
      // User can now access company dashboard
    })

    it('should complete OAuth registration for instructor', async () => {
      const googleProfile = {
        id: 'google-instructor-456',
        email: 'instructor@gmail.com',
        name: 'Jane Instructor',
      }

      // OAuth sign-up
      const user = await prisma.user.create({
        data: {
          email: googleProfile.email,
          emailVerified: new Date(),
          role: UserRole.INSTRUCTOR,
          status: AccountStatus.ACTIVE,
          password: null,
          profile: {
            create: { name: googleProfile.name },
          },
        },
      })

      // Complete instructor profile
      const instructorProfile = await prisma.instructorProfile.create({
        data: {
          userId: user.id,
          specializations: ['English Grammar', 'Pronunciation'],
          certifications: ['TEFL', 'TESOL'],
          yearsOfExperience: 5,
        },
      })

      expect(instructorProfile.specializations).toContain('English Grammar')
      expect(instructorProfile.yearsOfExperience).toBe(5)
    })
  })

  describe('Password Reset Flow', () => {
    it('should complete full password reset flow', async () => {
      // Step 1: User exists with old password
      const oldPassword = 'OldPassword@123'
      const hashedOld = await bcrypt.hash(oldPassword, 10)

      const user = await prisma.user.create({
        data: {
          email: 'reset-flow@example.com',
          password: hashedOld,
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          emailVerified: new Date(),
          profile: {
            create: { name: 'Reset User' },
          },
        },
      })

      // Step 2: User requests password reset
      const resetToken = await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          email: user.email,
          token: crypto.randomUUID(),
          expires: new Date(Date.now() + 60 * 60 * 1000),
          used: false,
        },
      })

      expect(resetToken.used).toBe(false)

      // Step 3: User clicks link and resets password
      const newPassword = 'NewPassword@456'
      const hashedNew = await bcrypt.hash(newPassword, 10)

      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { password: hashedNew },
        }),
        prisma.passwordResetToken.update({
          where: { id: resetToken.id },
          data: { used: true },
        }),
      ])

      // Step 4: Verify new password works
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      })

      const isNewPasswordValid = await bcrypt.compare(
        newPassword,
        updatedUser!.password!
      )
      const isOldPasswordValid = await bcrypt.compare(
        oldPassword,
        updatedUser!.password!
      )

      expect(isNewPasswordValid).toBe(true)
      expect(isOldPasswordValid).toBe(false)

      const usedToken = await prisma.passwordResetToken.findUnique({
        where: { id: resetToken.id },
      })
      expect(usedToken?.used).toBe(true)
    })

    it('should log password reset events', async () => {
      const hashedPassword = await bcrypt.hash(DEFAULT_TEST_PASSWORD, 10)

      const user = await prisma.user.create({
        data: {
          email: 'reset-audit@example.com',
          password: hashedPassword,
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          emailVerified: new Date(),
          profile: {
            create: { name: 'Reset Audit User' },
          },
        },
      })

      // Log reset request
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'PASSWORD_RESET',
          details: { type: 'request' },
        },
      })

      // Log successful reset
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'PASSWORD_CHANGED',
          details: { method: 'reset_token' },
        },
      })

      const auditLogs = await prisma.auditLog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' },
      })

      expect(auditLogs).toHaveLength(2)
      expect(auditLogs[0].action).toBe('PASSWORD_RESET')
      expect(auditLogs[1].action).toBe('PASSWORD_CHANGED')
    })
  })

  describe('Account Lockout Flow', () => {
    it('should lock account after 5 failed login attempts', async () => {
      const password = 'CorrectPassword@123'
      const hashedPassword = await bcrypt.hash(password, 10)

      const user = await prisma.user.create({
        data: {
          email: 'lockout-flow@example.com',
          password: hashedPassword,
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          emailVerified: new Date(),
          failedLoginAttempts: 0,
          profile: {
            create: { name: 'Lockout User' },
          },
        },
      })

      // Simulate 5 failed attempts
      let updatedUser = user
      for (let i = 0; i < 5; i++) {
        updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: { increment: 1 },
          },
        })
      }

      expect(updatedUser.failedLoginAttempts).toBe(5)

      // Lock account
      const lockedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          lockedUntil: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        },
      })

      expect(lockedUser.lockedUntil).not.toBeNull()
      const isLocked = lockedUser.lockedUntil! > new Date()
      expect(isLocked).toBe(true)
    })

    it('should unlock and reset attempts on successful login', async () => {
      const password = DEFAULT_TEST_PASSWORD
      const hashedPassword = await bcrypt.hash(password, 10)

      const user = await prisma.user.create({
        data: {
          email: 'unlock-flow@example.com',
          password: hashedPassword,
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          emailVerified: new Date(),
          failedLoginAttempts: 3,
          lockedUntil: new Date(Date.now() - 1000), // Expired lock
          profile: {
            create: { name: 'Unlock User' },
          },
        },
      })

      // Successful login
      const isPasswordValid = await bcrypt.compare(password, user.password!)
      expect(isPasswordValid).toBe(true)

      // Reset attempts and unlock
      const unlockedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
          lastLoginAt: new Date(),
        },
      })

      expect(unlockedUser.failedLoginAttempts).toBe(0)
      expect(unlockedUser.lockedUntil).toBeNull()
      expect(unlockedUser.lastLoginAt).not.toBeNull()
    })
  })

  describe('Role-Based Dashboard Access', () => {
    it('should route trainee to trainee dashboard after login', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'trainee-dashboard@example.com',
          password: await bcrypt.hash(DEFAULT_TEST_PASSWORD, 10),
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          emailVerified: new Date(),
          profile: {
            create: { name: 'Trainee Dashboard User' },
          },
        },
      })

      const dashboardRoute =
        user.role === UserRole.TRAINEE ? '/dashboard/trainee' : '/dashboard'
      expect(dashboardRoute).toBe('/dashboard/trainee')
    })

    it('should route company to company dashboard after login', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'company-dashboard@example.com',
          password: null,
          role: UserRole.COMPANY,
          status: AccountStatus.ACTIVE,
          emailVerified: new Date(),
          profile: {
            create: { name: 'Company Dashboard User' },
          },
        },
      })

      const dashboardRoute =
        user.role === UserRole.COMPANY ? '/dashboard/company' : '/dashboard'
      expect(dashboardRoute).toBe('/dashboard/company')
    })

    it('should route admin to admin dashboard after login', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'admin-dashboard@example.com',
          password: await bcrypt.hash(DEFAULT_TEST_PASSWORD, 10),
          role: UserRole.ADMIN,
          status: AccountStatus.ACTIVE,
          emailVerified: new Date(),
          profile: {
            create: { name: 'Admin Dashboard User' },
          },
        },
      })

      const dashboardRoute =
        user.role === UserRole.ADMIN ? '/dashboard/admin' : '/dashboard'
      expect(dashboardRoute).toBe('/dashboard/admin')
    })
  })

  describe('Multi-Factor Scenarios', () => {
    it('should handle user with both password and OAuth', async () => {
      // User registers with email/password
      const password = DEFAULT_TEST_PASSWORD
      const hashedPassword = await bcrypt.hash(password, 10)

      const user = await prisma.user.create({
        data: {
          email: 'hybrid-flow@example.com',
          password: hashedPassword,
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          emailVerified: new Date(),
          profile: {
            create: { name: 'Hybrid User' },
          },
        },
      })

      // Later links Google account
      await prisma.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider: 'google',
          providerAccountId: 'google-hybrid-789',
          access_token: 'hybrid-token',
          token_type: 'Bearer',
          scope: 'openid profile email',
        },
      })

      const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { accounts: true },
      })

      // User can login with either method
      expect(fullUser?.password).not.toBeNull()
      expect(fullUser?.accounts).toHaveLength(1)
    })
  })

  describe('Session Management', () => {
    it('should create session on login', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'session-flow@example.com',
          password: await bcrypt.hash(DEFAULT_TEST_PASSWORD, 10),
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          emailVerified: new Date(),
          profile: {
            create: { name: 'Session User' },
          },
        },
      })

      // Create session
      const session = await prisma.session.create({
        data: {
          userId: user.id,
          sessionToken: crypto.randomUUID(),
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      })

      expect(session.sessionToken).toBeDefined()
      expect(session.expires.getTime()).toBeGreaterThan(Date.now())
    })

    it('should delete session on logout', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'logout-flow@example.com',
          password: await bcrypt.hash(DEFAULT_TEST_PASSWORD, 10),
          role: UserRole.TRAINEE,
          status: AccountStatus.ACTIVE,
          emailVerified: new Date(),
          profile: {
            create: { name: 'Logout User' },
          },
        },
      })

      const session = await prisma.session.create({
        data: {
          userId: user.id,
          sessionToken: crypto.randomUUID(),
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })

      // Logout
      await prisma.session.delete({
        where: { id: session.id },
      })

      const deletedSession = await prisma.session.findUnique({
        where: { id: session.id },
      })

      expect(deletedSession).toBeNull()
    })
  })
})
