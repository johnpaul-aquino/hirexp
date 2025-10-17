# Authentication API Design

## API Overview

The authentication API provides comprehensive endpoints for user registration, login, profile management, and admin operations. All endpoints follow RESTful conventions with consistent error handling and response formats.

## Base URL Structure

```
Production: https://api.hirexp.com
Staging: https://staging-api.hirexp.com
Development: http://localhost:3000

API Version: /api/v1
Auth Base: /api/v1/auth
User Base: /api/v1/user
Admin Base: /api/v1/admin
```

## Authentication Endpoints

### 1. User Registration

#### POST `/api/v1/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "role": "TRAINEE", // TRAINEE | INSTRUCTOR | COMPANY
  "agreedToTerms": true,
  "marketingConsent": false
}
```

**Validation Rules:**
- Email: Valid email format, unique in database
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
- Name: Min 2 chars, max 100 chars
- Role: Must be valid role (not ADMIN)
- agreedToTerms: Must be true

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "userId": "cuid_123456",
    "email": "user@example.com",
    "role": "TRAINEE"
  }
}
```

**Error Responses:**
```json
// 400 Bad Request - Validation Error
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    {
      "field": "password",
      "message": "Password must contain at least one special character"
    }
  ]
}

// 409 Conflict - Email Already Exists
{
  "success": false,
  "error": "Email already registered"
}

// 429 Too Many Requests
{
  "success": false,
  "error": "Too many registration attempts. Please try again later.",
  "retryAfter": 3600 // seconds
}
```

### 2. Email Verification

#### GET `/api/v1/auth/verify-email`

Verify user email with token.

**Query Parameters:**
- `token` (required): Verification token from email

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "redirect": "/auth/login?verified=true"
}
```

**Error Responses:**
```json
// 400 Bad Request - Invalid/Expired Token
{
  "success": false,
  "error": "Invalid or expired verification token"
}
```

### 3. User Login

#### POST `/api/v1/auth/login`

Authenticate user with credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "rememberMe": true
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "cuid_123456",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "TRAINEE",
      "avatar": "https://cdn.hirexp.com/avatars/123.jpg"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900, // seconds (15 minutes)
    "redirectUrl": "/dashboard/trainee"
  }
}
```

**Error Responses:**
```json
// 401 Unauthorized - Invalid Credentials
{
  "success": false,
  "error": "Invalid email or password"
}

// 403 Forbidden - Account Locked
{
  "success": false,
  "error": "Account temporarily locked due to multiple failed attempts",
  "lockedUntil": "2025-01-15T10:30:00Z"
}

// 403 Forbidden - Email Not Verified
{
  "success": false,
  "error": "Please verify your email before logging in",
  "resendVerification": true
}
```

### 4. Google OAuth

#### GET `/api/v1/auth/google`

Initiate Google OAuth flow.

**Query Parameters:**
- `redirect` (optional): URL to redirect after auth

**Response:**
Redirects to Google OAuth consent page.

#### GET `/api/v1/auth/google/callback`

Handle Google OAuth callback.

**Query Parameters:**
- `code`: Authorization code from Google
- `state`: CSRF state parameter

**Success Response:**
Redirects to dashboard with session cookie set.

### 5. Logout

#### POST `/api/v1/auth/logout`

End user session.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 6. Refresh Token

#### POST `/api/v1/auth/refresh`

Get new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...", // New refresh token
    "expiresIn": 900
  }
}
```

### 7. Password Reset Request

#### POST `/api/v1/auth/forgot-password`

Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "If an account exists, a reset email has been sent."
}
```

### 8. Password Reset Confirm

#### POST `/api/v1/auth/reset-password`

Reset password with token.

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass123!"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

## User Profile Endpoints

### 1. Get Current User

#### GET `/api/v1/user/me`

