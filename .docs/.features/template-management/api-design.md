# Template Management System - API Design

## API Architecture

The Template Management API follows RESTful principles with role-based access control. All admin endpoints require ADMIN or INSTRUCTOR role, while usage endpoints are accessible to authenticated users based on assignments.

## Base URL

```
/api/admin/templates/*     # Template management (Admin only)
/api/ai/templates/*        # Template usage (Assigned users)
```

## Authentication

All endpoints require authentication via NextAuth session.

```typescript
const session = await getServerSession(authConfig);
if (!session?.user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

## Authorization

Admin endpoints check user role:

```typescript
if (session.user.role !== 'ADMIN' && session.user.role !== 'INSTRUCTOR') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

---

## Admin API Endpoints

### 1. List Templates

**Endpoint:** `GET /api/admin/templates`

**Purpose:** Retrieve paginated list of templates with filtering

**Access:** ADMIN, INSTRUCTOR

**Query Parameters:**

```typescript
interface ListTemplatesQuery {
  page?: number;              // Default: 1
  limit?: number;             // Default: 20, Max: 100
  type?: TemplateType;        // Filter by type
  category?: TemplateCategory; // Filter by category
  difficulty?: DifficultyLevel; // Filter by difficulty
  search?: string;            // Search in name/description
  tags?: string;              // Comma-separated tags
  isActive?: boolean;         // Filter by active status
  isPublished?: boolean;      // Filter by published status
  isTemplate?: boolean;       // Pre-loaded vs custom
  createdBy?: string;         // Filter by creator ID
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'difficulty';
  sortOrder?: 'asc' | 'desc'; // Default: desc
}
```

**Response:**

