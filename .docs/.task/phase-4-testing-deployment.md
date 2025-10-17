# Phase 4: Testing & Deployment (Week 7-8)

## Overview
Comprehensive testing, performance optimization, security hardening, and production deployment of the AI Chit Chat and AI Mock Call features.

## Prerequisites
- [x] Phase 1-3 completed successfully
- [ ] All features functional in development
- [ ] Testing frameworks installed
- [ ] Production environment configured
- [ ] CI/CD pipeline ready

## Tasks

### 1. Unit Testing (Day 1-2)

#### Test Setup and Configuration
```typescript
// jest.setup.ts
import "@testing-library/jest-dom"
import { TextEncoder, TextDecoder } from "util"
import { fetch } from "cross-fetch"

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any
global.fetch = fetch

// Mock environment variables
process.env.OPENAI_API_KEY = "test-key"
process.env.ELEVENLABS_API_KEY = "test-key"
process.env.DATABASE_URL = "postgresql://test"

// Mock WebRTC
global.RTCPeerConnection = jest.fn()
global.RTCSessionDescription = jest.fn()
global.RTCIceCandidate = jest.fn()
global.MediaStream = jest.fn()

// Mock Audio Context
global.AudioContext = jest.fn(() => ({
  createAnalyser: jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    fftSize: 2048
  })),
  createMediaStreamSource: jest.fn(() => ({
    connect: jest.fn()
  })),
  createScriptProcessor: jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn()
  }))
}))
```

#### Service Layer Tests
```typescript
// __tests__/services/openai.test.ts
import { OpenAIService } from "@/lib/ai/openai"

describe("OpenAI Service", () => {
  let service: OpenAIService

  beforeEach(() => {
    service = new OpenAIService()
  })

  describe("generateSystemPrompt", () => {
    it("generates correct prompt for chit-chat module", () => {
      const prompt = service.generateSystemPrompt({
        module: "chit-chat",
        difficulty: "beginner",
        topic: "Travel"
      })

      expect(prompt).toContain("English conversation partner")
      expect(prompt).toContain("beginner")
      expect(prompt).toContain("Travel")
    })

    it("generates correct prompt for mock-call module", () => {
      const prompt = service.generateSystemPrompt({
        module: "mock-call",
        difficulty: "intermediate",
        topic: "Customer complaint"
      })

      expect(prompt).toContain("call center simulation")
      expect(prompt).toContain("intermediate")
      expect(prompt).toContain("Customer complaint")
    })
  })

  describe("countTokens", () => {
    it("counts tokens correctly", () => {
      const text = "Hello, how are you today?"
      const tokenCount = service.countTokens(text)

      expect(tokenCount).toBeGreaterThan(0)
      expect(tokenCount).toBeLessThan(10)
    })
  })
})
```

#### Store Tests
```typescript
// __tests__/stores/chat-store.test.ts
import { renderHook, act, waitFor } from "@testing-library/react"
import { useChatStore } from "@/stores/chat-store"

// Mock fetch
global.fetch = jest.fn()

describe("Chat Store", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useChatStore.setState({
      currentSession: null,
      sessions: [],
      isRecording: false,
      isProcessing: false
    })
  })

  it("starts a new session", async () => {
    const mockSession = {
      id: "123",
      topic: "Travel",
      difficulty: "beginner"
    }

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockSession
    })

    const { result } = renderHook(() => useChatStore())

    await act(async () => {
      await result.current.startSession("Travel", "beginner")
    })

    expect(result.current.currentSession).toEqual({
      ...mockSession,
      messages: []
    })
  })

  it("sends a message", async () => {
    const mockResponse = {
      message: {
        id: "msg-1",
        content: "AI response",
        role: "assistant"
      },
      audioUrl: "https://example.com/audio.mp3"
    }

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockResponse
    })

    const { result } = renderHook(() => useChatStore())

    // Set current session
    act(() => {
      useChatStore.setState({
        currentSession: {
          id: "123",
          messages: [],
          topic: "Travel",
          difficulty: "beginner"
        } as any
      })
    })

    await act(async () => {
      await result.current.sendMessage("Hello")
    })

    await waitFor(() => {
      expect(result.current.currentSession?.messages).toHaveLength(2)
      expect(result.current.isProcessing).toBe(false)
    })
  })
})
```

