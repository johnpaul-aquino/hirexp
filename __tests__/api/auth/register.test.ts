import { describe, it, expect, beforeEach, vi } from 'vitest'
import { POST } from '@/app/api/auth/register/route'
import { prisma } from '@/__tests__/setup/test-db'
import {
  generateRegistrationPayload,
  generateMockUserWithHashedPassword,
  INVALID_PASSWORDS,
} from '@/__tests__/setup/mocks'
import { createMockRequest, getResponseJson } from '@/__tests__/setup/helpers'
import { UserRole, AccountStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

describe('POST /api/auth/register', () => {
  const baseUrl = 'http://localhost:3000/api/auth/register'

  beforeEach(async () => {
    // Clean database is handled by test-db.ts beforeEach hook
    vi.clearAllMocks()
  })

  describe('Successful Registration', () => {
    it('should successfully register a new trainee user', async () => {
      const payload = generateRegistrationPayload({ role: UserRole.TRAINEE })
      const request = createMockRequest(baseUrl, {
        method: 'POST',
        body: payload,
      })

      const response = await POST(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(201)
      expect(data.message).toContain('Registration successful')
      expect(data.user).toBeDefined()
      expect(data.user.email).toBe(payload.email)
      expect(data.user.name).toBe(payload.name)
      expect(data.user.role).toBe(UserRole.TRAINEE)

      // Verify user was created in database
      const createdUser = await prisma.user.findUnique({
        where: { email: payload.email },
        include: { profile: true },
      })

      expect(createdUser).toBeDefined()
      expect(createdUser?.email).toBe(payload.email)
      expect(createdUser?.role).toBe(UserRole.TRAINEE)
      expect(createdUser?.status).toBe(AccountStatus.PENDING_VERIFICATION)
      expect(createdUser?.profile?.name).toBe(payload.name)

      // Verify password was hashed correctly
      const passwordMatch = await bcrypt.compare(
        payload.password,
        createdUser!.password!
      )
      expect(passwordMatch).toBe(true)
    })

    it('should successfully register a company user', async () => {
      const payload = generateRegistrationPayload({ role: UserRole.COMPANY })
      const request = createMockRequest(baseUrl, {
        method: 'POST',
        body: payload,
      })

      const response = await POST(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(201)
      expect(data.user.role).toBe(UserRole.COMPANY)

      const createdUser = await prisma.user.findUnique({
        where: { email: payload.email },
      })

      expect(createdUser?.role).toBe(UserRole.COMPANY)
    })

    it('should successfully register an instructor user', async () => {
      const payload = generateRegistrationPayload({ role: UserRole.INSTRUCTOR })
      const request = createMockRequest(baseUrl, {
        method: 'POST',
        body: payload,
      })

      const response = await POST(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(201)
      expect(data.user.role).toBe(UserRole.INSTRUCTOR)
    })

    it('should create a verification token for the new user', async () => {
      const payload = generateRegistrationPayload()
      const request = createMockRequest(baseUrl, {
        method: 'POST',
        body: payload,
      })

      await POST(request)

      const user = await prisma.user.findUnique({
        where: { email: payload.email },
      })

      const verificationToken = await prisma.verificationToken.findFirst({
        where: { userId: user!.id },
      })

      expect(verificationToken).toBeDefined()
      expect(verificationToken?.email).toBe(payload.email)
      expect(verificationToken?.token).toBeDefined()
      expect(verificationToken?.expires).toBeInstanceOf(Date)
      expect(verificationToken!.expires.getTime()).toBeGreaterThan(Date.now())
    })

    it('should create an audit log entry for registration', async () => {
      const payload = generateRegistrationPayload()
      const request = createMockRequest(baseUrl, {
        method: 'POST',
        body: payload,
      })

      await POST(request)

      const user = await prisma.user.findUnique({
        where: { email: payload.email },
      })

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          userId: user!.id,
          action: 'SIGN_UP',
        },
      })

      expect(auditLog).toBeDefined()
      expect(auditLog?.action).toBe('SIGN_UP')
      expect(auditLog?.details).toMatchObject({
        role: payload.role,
        method: 'credentials',
      })
    })

    it('should convert email to lowercase', async () => {
      const payload = generateRegistrationPayload({
        email: 'TEST@EXAMPLE.COM',
      })
      const request = createMockRequest(baseUrl, {
        method: 'POST',
        body: payload,
      })

      const response = await POST(request)
      const data = await getResponseJson(response)

      expect(data.user.email).toBe('test@example.com')

      const createdUser = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
      })

      expect(createdUser?.email).toBe('test@example.com')
    })
  })

  describe('Validation Errors', () => {
    it('should reject registration with existing email', async () => {
      // Create existing user
      const existingUser = await generateMockUserWithHashedPassword({
        email: 'existing@example.com',
      })
      await prisma.user.create({
        data: {
          ...existingUser,
          profile: {
            create: { name: existingUser.name },
          },
        },
      })

      const payload = generateRegistrationPayload({
        email: 'existing@example.com',
      })
      const request = createMockRequest(baseUrl, {
        method: 'POST',
        body: payload,
      })

      const response = await POST(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(400)
      expect(data.error).toBe('User already exists')
      expect(data.message).toContain('already exists')
    })

    it('should reject registration with invalid email format', async () => {
      const payload = generateRegistrationPayload({
        email: 'invalid-email',
      })
      const request = createMockRequest(baseUrl, {
        method: 'POST',
        body: payload,
      })

      const response = await POST(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation error')
    })

    it('should reject registration with empty email', async () => {
      const payload = generateRegistrationPayload({ email: '' })
      const request = createMockRequest(baseUrl, {
        method: 'POST',
        body: payload,
      })

      const response = await POST(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation error')
      expect(data.message).toContain('Email is required')
    })

    it('should reject password that is too short', async () => {
      const payload = generateRegistrationPayload({
        password: INVALID_PASSWORDS.tooShort,
        confirmPassword: INVALID_PASSWORDS.tooShort,
      })
      const request = createMockRequest(baseUrl, {
        method: 'POST',
        body: payload,
      })

      const response = await POST(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation error')
      expect(data.message).toContain('at least 8 characters')
    })

    it('should reject password without uppercase letter', async () => {
      const payload = generateRegistrationPayload({
        password: INVALID_PASSWORDS.noUppercase,
        confirmPassword: INVALID_PASSWORDS.noUppercase,
      })
      const request = createMockRequest(baseUrl, {
        method: 'POST',
        body: payload,
      })

      const response = await POST(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation error')
      expect(data.message).toContain('uppercase letter')
    })

    it('should reject password without lowercase letter', async () => {
      const payload = generateRegistrationPayload({
        password: INVALID_PASSWORDS.noLowercase,
        confirmPassword: INVALID_PASSWORDS.noLowercase,
      })
      const request = createMockRequest(baseUrl, {
        method: 'POST',
        body: payload,
      })

      const response = await POST(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation error')
      expect(data.message).toContain('lowercase letter')
    })

    it('should reject password without number', async () => {
      const payload = generateRegistrationPayload({
        password: INVALID_PASSWORDS.noNumber,
        confirmPassword: INVALID_PASSWORDS.noNumber,
      })
      const request = createMockRequest(baseUrl, {
        method: 'POST',
        body: payload,
      })

      const response = await POST(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation error')
      expect(data.message).toContain('number')
    })

    it('should reject password without special character', async () => {
      const payload = generateRegistrationPayload({
        password: INVALID_PASSWORDS.noSpecialChar,
        confirmPassword: INVALID_PASSWORDS.noSpecialChar,
      })
      const request = createMockRequest(baseUrl, {
        method: 'POST',
        body: payload,
      })

      const response = await POST(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation error')
      expect(data.message).toContain('special character')
    })

    it('should reject when passwords do not match', async () => {
      const payload = generateRegistrationPayload({
        password: 'Test@12345',
        confirmPassword: 'DifferentPassword@123',
      })
      const request = createMockRequest(baseUrl, {
        method: 'POST',
        body: payload,
      })

      const response = await POST(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation error')
      expect(data.message).toContain('do not match')
    })

    it('should reject name that is too short', async () => {
      const payload = generateRegistrationPayload({ name: 'A' })
      const request = createMockRequest(baseUrl, {
        method: 'POST',
        body: payload,
      })

      const response = await POST(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation error')
      expect(data.message).toContain('at least 2 characters')
    })

    it('should reject name that is too long', async () => {
      const payload = generateRegistrationPayload({
        name: 'A'.repeat(101),
      })
      const request = createMockRequest(baseUrl, {
        method: 'POST',
        body: payload,
      })

      const response = await POST(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation error')
      expect(data.message).toContain('must not exceed 100 characters')
    })

    it('should reject invalid role', async () => {
      const payload = {
        ...generateRegistrationPayload(),
        role: 'INVALID_ROLE',
      }
      const request = createMockRequest(baseUrl, {
        method: 'POST',
        body: payload,
      })

      const response = await POST(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation error')
    })

    it('should reject missing required fields', async () => {
      const payload = {
        email: 'test@example.com',
        // Missing password, confirmPassword, name, role
      }
      const request = createMockRequest(baseUrl, {
        method: 'POST',
        body: payload,
      })

      const response = await POST(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation error')
    })
  })

  describe('Security', () => {
    it('should not return password in response', async () => {
      const payload = generateRegistrationPayload()
      const request = createMockRequest(baseUrl, {
        method: 'POST',
        body: payload,
      })

      const response = await POST(request)
      const data = await getResponseJson(response)

      expect(data.user.password).toBeUndefined()
    })

    it('should hash password using bcrypt', async () => {
      const payload = generateRegistrationPayload()
      const request = createMockRequest(baseUrl, {
        method: 'POST',
        body: payload,
      })

      await POST(request)

      const createdUser = await prisma.user.findUnique({
        where: { email: payload.email },
      })

      // Password should be hashed (not plain text)
      expect(createdUser!.password).not.toBe(payload.password)

      // Password should start with bcrypt hash prefix
      expect(createdUser!.password).toMatch(/^\$2[aby]\$/)

      // Password should be verifiable with bcrypt
      const isValid = await bcrypt.compare(
        payload.password,
        createdUser!.password!
      )
      expect(isValid).toBe(true)
    })
  })

  describe('Data Integrity', () => {
    it('should create user with correct default values', async () => {
      const payload = generateRegistrationPayload()
      const request = createMockRequest(baseUrl, {
        method: 'POST',
        body: payload,
      })

      await POST(request)

      const createdUser = await prisma.user.findUnique({
        where: { email: payload.email },
      })

      expect(createdUser?.status).toBe(AccountStatus.PENDING_VERIFICATION)
      expect(createdUser?.emailVerified).toBeNull()
      expect(createdUser?.failedLoginAttempts).toBe(0)
      expect(createdUser?.lockedUntil).toBeNull()
      expect(createdUser?.createdAt).toBeInstanceOf(Date)
      expect(createdUser?.updatedAt).toBeInstanceOf(Date)
    })

    it('should create profile with user name', async () => {
      const payload = generateRegistrationPayload()
      const request = createMockRequest(baseUrl, {
        method: 'POST',
        body: payload,
      })

      await POST(request)

      const createdUser = await prisma.user.findUnique({
        where: { email: payload.email },
        include: { profile: true },
      })

      expect(createdUser?.profile).toBeDefined()
      expect(createdUser?.profile?.name).toBe(payload.name)
      expect(createdUser?.profile?.userId).toBe(createdUser.id)
    })

    it('should create verification token with 24-hour expiration', async () => {
      const payload = generateRegistrationPayload()
      const request = createMockRequest(baseUrl, {
        method: 'POST',
        body: payload,
      })

      await POST(request)

      const user = await prisma.user.findUnique({
        where: { email: payload.email },
      })

      const token = await prisma.verificationToken.findFirst({
        where: { userId: user!.id },
      })

      const expiresIn =
        token!.expires.getTime() - new Date().getTime()
      const hoursUntilExpiry = expiresIn / (1000 * 60 * 60)

      // Should expire in approximately 24 hours (with small margin for test execution)
      expect(hoursUntilExpiry).toBeGreaterThan(23.9)
      expect(hoursUntilExpiry).toBeLessThan(24.1)
    })
  })
})
