---
name: TDD Writer
description: Write test-driven development tests for HireXp using Vitest, Supertest, React Testing Library, and Playwright
---

# TDD Writer

Build comprehensive test coverage for HireXp using modern testing tools.

## Context

HireXp testing stack:
- **Vitest** - Fast unit test runner
- **React Testing Library** - Component testing
- **Supertest** - API route testing
- **Playwright** - E2E browser testing

## Test-Driven Development Workflow

### TDD Cycle
1. **Red** - Write a failing test
2. **Green** - Write minimal code to pass
3. **Refactor** - Improve code quality
4. **Repeat** - Next feature

## Vitest Configuration

### Setup File

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.next/',
        'vitest.config.ts',
        '**/*.d.ts',
        '**/*.config.js',
        '**/mockData/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

### Setup Configuration

```typescript
// vitest.setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      pathname: '/',
      query: {},
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock environment variables
process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = 'test-cloud';
process.env.NEXTAUTH_SECRET = 'test-secret';
```

## React Testing Library - Component Tests

### Button Component Test

```typescript
// components/ui/button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="default">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');

    rerender(<Button variant="outline">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('border-input');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Form Component Test

```typescript
// components/forms/login-form.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './login-form';

describe('LoginForm', () => {
  it('validates email field', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');
    await user.tab(); // Trigger blur

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
    });
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
  });
});
```

### Hook Testing

```typescript
// hooks/use-audio-recorder.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAudioRecorder } from './use-audio-recorder';

// Mock MediaRecorder
global.MediaRecorder = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  ondataavailable: null,
  onstop: null,
  state: 'inactive',
})) as any;

// Mock getUserMedia
global.navigator.mediaDevices = {
  getUserMedia: vi.fn().mockResolvedValue({
    getTracks: () => [{ stop: vi.fn() }],
  }),
} as any;

describe('useAudioRecorder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts recording', async () => {
    const { result } = renderHook(() => useAudioRecorder());

    expect(result.current.isRecording).toBe(false);

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.isRecording).toBe(true);
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 16000,
      },
    });
  });

  it('stops recording and creates blob', async () => {
    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    await act(async () => {
      result.current.stopRecording();
    });

    await waitFor(() => {
      expect(result.current.isRecording).toBe(false);
    });
  });

  it('clears recording', async () => {
    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.startRecording();
      result.current.stopRecording();
    });

    act(() => {
      result.current.clearRecording();
    });

    expect(result.current.audioBlob).toBeNull();
    expect(result.current.duration).toBe(0);
  });
});
```

## Supertest - API Route Testing

### API Test Setup

```typescript
// tests/helpers/api-test-setup.ts
import { createServer } from 'http';
import { NextRequest } from 'next/server';
import { parse } from 'url';

export function createTestRequest(url: string, options?: RequestInit): NextRequest {
  const parsedUrl = parse(url, true);
  return new NextRequest(new Request(`http://localhost:3000${url}`, options));
}

