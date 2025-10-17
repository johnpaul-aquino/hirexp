# Scenario Management API - Complete Reference

## Base URL

```
Production: https://api.hirexp.com/v1
Staging: https://staging-api.hirexp.com/v1
Development: http://localhost:3000/api
```

## Authentication

All admin API endpoints require authentication via JWT token:

```http
Authorization: Bearer <access_token>
```

## Common Response Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Resource deleted successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (duplicate slug, etc.) |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

## Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "name",
        "message": "Name must be at least 3 characters"
      }
    ]
  }
}
```

## Endpoints Overview

### Scenarios
- `POST /admin/scenarios` - Create scenario
- `GET /admin/scenarios` - List scenarios
- `GET /admin/scenarios/:id` - Get scenario
- `PUT /admin/scenarios/:id` - Update scenario
- `PATCH /admin/scenarios/:id` - Partial update
- `DELETE /admin/scenarios/:id` - Delete scenario

### Scenario Operations
- `POST /admin/scenarios/:id/duplicate` - Duplicate
- `POST /admin/scenarios/:id/publish` - Publish
- `POST /admin/scenarios/:id/archive` - Archive
- `POST /admin/scenarios/:id/restore` - Restore
- `POST /admin/scenarios/search` - Advanced search

### Version Management
- `GET /admin/scenarios/:id/versions` - List versions
- `GET /admin/scenarios/:id/versions/:versionNumber` - Get version
- `POST /admin/scenarios/:id/versions/:versionNumber/restore` - Restore version
- `GET /admin/scenarios/:id/versions/compare` - Compare versions

### Templates
- `GET /admin/templates` - List templates
- `GET /admin/templates/:id` - Get template
- `POST /admin/templates/:id/create-scenario` - Create from template

### Bulk Operations
- `POST /admin/scenarios/bulk/import` - Bulk import
- `POST /admin/scenarios/bulk/export` - Bulk export
- `PATCH /admin/scenarios/bulk/update` - Bulk update
- `DELETE /admin/scenarios/bulk/delete` - Bulk delete

### Analytics
- `GET /admin/scenarios/:id/analytics` - Get analytics
- `POST /admin/scenarios/analytics/compare` - Compare scenarios
- `GET /admin/analytics/dashboard` - Overview dashboard

### Comments & Collaboration
- `POST /admin/scenarios/:id/comments` - Add comment
- `GET /admin/scenarios/:id/comments` - List comments
- `PATCH /admin/scenarios/:id/comments/:commentId` - Update comment
- `DELETE /admin/scenarios/:id/comments/:commentId` - Delete comment

### A/B Testing
- `POST /admin/scenarios/tests` - Create test
- `GET /admin/scenarios/tests/:id` - Get test
- `PATCH /admin/scenarios/tests/:id` - Update test
- `DELETE /admin/scenarios/tests/:id` - Cancel test

---

## Detailed API Documentation

## 1. Create Scenario

Create a new scenario.

**Endpoint:** `POST /admin/scenarios`

**Permissions:** `scenario:create`

**Rate Limit:** 10 requests per hour

### Request Body

```json
{
  "name": "Billing Dispute - Overcharge",
  "description": "Customer received incorrect bill with overcharge",
  "category": "BILLING_PAYMENTS",
  "difficulty": "INTERMEDIATE",
  "estimatedDuration": 10,
  "tags": ["billing", "dispute", "overcharge"],

  "customerProfile": {
    "name": "Robert Johnson",
    "age": 45,
    "personality": ["assertive", "detail-oriented"],
    "initialMood": 35,
    "speakingStyle": "firm, wants explanations",
    "backgroundStory": "Long-term customer with good payment history",
    "voiceProfileId": "angry_customer"
  },

  "context": {
    "companyName": "TelcoMax",
    "industry": "telecommunications",
    "productService": "Internet and TV bundle",
    "issue": "Bill is $75 higher than usual",
    "contextDetails": {
      "normalBill": 150,
      "currentBill": 225,
      "accountAge": "10 years",
      "paymentHistory": "excellent"
    },
    "priorInteractions": 0
  },

  "aiConfig": {
    "systemPrompt": "You are Robert Johnson, calling about...",
    "temperature": 0.8,
    "interruptionRate": 0.15,
    "escalationThreshold": 70,
    "emotionalTriggers": [
      { "trigger": "no_empathy", "moodChange": -15 },
      { "trigger": "good_solution", "moodChange": +20 }
    ]
  },

  "successCriteria": {
    "targetOutcome": "Issue resolved with credit applied",
    "acceptableSolutions": [
      "Immediate credit + future discount",
      "Full credit on next bill",
      "Investigation with callback"
    ],
    "mustUseKeywords": ["understand", "apologize", "resolve"],
    "avoidKeywords": ["policy", "nothing we can do"],
    "timeLimit": 600
  },

  "evaluationWeights": {
    "greeting": 10,
    "listening": 20,
    "solution": 25,
    "empathy": 20,
    "closing": 10,
    "customMetrics": [
      {
        "name": "billing_knowledge",
        "weight": 15,
        "description": "Understanding of billing processes"
      }
    ]
  },

  "status": "DRAFT",
  "isPrivate": false,
  "tenantId": null
}
```

### Response (201 Created)

```json
{
  "id": "scn_2KjNxBqP8M",
  "name": "Billing Dispute - Overcharge",
  "slug": "billing-dispute-overcharge",
  "status": "DRAFT",
  "versionNumber": 1,
  "createdAt": "2025-10-17T10:00:00.000Z",
  "createdBy": "usr_xyz789",
  "creator": {
    "id": "usr_xyz789",
    "name": "John Admin",
    "email": "john@hirexp.com"
  }
}
```

### Validation Errors (422)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "name",
        "message": "Name must be at least 3 characters"
      },
      {
        "field": "aiConfig.temperature",
        "message": "Temperature must be between 0 and 2"
      }
    ]
  }
}
```

