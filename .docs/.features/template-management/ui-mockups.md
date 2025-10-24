# Template Management System - UI Mockups

## Overview

The Template Management UI is integrated into the Admin Dashboard as a new tab. It provides a comprehensive interface for creating, editing, and managing AI training templates with a focus on usability and efficiency.

## Design Principles

1. **Clarity**: Clear labeling and logical grouping of related fields
2. **Progressive Disclosure**: Show basic info first, advanced options on demand
3. **Visual Feedback**: Immediate validation and helpful error messages
4. **Consistency**: Follow existing admin dashboard design patterns
5. **Efficiency**: Bulk operations and keyboard shortcuts

---

## Admin Dashboard Integration

### Tab Structure (Updated)

```
/dashboard/admin

Tabs:
├── Users (existing)
├── Roles (existing)
├── Permissions (existing)
├── Settings (existing)
└── ✨ Templates (NEW)
```

### Templates Tab Layout

```
┌────────────────────────────────────────────────────────────┐
│  Admin Dashboard                                  [Profile] │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  [Users] [Roles] [Permissions] [Settings] [Templates]       │
│                                             ─────────────    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │               TEMPLATES TAB CONTENT                 │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

---

## 1. Templates List View

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│  Templates                                [+ New Template]   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Filters:                                                     │
│  [Type ▾] [Category ▾] [Difficulty ▾] [Status ▾] [🔍 Search] │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  📋 Billing - Easy (Daniel Cruz)      [Edit] [Clone]  │ │
│  │  Mock Call · Billing · Easy · Active                   │ │
│  │  45 assignments · 128 sessions · 78% pass rate         │ │
│  │  Created Oct 20, 2024 by Admin User                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  📋 Billing - Hard (Karen Torres)     [Edit] [Clone]  │ │
│  │  Mock Call · Billing · Hard · Active                   │ │
│  │  32 assignments · 89 sessions · 62% pass rate          │ │
│  │  Created Oct 20, 2024 by Admin User                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  💬 Alex - Conversational Coach       [Edit] [Clone]  │ │
│  │  Chit Chat · Conversation · Medium · Active            │ │
│  │  67 assignments · 201 sessions · 84% pass rate         │ │
│  │  Created Oct 20, 2024 by Admin User                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  Showing 1-10 of 25                        [1] 2 3 › »       │
└──────────────────────────────────────────────────────────────┘
```

### Template Card Components

```typescript
interface TemplateCard {
  icon: '📋' | '💬' | '🎤';  // Based on type
  title: string;
  type: TemplateType;
  category: TemplateCategory;
  difficulty: DifficultyLevel;
  status: 'Active' | 'Draft' | 'Archived';
  stats: {
    assignments: number;
    sessions: number;
    passRate: number;
  };
  metadata: {
    createdAt: Date;
    createdBy: string;
  };
  actions: ['Edit', 'Clone', 'Archive', 'Analytics'];
}
```

### Filter Panel

```
┌───────────────────────────────────────────────┐
│  Type:         [All Types ▾]                  │
│                ☐ Chit Chat                    │
│                ☐ Mock Call                    │
│                ☑ Interview                    │
│                                               │
│  Category:     [All Categories ▾]             │
│                ☐ Billing                      │
│                ☑ Inquiry                      │
│                ☐ Technical Support            │
│                ☐ Conversation                 │
│                                               │
│  Difficulty:   [All Levels ▾]                 │
│                ☐ Easy                         │
│                ☑ Medium                       │
│                ☐ Hard                         │
│                ☐ Expert                       │
│                                               │
│  Status:       [All Status ▾]                 │
│                ☑ Active                       │
│                ☐ Draft                        │
│                ☐ Archived                     │
│                                               │
│  [Apply Filters]  [Clear All]                 │
└───────────────────────────────────────────────┘
```

---

## 2. Create/Edit Template Form

### Multi-Step Wizard

```
Step 1: Basic Info
Step 2: Persona
Step 3: Scenario
Step 4: AI Prompt
Step 5: Evaluation
Step 6: Preview & Save
```