export function createMockNextRequest(
  method: string,
  url: string,
  body?: any,
  headers?: Record<string, string>
) {
  const request = new NextRequest(
    new Request(`http://localhost:3000${url}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  );
  return request;
}
```

### POST API Route Test

```typescript
// app/api/sessions/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { createMockNextRequest } from '@/tests/helpers/api-test-setup';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    session: {
      create: vi.fn(),
    },
  },
}));

describe('POST /api/sessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a new session', async () => {
    const mockSession = {
      id: '123',
      userId: 'user-1',
      type: 'chat',
      level: 'beginner',
      createdAt: new Date(),
    };

    vi.mocked(prisma.session.create).mockResolvedValue(mockSession as any);

    const request = createMockNextRequest('POST', '/api/sessions', {
      userId: 'user-1',
      type: 'chat',
      level: 'beginner',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockSession);
    expect(prisma.session.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        type: 'chat',
        level: 'beginner',
      },
    });
  });

  it('validates request body', async () => {
    const request = createMockNextRequest('POST', '/api/sessions', {
      userId: 'user-1',
      // Missing required fields
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Validation error');
  });

  it('handles database errors', async () => {
    vi.mocked(prisma.session.create).mockRejectedValue(
      new Error('Database error')
    );

    const request = createMockNextRequest('POST', '/api/sessions', {
      userId: 'user-1',
      type: 'chat',
      level: 'beginner',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
  });
});
```

### GET API Route Test

```typescript
// app/api/sessions/[id]/route.test.ts
import { describe, it, expect, vi } from 'vitest';
import { GET, DELETE } from './route';
import { createMockNextRequest } from '@/tests/helpers/api-test-setup';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    session: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('GET /api/sessions/[id]', () => {
  it('returns session by id', async () => {
    const mockSession = {
      id: '123',
      userId: 'user-1',
      type: 'chat',
      level: 'beginner',
    };

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession as any);

    const request = createMockNextRequest('GET', '/api/sessions/123');
    const params = Promise.resolve({ id: '123' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockSession);
  });

  it('returns 404 for non-existent session', async () => {
    vi.mocked(prisma.session.findUnique).mockResolvedValue(null);

    const request = createMockNextRequest('GET', '/api/sessions/999');
    const params = Promise.resolve({ id: '999' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Session not found');
  });
});

describe('DELETE /api/sessions/[id]', () => {
  it('deletes session', async () => {
    vi.mocked(prisma.session.delete).mockResolvedValue({} as any);

    const request = createMockNextRequest('DELETE', '/api/sessions/123');
    const params = Promise.resolve({ id: '123' });

    const response = await DELETE(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(prisma.session.delete).toHaveBeenCalledWith({
      where: { id: '123' },
    });
  });
});
```

### Authenticated API Route Test

```typescript
// app/api/protected/route.test.ts
import { describe, it, expect, vi } from 'vitest';
import { POST } from './route';
import { createMockNextRequest } from '@/tests/helpers/api-test-setup';
import { verifyJWT } from '@/lib/auth';

vi.mock('@/lib/auth', () => ({
  verifyJWT: vi.fn(),
}));

describe('POST /api/protected', () => {
  it('requires authentication', async () => {
    const request = createMockNextRequest('POST', '/api/protected');

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('validates JWT token', async () => {
    vi.mocked(verifyJWT).mockResolvedValue(null);

    const request = createMockNextRequest('POST', '/api/protected', null, {
      Authorization: 'Bearer invalid-token',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid token');
  });

  it('allows authenticated requests', async () => {
    vi.mocked(verifyJWT).mockResolvedValue({ userId: 'user-1' });

    const request = createMockNextRequest('POST', '/api/protected', null, {
      Authorization: 'Bearer valid-token',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
```

## Integration Tests

### Full Flow Test

```typescript
// tests/integration/ai-chat.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInterface } from '@/components/chat-interface';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.post('/api/ai/chat/message', async () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: 'msg-1',
        content: 'Hello! How can I help you today?',
        role: 'assistant',
      },
    });
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

describe('AI Chat Integration', () => {
  it('completes full chat flow', async () => {
    const user = userEvent.setup();
    render(<ChatInterface sessionId="session-1" />);

    // Type message
    const input = screen.getByPlaceholderText(/type your message/i);
    await user.type(input, 'Hello');

    // Send message
    await user.click(screen.getByRole('button', { name: /send/i }));

    // Wait for response
    await waitFor(() => {
      expect(screen.getByText(/hello! how can i help you today?/i)).toBeInTheDocument();
    });

    // Check message appears in chat
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Playwright - E2E Tests

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Page Object Model

```typescript
// e2e/pages/login-page.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.submitButton = page.getByRole('button', { name: /sign in/i });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async isLoggedIn() {
    return this.page.url().includes('/dashboard');
  }
}
```

### E2E Test Example

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login-page';

test.describe('Authentication Flow', () => {
  test('user can login successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login('user@example.com', 'password123');

    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByText(/welcome/i)).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login('wrong@example.com', 'wrongpassword');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(/invalid credentials/i);
  });

  test('validates email format', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.emailInput.fill('invalid-email');
    await loginPage.passwordInput.click(); // Trigger blur

    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });
});
```

### Complex E2E Flow

```typescript
// e2e/ai-chat.spec.ts
import { test, expect } from '@playwright/test';

test.describe('AI Chat Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('user@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('can start and complete a chat session', async ({ page }) => {
    // Navigate to AI Chat
    await page.getByRole('link', { name: /ai chit chat/i }).click();
    await expect(page).toHaveURL(/.*ai-chat/);

    // Start session
    await page.getByRole('button', { name: /start session/i }).click();

    // Send message
    const input = page.getByPlaceholder(/type your message/i);
    await input.fill('Hello, how are you?');
    await page.keyboard.press('Enter');

    // Wait for AI response
    await expect(page.getByText(/i'm doing well/i)).toBeVisible({ timeout: 10000 });

    // Verify message appears in chat history
    await expect(page.getByText('Hello, how are you?')).toBeVisible();

    // End session
    await page.getByRole('button', { name: /end session/i }).click();

    // Check evaluation appears
    await expect(page.getByText(/session summary/i)).toBeVisible();
  });

  test('can record and send voice messages', async ({ page }) => {
    await page.goto('/dashboard/trainee/ai-chat');

    // Grant microphone permissions
    await page.context().grantPermissions(['microphone']);

    // Start recording
    await page.getByRole('button', { name: /record/i }).click();
    await page.waitForTimeout(2000); // Record for 2 seconds

    // Stop recording
    await page.getByRole('button', { name: /stop/i }).click();

    // Upload audio
    await page.getByRole('button', { name: /send/i }).click();

    // Wait for transcription
    await expect(page.getByText(/transcribing/i)).toBeVisible();
    await expect(page.getByText(/transcribing/i)).not.toBeVisible({ timeout: 10000 });
  });
});
```

## Coverage Configuration

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

### Coverage Thresholds

```typescript
// vitest.config.ts (coverage section)
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov'],
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80,
  },
  exclude: [
    'node_modules/',
    '.next/',
    'vitest.config.ts',
    '**/*.d.ts',
    '**/*.config.js',
    '**/mockData/**',
    'e2e/**',
  ],
}
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:coverage

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Best Practices

### 1. Test Structure (AAA Pattern)

```typescript
it('should do something', () => {
  // Arrange - Setup
  const value = 10;

  // Act - Execute
  const result = doSomething(value);

  // Assert - Verify
  expect(result).toBe(20);
});
```

### 2. Descriptive Test Names

```typescript
// ❌ Bad
it('works', () => {});

// ✅ Good
it('calculates total price including tax', () => {});
it('shows error when email is invalid', () => {});
```

### 3. Test One Thing

```typescript
// ❌ Bad - Testing multiple things
it('login and navigation', async () => {
  await login();
  await navigateToDashboard();
  await createSession();
  await sendMessage();
});

// ✅ Good - Separate tests
it('logs in with valid credentials', async () => {});
it('navigates to dashboard after login', async () => {});
it('creates new session', async () => {});
```

### 4. Use Test Factories

```typescript
// tests/factories/user-factory.ts
export function createMockUser(overrides = {}) {
  return {
    id: 'user-1',
    email: 'user@example.com',
    name: 'Test User',
    role: 'trainee',
    ...overrides,
  };
}

// Usage
const user = createMockUser({ role: 'company' });
```

### 5. Clean Up Side Effects

```typescript
afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

afterAll(() => {
  server.close();
});
```

## Checklist

- [ ] Vitest configured with jsdom
- [ ] React Testing Library setup
- [ ] Supertest for API routes
- [ ] Playwright for E2E tests
- [ ] Test coverage > 80%
- [ ] Page Object Model for E2E
- [ ] CI/CD pipeline configured
- [ ] Mock factories created
- [ ] MSW for API mocking
- [ ] Test data fixtures
- [ ] Accessibility tests included

## Your Task

Ask:
1. Component, API route, or E2E test?
2. What functionality to test?
3. TDD approach (write test first)?
4. Coverage requirements?
5. Specific test scenarios needed?

Then write comprehensive tests following TDD principles.
