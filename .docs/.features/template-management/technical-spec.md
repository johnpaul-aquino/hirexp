# Template Management System - Technical Specification

## Architecture Overview

The Template Management System uses a **single-entity design** where all components (persona, scenario, prompt, rubric) are combined into one `AiTemplate` model. This simplifies data management and ensures atomic operations.

## Database Schema

### Core Model: AiTemplate

```prisma
model AiTemplate {
  id              String           @id @default(cuid())

  // Metadata
  name            String           @db.VarChar(200)
  slug            String           @unique @db.VarChar(250)
  description     String           @db.Text
  type            TemplateType
  category        TemplateCategory
  difficulty      DifficultyLevel
  tags            String[]         // Searchable tags

  // Status & Visibility
  isActive        Boolean          @default(true)
  isTemplate      Boolean          @default(false)  // Pre-loaded vs custom
  isPublished     Boolean          @default(false)  // Ready for use

  // Persona Configuration
  persona         Json             // Persona details (see PersonaConfig type)

  // Scenario Configuration
  scenario        Json             // Scenario context (see ScenarioConfig type)

  // AI Prompt Configuration
  prompt          Json             // AI system prompt (see PromptConfig type)

  // Evaluation Configuration
  rubric          Json             // Evaluation rubric (see RubricConfig type)

  // Session Settings
  estimatedDuration Int            // Expected duration in minutes
  maxDuration     Int?             // Maximum allowed duration in minutes
  attemptsAllowed Int?             // Null = unlimited
  passingScore    Int              // Minimum score to pass (0-100)

  // Versioning
  version         Int              @default(1)
  parentId        String?          // For cloned/versioned templates
  parent          AiTemplate?      @relation("TemplateVersions", fields: [parentId], references: [id], onDelete: SetNull)
  versions        AiTemplate[]     @relation("TemplateVersions")

  // Audit Trail
  createdById     String
  createdBy       User             @relation("TemplateCreator", fields: [createdById], references: [id])
  updatedById     String?
  updatedBy       User?            @relation("TemplateUpdater", fields: [updatedById], references: [id])
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  archivedAt      DateTime?        // Soft delete

  // Relations
  assignments     TemplateAssignment[]
  sessions        AiSession[]

  @@index([type, category, difficulty])
  @@index([isActive, isPublished])
  @@index([createdById])
  @@index([slug])
  @@map("ai_templates")
}
```

### Supporting Models

#### Template Assignment

```prisma
model TemplateAssignment {
  id              String     @id @default(cuid())

  // Assignment Details
  templateId      String
  template        AiTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)

  userId          String
  user            User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Assignment Configuration
  assignedById    String
  assignedBy      User       @relation("AssignmentCreator", fields: [assignedById], references: [id])

  // Schedule
  availableFrom   DateTime?  // Null = available immediately
  availableUntil  DateTime?  // Null = no expiration

  // Prerequisites
  prerequisites   String[]   // Template IDs that must be completed first

  // Status Tracking
  status          AssignmentStatus @default(ASSIGNED)
  startedAt       DateTime?
  completedAt     DateTime?
  lastAttemptAt   DateTime?
  attemptCount    Int        @default(0)

  // Metadata
  notes           String?    @db.Text
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  @@unique([templateId, userId])
  @@index([userId, status])
  @@index([templateId])
  @@map("template_assignments")
}

enum AssignmentStatus {
  ASSIGNED        // Assigned but not started
  IN_PROGRESS     // At least one attempt made
  COMPLETED       // Successfully completed
  EXPIRED         // Past availableUntil date
  LOCKED          // Prerequisites not met
}
```

#### AI Session (Updated)

```prisma
model AiSession {
  id              String     @id @default(cuid())

  // Session Participants
  userId          String
  user            User       @relation(fields: [userId], references: [id])

  templateId      String
  template        AiTemplate @relation(fields: [templateId], references: [id])

  assignmentId    String?
  assignment      TemplateAssignment? @relation(fields: [assignmentId], references: [id])

  // Session Data
  transcript      Json       // Full conversation with timestamps
  audioRecordings String[]   // Cloudinary URLs for voice sessions

  // Timing
  startedAt       DateTime   @default(now())
  endedAt         DateTime?
  duration        Int?       // Actual duration in seconds

  // Status
  status          SessionStatus @default(IN_PROGRESS)

  // Evaluation (computed after session ends)
  evaluation      AiEvaluation?

  // Metadata
  userAgent       String?    @db.Text
  ipAddress       String?    @db.VarChar(45)

  @@index([userId, status])
  @@index([templateId])
  @@index([startedAt])
  @@map("ai_sessions")
}

enum SessionStatus {
  IN_PROGRESS
  COMPLETED
  ABANDONED
  EXPIRED
}
```