---

## 2. Get Scenario

Retrieve a single scenario by ID.

**Endpoint:** `GET /admin/scenarios/:id`

**Permissions:** `scenario:read`

**Query Parameters:**
- `includeAnalytics` (boolean) - Include analytics data
- `includeVersions` (boolean) - Include version history

### Response (200 OK)

```json
{
  "id": "scn_2KjNxBqP8M",
  "name": "Billing Dispute - Overcharge",
  "description": "Customer received incorrect bill with overcharge",
  "slug": "billing-dispute-overcharge",
  "category": "BILLING_PAYMENTS",
  "difficulty": "INTERMEDIATE",
  "estimatedDuration": 10,
  "tags": ["billing", "dispute", "overcharge"],
  "status": "PUBLISHED",
  "versionNumber": 3,

  "customerProfile": {
    "name": "Robert Johnson",
    "age": 45,
    "personality": ["assertive", "detail-oriented"],
    "initialMood": 35,
    "speakingStyle": "firm, wants explanations",
    "backgroundStory": "Long-term customer with good payment history",
    "voiceProfileId": "angry_customer"
  },

  "context": {
    "companyName": "TelcoMax",
    "industry": "telecommunications",
    "issue": "Bill is $75 higher than usual"
  },

  "aiConfig": {
    "systemPrompt": "...",
    "temperature": 0.8,
    "interruptionRate": 0.15
  },

  "successCriteria": {
    "targetOutcome": "Issue resolved with credit applied",
    "acceptableSolutions": [...]
  },

  "evaluationWeights": {
    "greeting": 10,
    "listening": 20,
    "solution": 25,
    "empathy": 20,
    "closing": 10
  },

  "metadata": {
    "createdAt": "2025-10-15T10:00:00.000Z",
    "createdBy": "usr_xyz789",
    "creator": {
      "id": "usr_xyz789",
      "name": "John Admin",
      "email": "john@hirexp.com"
    },
    "updatedAt": "2025-10-17T10:00:00.000Z",
    "updatedBy": "usr_abc456",
    "publishedAt": "2025-10-16T14:30:00.000Z",
    "publishedBy": "usr_xyz789"
  },

  "analytics": {
    "totalAttempts": 245,
    "uniqueUsers": 189,
    "completionRate": 0.89,
    "averageDuration": 487,
    "averageScore": 82.5,
    "passRate": 0.91,
    "averageRating": 4.5
  }
}
```

---

## 3. List Scenarios

List scenarios with filtering and pagination.

**Endpoint:** `GET /admin/scenarios`

