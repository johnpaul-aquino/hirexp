# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HireXp is a landing page for an AI-powered English training platform that connects job seekers with call center companies. The platform offers free training to job seekers while providing companies with pre-trained, job-ready talent. This is a Next.js 15 marketing website built with React 19, TypeScript, and Tailwind CSS.

## Development Commands

```bash
# Development server (uses Turbo mode)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Architecture & Key Concepts

### App Structure (Next.js 15 App Router)

The project uses Next.js 15's App Router with the following page structure:

- **`app/page.tsx`** - Homepage with hero, stats, job seekers section, companies section, how-it-works, FAQ
- **`app/trainees/page.tsx`** - Job seekers landing page
- **`app/companies/page.tsx`** - Companies landing page
- **`app/dashboard/trainee/page.tsx`** - Trainee dashboard with progress tracking and 5 training modules
- **`app/dashboard/company/page.tsx`** - Company dashboard with candidate pool and analytics
- **`app/layout.tsx`** - Root layout with global Navigation component

### Dashboard System

The platform includes comprehensive dashboard interfaces for both trainees and companies. See **DASHBOARDS.md** for complete documentation.

**Key Features:**
- **Trainee Dashboard**: Progress tracking, 5 training modules (English Assessments, AI Chat, AI Interview, Typing Test, Mock Call), performance insights, certificate progress
- **Company Dashboard**: Candidate pool browsing, filtering/search, hiring analytics, performance metrics
- **Shared Components**: StatCard, ModuleCard, ProgressRing, ActivityItem, CandidateCard, Sidebar
- **Mock Data**: Static demo data in `lib/mock-data.ts` aligned with `course-overview.md`

**Access URLs:**
- `/dashboard` - Portal selector page
- `/dashboard/trainee` - Job seeker dashboard
- `/dashboard/company` - Company dashboard

### Navigation System

The Navigation component (`components/navigation.tsx`) is a complex glassmorphic navbar with:

- **Active state tracking**: Tracks both URL-based routes AND scroll-based section visibility on homepage
- **Dual activation logic**:
  - `/trainees` link activates when on `/trainees` page OR when `#job-seekers` section is in view on homepage
  - `/companies` link activates when on `/companies` page OR when `#companies` section is in view on homepage
  - Anchor links (`/#how-it-works`, `/#faq`) activate when scrolled to those sections on ANY page
- **Fixed glassmorphic design**: Positioned at top with `backdrop-blur-xl`, rounded-full border, gradient effects
- **3-column grid layout**: Logo (left), nav items (center), CTA button (right)
- **Mobile menu**: Slide-in panel from right with backdrop blur
- **Waitlist modal**: Dialog that routes users to job seeker or company signup sections

### UI Component System

Uses shadcn/ui components (New York style) with MagicUI registry integration:

- **Component config**: `components.json` defines style, paths, and MagicUI registry
- **Theme system**: HSL-based CSS variables in `globals.css` for light/dark mode
- **Path aliases**: `@/` maps to project root via `tsconfig.json`
- **MagicUI components**: Animated UI components from `@magicui` registry (AuroraText, BorderBeam, ShineBorder, LightRays, etc.)

### Animation & Effects

Extensive use of Framer Motion for:

- **Layout animations**: Smooth page entry animations with staggered delays
- **Scroll-based animations**: `whileInView` for section reveals
- **Hover effects**: Interactive cards with `whileHover` scale transforms
- **Navigation**: Active state indicator with `layoutId="activeNav"` for smooth transitions

Custom keyframe animations defined in `globals.css` and `tailwind.config.ts`:

- `marquee`, `ripple`, `meteor`, `shine`, `aurora`, `orbit`, etc.
- MagicUI components use these via Tailwind animation utilities

### Section-Based Color Transitions

Homepage sections use dynamic background gradients that activate on scroll:

- `#job-seekers` section: Blue/purple gradient when in view
- `#companies` section: Orange/red gradient when in view
- Uses `useEffect` with scroll listeners and `getBoundingClientRect()` to track section visibility

### Design System

- **Base color**: Neutral (from shadcn)
- **CSS Variables**: Uses HSL color system for theme consistency
- **Border radius**: Configurable via `--radius` variable
- **Glassmorphism**: Extensively used in Navigation with `backdrop-blur-xl` and semi-transparent backgrounds
- **Gradient effects**: Multi-color gradients for text (AuroraText), borders (ShineBorder), and backgrounds

## Business Context

The platform has a two-sided marketplace model documented in `course-overview.md`:

### For Job Seekers (Free Training):
1. English Assessments - Reading, grammar, figures of speech
2. AI Chat-Chat - Text/voice conversations with AI
3. AI Interview - Simulated job interviews
4. Typing Test - WPM and accuracy tracking
5. AI Mock Call - Customer service simulations