#### AI Evaluation

```prisma
model AiEvaluation {
  id              String     @id @default(cuid())

  sessionId       String     @unique
  session         AiSession  @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  // Scores (structure matches template rubric)
  scores          Json       // Individual criterion scores
  totalScore      Int        // 0-100
  passed          Boolean    // totalScore >= template.passingScore

  // Detailed Feedback
  feedback        String     @db.Text
  strengths       String[]   // Identified strengths
  improvements    String[]   // Areas for improvement
  suggestions     String[]   // Specific action items

  // AI-Generated Insights
  aiAnalysis      Json?      // Detailed AI evaluation data

  // Metadata
  evaluatedAt     DateTime   @default(now())
  evaluatedBy     EvaluationType @default(AI_AUTOMATIC)

  @@index([sessionId])
  @@map("ai_evaluations")
}

enum EvaluationType {
  AI_AUTOMATIC    // Automated AI evaluation
  HUMAN_REVIEW    // Manual instructor review
  HYBRID          // AI + Human verification
}
```

## JSON Schema Definitions

### PersonaConfig

```typescript
interface PersonaConfig {
  // Character Identity
  name: string;                    // e.g., "Alex", "Daniel Cruz"
  age?: number;                    // e.g., 32
  location?: string;               // e.g., "Quezon City", "Texas, USA"

  // Personality Traits
  personality: string;             // e.g., "Friendly, curious, patient"
  mood: string;                    // e.g., "Calm", "Frustrated", "Energetic"
  frustrationLevel?: number;       // 0-100 (for customer personas)

  // Communication Style
  speakingStyle: string;           // e.g., "Clear, moderate pace"
  tone: string;                    // e.g., "Warm, engaging, slightly challenging"
  accent?: string;                 // e.g., "Native American", "Heavy Filipino"

  // Behavior Rules
  behaviorRules: string[];         // List of behavioral guidelines
  emotionalTriggers?: {            // What affects persona's mood
    trigger: string;
    response: string;
    moodChange?: number;           // +/- frustration level
  }[];

  // Background Context
  background?: string;             // e.g., "BPO worker with 5 years experience"
  motivation?: string;             // Why persona is in this situation
  expectations?: string;           // What persona wants from conversation
}
```

**Example:**
```json
{
  "name": "Daniel Cruz",
  "age": 32,
  "location": "Quezon City",
  "personality": "Friendly, curious, cooperative",
  "mood": "Calm",
  "frustrationLevel": 20,
  "speakingStyle": "Clear, moderate pace",
  "tone": "Polite and respectful",
  "behaviorRules": [
    "Be polite and respectful",
    "Use natural, chill tone",
    "If agent apologizes, say 'No worries, I understand'",
    "Thank agent sincerely if issue resolved"
  ],
  "emotionalTriggers": [
    {
      "trigger": "Agent provides clear explanation",
      "response": "Oh nice, that makes sense!",
      "moodChange": -10
    }
  ],
  "background": "First-time caller, trusts the company",
  "motivation": "Just wants clarity on billing",
  "expectations": "Professional explanation"
}
```

### ScenarioConfig

```typescript
interface ScenarioConfig {
  // Situation Details
  situation: string;               // Brief description of the scenario
  context: string;                 // Detailed background information
  issue?: string;                  // The problem (for customer service)
  topic?: string;                  // Conversation topic (for chit chat)

  // Learning Objectives
  objectives: string[];            // What trainee should learn

  // Success Criteria
  successCriteria: string[];       // How to succeed in this scenario
  goalOutcome: string;             // Ideal resolution
  acceptableSolutions?: string[];  // Alternative acceptable outcomes
  dealBreakers?: string[];         // What causes automatic failure

  // Conversation Parameters
  minTurns?: number;               // Minimum conversation exchanges
  maxTurns?: number;               // Maximum before auto-end
  urgency?: 'low' | 'medium' | 'high' | 'critical';

  // Additional Context
  additionalInfo?: {               // Extra details for realism
    accountNumber?: string;
    orderNumber?: string;
    dateOfIssue?: string;
    previousAttempts?: number;
    [key: string]: any;
  };
}
```