### 2. Integration Testing (Day 3-4)

#### API Integration Tests
```typescript
// __tests__/api/integration/chat-flow.test.ts
import { createMocks } from "node-mocks-http"
import { POST as createChat } from "@/app/api/chat/route"
import { POST as sendMessage } from "@/app/api/chat/[sessionId]/messages/route"
import { prisma } from "@/lib/prisma"

jest.mock("@/lib/prisma", () => ({
  prisma: {
    chatSession: {
      create: jest.fn(),
      findUnique: jest.fn()
    },
    chatMessage: {
      create: jest.fn()
    }
  }
}))

describe("Chat API Flow", () => {
  it("completes full chat conversation flow", async () => {
    // Create session
    const { req: createReq, res: createRes } = createMocks({
      method: "POST",
      body: {
        topic: "Travel",
        difficulty: "beginner"
      }
    })

    const mockSession = {
      id: "session-123",
      userId: "user-123",
      topic: "Travel",
      difficulty: "beginner"
    }

    ;(prisma.chatSession.create as jest.Mock).mockResolvedValue(mockSession)

    await createChat(createReq as any)
    const sessionData = JSON.parse(createRes._getData())

    expect(sessionData.id).toBe("session-123")

    // Send message
    const { req: msgReq, res: msgRes } = createMocks({
      method: "POST",
      params: { sessionId: "session-123" },
      body: {
        text: "Hello, I want to practice English"
      }
    })

    ;(prisma.chatSession.findUnique as jest.Mock).mockResolvedValue({
      ...mockSession,
      messages: []
    })

    ;(prisma.chatMessage.create as jest.Mock).mockResolvedValue({
      id: "msg-1",
      content: "Hello! I'd be happy to help you practice English.",
      role: "ASSISTANT"
    })

    await sendMessage(msgReq as any, { params: { sessionId: "session-123" } })
    const messageData = JSON.parse(msgRes._getData())

    expect(messageData.message).toBeDefined()
    expect(messageData.audioUrl).toBeDefined()
  })
})
```

#### WebSocket Integration Tests
```typescript
// __tests__/websocket/call-flow.test.ts
import { io, Socket } from "socket.io-client"
import { createServer } from "http"
import { Server } from "socket.io"

describe("WebSocket Call Flow", () => {
  let serverSocket: Server
  let clientSocket: Socket
  let httpServer: any

  beforeAll((done) => {
    httpServer = createServer()
    serverSocket = new Server(httpServer)
    httpServer.listen(() => {
      const port = httpServer.address().port
      clientSocket = io(`http://localhost:${port}`)

      serverSocket.on("connection", (socket) => {
        socket.on("join_session", ({ sessionId }) => {
          socket.join(`session:${sessionId}`)
        })

        socket.on("audio_chunk", ({ chunk }) => {
          // Process and echo back
          socket.emit("audio_response", {
            chunk: chunk,
            processed: true
          })
        })
      })

      clientSocket.on("connect", done)
    })
  })

  afterAll(() => {
    serverSocket.close()
    clientSocket.close()
    httpServer.close()
  })

  it("handles audio streaming", (done) => {
    clientSocket.emit("join_session", { sessionId: "test-123" })

    clientSocket.on("audio_response", (data) => {
      expect(data.processed).toBe(true)
      expect(data.chunk).toBeDefined()
      done()
    })

    clientSocket.emit("audio_chunk", {
      chunk: Buffer.from("audio-data").toString("base64")
    })
  })
})
```

### 3. End-to-End Testing (Day 5-6)

#### Playwright E2E Tests
```typescript
// e2e/chat-flow.spec.ts
import { test, expect } from "@playwright/test"