```typescript
interface ListTemplatesResponse {
  templates: {
    id: string;
    name: string;
    slug: string;
    description: string;
    type: TemplateType;
    category: TemplateCategory;
    difficulty: DifficultyLevel;
    tags: string[];
    isActive: boolean;
    isPublished: boolean;
    isTemplate: boolean;
    estimatedDuration: number;
    passingScore: number;
    version: number;
    createdBy: {
      id: string;
      name: string;
      email: string;
    };
    createdAt: string;
    updatedAt: string;
    _count: {
      assignments: number;
      sessions: number;
    };
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

**Example Request:**

```bash
GET /api/admin/templates?type=MOCK_CALL&difficulty=EASY&page=1&limit=10
```

**Example Response:**

```json
{
  "templates": [
    {
      "id": "tmpl_123abc",
      "name": "Billing - Easy (Daniel Cruz)",
      "slug": "billing-easy-daniel-cruz",
      "description": "Practice handling a calm billing inquiry",
      "type": "MOCK_CALL",
      "category": "BILLING",
      "difficulty": "EASY",
      "tags": ["billing", "customer-service", "beginner"],
      "isActive": true,
      "isPublished": true,
      "isTemplate": true,
      "estimatedDuration": 10,
      "passingScore": 60,
      "version": 1,
      "createdBy": {
        "id": "user_admin",
        "name": "Admin User",
        "email": "admin@hirexp.com"
      },
      "createdAt": "2024-10-20T10:00:00Z",
      "updatedAt": "2024-10-20T10:00:00Z",
      "_count": {
        "assignments": 45,
        "sessions": 128
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 2. Get Single Template

**Endpoint:** `GET /api/admin/templates/[id]`

**Purpose:** Retrieve complete template details including all JSON configurations

**Access:** ADMIN, INSTRUCTOR

**Path Parameters:**
- `id`: Template ID or slug

**Response:**

```typescript
interface GetTemplateResponse {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: TemplateType;
  category: TemplateCategory;
  difficulty: DifficultyLevel;
  tags: string[];
  isActive: boolean;
  isPublished: boolean;
  isTemplate: boolean;

  // Full Configurations
  persona: PersonaConfig;
  scenario: ScenarioConfig;
  prompt: PromptConfig;
  rubric: RubricConfig;

  // Session Settings
  estimatedDuration: number;
  maxDuration: number | null;
  attemptsAllowed: number | null;
  passingScore: number;

  // Versioning
  version: number;
  parentId: string | null;
  parent: {
    id: string;
    name: string;
    version: number;
  } | null;
  versions: {
    id: string;
    version: number;
    createdAt: string;
  }[];

  // Audit
  createdBy: UserBasic;
  updatedBy: UserBasic | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;

  // Statistics
  stats: {
    totalAssignments: number;
    totalSessions: number;
    completionRate: number;
    averageScore: number;
    averageDuration: number;
  };
}
```

**Example Request:**

```bash
GET /api/admin/templates/tmpl_123abc
```

---

### 3. Create Template

**Endpoint:** `POST /api/admin/templates`

**Purpose:** Create a new template

**Access:** ADMIN, INSTRUCTOR

**Request Body:**

```typescript
interface CreateTemplateRequest {
  name: string;
  description: string;
  type: TemplateType;
  category: TemplateCategory;
  difficulty: DifficultyLevel;
  tags?: string[];

  persona: PersonaConfig;
  scenario: ScenarioConfig;
  prompt: PromptConfig;
  rubric: RubricConfig;

  estimatedDuration: number;
  maxDuration?: number;
  attemptsAllowed?: number;
  passingScore: number;

  isActive?: boolean;         // Default: true
  isPublished?: boolean;      // Default: false
}
```

**Validation Rules:**

1. `name` is required, 3-200 characters
2. `passingScore` must be 0-100
3. `estimatedDuration` must be > 0
4. `maxDuration` must be >= `estimatedDuration`
5. If rubric.method is 'weighted_average', weights must sum to 100
6. `persona`, `scenario`, `prompt`, `rubric` must match JSON schemas

**Response:**

```typescript
interface CreateTemplateResponse {
  id: string;
  name: string;
  slug: string;
  message: string;  // "Template created successfully"
}
```

**Example Request:**

```bash
POST /api/admin/templates
Content-Type: application/json

{
  "name": "Billing - Easy (Daniel Cruz)",
  "description": "Practice handling a calm customer with a simple billing inquiry",
  "type": "MOCK_CALL",
  "category": "BILLING",
  "difficulty": "EASY",
  "tags": ["billing", "customer-service", "beginner"],
  "persona": { /* PersonaConfig */ },
  "scenario": { /* ScenarioConfig */ },
  "prompt": { /* PromptConfig */ },
  "rubric": { /* RubricConfig */ },
  "estimatedDuration": 10,
  "passingScore": 60,
  "isPublished": true
}
```

---

### 4. Update Template

**Endpoint:** `PUT /api/admin/templates/[id]`

**Purpose:** Update existing template

**Access:** ADMIN (INSTRUCTOR can only update their own templates)

**Request Body:** Same as Create, all fields optional

**Versioning Logic:**

- If template has active assignments, create new version instead of modifying
- Increment `version` number
- Set `parentId` to current template
- Old version remains unchanged, new version created

**Response:**

```typescript
interface UpdateTemplateResponse {
  id: string;
  version: number;
  isNewVersion: boolean;  // true if new version created
  message: string;
}
```

---

### 5. Delete Template

**Endpoint:** `DELETE /api/admin/templates/[id]`

**Purpose:** Soft delete a template (archive)

**Access:** ADMIN only

**Behavior:**

- Sets `archivedAt` timestamp
- Sets `isActive = false`
- Does NOT delete from database (soft delete)
- Existing assignments remain but cannot create new ones

**Response:**

```typescript
interface DeleteTemplateResponse {
  id: string;
  archivedAt: string;
  message: string;  // "Template archived successfully"
}
```

---

### 6. Clone Template

**Endpoint:** `POST /api/admin/templates/[id]/clone`

**Purpose:** Create a copy of existing template for customization

**Access:** ADMIN, INSTRUCTOR

**Request Body:**

```typescript
interface CloneTemplateRequest {
  name: string;               // New name for cloned template
  modifications?: Partial<CreateTemplateRequest>; // Optional changes
}
```

**Response:**

```typescript
interface CloneTemplateResponse {
  id: string;
  name: string;
  slug: string;
  parentId: string;  // Original template ID
  message: string;
}
```

**Example Request:**

```bash
POST /api/admin/templates/tmpl_123abc/clone
Content-Type: application/json

{
  "name": "Billing - Medium (Modified Daniel)",
  "modifications": {
    "difficulty": "MEDIUM",
    "persona": {
      "frustrationLevel": 50  // Increase frustration
    }
  }
}
```

---

### 7. Restore Archived Template

**Endpoint:** `POST /api/admin/templates/[id]/restore`

**Purpose:** Restore a soft-deleted template

**Access:** ADMIN only

**Response:**

```typescript
interface RestoreTemplateResponse {
  id: string;
  isActive: boolean;  // true
  message: string;
}
```

---

### 8. Publish/Unpublish Template

**Endpoint:** `PATCH /api/admin/templates/[id]/publish`

**Purpose:** Toggle template published status

**Access:** ADMIN only

**Request Body:**

```typescript
interface PublishTemplateRequest {
  isPublished: boolean;
}
```

**Response:**

```typescript
interface PublishTemplateResponse {
  id: string;
  isPublished: boolean;
  message: string;
}
```

---

## Assignment API Endpoints

### 9. Create Assignment

**Endpoint:** `POST /api/admin/templates/[id]/assign`

**Purpose:** Assign template to user(s)

**Access:** ADMIN, INSTRUCTOR

**Request Body:**

```typescript
interface CreateAssignmentRequest {
  userIds: string[];          // Can assign to multiple users
  availableFrom?: string;     // ISO date, null = immediate
  availableUntil?: string;    // ISO date, null = no expiration
  prerequisites?: string[];   // Template IDs that must be completed first
  notes?: string;             // Internal notes about assignment
}
```

**Response:**

```typescript
interface CreateAssignmentResponse {
  assignments: {
    id: string;
    userId: string;
    templateId: string;
    status: AssignmentStatus;
  }[];
  message: string;
}
```

---

### 10. List Template Assignments

**Endpoint:** `GET /api/admin/templates/[id]/assignments`

**Purpose:** View all assignments for a template

**Access:** ADMIN, INSTRUCTOR

**Query Parameters:**

```typescript
interface ListAssignmentsQuery {
  status?: AssignmentStatus;
  userId?: string;
  page?: number;
  limit?: number;
}
```

**Response:**

```typescript
interface ListAssignmentsResponse {
  assignments: {
    id: string;
    user: UserBasic;
    status: AssignmentStatus;
    assignedBy: UserBasic;
    availableFrom: string | null;
    availableUntil: string | null;
    startedAt: string | null;
    completedAt: string | null;
    attemptCount: number;
    lastAttemptAt: string | null;
    createdAt: string;
  }[];
  pagination: PaginationMeta;
}
```

---

### 11. Update Assignment

**Endpoint:** `PATCH /api/admin/assignments/[id]`

**Purpose:** Modify assignment dates or prerequisites

**Access:** ADMIN, INSTRUCTOR (own assignments only)

**Request Body:**

```typescript
interface UpdateAssignmentRequest {
  availableFrom?: string;
  availableUntil?: string;
  prerequisites?: string[];
  notes?: string;
}
```

---

### 12. Delete Assignment

**Endpoint:** `DELETE /api/admin/assignments/[id]`

**Purpose:** Remove assignment

**Access:** ADMIN only

**Behavior:**

- Hard delete assignment
- Does NOT delete related sessions (historical data preserved)

---

## Usage API Endpoints (For Trainees)

### 13. Get My Assigned Templates

**Endpoint:** `GET /api/ai/templates/assigned`

**Purpose:** Retrieve templates assigned to current user

**Access:** All authenticated users

**Query Parameters:**

```typescript
interface GetAssignedTemplatesQuery {
  type?: TemplateType;
  status?: AssignmentStatus;
}
```

**Response:**

```typescript
interface GetAssignedTemplatesResponse {
  templates: {
    id: string;
    name: string;
    description: string;
    type: TemplateType;
    category: TemplateCategory;
    difficulty: DifficultyLevel;
    estimatedDuration: number;
    passingScore: number;

    assignment: {
      id: string;
      status: AssignmentStatus;
      availableFrom: string | null;
      availableUntil: string | null;
      attemptCount: number;
      attemptsAllowed: number | null;
      canStart: boolean;        // Computed field
      blockedReason?: string;   // Why can't start (if canStart = false)
    };

    // Progress
    bestScore: number | null;
    lastAttemptAt: string | null;
    completedAt: string | null;
  }[];
}
```

**Example Response:**

```json
{
  "templates": [
    {
      "id": "tmpl_123abc",
      "name": "Billing - Easy (Daniel Cruz)",
      "description": "Practice handling a calm billing inquiry",
      "type": "MOCK_CALL",
      "category": "BILLING",
      "difficulty": "EASY",
      "estimatedDuration": 10,
      "passingScore": 60,
      "assignment": {
        "id": "assign_xyz",
        "status": "ASSIGNED",
        "availableFrom": null,
        "availableUntil": "2024-12-31T23:59:59Z",
        "attemptCount": 0,
        "attemptsAllowed": 3,
        "canStart": true
      },
      "bestScore": null,
      "lastAttemptAt": null,
      "completedAt": null
    },
    {
      "id": "tmpl_456def",
      "name": "Billing - Hard (Karen Torres)",
      "type": "MOCK_CALL",
      "category": "BILLING",
      "difficulty": "HARD",
      "assignment": {
        "status": "LOCKED",
        "canStart": false,
        "blockedReason": "Must complete 'Billing - Easy' first"
      }
    }
  ]
}
```

---

### 14. Get Template Configuration for Session

**Endpoint:** `GET /api/ai/templates/[id]/config`

**Purpose:** Load full template configuration to start AI session

**Access:** Authenticated users with active assignment

**Authorization:**

- Check if user has assignment for this template
- Verify assignment is not LOCKED or EXPIRED
- Verify attempt limits not exceeded

**Response:**

```typescript
interface GetTemplateConfigResponse {
  template: {
    id: string;
    name: string;
    type: TemplateType;
    category: TemplateCategory;
    difficulty: DifficultyLevel;

    // Full configs for AI session
    persona: PersonaConfig;
    scenario: ScenarioConfig;
    prompt: PromptConfig;
    rubric: RubricConfig;

    estimatedDuration: number;
    maxDuration: number | null;
    passingScore: number;
  };
  assignment: {
    id: string;
    attemptCount: number;
    attemptsAllowed: number | null;
  };
}
```

---

### 15. Start AI Session

**Endpoint:** `POST /api/ai/sessions/start`

**Purpose:** Initialize new AI training session

**Access:** Authenticated users

**Request Body:**

```typescript
interface StartSessionRequest {
  templateId: string;
  assignmentId?: string;  // Optional, for tracking assignment progress
}
```

**Response:**

```typescript
interface StartSessionResponse {
  sessionId: string;
  templateId: string;
  startedAt: string;
  maxDuration: number | null;
  message: string;
}
```

**Side Effects:**

- Create AiSession record with status IN_PROGRESS
- Increment assignment.attemptCount
- Update assignment.status to IN_PROGRESS (if first attempt)
- Update assignment.lastAttemptAt

---

### 16. Submit AI Session for Evaluation

**Endpoint:** `POST /api/ai/sessions/[id]/evaluate`

**Purpose:** End session and calculate scores

**Access:** Session owner only

**Request Body:**

```typescript
interface EvaluateSessionRequest {
  transcript: {
    timestamp: string;
    speaker: 'user' | 'ai';
    message: string;
  }[];
  audioRecordings?: string[];  // Cloudinary URLs
}
```

**Response:**

```typescript
interface EvaluateSessionResponse {
  evaluation: {
    id: string;
    sessionId: string;
    scores: Record<string, number>;
    totalScore: number;
    passed: boolean;
    feedback: string;
    strengths: string[];
    improvements: string[];
    suggestions: string[];
  };
  assignment?: {
    status: AssignmentStatus;  // Updated if passed
    completedAt: string | null;
  };
}
```

**Evaluation Logic:**

1. Load template rubric
2. Apply rubric to transcript using AI analysis
3. Calculate scores per criterion
4. Compute total score
5. Generate feedback
6. Update session status to COMPLETED
7. If passed and has assignment, update assignment to COMPLETED

---

## Analytics Endpoints

### 17. Template Analytics

**Endpoint:** `GET /api/admin/templates/[id]/analytics`

**Purpose:** View template performance metrics

**Access:** ADMIN, INSTRUCTOR

**Query Parameters:**

```typescript
interface TemplateAnalyticsQuery {
  dateFrom?: string;  // ISO date
  dateTo?: string;    // ISO date
}
```

**Response:**

```typescript
interface TemplateAnalyticsResponse {
  overview: {
    totalAssignments: number;
    totalSessions: number;
    totalCompletions: number;
    completionRate: number;  // percentage
    averageScore: number;
    averageDuration: number;  // seconds
    passRate: number;  // percentage
  };

  scoreDistribution: {
    range: string;  // "0-20", "21-40", etc.
    count: number;
    percentage: number;
  }[];

  attemptDistribution: {
    attempts: number;
    users: number;
  }[];

  topPerformers: {
    user: UserBasic;
    score: number;
    completedAt: string;
  }[];

  recentSessions: {
    id: string;
    user: UserBasic;
    score: number;
    passed: boolean;
    duration: number;
    completedAt: string;
  }[];
}
```

---

## Error Responses

All endpoints follow consistent error format:

```typescript
interface ErrorResponse {
  error: string;           // Short error code
  message: string;         // Human-readable message
  details?: any;           // Additional error context
  statusCode: number;
}
```

**Common Error Codes:**

| Status | Error Code | Message |
|--------|------------|---------|
| 400 | VALIDATION_ERROR | Invalid request data |
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |

**Example Error Response:**

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Template validation failed",
  "details": {
    "rubric": {
      "weights": "Criterion weights must sum to 100"
    }
  },
  "statusCode": 400
}
```

---

## Rate Limiting

| Endpoint Type | Rate Limit |
|---------------|------------|
| Admin - List/Read | 100 requests / minute |
| Admin - Write | 20 requests / minute |
| Usage - Read | 60 requests / minute |
| Session Start | 10 requests / minute |

---

## API Versioning

Current version: `v1`

Future versions will use URL prefix: `/api/v2/admin/templates`

---

*Document Version: 1.0*
*Last Updated: October 2024*
*API Stability: Experimental*