**Example:**
```json
{
  "situation": "Customer calling about billing overcharge",
  "context": "Customer noticed bill is ₱300 higher than usual. This is their first call about this issue. They're calm but confused.",
  "issue": "₱300 extra charge on monthly bill",
  "objectives": [
    "Practice active listening skills",
    "Demonstrate empathy and understanding",
    "Explain billing clearly and professionally",
    "Resolve issue to customer satisfaction"
  ],
  "successCriteria": [
    "Acknowledge customer concern within first 30 seconds",
    "Ask clarifying questions about the charge",
    "Provide clear explanation or commit to investigation",
    "Offer resolution or next steps",
    "End call professionally with confirmation"
  ],
  "goalOutcome": "Customer understands the charge OR receives commitment to investigate and resolve",
  "acceptableSolutions": [
    "Explain valid charge and customer accepts",
    "Commit to investigation with callback timeframe",
    "Offer credit/adjustment if charge is error"
  ],
  "urgency": "medium",
  "minTurns": 5,
  "maxTurns": 20
}
```

### PromptConfig

```typescript
interface PromptConfig {
  // Main AI Instructions
  systemPrompt: string;            // Core AI behavior instructions

  // Conversation Rules
  conversationRules: string[];     // How AI should conduct conversation

  // Response Guidelines
  responseStyle?: {
    speakLess?: boolean;           // e.g., trainee should speak 70%
    askOpenEnded?: boolean;        // Encourage longer responses
    challengeGently?: boolean;     // Push trainee to elaborate
    modelCorrections?: boolean;    // Fix grammar naturally
  };

  // Examples
  exampleDialogues?: {
    userMessage: string;
    aiResponse: string;
    explanation?: string;
  }[];

  // Constraints
  constraints?: string[];          // What AI should NOT do

  // Special Instructions
  endingProtocol?: string;         // How to end the session
  escalationRules?: string;        // When to escalate or end early
}
```

**Example:**
```json
{
  "systemPrompt": "You are 'Alex', an energetic, confident, and friendly Native American conversational coach working for HireXP. Your job is to help trainees practice speaking English naturally through real conversations. Make the trainee speak more than you do (70% trainee, 30% you). Sound like a real American, not a textbook.",
  "conversationRules": [
    "Ask open-ended questions to encourage longer responses",
    "React naturally with laughs, empathy, or follow-ups",
    "Challenge gently if answers are short: 'C'mon, you can give me more than that!'",
    "Motivate continuously: 'You're improving every minute we talk'",
    "Don't lecture on grammar - model correct usage naturally"
  ],
  "responseStyle": {
    "speakLess": true,
    "askOpenEnded": true,
    "challengeGently": true,
    "modelCorrections": true
  },
  "exampleDialogues": [
    {
      "userMessage": "Uh… I just go to work, same every day.",
      "aiResponse": "Haha, come on! There's gotta be something different — maybe a funny customer, a new task, a bad commute? Tell me more!",
      "explanation": "Gently challenges trainee to provide more detail"
    }
  ],
  "endingProtocol": "End every session with encouragement + feedback summary: 'You sounded more confident this time — your pace is improving! Keep practicing, okay?'"
}
```

### RubricConfig

```typescript
interface RubricConfig {
  // Scoring Method
  method: 'weighted_average' | 'simple_average' | 'pass_fail' | 'rubric_based';

  // Evaluation Criteria
  criteria: {
    name: string;                  // e.g., "Empathy", "Fluency"
    description: string;           // What this criterion measures
    weight?: number;               // For weighted_average (0-100, sum=100)
    scale: {                       // Score levels
      type: 'numeric' | 'categorical';
      min?: number;                // For numeric (e.g., 1)
      max?: number;                // For numeric (e.g., 5)
      levels?: {                   // For categorical
        value: string;             // e.g., "Low", "Medium", "High"
        score: number;             // Numeric equivalent
        description: string;       // What this level means
      }[];
    };
  }[];

  // Feedback Templates
  feedbackTemplates: {
    scoreRange: {min: number; max: number};
    message: string;
    tone: 'encouraging' | 'constructive' | 'congratulatory';
  }[];

  // Performance Indicators
  excellentThreshold?: number;     // Score for "excellent" performance
  goodThreshold?: number;          // Score for "good" performance
  passingThreshold: number;        // Minimum to pass
}
```

