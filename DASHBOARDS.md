# HireXp Dashboard Documentation

## Overview

This document describes the implementation of the HireXp dashboard system, which includes separate portals for job seekers (trainees) and companies.

## Access URLs

- **Dashboard Home**: http://localhost:3002/dashboard
- **Trainee Dashboard**: http://localhost:3002/dashboard/trainee
- **Company Dashboard**: http://localhost:3002/dashboard/company

## Architecture

### File Structure

```
app/
  dashboard/
    layout.tsx                    # Root dashboard layout
    page.tsx                      # Dashboard portal selector
    trainee/
      layout.tsx                  # Trainee-specific layout with sidebar
      page.tsx                    # Trainee dashboard main page
    company/
      layout.tsx                  # Company-specific layout with sidebar
      page.tsx                    # Company dashboard main page

components/
  dashboard/
    sidebar.tsx                   # Dynamic sidebar (trainee/company modes)
    stat-card.tsx                 # Statistics display card
    module-card.tsx               # Training module card with progress
    progress-ring.tsx             # Circular progress indicator
    activity-item.tsx             # Activity timeline item
    candidate-card.tsx            # Candidate profile card (company view)

lib/
  mock-data.ts                    # Static demo data for dashboards
```

## Features

### Trainee Dashboard

#### 1. Header Section
- Welcome message with user name
- Current level badge (Beginner/Intermediate/Advanced)

#### 2. Statistics Overview (4 Cards)
- **Overall Progress**: Percentage completion with module count
- **Overall Score**: Average score across all modules
- **Time Spent**: Total learning hours
- **Streak**: Consecutive days of activity

#### 3. Progress Overview Card
- Large circular progress ring showing completion percentage
- Breakdown metrics (modules completed, average score, time investment)

#### 4. Performance Insights Card
- **Strengths**: AI-identified strong areas (e.g., "Grammar accuracy 90%")
- **Areas for Improvement**: Skills needing focus
- **Recommendations**: Personalized next steps

#### 5. Training Modules Grid (5 Modules)

Based on `course-overview.md`:

1. **English Assessments**
   - Status: Completed (100%)
   - Score: 85%
   - Metrics: Score percentage, Improvement rate, Topics mastered

2. **AI Chat-Chat**
   - Status: In Progress (60%)
   - Score: 72%
   - Metrics: Conversation quality, Grammar accuracy, Vocabulary usage

3. **AI Interview**
   - Status: In Progress (30%)
   - Score: 68%
   - Metrics: Overall rating, Answer quality, Confidence score

4. **Typing Test**
   - Status: Not Started (0%)
   - Metrics: WPM score, Accuracy percentage, Consistency

5. **AI Mock Call**
   - Status: Locked (requires previous modules)
   - Metrics: Issue resolution, Communication clarity, Professionalism score

Each module card displays:
- Icon and title
- Description
- Progress bar (0-100%)
- Status badge (Not Started/In Progress/Completed/Locked)
- Last score (if available)
- Action button (Start/Continue/Review/Locked)

#### 6. Recent Activity Timeline
- Last 4 completed activities
- Activity type, description, and timestamp
- Icon-coded by activity type

#### 7. Certificate Progress Card
- Trophy icon
- Modules completed count (2/5)
- Progress message
- "View Certificate" button (enabled when all modules complete)

### Company Dashboard

#### 1. Header Section
- Company name
- Partnership date badge
- Welcome message

#### 2. Key Metrics (4 Cards)
- **Total Candidates**: 127 (8 new this week)
- **Candidates Hired**: 18 (↑15%)
- **Training Cost Savings**: $45K total
- **Average Candidate Score**: 82% (↑3%)

#### 3. Candidate Pool Section

**Search & Filters:**
- Search bar (by name or ID)
- English Level filter (All/Beginner/Intermediate/Advanced)
- Availability filter (All/Available/Hired)
- Results count display

**Candidate Cards Grid:**
Each card shows:
- Candidate ID (anonymized: "Candidate #1234")
- Avatar with ID badge
- English Level badge (colored by level)
- Overall Score (percentage)
- Modules Completed (5/5)
- Typing Speed (WPM)
- Interview Rating (1-5 stars)
- Availability status badge
- "View Profile" button

#### 4. Recent Hires Section
- List of last 3 hired candidates
- Candidate ID, role, performance rating, hire date
- Performance badge (Excellent/Good)

#### 5. Analytics Overview (3 Cards)

**Level Distribution:**
- Beginner: Count and percentage
- Intermediate: Count and percentage
- Advanced: Count and percentage
- Visual progress bars

**Availability Status:**
- Available candidates count and percentage
- Hired candidates count and percentage
- Color-coded bars (green/gray)

**Top Performers:**
- Top 3 candidates by overall score
- Ranked with medals (1st, 2nd, 3rd)
- Candidate name and score

## Mock Data

### Trainee Data (`lib/mock-data.ts`)

```typescript
mockTraineeData = {
  user: { name, email, level, enrolledDate },
  stats: { overallProgress, modulesCompleted, overallScore, timeSpent, streakDays },
  modules: [5 training modules with progress, scores, metrics],
  recentActivity: [4 recent activities],
  strengths: [4 identified strengths],
  improvements: [4 areas to improve],
  recommendations: [3 personalized suggestions]
}
```