**Permissions:** `scenario:read`

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 20, max: 100)
- `search` (string) - Search query
- `status` (string[]) - Filter by status
- `category` (string[]) - Filter by category
- `difficulty` (string[]) - Filter by difficulty
- `createdBy` (string) - Filter by creator
- `tenantId` (string) - Filter by tenant
- `isPrivate` (boolean) - Filter private scenarios
- `sortBy` (string) - Sort field (name|createdAt|updatedAt|usageCount|rating)
- `sortOrder` (string) - Sort order (asc|desc)

### Example Request

```http
GET /admin/scenarios?page=1&limit=20&status=PUBLISHED&category=BILLING_PAYMENTS&sortBy=usageCount&sortOrder=desc
```

### Response (200 OK)

```json
{
  "data": [
    {
      "id": "scn_2KjNxBqP8M",
      "name": "Billing Dispute - Overcharge",
      "slug": "billing-dispute-overcharge",
      "description": "Customer received incorrect bill",
      "category": "BILLING_PAYMENTS",
      "difficulty": "INTERMEDIATE",
      "status": "PUBLISHED",
      "tags": ["billing", "dispute"],
      "versionNumber": 3,
      "isTemplate": false,
      "usageCount": 245,
      "analytics": {
        "totalAttempts": 245,
        "averageScore": 82.5,
        "averageRating": 4.5
      },
      "creator": {
        "id": "usr_xyz789",
        "name": "John Admin"
      },
      "createdAt": "2025-10-15T10:00:00.000Z",
      "updatedAt": "2025-10-17T10:00:00.000Z",
      "publishedAt": "2025-10-16T14:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  },
  "filters": {
    "appliedFilters": {
      "status": ["PUBLISHED"],
      "category": ["BILLING_PAYMENTS"]
    },
    "availableFilters": {
      "categories": ["BILLING_PAYMENTS", "TECHNICAL_SUPPORT", ...],
      "difficulties": ["BEGINNER", "INTERMEDIATE", ...],
      "statuses": ["DRAFT", "PUBLISHED", ...]
    }
  }
}
```

---

## 4. Update Scenario

Update an existing scenario.

**Endpoint:** `PUT /admin/scenarios/:id`

**Permissions:** `scenario:update`

**Note:** Creates a new version automatically.

### Request Body

```json
{
  "name": "Billing Dispute - Overcharge (Updated)",
  "aiConfig": {
    "temperature": 0.85,
    "interruptionRate": 0.2
  },
  "changelog": "Increased customer frustration level for realism"
}
```

### Response (200 OK)

```json
{
  "id": "scn_2KjNxBqP8M",
  "versionNumber": 4,
  "previousVersionNumber": 3,
  "updatedAt": "2025-10-17T11:00:00.000Z",
  "updatedBy": "usr_xyz789",
  "changelog": "Increased customer frustration level for realism",
  "message": "Scenario updated successfully"
}
```

---

## 5. Partial Update (Patch)

Update specific fields without creating a new version.

**Endpoint:** `PATCH /admin/scenarios/:id`

**Permissions:** `scenario:update`

### Request Body

```json
{
  "tags": ["billing", "dispute", "urgent"],
  "estimatedDuration": 12
}
```

### Response (200 OK)

```json
{
  "id": "scn_2KjNxBqP8M",
  "updatedAt": "2025-10-17T11:30:00.000Z",
  "message": "Scenario updated successfully"
}
```

---

## 6. Delete Scenario

Delete or archive a scenario.

**Endpoint:** `DELETE /admin/scenarios/:id`

**Permissions:** `scenario:delete`

**Query Parameters:**
- `permanent` (boolean) - Permanently delete (requires SUPER_ADMIN)

### Soft Delete (Archive)

```http
DELETE /admin/scenarios/scn_2KjNxBqP8M
```

**Response:** `204 No Content`

### Permanent Delete

```http
DELETE /admin/scenarios/scn_2KjNxBqP8M?permanent=true
```

**Response:** `204 No Content`

---

## 7. Duplicate Scenario

Create a copy of an existing scenario.

**Endpoint:** `POST /admin/scenarios/:id/duplicate`

**Permissions:** `scenario:create`

### Request Body

```json
{
  "newName": "Billing Dispute - Overcharge (Copy)",
  "preserveAnalytics": false,
  "status": "DRAFT"
}
```

### Response (201 Created)

```json
{
  "id": "scn_new456",
  "originalId": "scn_2KjNxBqP8M",
  "name": "Billing Dispute - Overcharge (Copy)",
  "status": "DRAFT",
  "createdAt": "2025-10-17T12:00:00.000Z"
}
```