**Example (Mock Call Rubric):**
```json
{
  "method": "weighted_average",
  "criteria": [
    {
      "name": "Empathy",
      "description": "Did the agent show understanding and apologize for inconvenience?",
      "weight": 25,
      "scale": {
        "type": "numeric",
        "min": 1,
        "max": 5
      }
    },
    {
      "name": "Problem Solving",
      "description": "Did the agent explain or resolve the issue clearly?",
      "weight": 30,
      "scale": {
        "type": "numeric",
        "min": 1,
        "max": 5
      }
    },
    {
      "name": "Communication",
      "description": "Did the agent use proper tone and phrasing?",
      "weight": 25,
      "scale": {
        "type": "numeric",
        "min": 1,
        "max": 5
      }
    },
    {
      "name": "Call Closing",
      "description": "Was the call closed properly with assurance?",
      "weight": 20,
      "scale": {
        "type": "numeric",
        "min": 1,
        "max": 5
      }
    }
  ],
  "feedbackTemplates": [
    {
      "scoreRange": {"min": 90, "max": 100},
      "message": "Excellent! You handled this call like a pro. Your empathy and problem-solving skills were outstanding.",
      "tone": "congratulatory"
    },
    {
      "scoreRange": {"min": 70, "max": 89},
      "message": "Good job! You showed strong communication skills. Focus on improving your problem-solving approach.",
      "tone": "encouraging"
    },
    {
      "scoreRange": {"min": 0, "max": 69},
      "message": "You're making progress. Work on showing more empathy and providing clearer solutions. Keep practicing!",
      "tone": "constructive"
    }
  ],
  "excellentThreshold": 90,
  "goodThreshold": 70,
  "passingThreshold": 60
}
```

**Example (Chit Chat Rubric):**
```json
{
  "method": "simple_average",
  "criteria": [
    {
      "name": "Confidence",
      "description": "Speaking confidence level",
      "scale": {
        "type": "categorical",
        "levels": [
          {
            "value": "Low",
            "score": 33,
            "description": "Hesitant, many pauses, unsure tone"
          },
          {
            "value": "Medium",
            "score": 66,
            "description": "Mostly confident with occasional hesitation"
          },
          {
            "value": "High",
            "score": 100,
            "description": "Confident throughout, natural flow"
          }
        ]
      }
    },
    {
      "name": "Fluency",
      "description": "Smoothness and naturalness of speech",
      "scale": {
        "type": "categorical",
        "levels": [
          {"value": "Weak", "score": 33, "description": "Choppy, unnatural"},
          {"value": "Developing", "score": 66, "description": "Improving flow"},
          {"value": "Strong", "score": 100, "description": "Natural, smooth"}
        ]
      }
    },
    {
      "name": "Grammar",
      "description": "Grammatical accuracy",
      "scale": {
        "type": "categorical",
        "levels": [
          {"value": "Low", "score": 33, "description": "Frequent errors"},
          {"value": "Medium", "score": 66, "description": "Some errors"},
          {"value": "High", "score": 100, "description": "Mostly accurate"}
        ]
      }
    },
    {
      "name": "Pronunciation",
      "description": "Clarity of pronunciation",
      "scale": {
        "type": "categorical",
        "levels": [
          {"value": "Low", "score": 33, "description": "Hard to understand"},
          {"value": "Medium", "score": 66, "description": "Generally clear"},
          {"value": "High", "score": 100, "description": "Very clear"}
        ]
      }
    }
  ],
  "feedbackTemplates": [
    {
      "scoreRange": {"min": 80, "max": 100},
      "message": "You're improving! Your tone sounds more natural now. Keep practicing!",
      "tone": "encouraging"
    },
    {
      "scoreRange": {"min": 50, "max": 79},
      "message": "Good effort! Try expanding your answers next time.",
      "tone": "constructive"
    },
    {
      "scoreRange": {"min": 0, "max": 49},
      "message": "Keep going! Every conversation makes you better.",
      "tone": "encouraging"
    }
  ],
  "passingThreshold": 60
}
```

## Enums

```prisma
enum TemplateType {
  CHIT_CHAT       // Conversational practice (Alex)
  MOCK_CALL       // Customer service simulation
  INTERVIEW       // Job interview practice
}

enum TemplateCategory {
  // Mock Call Categories
  BILLING
  TECHNICAL_SUPPORT
  INQUIRY
  COMPLAINT
  RETENTION

  // Chit Chat Categories
  CONVERSATION
  BUSINESS_ENGLISH
  TRAVEL
  DAILY_LIFE

  // Interview Categories
  SCREENING
  BEHAVIORAL
  SITUATIONAL
  FINAL_ROUND
}

enum DifficultyLevel {
  EASY            // Beginner-friendly
  MEDIUM          // Intermediate challenge
  HARD            // Advanced difficulty
  EXPERT          // Expert-level complexity
}
```