### For Companies:
- Access to pre-trained candidates
- 70% reduction in training costs
- Verified skills and performance data
- Faster time-to-productivity

## Important Implementation Details

### Scroll-Based Section Detection

When implementing scroll detection for navigation active states or section transitions:

```typescript
const scrollPosition = window.scrollY + window.innerHeight / 2 // Center of viewport
const { top, bottom } = element.getBoundingClientRect()
const absoluteTop = top + window.scrollY
const absoluteBottom = bottom + window.scrollY

if (scrollPosition >= absoluteTop && scrollPosition < absoluteBottom) {
  // Section is active
}
```

### Active Navigation Link Logic

Navigation items use complex active state detection that considers:
1. Current route pathname
2. Scroll position on homepage
3. Section IDs (job-seekers, companies, how-it-works, faq)

When adding new navigation items, ensure `isActive()` function in `navigation.tsx` accounts for all activation scenarios.

### Adding New UI Components

When adding shadcn/ui or MagicUI components:

```bash
# shadcn components
npx shadcn@latest add [component-name]

# MagicUI components are configured in components.json
# They use the @magicui registry
```

Components go in `components/ui/` and can be imported via `@/components/ui/[name]`.

### Styling Patterns

- Use `className` with Tailwind utilities
- Prefer HSL color variables: `bg-background`, `text-foreground`, `border-border`
- For animations, combine Framer Motion with Tailwind animations
- Glassmorphism pattern: `bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20`

## Common Pitfalls

1. **Navigation active states**: Don't forget both route-based AND section-based activation logic
2. **Section IDs**: Ensure homepage sections have correct `id` attributes for anchor navigation
3. **Mobile menu**: Close mobile menu on route changes (handled via `useEffect` in Navigation)
4. **Scroll listeners**: Clean up event listeners in `useEffect` return functions
5. **Framer Motion**: Use `viewport={{ once: true }}` for scroll animations to prevent re-triggering

## File Organization

- **`app/`** - Next.js pages and layouts
- **`components/`** - Reusable React components
- **`components/ui/`** - shadcn/ui and MagicUI components
- **`lib/`** - Utility functions (e.g., `utils.ts` with `cn()` helper)
- **`.claude/agents/`** - Custom agent configurations for Claude Code
- **`__tests__/`** - Test files organized by feature/module
- In our development use hooks and store pattern, we will use zustand

## Testing Strategy (TDD)

HireXp follows Test-Driven Development (TDD) principles to ensure code quality, reliability, and maintainability. All features should have comprehensive test coverage before being merged to the main branch.

### Testing Philosophy

1. **Write Tests First**: Before implementing a feature, write tests that define the expected behavior
2. **Red-Green-Refactor**: Write failing test → Make it pass → Refactor code
3. **Comprehensive Coverage**: Aim for >80% code coverage, especially for critical paths like authentication
4. **Test All Layers**: Unit tests, integration tests, and end-to-end tests
5. **Mock External Dependencies**: Use mocks for third-party services (email, OAuth, Redis, Cloudinary)

### Testing Tools & Framework

- **Vitest**: Fast, Vite-powered testing framework (Jest-compatible API)
- **React Testing Library**: Component testing with user-centric queries
- **@testing-library/user-event**: Realistic user interaction simulation
- **Supertest**: HTTP API endpoint testing
- **@faker-js/faker**: Generate realistic mock data
- **Happy-DOM**: Lightweight DOM implementation for Node

### Test Commands

```bash
# Run tests in watch mode (interactive)
npm test

# Run all tests once
npm run test:run

# Run tests with UI (visual debugging)
npm run test:ui

# Generate coverage report
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Test File Organization

Tests are organized in `__tests__/` directory mirroring the app structure:

```
__tests__/
├── setup/                  # Test configuration and utilities
│   ├── vitest.setup.ts    # Global test setup and mocks
│   ├── test-db.ts         # Database utilities and cleanup
│   ├── helpers.ts         # Test helper functions
│   └── mocks.ts           # Mock data factories
├── api/                   # API route tests
│   ├── auth/             # Authentication API tests
│   │   ├── register.test.ts
│   │   ├── login.test.ts
│   │   ├── verify-email.test.ts
│   │   ├── reset-password.test.ts
│   │   └── oauth.test.ts
│   └── admin/            # Admin API tests
├── middleware/           # Middleware tests
│   ├── auth.test.ts
│   └── permissions.test.ts
├── lib/                  # Library/utility tests
│   ├── rate-limit.test.ts
│   └── audit-log.test.ts
├── components/           # Component tests
│   └── ui/
├── integration/          # Integration tests
│   ├── registration-flow.test.ts
│   ├── login-flow.test.ts
│   └── permission-matrix.test.ts
└── e2e/                  # End-to-end tests (Playwright)
```

### Test Database Strategy

- **Separate Test Database**: Use dedicated `hirexp_test` database (PostgreSQL)
- **Clean State**: Database is cleaned before each test using `TRUNCATE TABLE ... CASCADE`
- **Transaction Rollback**: For integration tests, use Prisma transactions
- **Seeding**: Create only necessary data for each test (avoid global seeds)
- **Isolation**: Tests should not depend on execution order

**Environment Variables for Testing:**

```bash
DATABASE_URL="postgresql://hirexp:hirexp_dev_password@localhost:5432/hirexp_test?schema=public"
REDIS_URL="redis://localhost:6379"
NODE_ENV="test"
```

### Mock Data Patterns

Use factory functions from `__tests__/setup/mocks.ts` to generate test data:

```typescript
import {
  generateMockUser,
  generateRegistrationPayload,
  generateLoginPayload,
  DEFAULT_TEST_PASSWORD,
  INVALID_PASSWORDS,
} from '@/__tests__/setup/mocks'