---

## 8. Publish Scenario

Publish a draft or approved scenario.

**Endpoint:** `POST /admin/scenarios/:id/publish`

**Permissions:** `scenario:publish`

### Request Body

```json
{
  "notes": "Ready for production use",
  "notifyUsers": false
}
```

### Response (200 OK)

```json
{
  "id": "scn_2KjNxBqP8M",
  "status": "PUBLISHED",
  "publishedAt": "2025-10-17T12:00:00.000Z",
  "publishedBy": "usr_xyz789",
  "message": "Scenario published successfully"
}
```

---

## 9. Archive Scenario

Archive a published scenario.

**Endpoint:** `POST /admin/scenarios/:id/archive`

**Permissions:** `scenario:update`

### Request Body

```json
{
  "reason": "Outdated scenario, replaced by scn_new456"
}
```

### Response (200 OK)

```json
{
  "id": "scn_2KjNxBqP8M",
  "status": "ARCHIVED",
  "archivedAt": "2025-10-17T13:00:00.000Z",
  "archivedBy": "usr_xyz789"
}
```

---

## 10. Advanced Search

Perform full-text search with relevance ranking.

**Endpoint:** `POST /admin/scenarios/search`

**Permissions:** `scenario:read`

### Request Body

```json
{
  "query": "billing dispute angry customer",
  "filters": {
    "categories": ["BILLING_PAYMENTS"],
    "difficulties": ["INTERMEDIATE", "ADVANCED"],
    "status": ["PUBLISHED"],
    "minRating": 4.0,
    "minUsageCount": 10
  },
  "sort": {
    "by": "relevance",
    "order": "desc"
  },
  "page": 1,
  "limit": 20
}
```

### Response (200 OK)

```json
{
  "results": [
    {
      "id": "scn_2KjNxBqP8M",
      "name": "Billing Dispute - Overcharge",
      "description": "Customer is angry about incorrect bill...",
      "category": "BILLING_PAYMENTS",
      "difficulty": "INTERMEDIATE",
      "relevanceScore": 0.95,
      "matchedFields": ["name", "description", "tags"],
      "highlights": {
        "description": "...customer is <em>angry</em> about incorrect <em>billing</em>...",
        "tags": ["<em>billing</em>", "<em>dispute</em>"]
      },
      "analytics": {
        "averageRating": 4.5,
        "usageCount": 245
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "totalPages": 1
  },
  "searchMeta": {
    "query": "billing dispute angry customer",
    "processingTime": 45,
    "totalResults": 12
  }
}
```

---

## 11. Get Version History

Get all versions of a scenario.

**Endpoint:** `GET /admin/scenarios/:id/versions`

**Permissions:** `scenario:read`

### Response (200 OK)

```json
{
  "scenarioId": "scn_2KjNxBqP8M",
  "currentVersion": 4,
  "versions": [
    {
      "versionId": "ver_123",
      "versionNumber": 4,
      "changelog": "Increased frustration level",
      "createdBy": "usr_xyz789",
      "creator": {
        "name": "John Admin",
        "email": "john@hirexp.com"
      },
      "createdAt": "2025-10-17T10:00:00.000Z",
      "isActive": true,
      "publishedAt": null
    },
    {
      "versionId": "ver_122",
      "versionNumber": 3,
      "changelog": "Updated voice profile",
      "createdBy": "usr_abc456",
      "creator": {
        "name": "Jane Editor",
        "email": "jane@hirexp.com"
      },
      "createdAt": "2025-10-16T14:00:00.000Z",
      "isActive": false,
      "publishedAt": "2025-10-16T14:30:00.000Z"
    }
  ],
  "totalVersions": 4
}
```

---

## 12. Get Specific Version

Get full data for a specific version.

**Endpoint:** `GET /admin/scenarios/:id/versions/:versionNumber`

**Permissions:** `scenario:read`

### Response (200 OK)

```json
{
  "versionId": "ver_122",
  "scenarioId": "scn_2KjNxBqP8M",
  "versionNumber": 3,
  "changelog": "Updated voice profile",
  "snapshot": {
    "name": "Billing Dispute - Overcharge",
    "customerProfile": { ... },
    "aiConfig": { ... }
    // Full scenario data at this version
  },
  "createdBy": "usr_abc456",
  "creator": {
    "name": "Jane Editor",
    "email": "jane@hirexp.com"
  },
  "createdAt": "2025-10-16T14:00:00.000Z",
  "publishedAt": "2025-10-16T14:30:00.000Z"
}
```