## Business Logic

### Template Validation Rules

1. **Name Uniqueness**: Template names must be unique within the same type
2. **Slug Generation**: Auto-generate from name, ensure uniqueness
3. **Passing Score**: Must be 0-100
4. **Duration**: estimatedDuration must be > 0, maxDuration must be >= estimatedDuration
5. **Rubric Weights**: If weighted_average, criterion weights must sum to 100
6. **Version Constraints**: Cannot have circular version relationships

### Assignment Logic

1. **Prerequisites Check**: User cannot start template if prerequisites not completed
2. **Date Availability**: Template only accessible between availableFrom and availableUntil
3. **Attempt Limits**: Block attempts if attemptCount >= template.attemptsAllowed
4. **Status Updates**:
   - ASSIGNED → IN_PROGRESS on first session start
   - IN_PROGRESS → COMPLETED when session passes
   - Any status → EXPIRED when past availableUntil

### Evaluation Logic

```typescript
function evaluateSession(session: AiSession, rubric: RubricConfig): AiEvaluation {
  const scores: Record<string, number> = {};

  // Calculate individual criterion scores
  for (const criterion of rubric.criteria) {
    const score = calculateCriterionScore(session, criterion);
    scores[criterion.name] = score;
  }

  // Calculate total score based on method
  let totalScore: number;
  switch (rubric.method) {
    case 'weighted_average':
      totalScore = rubric.criteria.reduce((sum, criterion) => {
        return sum + (scores[criterion.name] * (criterion.weight / 100));
      }, 0);
      break;

    case 'simple_average':
      totalScore = Object.values(scores).reduce((a, b) => a + b, 0) / rubric.criteria.length;
      break;

    case 'pass_fail':
      totalScore = Object.values(scores).every(s => s >= rubric.passingThreshold) ? 100 : 0;
      break;
  }

  // Determine if passed
  const passed = totalScore >= rubric.passingThreshold;

  // Generate feedback
  const feedbackTemplate = rubric.feedbackTemplates.find(
    t => totalScore >= t.scoreRange.min && totalScore <= t.scoreRange.max
  );

  return {
    scores,
    totalScore: Math.round(totalScore),
    passed,
    feedback: feedbackTemplate?.message || "Session completed.",
    strengths: identifyStrengths(scores, rubric),
    improvements: identifyImprovements(scores, rubric),
    suggestions: generateSuggestions(scores, rubric)
  };
}
```

## Performance Optimization

### Database Indexes

```prisma
@@index([type, category, difficulty])      // Template filtering
@@index([isActive, isPublished])           // Active templates
@@index([createdById])                     // User's templates
@@index([slug])                            // URL lookups
@@index([userId, status]) // on TemplateAssignment
@@index([templateId])     // on TemplateAssignment
```

### Caching Strategy

1. **Template List**: Cache for 5 minutes (frequently read, rarely updated)
2. **Individual Template**: Cache for 10 minutes
3. **User Assignments**: Cache for 1 minute (changes more frequently)
4. **Active Templates Count**: Cache for 15 minutes

### Query Optimization

```typescript
// Efficient template list query
const templates = await prisma.aiTemplate.findMany({
  where: {
    isActive: true,
    isPublished: true,
    type: 'MOCK_CALL',
  },
  select: {
    id: true,
    name: true,
    slug: true,
    description: true,
    type: true,
    category: true,
    difficulty: true,
    tags: true,
    estimatedDuration: true,
    // Exclude large JSON fields
  },
  orderBy: { createdAt: 'desc' },
  take: 50,
});
```

## Security Considerations

### Access Control

- Only ADMIN and INSTRUCTOR roles can access template management
- Regular users (TRAINEE) can only view assigned templates
- Soft deletes prevent accidental data loss
- Audit trail tracks all changes

### Data Validation

- All JSON fields validated against TypeScript interfaces
- Prisma validation for scalar fields
- Custom validation for rubric weights, score ranges, etc.
- XSS protection in template content

---

*Document Version: 1.0*
*Last Updated: October 2024*
*Technical Review: Pending*