### Step 1: Basic Information

```
┌──────────────────────────────────────────────────────────────┐
│  Create New Template                              Step 1 of 6│
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Template Name *                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Billing - Easy (Daniel Cruz)                         │   │
│  └──────────────────────────────────────────────────────┘   │
│  ℹ️  This will be visible to trainees                         │
│                                                               │
│  Description *                                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Practice handling a calm customer with a simple      │   │
│  │ billing inquiry about ₱300 overcharge.                │   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  Template Type *                                              │
│  ⚪ Chit Chat    ⚫ Mock Call    ⚪ Interview                 │
│                                                               │
│  Category *                                                   │
│  [Billing        ▾]                                          │
│                                                               │
│  Difficulty Level *                                           │
│  ⚫ Easy    ⚪ Medium    ⚪ Hard    ⚪ Expert                  │
│                                                               │
│  Tags (comma-separated)                                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ billing, customer-service, beginner                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  Session Settings                                             │
│  Estimated Duration (minutes) *  [10      ]                  │
│  Max Duration (minutes)          [20      ] (optional)       │
│  Attempts Allowed                [3       ] (blank = ∞)      │
│  Passing Score (0-100) *         [60      ]                  │
│                                                               │
│                              [Cancel]  [Next: Persona →]     │
└──────────────────────────────────────────────────────────────┘
```

### Step 2: Persona Configuration

```
┌──────────────────────────────────────────────────────────────┐
│  Create New Template                              Step 2 of 6│
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ⚡ Load Preset Persona: [Select...        ▾]  or create new │
│                                                               │
│  Character Identity                                           │
│  ┌──────────────────┬──────────────────────────────────────┐│
│  │ Persona Name *   │  Age        Location                  ││
│  │ Daniel Cruz      │  [32   ]    Quezon City               ││
│  └──────────────────┴──────────────────────────────────────┘│
│                                                               │
│  Personality Traits *                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Friendly, curious, cooperative, patient               │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  Mood / Emotional State *                                     │
│  [Calm               ▾]                                      │
│                                                               │
│  Frustration Level (0-100)                                    │
│  [━━━━━━━━━━━━━━━━━━░░] 20    Low frustration               │
│                                                               │
│  Speaking Style *                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Clear, moderate pace. Polite and respectful tone.    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  Behavior Rules                             [+ Add Rule]     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 1. Be polite and respectful                 [Edit] [×] │ │
│  │ 2. Use natural, chill tone                  [Edit] [×] │ │
│  │ 3. Thank agent if issue resolved            [Edit] [×] │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  Emotional Triggers (Optional)              [+ Add Trigger]  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Trigger: Agent provides clear explanation              │ │
│  │ Response: "Oh nice, that makes sense!"                 │ │
│  │ Mood Change: -10 (calmer)                 [Edit] [×]   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  Background / Motivation                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ First-time caller, trusts company, just wants         │   │
│  │ clarity on unexpected charge                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│               [← Back]  [Save Draft]  [Next: Scenario →]     │
└──────────────────────────────────────────────────────────────┘
```

### Step 3: Scenario Configuration