---

## 13. Compare Versions

Compare two versions side-by-side.

**Endpoint:** `GET /admin/scenarios/:id/versions/compare?from=2&to=3`

**Permissions:** `scenario:read`

**Query Parameters:**
- `from` (number) - Source version number
- `to` (number) - Target version number

### Response (200 OK)

```json
{
  "scenarioId": "scn_2KjNxBqP8M",
  "from": 2,
  "to": 3,
  "differences": [
    {
      "path": "aiConfig.temperature",
      "field": "temperature",
      "oldValue": 0.8,
      "newValue": 0.85,
      "changeType": "modified"
    },
    {
      "path": "customerProfile.initialMood",
      "field": "initialMood",
      "oldValue": 35,
      "newValue": 25,
      "changeType": "modified"
    },
    {
      "path": "tags",
      "field": "tags",
      "oldValue": ["billing", "dispute"],
      "newValue": ["billing", "dispute", "urgent"],
      "changeType": "added"
    }
  ],
  "totalChanges": 3,
  "changedBy": "usr_abc456",
  "changedAt": "2025-10-16T14:00:00.000Z"
}
```

---

## 14. Restore Version

Restore a previous version.

**Endpoint:** `POST /admin/scenarios/:id/versions/:versionNumber/restore`

**Permissions:** `scenario:update`

### Request Body

```json
{
  "createNewVersion": true,
  "changelog": "Reverted to version 2 due to performance issues"
}
```

### Response (200 OK)

```json
{
  "id": "scn_2KjNxBqP8M",
  "versionNumber": 5,
  "restoredFromVersion": 2,
  "updatedAt": "2025-10-17T14:00:00.000Z",
  "message": "Version restored successfully"
}
```

---

## 15. Get Analytics

Get detailed analytics for a scenario.

**Endpoint:** `GET /admin/scenarios/:id/analytics?period=30d`

**Permissions:** `scenario:read`

**Query Parameters:**
- `period` (string) - Time period (7d|30d|90d|1y|custom)
- `startDate` (ISO 8601) - Custom start date
- `endDate` (ISO 8601) - Custom end date

### Response (200 OK)

```json
{
  "scenarioId": "scn_2KjNxBqP8M",
  "period": {
    "start": "2025-09-17T00:00:00.000Z",
    "end": "2025-10-17T23:59:59.000Z",
    "days": 30
  },
  "metrics": {
    "totalAttempts": 245,
    "uniqueUsers": 189,
    "completionRate": 0.89,
    "averageDuration": 487,
    "averageScore": 82.5,
    "passRate": 0.91
  },
  "scoreDistribution": {
    "greeting": 85.2,
    "listening": 80.1,
    "solution": 83.7,
    "empathy": 81.9,
    "closing": 84.5
  },
  "scoreBreakdown": {
    "0-60": 12,
    "61-70": 23,
    "71-80": 67,
    "81-90": 98,
    "91-100": 45
  },
  "userFeedback": {
    "averageRating": 4.5,
    "feedbackCount": 67,
    "ratings": {
      "5": 35,
      "4": 22,
      "3": 7,
      "2": 2,
      "1": 1
    },
    "reportedIssues": 3
  },
  "performance": {
    "avgTokensUsed": 1250,
    "avgLatency": 1.8,
    "errorRate": 0.02
  },
  "trends": [
    {
      "date": "2025-10-15",
      "attempts": 12,
      "avgScore": 81.2,
      "completionRate": 0.87
    },
    {
      "date": "2025-10-16",
      "attempts": 15,
      "avgScore": 83.5,
      "completionRate": 0.91
    }
  ]
}
```

---

## 16. Bulk Import

Import multiple scenarios from file.

**Endpoint:** `POST /admin/scenarios/bulk/import`

**Permissions:** `scenario:create`

**Content-Type:** `multipart/form-data`

### Request

```http
POST /admin/scenarios/bulk/import
Content-Type: multipart/form-data

file: scenarios.json
options: {
  "validateOnly": false,
  "skipErrors": true,
  "defaultStatus": "DRAFT",
  "overwriteExisting": false
}
```