Get authenticated user's profile.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "cuid_123456",
    "email": "user@example.com",
    "role": "TRAINEE",
    "status": "ACTIVE",
    "profile": {
      "name": "John Doe",
      "avatar": "https://cdn.hirexp.com/avatars/123.jpg",
      "bio": "English learner",
      "location": "New York, USA",
      "languages": ["en", "es"],
      "skills": ["communication", "customer-service"]
    },
    "roleProfile": {
      // Role-specific data (InstructorProfile/CompanyProfile)
    },
    "progress": {
      "overallProgress": 65,
      "certificateProgress": 45,
      "currentStreak": 5,
      "level": "intermediate"
    }
  }
}
```

### 2. Update Profile

#### PUT `/api/v1/user/profile`

Update user profile information.

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```
avatar: File (image/jpeg, image/png, max 5MB)
data: {
  "name": "John Doe",
  "bio": "Experienced English learner",
  "phone": "+1234567890",
  "location": "San Francisco, USA",
  "languages": ["en", "es", "fr"],
  "skills": ["communication", "writing", "presentation"],
  "linkedIn": "https://linkedin.com/in/johndoe",
  "preferences": {
    "emailNotifications": true,
    "smsNotifications": false,
    "marketingEmails": true,
    "theme": "dark",
    "language": "en"
  }
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    // Updated profile data
  }
}
```

### 3. Change Password

#### POST `/api/v1/user/change-password`

Change authenticated user's password.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!",
  "confirmPassword": "NewPass123!"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### 4. Update Preferences

#### PATCH `/api/v1/user/preferences`

Update user preferences.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "emailNotifications": true,
  "smsNotifications": false,
  "marketingEmails": true,
  "theme": "dark",
  "language": "en",
  "timezone": "America/New_York"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Preferences updated",
  "data": {
    // Updated preferences
  }
}
```

## Admin Endpoints

### 1. List Users

#### GET `/api/v1/admin/users`

Get paginated list of users.

**Headers:**
```
Authorization: Bearer <adminToken>
```

**Query Parameters:**
- `page` (default: 1): Page number
- `limit` (default: 20): Items per page
- `role`: Filter by role
- `status`: Filter by status
- `search`: Search by name or email
- `sort`: Sort field (createdAt, name, email)
- `order`: Sort order (asc, desc)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "cuid_123456",
        "email": "user@example.com",
        "role": "TRAINEE",
        "status": "ACTIVE",
        "profile": {
          "name": "John Doe",
          "avatar": "https://..."
        },
        "createdAt": "2025-01-15T10:00:00Z",
        "lastLoginAt": "2025-01-15T15:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### 2. Get User Details

#### GET `/api/v1/admin/users/:userId`

Get detailed user information.

**Headers:**
```
Authorization: Bearer <adminToken>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      // Complete user data
    },
    "sessions": [
      // Active sessions
    ],
    "auditLogs": [
      // Recent audit logs
    ],
    "statistics": {
      "totalSessions": 45,
      "averageScore": 78.5,
      "lastActive": "2025-01-15T15:30:00Z"
    }
  }
}
```

### 3. Update User Role

#### PUT `/api/v1/admin/users/:userId/role`

Change user's role.

**Headers:**
```
Authorization: Bearer <adminToken>
```

**Request Body:**
```json
{
  "role": "INSTRUCTOR",
  "reason": "Completed instructor training program and passed evaluation"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "userId": "cuid_123456",
    "previousRole": "TRAINEE",
    "newRole": "INSTRUCTOR",
    "updatedAt": "2025-01-15T16:00:00Z"
  }
}
```

### 4. Suspend/Activate User

#### PUT `/api/v1/admin/users/:userId/status`

Change user account status.

**Headers:**
```
Authorization: Bearer <adminToken>
```

**Request Body:**
```json
{
  "status": "SUSPENDED", // ACTIVE | SUSPENDED | DEACTIVATED
  "reason": "Violation of terms of service",
  "duration": 7 // Days (optional, for temporary suspension)
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "User status updated",
  "data": {
    "userId": "cuid_123456",
    "status": "SUSPENDED",
    "suspendedUntil": "2025-01-22T16:00:00Z"
  }
}
```

### 5. Reset User Password

#### POST `/api/v1/admin/users/:userId/reset-password`

Force password reset for user.

**Headers:**
```
Authorization: Bearer <adminToken>
```

**Request Body:**
```json
{
  "sendEmail": true,
  "reason": "Security precaution"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset initiated",
  "data": {
    "resetToken": "temp_token_123", // Only if sendEmail is false
    "emailSent": true
  }
}
```

### 6. Get Audit Logs

#### GET `/api/v1/admin/audit-logs`

Get system audit logs.

**Headers:**
```
Authorization: Bearer <adminToken>
```