```
┌──────────────────────────────────────────────────────────────┐
│  Create New Template                              Step 3 of 6│
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Situation Summary *                                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Customer calling about ₱300 billing overcharge        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  Detailed Context *                                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Customer noticed their monthly bill is ₱300 higher   │   │
│  │ than usual. This is their first call about this      │   │
│  │ issue. They're calm but confused about the charge.   │   │
│  │ The charge is legitimate but not well explained.     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  Learning Objectives                         [+ Add Objective]│
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ☑ Practice active listening skills                     │ │
│  │ ☑ Demonstrate empathy and understanding                │ │
│  │ ☑ Explain billing clearly and professionally           │ │
│  │ ☑ Resolve issue to customer satisfaction               │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  Success Criteria                           [+ Add Criterion] │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ☐ Acknowledge concern within 30 seconds                │ │
│  │ ☐ Ask clarifying questions                             │ │
│  │ ☐ Provide clear explanation or commit to investigation │ │
│  │ ☐ End call professionally                              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  Goal Outcome *                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Customer understands the charge OR receives           │   │
│  │ commitment to investigate and resolve                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  Conversation Parameters                                      │
│  Min Turns: [5    ]    Max Turns: [20   ]    Urgency: [Medium▾]│
│                                                               │
│  Additional Context (JSON)                      [Advanced ▾] │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ {                                                     │   │
│  │   "accountNumber": "ACC-123456",                      │   │
│  │   "dateOfIssue": "2024-10-15",                        │   │
│  │   "previousAttempts": 0                               │   │
│  │ }                                                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│                [← Back]  [Save Draft]  [Next: Prompt →]      │
└──────────────────────────────────────────────────────────────┘
```

### Step 4: AI Prompt Configuration

```
┌──────────────────────────────────────────────────────────────┐
│  Create New Template                              Step 4 of 6│
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ⚡ Load Preset Prompt: [Select...        ▾]  or create new  │
│                                                               │
│  System Prompt *                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ You are a real customer calling about a billing      │   │
│  │ problem. You are Daniel Cruz, a 32-year-old from     │   │
│  │ Quezon City. You're calling because you noticed      │   │
│  │ ₱300 extra on your bill. You're calm and polite,     │   │
│  │ and you just want an explanation.                    │   │
│  │                                                       │   │
│  │ Stay in character at all times. Speak naturally      │   │
│  │ using conversational tone. Don't tell the trainee    │   │
│  │ what to do - make them respond like a real agent.    │   │
│  │                                                       │   │
│  │ If the agent provides a clear explanation,           │   │
│  │ gradually relax and say things like "Oh, I see" or   │   │
│  │ "That makes sense now."                              │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  Conversation Rules                              [+ Add Rule] │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ • Wait for agent to respond (don't jump ahead)         │ │
│  │ • Use natural language with pauses and fillers         │ │
│  │ • React emotionally based on agent's approach          │ │
│  │ • End call when satisfied or frustrated                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  Response Style                                               │
│  ☑ Trainee should speak more (70% user, 30% AI)              │
│  ☑ Ask open-ended questions                                  │
│  ☐ Challenge gently to elaborate                             │
│  ☑ Model corrections naturally (don't lecture)               │
│                                                               │
│  Example Dialogues (Optional)                 [+ Add Example] │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ User: "I just noticed my bill is higher this month"   │ │
│  │ AI: "Oh really? By how much? I can help you check."   │ │
│  │                                             [Edit] [×] │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  Ending Protocol                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ End the call naturally when issue is resolved or      │   │
│  │ after 20 turns. Thank agent if satisfied.             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  [Test Prompt]    [← Back]  [Save Draft]  [Next: Rubric →]  │
└──────────────────────────────────────────────────────────────┘
```

### Step 5: Evaluation Rubric

```
┌──────────────────────────────────────────────────────────────┐
│  Create New Template                              Step 5 of 6│
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ⚡ Load Preset Rubric: [Mock Call - Standard  ▾]            │
│                                                               │
│  Scoring Method *                                             │
│  ⚪ Simple Average    ⚫ Weighted Average    ⚪ Pass/Fail     │
│                                                               │
│  Evaluation Criteria                        [+ Add Criterion] │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 1. Empathy                                  [Edit] [×]  │ │
│  │    Did agent show understanding and apologize?          │ │
│  │    Weight: 25%    Scale: 1-5 (numeric)                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 2. Problem Solving                          [Edit] [×]  │ │
│  │    Did agent explain/resolve issue clearly?             │ │
│  │    Weight: 30%    Scale: 1-5 (numeric)                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 3. Communication                            [Edit] [×]  │ │
│  │    Did agent use proper tone and phrasing?              │ │
│  │    Weight: 25%    Scale: 1-5 (numeric)                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 4. Call Closing                             [Edit] [×]  │ │
│  │    Was call closed properly with assurance?             │ │
│  │    Weight: 20%    Scale: 1-5 (numeric)                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  Total Weight: 100% ✓                                         │
│                                                               │
│  Feedback Templates                          [+ Add Template] │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Score 90-100: "Excellent! Outstanding empathy..."      │ │
│  │ Score 70-89: "Good job! Strong communication..."       │ │
│  │ Score 0-69: "You're making progress. Work on..."       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  Score Thresholds                                             │
│  Excellent: [90 ]    Good: [70 ]    Passing: [60 ]           │
│                                                               │
│  [Test Calculator]  [← Back]  [Save Draft]  [Next: Preview]  │
└──────────────────────────────────────────────────────────────┘
```