### Response (200 OK)

```json
{
  "imported": 45,
  "skipped": 3,
  "failed": 2,
  "errors": [
    {
      "row": 12,
      "scenarioName": "Invalid Scenario",
      "error": "Invalid category value: INVALID_CATEGORY",
      "field": "category"
    },
    {
      "row": 28,
      "scenarioName": "Duplicate Scenario",
      "error": "Scenario with slug already exists",
      "field": "slug"
    }
  ],
  "scenarioIds": [
    "scn_001",
    "scn_002",
    ...
  ],
  "processingTime": 3.5,
  "downloadErrorReport": "/admin/imports/reports/imp_xyz789.json"
}
```

---

## 17. Bulk Export

Export multiple scenarios.

**Endpoint:** `POST /admin/scenarios/bulk/export`

**Permissions:** `scenario:read`

### Request Body

```json
{
  "scenarioIds": ["scn_001", "scn_002", "scn_003"],
  "format": "json",
  "includeAnalytics": true,
  "includeVersions": false,
  "compression": "zip"
}
```

### Response (200 OK)

```json
{
  "exportId": "exp_abc123",
  "downloadUrl": "https://cloudinary.com/exports/scenarios_20251017.zip",
  "expiresAt": "2025-10-18T12:00:00.000Z",
  "fileSize": 2458320,
  "scenarioCount": 3,
  "format": "json",
  "createdAt": "2025-10-17T14:00:00.000Z"
}
```

---

## 18. List Templates

Get available scenario templates.

**Endpoint:** `GET /admin/templates`

**Permissions:** `template:read`

**Query Parameters:**
- `category` (string)
- `difficulty` (string)
- `featured` (boolean)

### Response (200 OK)

```json
{
  "templates": [
    {
      "id": "tmp_001",
      "name": "Billing Dispute Template",
      "description": "General billing complaint template with customizable details",
      "thumbnail": "https://cloudinary.com/templates/billing-dispute.png",
      "category": "BILLING_PAYMENTS",
      "difficulty": "INTERMEDIATE",
      "industry": "telecommunications",
      "usageCount": 145,
      "averageRating": 4.7,
      "variables": [
        {
          "key": "customerName",
          "label": "Customer Name",
          "type": "text",
          "required": true
        },
        {
          "key": "issueAmount",
          "label": "Disputed Amount",
          "type": "number",
          "required": true
        }
      ],
      "isFeatured": true,
      "createdBy": "usr_system"
    }
  ]
}
```

---

## 19. Create from Template

Create a scenario from a template.

**Endpoint:** `POST /admin/templates/:templateId/create-scenario`

**Permissions:** `scenario:create`

### Request Body

```json
{
  "name": "Custom Billing Scenario",
  "variables": {
    "customerName": "Jane Smith",
    "companyName": "MyCompany Inc",
    "issueAmount": 75
  }
}
```

### Response (201 Created)

```json
{
  "id": "scn_new789",
  "name": "Custom Billing Scenario",
  "templateId": "tmp_001",
  "status": "DRAFT",
  "createdAt": "2025-10-17T15:00:00.000Z"
}
```

---

## Rate Limiting

Rate limits vary by endpoint and user role:

### Limits by Endpoint Type

| Endpoint | Limit | Window |
|----------|-------|--------|
| Create/Update | 10 requests | 1 hour |
| Read | 100 requests | 1 minute |
| Bulk Import | 3 requests | 1 hour |
| Bulk Export | 5 requests | 1 hour |
| Analytics | 20 requests | 1 minute |

### Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1634567890
```

### Rate Limit Exceeded (429)

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "retryAfter": 3600,
    "limit": 10,
    "windowSeconds": 3600
  }
}
```

---

## Webhooks (Future)

Webhook events for scenario changes:

```json
{
  "event": "scenario.published",
  "timestamp": "2025-10-17T12:00:00.000Z",
  "data": {
    "scenarioId": "scn_2KjNxBqP8M",
    "name": "Billing Dispute - Overcharge",
    "status": "PUBLISHED",
    "publishedBy": "usr_xyz789"
  }
}
```

**Available Events:**
- `scenario.created`
- `scenario.updated`
- `scenario.published`
- `scenario.archived`
- `scenario.deleted`

---

*Document Version: 1.0*
*Created: October 2025*
*Next Review: November 2025*