**Query Parameters:**
- `userId`: Filter by user
- `action`: Filter by action type
- `startDate`: Start date (ISO 8601)
- `endDate`: End date (ISO 8601)
- `page`: Page number
- `limit`: Items per page

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log_123",
        "userId": "cuid_123456",
        "action": "ROLE_CHANGED",
        "details": {
          "previousRole": "TRAINEE",
          "newRole": "INSTRUCTOR"
        },
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "createdAt": "2025-01-15T16:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 500
    }
  }
}
```

## Role-Specific Endpoints

### Instructor Endpoints

#### GET `/api/v1/instructor/students`

Get instructor's students.

**Headers:**
```
Authorization: Bearer <instructorToken>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": "student_123",
        "name": "Jane Smith",
        "progress": 65,
        "lastActivity": "2025-01-15T14:00:00Z",
        "averageScore": 78
      }
    ]
  }
}
```

#### POST `/api/v1/instructor/content`

Create educational content.

**Headers:**
```
Authorization: Bearer <instructorToken>
```

**Request Body:**
```json
{
  "title": "Advanced Business English",
  "type": "LESSON",
  "category": "business",
  "difficulty": "advanced",
  "content": {
    // Content structure
  }
}
```

### Company Endpoints

#### GET `/api/v1/company/candidates`

Search for candidates.

**Headers:**
```
Authorization: Bearer <companyToken>
```

**Query Parameters:**
- `skills[]`: Required skills
- `minScore`: Minimum evaluation score
- `level`: English level
- `certified`: Only certified candidates

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "candidates": [
      {
        "id": "candidate_123",
        "name": "John Doe",
        "level": "intermediate",
        "overallScore": 82,
        "skills": ["communication", "customer-service"],
        "certified": true,
        "certificateCode": "CERT-2025-001"
      }
    ]
  }
}
```

#### POST `/api/v1/company/job-posting`

Create job posting.

**Headers:**
```
Authorization: Bearer <companyToken>
```

**Request Body:**
```json
{
  "title": "Customer Service Representative",
  "description": "Looking for English-speaking support agent",
  "requirements": ["B2 English level", "Customer service experience"],
  "requiredSkills": ["communication", "problem-solving"],
  "experienceLevel": "entry",
  "location": "Remote",
  "salary": "$2000-3000/month"
}
```

## WebSocket Events

### Authentication Events

```javascript
// Client -> Server
socket.emit('auth:login', { token: 'jwt_token' })
socket.emit('auth:logout')

// Server -> Client
socket.on('auth:success', { user: userData })
socket.on('auth:error', { message: 'Invalid token' })
socket.on('auth:expired', { message: 'Session expired' })
socket.on('auth:role-changed', { newRole: 'INSTRUCTOR' })
```

### Real-time Notifications

```javascript
// Server -> Client
socket.on('notification', {
  type: 'role_change',
  title: 'Role Updated',
  message: 'Your role has been changed to Instructor',
  timestamp: '2025-01-15T16:00:00Z'
})
```

## Error Handling

### Standard Error Response

All errors follow this structure:

```json
{
  "success": false,
  "error": "Main error message",
  "code": "ERROR_CODE",
  "details": {
    // Additional error details
  },
  "timestamp": "2025-01-15T16:00:00Z"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_REQUIRED` | 401 | Authentication required |
| `INVALID_CREDENTIALS` | 401 | Invalid login credentials |
| `TOKEN_EXPIRED` | 401 | Access token expired |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `ACCOUNT_LOCKED` | 403 | Account temporarily locked |
| `EMAIL_NOT_VERIFIED` | 403 | Email verification required |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `DUPLICATE_EMAIL` | 409 | Email already registered |
| `RATE_LIMIT` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

## Rate Limiting

### Limits by Endpoint

| Endpoint | Limit | Window |
|----------|-------|--------|
| Registration | 3 requests | 1 hour |
| Login | 5 requests | 15 minutes |
| Password Reset | 3 requests | 1 hour |
| Profile Update | 10 requests | 1 hour |
| API General | 100 requests | 1 minute |

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642255200
Retry-After: 60
```

## Security Headers

All API responses include security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

## Versioning

API versioning is done through URL path:
- Current: `/api/v1`
- Legacy support: 6 months
- Deprecation notices: 3 months in advance

## Testing

### Test Credentials (Development Only)

```json
{
  "trainee": {
    "email": "trainee@test.com",
    "password": "Test123!"
  },
  "instructor": {
    "email": "instructor@test.com",
    "password": "Test123!"
  },
  "company": {
    "email": "company@test.com",
    "password": "Test123!"
  },
  "admin": {
    "email": "admin@test.com",
    "password": "Admin123!"
  }
}
```

### Postman Collection

Import the Postman collection for easy API testing:
- Collection URL: `https://api.hirexp.com/docs/postman.json`
- Environment: `https://api.hirexp.com/docs/postman-env.json`