### Step 6: Preview & Save

```
┌──────────────────────────────────────────────────────────────┐
│  Create New Template                              Step 6 of 6│
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  📋 Template Preview                                          │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Billing - Easy (Daniel Cruz)                           │ │
│  │  Mock Call · Billing · Easy                             │ │
│  │                                                          │ │
│  │  Practice handling a calm customer with a simple        │ │
│  │  billing inquiry about ₱300 overcharge.                 │ │
│  │                                                          │ │
│  │  📊 Session Settings                                     │ │
│  │  • Duration: 10 minutes (max 20)                        │ │
│  │  • Attempts: 3                                          │ │
│  │  • Passing Score: 60/100                                │ │
│  │                                                          │ │
│  │  👤 Persona: Daniel Cruz                                │ │
│  │  • 32 years old, Quezon City                            │ │
│  │  • Calm, polite, cooperative                            │ │
│  │  • Frustration: Low (20/100)                            │ │
│  │                                                          │ │
│  │  📝 Scenario                                             │ │
│  │  Customer noticed ₱300 extra charge on bill...          │ │
│  │                                                          │ │
│  │  🤖 AI Behavior                                          │ │
│  │  • Natural, conversational tone                         │ │
│  │  • Calm at start, appreciates explanations              │ │
│  │  • 4 behavior rules configured                          │ │
│  │                                                          │ │
│  │  ✅ Evaluation                                           │ │
│  │  • Weighted Average (4 criteria)                        │ │
│  │  • Empathy (25%), Problem Solving (30%)...              │ │
│  │  • Passing score: 60/100                                │ │
│  │                                                          │ │
│  │  🏷️ Tags: billing, customer-service, beginner           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  Publish Options                                              │
│  ☑ Set as Active                                             │
│  ☑ Publish Immediately (make available for assignment)       │
│  ☐ Mark as Official Template (pre-loaded, non-editable)      │
│                                                               │
│  [← Back]  [Save as Draft]  [Create Template]                │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Template Detail View

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back to Templates                            [Edit] [Clone]│
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  📋 Billing - Easy (Daniel Cruz)                              │
│  Mock Call · Billing · Easy · Active · v1                     │
│                                                               │
│  Practice handling a calm customer with a simple billing      │
│  inquiry about ₱300 overcharge.                               │
│                                                               │
│  Created Oct 20, 2024 by Admin User                           │
│  Last updated Oct 20, 2024                                    │
│                                                               │
│  ┌──────────────┬──────────────┬──────────────┬───────────┐ │
│  │ Overview     │ Assignments  │ Analytics    │ History   │ │
│  │ ──────────   │              │              │           │ │
│  └──────────────┴──────────────┴──────────────┴───────────┘ │
│                                                               │
│  Session Settings                                             │
│  • Estimated Duration: 10 minutes                             │
│  • Maximum Duration: 20 minutes                               │
│  • Attempts Allowed: 3                                        │
│  • Passing Score: 60/100                                      │
│                                                               │
│  Persona Configuration                              [View All]│
│  Name: Daniel Cruz (32, Quezon City)                          │
│  Personality: Friendly, curious, cooperative, patient         │
│  Mood: Calm (Frustration: 20/100)                             │
│  Speaking Style: Clear, moderate pace, polite                 │
│  Behavior Rules: 3 rules configured                           │
│  Emotional Triggers: 1 trigger configured                     │
│                                                               │
│  Scenario Configuration                             [View All]│
│  Situation: Customer calling about ₱300 billing overcharge    │
│  Objectives: 4 learning objectives                            │
│  Success Criteria: 4 criteria defined                         │
│  Conversation: Min 5 turns, Max 20 turns, Medium urgency      │
│                                                               │
│  AI Prompt Configuration                            [View All]│
│  System Prompt: 156 characters (click to expand)              │
│  Conversation Rules: 4 rules defined                          │
│  Example Dialogues: 1 example provided                        │
│                                                               │
│  Evaluation Rubric                                  [View All]│
│  Method: Weighted Average                                     │
│  Criteria: 4 criteria (100% total weight)                     │
│    • Empathy (25%)                                            │
│    • Problem Solving (30%)                                    │
│    • Communication (25%)                                      │
│    • Call Closing (20%)                                       │
│  Feedback Templates: 3 templates configured                   │
│                                                               │
│  Quick Stats                                                  │
│  ┌──────────┬──────────┬──────────┬──────────┐              │
│  │    45    │   128    │   78%    │  8.5 min │              │
│  │Assigned  │ Sessions │ Pass Rate│ Avg Time │              │
│  └──────────┴──────────┴──────────┴──────────┘              │
│                                                               │
│  Actions                                                      │
│  [Assign to Users]  [View Analytics]  [Archive]              │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Assignment Interface

```
┌──────────────────────────────────────────────────────────────┐
│  Assign Template: Billing - Easy (Daniel Cruz)          [×]  │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Select Users                                                 │
│  🔍 [Search users...]                                         │
│                                                               │
│  ☑ John Doe (john@example.com) - Trainee                     │
│  ☑ Maria Santos (maria@example.com) - Trainee                │
│  ☐ Carlos Garcia (carlos@example.com) - Trainee              │
│  ☐ Anna Cruz (anna@example.com) - Trainee                    │
│                                                               │
│  Or select group:                                             │
│  ☐ All Trainees (47 users)                                   │
│  ☐ Batch 2024-10 (12 users)                                  │
│  ☐ Advanced Learners (8 users)                               │
│                                                               │
│  Schedule (Optional)                                          │
│  Available From: [2024-10-25 ▾]  Time: [09:00 ▾]             │
│  Available Until: [2024-12-31 ▾]  Time: [23:59 ▾]            │
│  ☐ No expiration                                              │
│                                                               │
│  Prerequisites (Optional)                                     │
│  Users must complete these templates first:                   │
│  [+ Add Prerequisite]                                         │
│                                                               │
│  Notes (Optional)                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Complete this before moving to Hard level             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  Summary                                                      │
│  • 2 users will be assigned this template                    │
│  • Available Oct 25, 2024 - Dec 31, 2024                     │
│  • No prerequisites required                                  │
│                                                               │
│                              [Cancel]  [Assign Template]      │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Analytics Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│  Template Analytics: Billing - Easy (Daniel Cruz)            │
│  Date Range: [Last 30 Days ▾]              [Export Report]  │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Overview Metrics                                             │
│  ┌─────────┬─────────┬──────────┬────────────┬──────────┐  │
│  │   45    │   128   │    96    │    75%     │   78%    │  │
│  │Assigned │Sessions │Completed │ Completion │Pass Rate │  │
│  │         │         │          │    Rate    │          │  │
│  └─────────┴─────────┴──────────┴────────────┴──────────┘  │
│                                                               │
│  Performance Distribution                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │    Score Range          Sessions        Percentage    │   │
│  │    90-100 (Excellent)      24              25%        │   │
│  │    70-89  (Good)           48              50%        │   │
│  │    60-69  (Pass)           16              17%        │   │
│  │    0-59   (Fail)            8               8%        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  Score Trends (Last 30 Days)                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  100 │                                  ╱─╲           │   │
│  │   80 │              ╱─╲      ╱─╲    ╱──   ─╲         │   │
│  │   60 │      ╱───╲──    ───╱─    ╲──          ─╲      │   │
│  │   40 │  ╱───                                    ───   │   │
│  │   20 │                                              │   │
│  │    0 └──────────────────────────────────────────────│   │
│  │       Oct 1    Oct 10   Oct 20   Oct 30            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  Criterion Performance (Average Scores)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Empathy            ████████████████░░  4.2/5        │   │
│  │  Problem Solving    ███████████████░░░  3.8/5        │   │
│  │  Communication      ████████████████░░  4.0/5        │   │
│  │  Call Closing       ████████████████░░  4.1/5        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  Recent Sessions                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ John Doe        82/100  ✓ Pass   8 min    Oct 24, 2024│ │
│  │ Maria Santos    91/100  ✓ Pass   7 min    Oct 23, 2024│ │
│  │ Carlos Garcia   58/100  ✗ Fail  12 min    Oct 23, 2024│ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  [View All Sessions]                                          │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. Mobile Responsive Views

