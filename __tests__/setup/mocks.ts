import { faker } from '@faker-js/faker'
import bcrypt from 'bcryptjs'
import { UserRole, AccountStatus } from '@prisma/client'

/**
 * Generate mock user data
 */
export function generateMockUser(overrides: Partial<{
  id: string
  email: string
  password: string
  role: UserRole
  emailVerified: Date | null
  status: AccountStatus
}> = {}) {
  const defaultPassword = 'Test@12345'

  return {
    id: overrides.id ?? faker.string.uuid(),
    email: overrides.email ?? faker.internet.email().toLowerCase(),
    password: overrides.password ?? defaultPassword,
    role: overrides.role ?? UserRole.TRAINEE,
    emailVerified: overrides.emailVerified ?? null,
    status: overrides.status ?? AccountStatus.PENDING_VERIFICATION,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

/**
 * Generate mock user name for profile
 */
export function generateMockUserName(): string {
  return faker.person.fullName()
}

/**
 * Generate mock user with hashed password (for database insertion)
 */
export async function generateMockUserWithHashedPassword(overrides: Partial<{
  id: string
  email: string
  password: string
  role: UserRole
  emailVerified: Date | null
  status: AccountStatus
}> = {}) {
  const user = generateMockUser(overrides)
  const hashedPassword = await bcrypt.hash(user.password, 10)

  return {
    ...user,
    password: hashedPassword,
  }
}

/**
 * Generate mock profile data
 */
export function generateMockProfile(userId: string, overrides: Partial<{
  firstName: string
  lastName: string
  phone: string
  avatar: string
  bio: string
}> = {}) {
  return {
    userId,
    firstName: overrides.firstName ?? faker.person.firstName(),
    lastName: overrides.lastName ?? faker.person.lastName(),
    phone: overrides.phone ?? faker.phone.number(),
    avatar: overrides.avatar ?? faker.image.avatar(),
    bio: overrides.bio ?? faker.lorem.paragraph(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

/**
 * Generate mock verification token
 */
export function generateMockVerificationToken(overrides: Partial<{
  identifier: string
  token: string
  expires: Date
}> = {}) {
  return {
    identifier: overrides.identifier ?? faker.internet.email(),
    token: overrides.token ?? faker.string.uuid(),
    expires: overrides.expires ?? new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
  }
}

/**
 * Generate mock session data
 */
export function generateMockSession(userId: string, overrides: Partial<{
  sessionToken: string
  expires: Date
}> = {}) {
  return {
    userId,
    sessionToken: overrides.sessionToken ?? faker.string.uuid(),
    expires: overrides.expires ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  }
}

/**
 * Generate mock OAuth account
 */
export function generateMockAccount(userId: string, overrides: Partial<{
  type: string
  provider: string
  providerAccountId: string
  access_token: string
  refresh_token: string
  expires_at: number
}> = {}) {
  return {
    userId,
    type: overrides.type ?? 'oauth',
    provider: overrides.provider ?? 'google',
    providerAccountId: overrides.providerAccountId ?? faker.string.uuid(),
    access_token: overrides.access_token ?? faker.string.alphanumeric(40),
    refresh_token: overrides.refresh_token ?? faker.string.alphanumeric(40),
    expires_at: overrides.expires_at ?? Math.floor(Date.now() / 1000) + 3600,
    token_type: 'Bearer',
    scope: 'openid profile email',
  }
}

/**
 * Generate mock audit log entry
 */
export function generateMockAuditLog(overrides: Partial<{
  userId: string
  action: string
  ipAddress: string
  userAgent: string
  metadata: any
}> = {}) {
  return {
    id: faker.string.uuid(),
    userId: overrides.userId ?? faker.string.uuid(),
    action: overrides.action ?? 'SIGN_IN',
    ipAddress: overrides.ipAddress ?? faker.internet.ip(),
    userAgent: overrides.userAgent ?? faker.internet.userAgent(),
    metadata: overrides.metadata ?? {},
    createdAt: new Date(),
  }
}

/**
 * Generate registration request payload
 */
export function generateRegistrationPayload(overrides: Partial<{
  email: string
  password: string
  confirmPassword: string
  name: string
  role: UserRole
}> = {}) {
  const password = overrides.password ?? 'Test@12345'

  return {
    email: overrides.email ?? faker.internet.email().toLowerCase(),
    password,
    confirmPassword: overrides.confirmPassword ?? password,
    name: overrides.name ?? faker.person.fullName(),
    role: overrides.role ?? UserRole.TRAINEE,
  }
}

/**
 * Generate login request payload
 */
export function generateLoginPayload(overrides: Partial<{
  email: string
  password: string
}> = {}) {
  return {
    email: overrides.email ?? faker.internet.email().toLowerCase(),
    password: overrides.password ?? 'Test@12345',
  }
}

/**
 * Generate password reset request payload
 */
export function generatePasswordResetPayload(overrides: Partial<{
  email: string
}> = {}) {
  return {
    email: overrides.email ?? faker.internet.email().toLowerCase(),
  }
}

/**
 * Generate new password payload
 */
export function generateNewPasswordPayload(overrides: Partial<{
  token: string
  password: string
  confirmPassword: string
}> = {}) {
  const password = overrides.password ?? 'NewTest@12345'

  return {
    token: overrides.token ?? faker.string.uuid(),
    password,
    confirmPassword: overrides.confirmPassword ?? password,
  }
}

/**
 * Mock Redis client for rate limiting tests
 */
export function createMockRedis() {
  const store = new Map<string, { value: number; expiry: number }>()

  return {
    incr: async (key: string) => {
      const item = store.get(key)
      const newValue = item ? item.value + 1 : 1
      const expiry = item?.expiry ?? Date.now() + 60000
      store.set(key, { value: newValue, expiry })
      return newValue
    },
    expire: async (key: string, seconds: number) => {
      const item = store.get(key)
      if (item) {
        store.set(key, { ...item, expiry: Date.now() + seconds * 1000 })
      }
      return 1
    },
    get: async (key: string) => {
      const item = store.get(key)
      if (!item) return null
      if (Date.now() > item.expiry) {
        store.delete(key)
        return null
      }
      return item.value.toString()
    },
    del: async (key: string) => {
      store.delete(key)
      return 1
    },
    flushall: async () => {
      store.clear()
      return 'OK'
    },
  }
}

/**
 * Default test password (meets all requirements)
 */
export const DEFAULT_TEST_PASSWORD = 'Test@12345'

/**
 * Invalid passwords for testing validation
 */
export const INVALID_PASSWORDS = {
  tooShort: 'Test@1',
  noUppercase: 'test@12345',
  noLowercase: 'TEST@12345',
  noNumber: 'Test@test',
  noSpecialChar: 'Test12345',
}