test.describe("AI Chit Chat E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/trainee")
    await page.click('text="AI Chit Chat"')
  })

  test("complete chat conversation flow", async ({ page }) => {
    // Select topic
    await page.click('text="General Conversation"')
    await page.selectOption('select[name="difficulty"]', "beginner")
    await page.click('button:has-text("Start Chat")')

    // Wait for chat interface
    await expect(page.locator(".chat-interface")).toBeVisible()

    // Send text message
    await page.fill('input[placeholder="Type your message..."]', "Hello")
    await page.press('input[placeholder="Type your message..."]', "Enter")

    // Wait for AI response
    await expect(page.locator(".assistant-message")).toBeVisible({
      timeout: 10000
    })

    // Test audio recording
    await page.click('button[aria-label="Start recording"]')
    await page.waitForTimeout(2000) // Simulate speaking
    await page.click('button[aria-label="Stop recording"]')

    // Wait for transcription and response
    await expect(page.locator(".assistant-message").nth(1)).toBeVisible({
      timeout: 15000
    })

    // End session
    await page.click('button:has-text("End Session")')

    // Check evaluation
    await expect(page.locator(".evaluation-results")).toBeVisible()
    await expect(page.locator(".overall-score")).toContainText(/\d+%/)
  })

  test("handles network errors gracefully", async ({ page, context }) => {
    // Simulate network failure
    await context.route("**/api/chat/**", (route) => {
      route.abort("failed")
    })

    await page.click('text="General Conversation"')
    await page.click('button:has-text("Start Chat")')

    // Should show error message
    await expect(page.locator(".error-message")).toContainText(
      /Failed to start/i
    )
  })
})
```

#### Mock Call E2E Tests
```typescript
// e2e/call-flow.spec.ts
import { test, expect } from "@playwright/test"

test.describe("AI Mock Call E2E", () => {
  test("complete call flow with evaluation", async ({ page, context }) => {
    // Grant microphone permission
    await context.grantPermissions(["microphone"])

    await page.goto("/dashboard/trainee")
    await page.click('text="AI Mock Call"')

    // Select scenario
    await page.click('text="Customer Support"')
    await page.selectOption('select[name="difficulty"]', "intermediate")
    await page.click('button:has-text("Start Call")')

    // Wait for call to connect
    await expect(page.locator(".call-status")).toContainText(/Connected/i)

    // Simulate call duration
    await page.waitForTimeout(5000)

    // Check real-time transcript
    await expect(page.locator(".call-transcript")).toBeVisible()
    await expect(page.locator(".transcript-entry")).toHaveCount(
      { min: 1 },
      { timeout: 10000 }
    )

    // End call
    await page.click('button:has-text("End Call")')

    // Check evaluation
    await expect(page.locator(".call-evaluation")).toBeVisible()
    await expect(page.locator(".call-metrics")).toContainText(/Handle Time/i)
  })
})
```

### 4. Performance Testing (Day 7-8)

#### Load Testing with k6
```javascript
// k6/load-test.js
import http from "k6/http"
import { check, sleep } from "k6"
import { WebSocket } from "k6/ws"

export const options = {
  stages: [
    { duration: "30s", target: 20 },  // Ramp up to 20 users
    { duration: "1m", target: 20 },   // Stay at 20 users
    { duration: "30s", target: 50 },  // Ramp up to 50 users
    { duration: "2m", target: 50 },   // Stay at 50 users
    { duration: "30s", target: 0 }    // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% of requests under 500ms
    http_req_failed: ["rate<0.1"],    // Error rate under 10%
    ws_connecting: ["p(95)<1000"],    // WebSocket connection under 1s
    ws_msgs_received: ["rate>10"]     // At least 10 messages/second
  }
}

const BASE_URL = "https://staging.hirexp.com"
const WS_URL = "wss://staging.hirexp.com/ws"