### Mobile Template List

```
┌──────────────────────────────┐
│  Templates              ☰    │
├──────────────────────────────┤
│                              │
│  [+ New]  [Filters ▾]        │
│                              │
│  ┌──────────────────────────┐│
│  │ 📋 Billing - Easy        ││
│  │ Daniel Cruz              ││
│  │ Mock Call · Easy         ││
│  │ 45 assigned · 78% pass   ││
│  │ [Edit] [Clone]           ││
│  └──────────────────────────┘│
│                              │
│  ┌──────────────────────────┐│
│  │ 📋 Billing - Hard        ││
│  │ Karen Torres             ││
│  │ Mock Call · Hard         ││
│  │ 32 assigned · 62% pass   ││
│  │ [Edit] [Clone]           ││
│  └──────────────────────────┘│
│                              │
└──────────────────────────────┘
```

---

## Component Hierarchy

```
AdminDashboard
├── TabNavigation
│   ├── UsersTab
│   ├── RolesTab
│   ├── PermissionsTab
│   ├── SettingsTab
│   └── TemplatesTab ← NEW
│       ├── TemplatesList
│       │   ├── FilterPanel
│       │   ├── SearchBar
│       │   ├── TemplateCard[]
│       │   └── Pagination
│       ├── TemplateForm (Create/Edit)
│       │   ├── Step1_BasicInfo
│       │   ├── Step2_Persona
│       │   ├── Step3_Scenario
│       │   ├── Step4_Prompt
│       │   ├── Step5_Rubric
│       │   └── Step6_Preview
│       ├── TemplateDetail
│       │   ├── OverviewTab
│       │   ├── AssignmentsTab
│       │   ├── AnalyticsTab
│       │   └── HistoryTab
│       ├── AssignmentModal
│       │   ├── UserSelector
│       │   ├── SchedulePicker
│       │   └── PrerequisitesList
│       └── AnalyticsDashboard
│           ├── MetricsCards
│           ├── ScoreDistributionChart
│           ├── TrendChart
│           └── RecentSessionsList
```

---

## Design Tokens

### Colors

```css
--template-mock-call: #3B82F6;    /* Blue */
--template-chit-chat: #8B5CF6;    /* Purple */
--template-interview: #F59E0B;    /* Amber */

--difficulty-easy: #10B981;       /* Green */
--difficulty-medium: #F59E0B;     /* Orange */
--difficulty-hard: #EF4444;       /* Red */
--difficulty-expert: #8B5CF6;     /* Purple */

--status-active: #10B981;         /* Green */
--status-draft: #6B7280;          /* Gray */
--status-archived: #EF4444;       /* Red */
```

### Typography

```css
--font-heading: 'Inter', sans-serif;
--font-body: 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', monospace;  /* For JSON editor */
```

---

*Document Version: 1.0*
*Last Updated: October 2024*
*Design Review: Pending*
