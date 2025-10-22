import { NextRequest } from 'next/server'
import { headers } from 'next/headers'

/**
 * Create a mock NextRequest for testing API routes
 */
export function createMockRequest(
  url: string,
  options: {
    method?: string
    body?: any
    headers?: Record<string, string>
  } = {}
): NextRequest {
  const { method = 'GET', body, headers: customHeaders = {} } = options

  const request = new NextRequest(url, {
    method,
    headers: new Headers({
      'Content-Type': 'application/json',
      ...customHeaders,
    }),
    body: body ? JSON.stringify(body) : undefined,
  })

  return request
}

/**
 * Create mock session for authenticated requests
 */
export function createMockSession(user: {
  id: string
  email: string
  role: string
  emailVerified?: Date | null
}) {
  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified || new Date(),
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }
}

/**
 * Extract JSON from Response object
 */
export async function getResponseJson(response: Response) {
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch (error) {
    throw new Error(`Failed to parse response as JSON: ${text}`)
  }
}

/**
 * Wait for a promise to resolve or timeout
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ])
}

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Mock headers for Next.js
 */
export function mockHeaders(headerValues: Record<string, string>) {
  return () => {
    const headerMap = new Map(Object.entries(headerValues))
    return {
      get: (name: string) => headerMap.get(name.toLowerCase()) || null,
      has: (name: string) => headerMap.has(name.toLowerCase()),
      forEach: (callback: (value: string, key: string) => void) => {
        headerMap.forEach((value, key) => callback(value, key))
      },
    }
  }
}
