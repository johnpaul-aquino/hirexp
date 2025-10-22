import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll, vi } from 'vitest'

// Clean up after each test
afterEach(() => {
  cleanup()
})

// Mock environment variables for testing
beforeAll(() => {
  process.env.NEXTAUTH_URL = 'http://localhost:3000'
  process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing-only'
  process.env.DATABASE_URL = 'postgresql://hirexp:hirexp_dev_password@localhost:5432/hirexp_test?schema=public'
  process.env.REDIS_URL = 'redis://localhost:6379'
  process.env.NODE_ENV = 'test'
})

// Global mocks
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  redirect: vi.fn(),
}))

// Mock next-auth
vi.mock('next-auth', () => ({
  default: vi.fn(),
}))

vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  useSession: vi.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock nodemailer
vi.mock('nodemailer', () => ({
  createTransport: vi.fn(() => ({
    sendMail: vi.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  })),
}))

// Mock cloudinary
vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload: vi.fn().mockResolvedValue({
        secure_url: 'https://test.cloudinary.com/test-image.jpg',
        public_id: 'test-public-id',
      }),
    },
  },
}))

afterAll(() => {
  vi.clearAllMocks()
})
