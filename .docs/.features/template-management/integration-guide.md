# Template Management - Integration Guide

## Overview

This document explains how the Template Management System integrates with the AI Chit Chat and AI Mock Call features, including data flow, session management, and evaluation processes.

## Integration Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Admin Dashboard                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Template Management                             │  │
│  │  • Create/Edit Templates                         │  │
│  │  • Assign to Trainees                            │  │
│  │  • Monitor Usage                                 │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Creates Assignments
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Template Assignments                    │
│  userId + templateId + schedule + prerequisites         │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Loads Available Templates
                          ▼
┌─────────────────────────────────────────────────────────┐
│               Trainee Dashboard                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Training Modules                                │  │
│  │  • AI Chit Chat                                  │  │
│  │  • AI Mock Call                                  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Starts Session
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    AI Session                            │
│  • Loads template configuration                         │
│  • Applies persona + scenario + prompt                  │
│  • Records conversation transcript                      │
│  • Tracks duration                                      │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Ends Session
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   AI Evaluation                          │
│  • Applies template rubric                              │
│  • Calculates scores                                    │
│  • Generates feedback                                   │
│  • Updates assignment status                            │
└─────────────────────────────────────────────────────────┘
```

---

## Integration 1: AI Chit Chat

### Flow Overview

```
Trainee clicks "AI Chit Chat" in dashboard
    ↓
System fetches assigned CHIT_CHAT templates
    ↓
Trainee selects template (e.g., "Alex - Conversational Coach")
    ↓
System loads full template configuration
    ↓
Session starts with Alex persona + conversation rules
    ↓
AI behaves according to template prompt
    ↓
Conversation recorded with timestamps
    ↓
Session ends (manually or max duration reached)
    ↓
Evaluation applies template rubric
    ↓
Feedback displayed to trainee
    ↓
Assignment status updated if passed
```

### Implementation

#### Step 1: Display Available Templates

**File:** `app/dashboard/trainee/ai-chit-chat/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function AiChitChatPage() {
  const { data: session } = useSession();
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    async function fetchTemplates() {
      const response = await fetch('/api/ai/templates/assigned?type=CHIT_CHAT');
      const data = await response.json();
      setTemplates(data.templates);
    }

    if (session?.user) {
      fetchTemplates();
    }
  }, [session]);

  return (
    <div>
      <h1>AI Chit Chat</h1>
      <p>Select a conversation template to practice:</p>

      <div className="grid gap-4">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onStart={() => startSession(template.id, template.assignment.id)}
          />
        ))}
      </div>
    </div>
  );
}
```

#### Step 2: Load Template Configuration

**File:** `app/dashboard/trainee/ai-chit-chat/session/[id]/page.tsx`

```typescript
'use client';