export default function() {
  // Test chat session creation
  const createSession = http.post(
    `${BASE_URL}/api/chat`,
    JSON.stringify({
      topic: "General Conversation",
      difficulty: "beginner"
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer test-token"
      }
    }
  )

  check(createSession, {
    "session created": (r) => r.status === 200,
    "has session id": (r) => JSON.parse(r.body).id !== undefined
  })

  if (createSession.status === 200) {
    const sessionId = JSON.parse(createSession.body).id

    // Test message sending
    const sendMessage = http.post(
      `${BASE_URL}/api/chat/${sessionId}/messages`,
      JSON.stringify({
        text: "Hello, this is a test message"
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer test-token"
        }
      }
    )

    check(sendMessage, {
      "message sent": (r) => r.status === 200,
      "response received": (r) => JSON.parse(r.body).message !== undefined,
      "audio generated": (r) => JSON.parse(r.body).audioUrl !== undefined
    })
  }

  // Test WebSocket for calls
  const ws = new WebSocket(`${WS_URL}/call`)

  ws.on("open", () => {
    ws.send(JSON.stringify({
      type: "join_session",
      sessionId: "test-" + Date.now()
    }))
  })

  ws.on("message", (data) => {
    check(data, {
      "ws message received": (d) => d !== null
    })
  })

  ws.setTimeout(() => {
    ws.close()
  }, 5000)

  sleep(1)
}
```

#### Performance Monitoring
```typescript
// lib/monitoring/performance.ts
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map()

  startMeasure(name: string): () => void {
    const start = performance.now()

    return () => {
      const duration = performance.now() - start
      this.recordMetric(name, duration)
    }
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(value)

    // Send to analytics
    this.sendToAnalytics(name, value)
  }

  getMetrics(name: string): {
    avg: number
    p50: number
    p95: number
    p99: number
  } {
    const values = this.metrics.get(name) || []
    if (values.length === 0) return { avg: 0, p50: 0, p95: 0, p99: 0 }

    const sorted = [...values].sort((a, b) => a - b)
    const avg = values.reduce((a, b) => a + b, 0) / values.length

    return {
      avg,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    }
  }

  private sendToAnalytics(name: string, value: number): void {
    // Send to your analytics service
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "timing_complete", {
        name,
        value: Math.round(value),
        event_category: "Performance"
      })
    }
  }
}

export const perfMonitor = new PerformanceMonitor()
```

### 5. Security Hardening (Day 9-10)

#### Security Headers
```typescript
// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security headers
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.openai.com https://api.elevenlabs.io wss://",
      "media-src 'self' blob: https:",
      "frame-src 'none'"
    ].join("; ")
  )

  // CORS headers for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    response.headers.set("Access-Control-Allow-Origin", process.env.NEXTAUTH_URL!)
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ]
}
```

#### Input Validation & Sanitization
```typescript
// lib/security/validation.ts
import { z } from "zod"
import DOMPurify from "isomorphic-dompurify"

export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  })
}

export const validateChatMessage = z.object({
  content: z.string().min(1).max(5000).transform(sanitizeInput),
  audioBlob: z.instanceof(Blob).optional()
})

export const validateSessionCreation = z.object({
  topic: z.enum([
    "General Conversation",
    "Business English",
    "Travel",
    "Technology",
    "Healthcare"
  ]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"])
})

export const validateCallScenario = z.object({
  scenario: z.enum([
    "Customer Support",
    "Technical Support",
    "Sales Call",
    "Appointment Booking",
    "Complaint Handling"
  ]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"])
})
```

#### Rate Limiting
```typescript
// lib/security/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!
})

export const rateLimiter = {
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
    analytics: true
  }),

  chat: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"), // 30 messages per minute
    analytics: true
  }),

  audio: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 audio uploads per minute
    analytics: true
  })
}

// Usage in API route
export async function POST(req: NextRequest) {
  const ip = req.ip || "127.0.0.1"
  const { success, limit, reset, remaining } = await rateLimiter.chat.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": new Date(reset).toISOString()
        }
      }
    )
  }

  // Continue with request processing
}
```

### 6. Deployment Configuration (Day 11-12)

#### Docker Configuration
```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### Docker Compose for Local Testing
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/hirexp
      REDIS_URL: redis://redis:6379
    depends_on:
      - db
      - redis
    networks:
      - hirexp-network

  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: hirexp
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - hirexp-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - hirexp-network

volumes:
  postgres-data:
  redis-data:

networks:
  hirexp-network:
    driver: bridge
```

#### GitHub Actions CI/CD
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test -- --coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Run E2E tests
        run: npx playwright test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'

    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to Production
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            docker pull ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
            docker stop hirexp || true
            docker rm hirexp || true
            docker run -d \
              --name hirexp \
              --restart always \
              -p 80:3000 \
              --env-file .env.production \
              ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
```