// Create mock user for tests
const user = generateMockUser({
  role: UserRole.TRAINEE,
  emailVerified: new Date()
})

// Create registration payload with defaults
const payload = generateRegistrationPayload()

// Override specific fields
const companyPayload = generateRegistrationPayload({
  role: UserRole.COMPANY,
  email: 'company@example.com'
})
```

**Available Mock Factories:**

- `generateMockUser()` - User data
- `generateMockUserWithHashedPassword()` - User with bcrypt-hashed password
- `generateMockProfile()` - User profile data
- `generateMockVerificationToken()` - Email verification token
- `generateMockSession()` - Session data
- `generateRegistrationPayload()` - Registration request body
- `generateLoginPayload()` - Login request body
- `createMockRedis()` - Mock Redis client for rate limiting tests

### Test Categories & Coverage Requirements

#### 1. API Route Tests (80%+ coverage)

Test all API endpoints under `app/api/`:

**What to Test:**
- ✅ Successful requests with valid data
- ✅ All validation errors (Zod schema violations)
- ✅ Authentication/authorization checks
- ✅ Database operations (create, read, update, delete)
- ✅ Error handling and error messages
- ✅ Status codes (200, 201, 400, 401, 403, 404, 500)
- ✅ Response data structure
- ✅ Side effects (audit logs, email triggers, token creation)

**Example Test Structure:**

```typescript
describe('POST /api/auth/register', () => {
  describe('Successful Registration', () => {
    it('should successfully register a new trainee user')
    it('should create verification token')
    it('should create audit log entry')
  })

  describe('Validation Errors', () => {
    it('should reject duplicate email')
    it('should reject invalid password format')
    it('should reject passwords that do not match')
  })

  describe('Security', () => {
    it('should hash password using bcrypt')
    it('should not return password in response')
  })
})
```

#### 2. Authentication & Authorization Tests (90%+ coverage)

Critical security features require highest coverage:

**What to Test:**
- ✅ User registration with all roles (TRAINEE, INSTRUCTOR, COMPANY, ADMIN)
- ✅ Login with credentials (email + password)
- ✅ OAuth login (Google)
- ✅ Email verification flow
- ✅ Password reset flow
- ✅ Account lockout after 5 failed attempts
- ✅ 15-minute lockout duration
- ✅ Session management
- ✅ JWT token generation and validation
- ✅ Role-based access control (RBAC)
- ✅ Permission matrix for all 4 roles
- ✅ Audit logging for all auth events

#### 3. Middleware Tests (80%+ coverage)

Test Next.js middleware for route protection:

**What to Test:**
- ✅ Authentication middleware (requires valid session)
- ✅ Role-based route protection
- ✅ Redirect to login for unauthenticated users
- ✅ Redirect to appropriate dashboard after login
- ✅ Permission checks for protected actions

#### 4. Rate Limiting Tests (80%+ coverage)

Test rate limiting for all protected endpoints:

**What to Test:**
- ✅ Registration: 3 requests per hour
- ✅ Login: 5 requests per minute
- ✅ Password reset: 3 requests per hour
- ✅ Email verification: 3 requests per hour
- ✅ IP-based rate limiting
- ✅ User-based rate limiting (after authentication)
- ✅ Rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining)
- ✅ 429 status code when limit exceeded

#### 5. Component Tests (70%+ coverage)

Test React components with React Testing Library:

**What to Test:**
- ✅ Component renders correctly
- ✅ Props are applied correctly
- ✅ User interactions (clicks, form inputs)
- ✅ Conditional rendering
- ✅ Loading states
- ✅ Error states
- ✅ Accessibility (aria labels, keyboard navigation)

**Example Component Test:**

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { LoginForm } from '@/components/auth/login-form'

describe('LoginForm', () => {
  it('should render email and password fields', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('should show validation errors on submit', async () => {
    render(<LoginForm />)
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
  })
})
```