### Company Data (`lib/mock-data.ts`)

```typescript
mockCompanyData = {
  company: { name, partnerSince },
  stats: { totalCandidates, newThisWeek, candidatesHired, trainingCostSavings, averageCandidateScore },
  recentHires: [3 recent hires with details]
}

mockCandidates = [6 candidate profiles with complete metrics]
```

## UI Components Used

### shadcn/ui Components
- Badge - Status indicators and labels
- Progress - Progress bars
- Card - Container components
- Button - Interactive actions
- Input - Search fields
- Select - Dropdown filters
- Avatar - User/candidate avatars
- Table - Data display (future use)
- Tabs - View switching (future use)

### MagicUI Components
- BlurFade - Staggered entrance animations
- NumberTicker - Animated number counting
- BorderBeam - Card border animations (unused in final implementation)

### Custom Dashboard Components
- StatCard - Metric display with icon, value, trend
- ModuleCard - Training module with progress and actions
- ProgressRing - Circular progress indicator (SVG-based)
- ActivityItem - Timeline activity entry
- CandidateCard - Candidate profile display
- Sidebar - Navigation sidebar (trainee/company modes)

## Design Patterns

### Animations
- Framer Motion for smooth transitions
- BlurFade component for staggered entrance effects
- NumberTicker for animated statistics
- Progress animations (500ms duration)

### Responsive Design
- Mobile-first approach
- Grid layouts: 1 column (mobile) → 2-4 columns (desktop)
- Sidebar: Fixed on desktop, slide-in on mobile
- Touch-friendly buttons and interactions

### Color System
- Trainee theme: Blue/purple gradients
- Company theme: Orange/red accents
- Status colors:
  - Green: Completed, Available, Positive trends
  - Blue: In Progress, Beginner level
  - Purple: Intermediate level
  - Orange: Improvements needed, Advanced level
  - Gray: Not started, Hired, Neutral

### Accessibility
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast compliance
- Focus states on all interactive elements

## Module Status Logic

Modules follow a progressive unlock pattern:

1. **English Assessments** - Always unlocked
2. **AI Chat-Chat** - Unlocked when Assessments started
3. **AI Interview** - Unlocked when Chat started
4. **Typing Test** - Unlocked when Interview started
5. **AI Mock Call** - Locked until 80%+ completion on all previous modules

Status badges:
- **Not Started**: Gray, "Start Module" button
- **In Progress**: Blue, "Continue" button, shows progress %
- **Completed**: Green check, "Review" button, shows final score
- **Locked**: Gray with lock icon, disabled button

## Navigation Structure

### Trainee Sidebar
- Dashboard (home)
- English Assessments (link to module)
- AI Chat (link to module)
- AI Interview (link to module)
- Typing Test (link to module)
- Mock Call (link to module)
- Certificate (link to certificate page)
- Sign Out

### Company Sidebar
- Dashboard (home)
- Candidate Pool (browse candidates)
- Analytics (performance metrics)
- Settings (company settings)
- Sign Out

## Future Enhancements

### Trainee Dashboard
- [ ] Individual module pages with interactive content
- [ ] Certificate generation and download
- [ ] Progress comparison with peers
- [ ] Gamification (badges, achievements)
- [ ] Study reminders and notifications
- [ ] Performance history charts

### Company Dashboard
- [ ] Detailed candidate profile pages
- [ ] Advanced filtering (WPM range, score range, date range)
- [ ] Bulk actions (shortlist, message multiple candidates)
- [ ] Interview scheduling integration
- [ ] Performance analytics charts
- [ ] Export candidate data to CSV
- [ ] Saved candidate searches
- [ ] Candidate comparison tool

### Both Dashboards
- [ ] Real authentication system
- [ ] Backend API integration
- [ ] Real-time updates
- [ ] Dark mode toggle
- [ ] Multi-language support
- [ ] Mobile app companion

## Development

### Running the Dashboards

```bash
npm run dev
```

Visit:
- http://localhost:3002/dashboard - Portal selector
- http://localhost:3002/dashboard/trainee - Job seeker view
- http://localhost:3002/dashboard/company - Company view

### Adding New Features

1. **New Stat Card**: Use `<StatCard>` component
2. **New Module**: Add to `mockTraineeData.modules` array
3. **New Metric**: Update module metrics object
4. **New Filter**: Add to company dashboard filters
5. **New Navigation Item**: Update sidebar nav arrays

### Styling Guidelines

- Use Tailwind utilities for consistency
- Follow existing color patterns (blue for trainee, orange for company)
- Maintain 4-6-8 spacing scale
- Use `text-muted-foreground` for secondary text
- Apply hover states on interactive elements
- Use `transition-all duration-300` for smooth animations

## Course Overview Alignment

All dashboard features align with `course-overview.md` specifications:

✅ 5 training modules implemented
✅ Success metrics for each module
✅ Progress tracking system
✅ Module access strategy (level-based unlocking)
✅ Certificate completion flow
✅ Performance analytics
✅ Candidate evaluation criteria

## Notes

- All data is currently static/mock for demonstration
- Dashboards are fully responsive and mobile-friendly
- Animations use Framer Motion and custom CSS
- No backend required for static demonstration
- Ready for API integration when backend is available
