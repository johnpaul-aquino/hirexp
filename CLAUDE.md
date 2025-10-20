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
- In our development use hooks and store pattern, we will use zustand