#### 6. Integration Tests (70%+ coverage)

Test complete user flows across multiple components/APIs:

**What to Test:**
- ✅ Complete registration → email verification → login flow
- ✅ OAuth sign-up → profile completion → dashboard access
- ✅ Password reset request → email → token validation → password update
- ✅ Role-based dashboard access
- ✅ Company viewing trainee profiles
- ✅ Trainee completing training modules

### Mocking Strategy

#### External Services to Mock:

1. **NextAuth**: Mock `signIn`, `signOut`, `useSession`
2. **Email (Nodemailer)**: Mock `sendMail` to avoid sending real emails
3. **Cloudinary**: Mock `uploader.upload` for file uploads
4. **Redis**: Use in-memory mock for rate limiting tests
5. **Next.js Navigation**: Mock `useRouter`, `redirect`, `usePathname`

**Global Mocks** (in `vitest.setup.ts`):

```typescript
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  useSession: vi.fn(() => ({ data: null, status: 'unauthenticated' })),
}))

vi.mock('nodemailer', () => ({
  createTransport: vi.fn(() => ({
    sendMail: vi.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  })),
}))
```

### Writing Good Tests

#### ✅ DO:

- **Use descriptive test names**: `it('should reject login when account is locked')`
- **Follow AAA pattern**: Arrange → Act → Assert
- **Test one thing per test**: Each `it()` should verify one behavior
- **Use data-testid sparingly**: Prefer semantic queries (`getByRole`, `getByLabelText`)
- **Test user behavior, not implementation**: Focus on what users see/do
- **Clean up after tests**: Use `afterEach` hooks for cleanup
- **Mock external dependencies**: Don't make real API calls or send real emails
- **Use TypeScript**: Type your test data and assertions

#### ❌ DON'T:

- **Don't test implementation details**: Avoid testing internal state or private methods
- **Don't make tests dependent**: Each test should be independently runnable
- **Don't use random data without seeds**: Use faker with consistent seeds for reproducible tests
- **Don't skip cleanup**: Always clean database after tests
- **Don't test third-party libraries**: Trust that React, Next.js, Prisma work correctly
- **Don't use `any` type**: Be explicit about types in tests

### Coverage Requirements

- **Authentication features**: >90% coverage (critical security)
- **API routes**: >80% coverage
- **Middleware**: >80% coverage
- **Components**: >70% coverage
- **Utility functions**: >80% coverage
- **Overall project**: >75% coverage

### Running Coverage Report

```bash
npm run test:coverage
```

This generates an HTML report in `coverage/` directory. Open `coverage/index.html` to view detailed coverage by file.

### CI/CD Integration

Tests run automatically on:

1. **Pre-commit**: Run relevant tests for changed files
2. **Pull Request**: Run full test suite before merge
3. **Main Branch**: Run tests + coverage check
4. **Deployment**: Require tests to pass before deploying

**GitHub Actions Workflow** (`.github/workflows/test.yml`):

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### Test-Driven Development Workflow

1. **Write the test first** (it should fail - Red)
   ```typescript
   it('should verify email with valid token', async () => {
     // Test code here - will fail because feature doesn't exist yet
   })
   ```

2. **Implement minimum code to pass the test** (Green)
   ```typescript
   // Implement just enough to make the test pass
   ```

3. **Refactor while keeping tests green**
   ```typescript
   // Improve code structure, performance, readability
   // Tests ensure nothing breaks
   ```

4. **Repeat for next feature**

### Common Testing Patterns

#### Testing API Routes:

```typescript
import { createMockRequest } from '@/__tests__/setup/helpers'

const request = createMockRequest('http://localhost:3000/api/auth/register', {
  method: 'POST',
  body: { email: 'test@example.com', password: 'Test@12345' }
})

const response = await POST(request)
expect(response.status).toBe(201)
```

#### Testing with Database:

```typescript
import { prisma } from '@/__tests__/setup/test-db'

// Database is automatically cleaned before each test
const user = await prisma.user.create({ data: {...} })
expect(user.email).toBe('test@example.com')
// Cleanup happens automatically after test
```

#### Testing Protected Routes:

```typescript
import { createMockSession } from '@/__tests__/setup/helpers'

const session = createMockSession({
  id: 'user-123',
  email: 'user@example.com',
  role: 'TRAINEE'
})

// Use session in test
```

### Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [TDD Guide](https://martinfowler.com/bliki/TestDrivenDevelopment.html)