export default function ChitChatSessionPage({ params }: { params: { id: string } }) {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    async function loadTemplate() {
      const response = await fetch(`/api/ai/templates/${params.id}/config`);
      const data = await response.json();
      setConfig(data.template);
    }

    loadTemplate();
  }, [params.id]);

  if (!config) return <div>Loading...</div>;

  // Initialize AI session with config
  return (
    <ConversationInterface
      persona={config.persona}
      scenario={config.scenario}
      prompt={config.prompt}
      rubric={config.rubric}
      maxDuration={config.maxDuration}
      onComplete={handleSessionComplete}
    />
  );
}
```

#### Step 3: Initialize AI with Template Prompt

**File:** `lib/ai/conversation.ts`

```typescript
export async function initializeConversation(templateConfig: TemplateConfig) {
  const systemMessage = {
    role: 'system',
    content: templateConfig.prompt.systemPrompt
  };

  // Add conversation rules as context
  const rulesContext = {
    role: 'system',
    content: `Conversation Rules:\n${templateConfig.prompt.conversationRules.join('\n')}`
  };

  // Add persona context
  const personaContext = {
    role: 'system',
    content: `You are ${templateConfig.persona.name}, ${templateConfig.persona.personality}. ${templateConfig.persona.background}`
  };

  return [systemMessage, rulesContext, personaContext];
}
```

#### Step 4: Record Session

**File:** `app/api/ai/sessions/start/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const session = await getServerSession(authConfig);
  const { templateId, assignmentId } = await request.json();

  // Create session record
  const aiSession = await prisma.aiSession.create({
    data: {
      userId: session.user.id,
      templateId,
      assignmentId,
      status: 'IN_PROGRESS',
      transcript: [],
    },
  });

  // Update assignment
  if (assignmentId) {
    await prisma.templateAssignment.update({
      where: { id: assignmentId },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        attemptCount: { increment: 1 },
        lastAttemptAt: new Date(),
      },
    });
  }

  return NextResponse.json({ sessionId: aiSession.id });
}
```

#### Step 5: Evaluate Session

**File:** `app/api/ai/sessions/[id]/evaluate/route.ts`

```typescript
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { transcript } = await request.json();

  // Load session and template
  const session = await prisma.aiSession.findUnique({
    where: { id: params.id },
    include: { template: true, assignment: true },
  });

  // Update session with transcript
  await prisma.aiSession.update({
    where: { id: params.id },
    data: {
      transcript,
      endedAt: new Date(),
      duration: Math.floor((new Date() - session.startedAt) / 1000),
      status: 'COMPLETED',
    },
  });

  // Apply rubric evaluation
  const scores = await evaluateWithAI(transcript, session.template.rubric);
  const totalScore = calculateTotalScore(scores, session.template.rubric);
  const passed = totalScore >= session.template.passingScore;

  // Generate feedback
  const feedback = generateFeedback(totalScore, session.template.rubric);

  // Create evaluation record
  const evaluation = await prisma.aiEvaluation.create({
    data: {
      sessionId: params.id,
      scores,
      totalScore,
      passed,
      feedback,
      strengths: identifyStrengths(scores),
      improvements: identifyImprovements(scores),
      suggestions: generateSuggestions(scores),
    },
  });

  // Update assignment if passed
  if (passed && session.assignmentId) {
    await prisma.templateAssignment.update({
      where: { id: session.assignmentId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  }

  return NextResponse.json({ evaluation });
}
```

---

## Integration 2: AI Mock Call

### Flow Overview

```
Trainee clicks "AI Mock Call" in dashboard
    ↓
System fetches assigned MOCK_CALL templates
    ↓
Templates grouped by category (Billing, Inquiry, etc.)
    ↓
Trainee selects template (e.g., "Billing - Easy (Daniel)")
    ↓
System loads template configuration
    ↓
Call simulation starts with customer persona
    ↓
AI acts as customer per scenario
    ↓
Trainee responds as call center agent
    ↓
Conversation recorded
    ↓
Call ends (customer satisfied, frustrated, or max turns)
    ↓
Evaluation applies rubric (Empathy, Problem Solving, etc.)
    ↓
Detailed feedback with scores per criterion
    ↓
Assignment status updated
```

### Implementation

#### Step 1: Display Templates by Category

**File:** `app/dashboard/trainee/ai-mock-call/page.tsx`

```typescript
export default function MockCallPage() {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    async function fetchTemplates() {
      const response = await fetch('/api/ai/templates/assigned?type=MOCK_CALL');
      const data = await response.json();

      // Group by category
      const grouped = data.templates.reduce((acc, template) => {
        if (!acc[template.category]) acc[template.category] = [];
        acc[template.category].push(template);
        return acc;
      }, {});

      setTemplates(grouped);
    }

    fetchTemplates();
  }, []);

  return (
    <div>
      <h1>AI Mock Call Simulation</h1>

      {Object.entries(templates).map(([category, categoryTemplates]) => (
        <div key={category}>
          <h2>{category}</h2>
          <div className="grid gap-4">
            {categoryTemplates.map((template) => (
              <MockCallCard
                key={template.id}
                template={template}
                difficulty={template.difficulty}
                onStart={() => startMockCall(template.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

#### Step 2: Customer Persona Initialization

**File:** `app/dashboard/trainee/ai-mock-call/session/[id]/page.tsx`

```typescript
export default function MockCallSessionPage({ params }: { params: { id: string } }) {
  const [config, setConfig] = useState(null);
  const [callPhase, setCallPhase] = useState('greeting'); // greeting, issue, resolution, closing

  // Load template
  useEffect(() => {
    async function loadTemplate() {
      const response = await fetch(`/api/ai/templates/${params.id}/config`);
      const data = await response.json();
      setConfig(data.template);
    }

    loadTemplate();
  }, [params.id]);

  // Initialize with customer greeting
  useEffect(() => {
    if (config) {
      const customerGreeting = generateCustomerGreeting(config.persona, config.scenario);
      addMessage('ai', customerGreeting);
    }
  }, [config]);

  return (
    <CallInterface
      persona={config?.persona}
      scenario={config?.scenario}
      onAgentResponse={handleAgentResponse}
      onCallEnd={handleCallEnd}
    />
  );
}
```

#### Step 3: Dynamic Customer Responses

**File:** `lib/ai/mock-call.ts`

```typescript
export async function generateCustomerResponse(
  agentMessage: string,
  conversationHistory: Message[],
  templateConfig: TemplateConfig
) {
  const { persona, scenario, prompt } = templateConfig;

  // Build context with emotional state
  const context = `
    Persona: ${persona.name}
    Current Mood: ${persona.mood}
    Frustration Level: ${persona.frustrationLevel}/100

    Scenario: ${scenario.situation}

    Behavior Rules:
    ${persona.behaviorRules.join('\n')}

    Emotional Triggers:
    ${JSON.stringify(persona.emotionalTriggers, null, 2)}
  `;

  // Check if agent's response triggers emotional change
  let updatedFrustration = persona.frustrationLevel;
  for (const trigger of persona.emotionalTriggers || []) {
    if (agentMessage.toLowerCase().includes(trigger.trigger.toLowerCase())) {
      updatedFrustration += trigger.moodChange;
      updatedFrustration = Math.max(0, Math.min(100, updatedFrustration));
    }
  }

  // Generate AI response with updated context
  const messages = [
    { role: 'system', content: prompt.systemPrompt },
    { role: 'system', content: context },
    { role: 'system', content: `Current frustration level: ${updatedFrustration}/100` },
    ...conversationHistory,
    { role: 'user', content: agentMessage },
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages,
    temperature: 0.8,
  });

  return {
    message: response.choices[0].message.content,
    updatedFrustration,
  };
}
```

#### Step 4: Call Completion Detection

**File:** `lib/ai/call-detector.ts`

```typescript
export function shouldEndCall(
  transcript: Message[],
  scenario: ScenarioConfig,
  currentFrustration: number
): { shouldEnd: boolean; reason: string } {
  // Max turns reached
  if (transcript.length >= (scenario.maxTurns || 20) * 2) {
    return { shouldEnd: true, reason: 'max_turns' };
  }

  // Customer satisfaction detected
  const lastCustomerMessages = transcript
    .filter((m) => m.speaker === 'ai')
    .slice(-3)
    .map((m) => m.message.toLowerCase());

  const satisfactionIndicators = ['thank you', 'thanks', 'appreciate', 'that helps', 'makes sense'];
  if (lastCustomerMessages.some((msg) => satisfactionIndicators.some((ind) => msg.includes(ind)))) {
    return { shouldEnd: true, reason: 'customer_satisfied' };
  }

  // Escalation to supervisor
  if (lastCustomerMessages.some((msg) => msg.includes('supervisor') || msg.includes('manager'))) {
    return { shouldEnd: true, reason: 'escalated' };
  }

  // Customer too frustrated (gave up)
  if (currentFrustration >= 95) {
    return { shouldEnd: true, reason: 'customer_frustrated' };
  }

  return { shouldEnd: false, reason: '' };
}
```

#### Step 5: Rubric-Based Evaluation

**File:** `lib/ai/evaluate-mock-call.ts`

```typescript
export async function evaluateMockCall(
  transcript: Message[],
  rubric: RubricConfig
): Promise<EvaluationResult> {
  const criterionScores: Record<string, number> = {};

  // Use AI to evaluate each criterion
  for (const criterion of rubric.criteria) {
    const prompt = `
      Evaluate the call center agent's performance on: ${criterion.name}

      Description: ${criterion.description}

      Conversation Transcript:
      ${JSON.stringify(transcript, null, 2)}

      Rate on a scale of ${criterion.scale.min} to ${criterion.scale.max}.
      Provide only the numeric score.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const score = parseInt(response.choices[0].message.content.trim());
    criterionScores[criterion.name] = score;
  }

  // Calculate total based on method
  let totalScore = 0;
  if (rubric.method === 'weighted_average') {
    totalScore = rubric.criteria.reduce((sum, criterion) => {
      return sum + (criterionScores[criterion.name] * (criterion.weight / 100));
    }, 0);
  } else if (rubric.method === 'simple_average') {
    const scores = Object.values(criterionScores);
    totalScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  // Normalize to 0-100
  const maxPossibleScore = Math.max(...rubric.criteria.map((c) => c.scale.max));
  totalScore = (totalScore / maxPossibleScore) * 100;

  return {
    scores: criterionScores,
    totalScore: Math.round(totalScore),
    passed: totalScore >= rubric.passingThreshold,
  };
}
```

---

## Data Flow Diagrams

### Session Start Flow

```
┌────────────┐
│  Trainee   │
└─────┬──────┘
      │ Clicks "Start Session"
      ▼
┌─────────────────────┐
│ Frontend Component  │
│  POST /api/ai/      │
│  sessions/start     │
└─────┬───────────────┘
      │ {templateId, assignmentId}
      ▼
┌──────────────────────────────┐
│  API Route                   │
│  1. Validate assignment      │
│  2. Create AiSession record  │
│  3. Update assignment status │
│  4. Return sessionId         │
└─────┬────────────────────────┘
      │ sessionId
      ▼
┌──────────────────────┐
│  Frontend           │
│  Navigate to        │
│  /session/[id]      │
└─────┬───────────────┘
      │
      ▼
┌──────────────────────────────┐
│  Session Page               │
│  GET /api/ai/templates/     │
│  [id]/config                │
└─────┬───────────────────────┘
      │ Full template config
      ▼
┌──────────────────────┐
│  AI Conversation    │
│  Interface          │
│  Initialized        │
└─────────────────────┘
```

### Evaluation Flow

```
┌───────────────┐
│ Session Ends  │
└────┬──────────┘
     │ transcript[]
     ▼
┌──────────────────────────────┐
│  POST /api/ai/sessions/      │
│  [id]/evaluate               │
└────┬─────────────────────────┘
     │
     ├──> Load AiSession + Template
     │
     ├──> Apply Rubric to Transcript
     │     (AI-powered evaluation)
     │
     ├──> Calculate Total Score
     │
     ├──> Generate Feedback
     │
     ├──> Create AiEvaluation Record
     │
     └──> Update Assignment if Passed
          └──> Return Evaluation
               │
               ▼
          ┌──────────────────┐
          │  Feedback Page   │
          │  Display scores, │
          │  feedback, and   │
          │  suggestions     │
          └──────────────────┘
```

---

## State Management

### Template Assignment State

```typescript
interface AssignmentState {
  id: string;
  templateId: string;
  template: {
    name: string;
    type: TemplateType;
    difficulty: DifficultyLevel;
    estimatedDuration: number;
  };
  status: AssignmentStatus;
  canStart: boolean;
  blockedReason?: string;
  attemptCount: number;
  attemptsAllowed: number | null;
  bestScore: number | null;
  lastAttemptAt: Date | null;
}
```

### Session State

```typescript
interface SessionState {
  sessionId: string;
  templateId: string;
  status: 'loading' | 'active' | 'completed' | 'error';
  transcript: Message[];
  currentTurn: number;
  maxTurns: number;
  duration: number;
  maxDuration: number | null;
  personaState: {
    frustrationLevel: number;
    mood: string;
  };
}
```

---

## Error Handling

### Common Errors

1. **Template Not Found**
   ```typescript
   if (!template) {
     return NextResponse.json(
       { error: 'TEMPLATE_NOT_FOUND', message: 'Template does not exist' },
       { status: 404 }
     );
   }
   ```

2. **Assignment Locked**
   ```typescript
   if (assignment.status === 'LOCKED') {
     return NextResponse.json(
       {
         error: 'ASSIGNMENT_LOCKED',
         message: 'Prerequisites not met',
         details: { prerequisites: assignment.prerequisites },
       },
       { status: 403 }
     );
   }
   ```

3. **Attempt Limit Exceeded**
   ```typescript
   if (
     template.attemptsAllowed &&
     assignment.attemptCount >= template.attemptsAllowed
   ) {
     return NextResponse.json(
       { error: 'ATTEMPTS_EXCEEDED', message: 'Maximum attempts reached' },
       { status: 403 }
     );
   }
   ```

4. **Session Expired**
   ```typescript
   if (assignment.availableUntil && new Date() > assignment.availableUntil) {
     return NextResponse.json(
       { error: 'ASSIGNMENT_EXPIRED', message: 'Assignment is no longer available' },
       { status: 403 }
     );
   }
   ```

---

## Testing Integration

### Unit Tests

```typescript
// Test template configuration loading
describe('loadTemplateConfig', () => {
  it('should load all template components', async () => {
    const config = await loadTemplateConfig('tmpl_alex');
    expect(config).toHaveProperty('persona');
    expect(config).toHaveProperty('scenario');
    expect(config).toHaveProperty('prompt');
    expect(config).toHaveProperty('rubric');
  });
});

// Test evaluation calculation
describe('evaluateSession', () => {
  it('should calculate weighted average correctly', () => {
    const scores = { Empathy: 4, 'Problem Solving': 5 };
    const rubric = {
      method: 'weighted_average',
      criteria: [
        { name: 'Empathy', weight: 50 },
        { name: 'Problem Solving', weight: 50 },
      ],
    };
    const total = calculateTotalScore(scores, rubric);
    expect(total).toBe(90); // (4*50 + 5*50) / 5 * 100 = 90
  });
});
```

### Integration Tests

```typescript
// Test full session flow
describe('AI Session Flow', () => {
  it('should complete full session lifecycle', async () => {
    // Start session
    const startResponse = await request(app)
      .post('/api/ai/sessions/start')
      .send({ templateId: 'tmpl_daniel' });
    expect(startResponse.status).toBe(200);

    const sessionId = startResponse.body.sessionId;

    // Submit evaluation
    const evalResponse = await request(app)
      .post(`/api/ai/sessions/${sessionId}/evaluate`)
      .send({ transcript: mockTranscript });
    expect(evalResponse.status).toBe(200);
    expect(evalResponse.body.evaluation.totalScore).toBeGreaterThan(0);
  });
});
```

---

## Performance Considerations

1. **Template Caching**: Cache frequently accessed templates in Redis
2. **Lazy Loading**: Load full template config only when starting session
3. **Transcript Compression**: Store large transcripts compressed
4. **Evaluation Queue**: Use background jobs for AI-powered evaluation on heavy load
5. **Database Indexes**: Ensure indexes on `userId`, `templateId`, `status` fields

---

*Document Version: 1.0*
*Last Updated: October 2024*
*Integration Status: Documented, Ready for Implementation*