### 7. Monitoring & Logging (Day 13-14)

#### Application Monitoring
```typescript
// lib/monitoring/logger.ts
import winston from "winston"
import { Logtail } from "@logtail/node"
import { LogtailTransport } from "@logtail/winston"

const logtail = new Logtail(process.env.LOGTAIL_TOKEN!)

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: "hirexp-ai",
    environment: process.env.NODE_ENV
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new LogtailTransport(logtail)
  ]
})

// Custom error tracking
export function logError(error: Error, context?: any) {
  logger.error({
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  })
}

// Performance logging
export function logPerformance(operation: string, duration: number, metadata?: any) {
  logger.info({
    type: "performance",
    operation,
    duration,
    metadata,
    timestamp: new Date().toISOString()
  })
}

// Usage tracking
export function logUsage(userId: string, feature: string, metadata?: any) {
  logger.info({
    type: "usage",
    userId,
    feature,
    metadata,
    timestamp: new Date().toISOString()
  })
}

export default logger
```

#### Health Check Endpoints
```typescript
// app/api/health/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!
})

export async function GET() {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      database: "unknown",
      redis: "unknown",
      openai: "unknown",
      elevenlabs: "unknown"
    }
  }

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`
    health.services.database = "healthy"
  } catch (error) {
    health.services.database = "unhealthy"
    health.status = "degraded"
  }

  // Check Redis
  try {
    await redis.ping()
    health.services.redis = "healthy"
  } catch (error) {
    health.services.redis = "unhealthy"
    health.status = "degraded"
  }

  // Check OpenAI
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      }
    })
    health.services.openai = response.ok ? "healthy" : "unhealthy"
  } catch (error) {
    health.services.openai = "unhealthy"
    health.status = "degraded"
  }

  // Check ElevenLabs
  try {
    const response = await fetch("https://api.elevenlabs.io/v1/user", {
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY!
      }
    })
    health.services.elevenlabs = response.ok ? "healthy" : "unhealthy"
  } catch (error) {
    health.services.elevenlabs = "unhealthy"
    health.status = "degraded"
  }

  const statusCode = health.status === "healthy" ? 200 : 503

  return NextResponse.json(health, { status: statusCode })
}
```

## Production Checklist

### Pre-Deployment
- [ ] All tests passing (unit, integration, E2E)
- [ ] Performance benchmarks met
- [ ] Security scan completed
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] SSL certificates ready
- [ ] CDN configured
- [ ] Backup strategy defined

### Deployment
- [ ] Database migrations run
- [ ] Redis cache cleared
- [ ] Docker images built
- [ ] Health checks passing
- [ ] Monitoring configured
- [ ] Logging enabled
- [ ] Rate limiting active
- [ ] CORS configured

### Post-Deployment
- [ ] Smoke tests passing
- [ ] Performance metrics normal
- [ ] Error rates acceptable
- [ ] User acceptance testing
- [ ] Rollback plan ready
- [ ] Support team briefed
- [ ] Analytics tracking
- [ ] Customer communication sent

## Success Metrics

### Performance
- Page load time < 3s
- API response time p95 < 500ms
- WebSocket latency < 100ms
- Audio processing < 200ms
- Error rate < 1%

### Reliability
- Uptime > 99.9%
- Zero data loss
- Successful rollback capability
- Auto-scaling functional

### Security
- All OWASP top 10 covered
- PII data encrypted
- Rate limiting effective
- Security headers present

### User Experience
- User satisfaction > 4.5/5
- Task completion rate > 90%
- Support ticket rate < 5%
- Feature adoption > 70%

## Maintenance Plan

### Daily
- Monitor error logs
- Check performance metrics
- Review user feedback
- Verify backups

### Weekly
- Security updates
- Performance analysis
- User behavior analytics
- Team sync meeting

### Monthly
- Dependency updates
- Load testing
- Security audit
- Feature usage review

### Quarterly
- Major updates
- Penetration testing
- Disaster recovery drill
- Technology review