import { PrismaClient } from '@prisma/client'
import { beforeEach, afterEach } from 'vitest'

// Singleton PrismaClient for tests
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.DEBUG === 'true' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

/**
 * Clean up database tables between tests
 * Deletes all records in the correct order to avoid foreign key constraints
 */
export async function cleanupDatabase() {
  const tables = [
    'audit_logs',
    'verification_tokens',
    'password_reset_tokens',
    'sessions',
    'accounts',
    'profiles',
    'users',
  ]

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`)
  }
}

/**
 * Setup database for testing
 * Called before each test to ensure clean state
 */
beforeEach(async () => {
  try {
    await cleanupDatabase()
  } catch (error) {
    console.error('Error cleaning database before test:', error)
  }
})

/**
 * Disconnect Prisma client after all tests
 */
export async function disconnectDatabase() {
  await prisma.$disconnect()
}
