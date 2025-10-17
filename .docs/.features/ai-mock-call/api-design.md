# AI Mock Call - API Design

## API Overview

The AI Mock Call API provides real-time WebSocket and RESTful endpoints for managing call center simulations. The API handles scenario selection, call session management, real-time audio streaming, and performance evaluation.

## Base URLs

```
REST API: https://api.hirexp.com/api/ai/mock-call
WebSocket: wss://api.hirexp.com/ws/mock-call
Development: http://localhost:3000/api/ai/mock-call
```

## Authentication

```http
Authorization: Bearer <jwt_token>
X-Session-ID: <session_id>
```

## REST Endpoints

### 1. Get Available Scenarios

Retrieve scenarios based on user level and preferences.

**Endpoint:** `GET /scenarios`

**Query Parameters:**
```
category?: "complaint" | "technical" | "sales" | "billing" | "retention"
difficulty?: "beginner" | "intermediate" | "advanced" | "expert"
industry?: "telecom" | "banking" | "healthcare" | "ecommerce"
limit?: number (default: 20)
offset?: number (default: 0)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "scenarios": [
      {
        "id": "scn_abc123",
        "name": "Angry Customer - Billing Dispute",
        "category": "complaint",
        "difficulty": "intermediate",
        "description": "Customer received incorrect charges on their bill",
        "estimatedDuration": 8,
        "customer": {
          "name": "Robert Johnson",
          "age": 45,
          "mood": "frustrated",
          "personality": "demanding"
        },
        "objectives": [
          "Identify the billing error",
          "Apologize and empathize",
          "Offer appropriate resolution",
          "Retain the customer"
        ],
        "skills": ["de-escalation", "problem-solving", "empathy"],
        "playCount": 1234,
        "avgScore": 78.5,
        "userAttempts": 2,
        "bestScore": 85
      }
    ],
    "pagination": {
      "total": 45,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

### 2. Get Scenario Details

Get complete scenario information before starting a call.

**Endpoint:** `GET /scenarios/:scenarioId`

**Response:**
```json
{
  "success": true,
  "data": {
    "scenario": {
      "id": "scn_abc123",
      "name": "Angry Customer - Billing Dispute",
      "briefing": {
        "situation": "Customer was charged $150 extra on their monthly bill",
        "background": "Long-time customer (5 years), usually pays on time",
        "customerMood": "Very frustrated, considering cancellation",
        "desiredOutcome": "Correct the billing error and retain customer"
      },
      "customerProfile": {
        "name": "Robert Johnson",
        "accountNumber": "ACC-789456",
        "serviceType": "Premium Plan",
        "monthlyBill": "$89.99",
        "accountStatus": "Active",
        "paymentHistory": "Good",
        "previousContacts": 2
      },
      "companyInfo": {
        "policies": {
          "refund": "Up to 3 months retroactive",
          "credit": "Can offer up to $200 without supervisor",
          "retention": "Authorized to offer 20% discount for 6 months"
        },
        "systems": ["CRM", "Billing System", "Ticket System"],
        "resources": {
          "knowledgeBase": "/kb/billing-disputes",
          "scripts": "/scripts/retention"
        }
      },
      "evaluationCriteria": {
        "required": [
          "Proper greeting with company name",
          "Verify customer identity",
          "Document the issue",
          "Offer resolution"
        ],
        "bonusPoints": [
          "Empathy statements",
          "Proactive solutions",
          "Upsell attempt"
        ]
      }
    }
  }
}
```

### 3. Start Call Session

Initialize a new mock call session.

**Endpoint:** `POST /start`

**Request Body:**
```json
{
  "scenarioId": "scn_abc123",
  "userId": "user_xyz789",
  "settings": {
    "recordCall": true,
    "difficultyAdjustment": "dynamic",
    "audioQuality": "high",
    "backgroundNoise": true,
    "allowInterruptions": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "call_def456",
    "websocketUrl": "wss://api.hirexp.com/ws/mock-call",
    "sessionToken": "sess_ghi789",
    "iceServers": [
      {
        "urls": "stun:stun.l.google.com:19302"
      },
      {
        "urls": "turn:turn.hirexp.com:3478",
        "username": "user_xyz789",
        "credential": "temp_credential_abc"
      }
    ],
    "callState": {
      "status": "initializing",
      "customerMood": 45,
      "satisfactionLevel": 50
    },
    "instructions": {
      "greeting": "Answer within 3 seconds",
      "opening": "Use company standard greeting",
      "reminder": "Remember to verify customer identity"
    }
  }
}
```

### 4. Update Call Status

Update the status of an ongoing call (hold, transfer, etc.).

**Endpoint:** `PUT /session/:sessionId/status`

**Request Body:**
```json
{
  "action": "hold" | "resume" | "transfer" | "escalate",
  "reason": "string",
  "transferTo": "supervisor" | "technical" | "billing",
  "notes": "Customer needs technical assistance"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "call_def456",
    "status": "on_hold",
    "holdTime": 0,
    "customerReaction": {
      "mood": -10,
      "message": "I don't have time to wait!"
    }
  }
}
```

### 5. End Call Session

Complete the call and trigger evaluation.

**Endpoint:** `POST /session/:sessionId/end`

**Request Body:**
```json
{
  "endReason": "resolved" | "transferred" | "disconnected" | "failed",
  "resolution": {
    "issueResolved": true,
    "actionTaken": "Credited $150 to account",
    "followUpRequired": false,
    "customerRetained": true
  },
  "agentNotes": "Customer was satisfied with the resolution"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "call_def456",
    "summary": {
      "duration": 485,
      "holdTime": 23,
      "talkTime": 462,
      "outcome": "resolved"
    },
    "evaluation": {
      "overallScore": 82,
      "breakdown": {
        "greeting": 95,
        "listening": 78,
        "solution": 85,
        "communication": 80,
        "empathy": 75,
        "closing": 85
      },
      "customerSatisfaction": 4.2,
      "firstCallResolution": true
    },
    "recording": {
      "url": "https://cdn.hirexp.com/recordings/call_def456.webm",
      "transcript": "https://api.hirexp.com/transcripts/call_def456.json",
      "duration": 485
    },
    "feedback": {
      "strengths": [
        "Excellent greeting and introduction",
        "Successfully resolved the billing issue",
        "Maintained professional tone throughout"
      ],
      "improvements": [
        "Could have shown more empathy initially",
        "Missed opportunity to verify all charges",
        "Forgot to offer callback for follow-up"
      ],
      "tips": [
        "Use more empathy statements like 'I understand your frustration'",
        "Always review the entire bill with the customer",
        "Offer proactive follow-up to ensure satisfaction"
      ]
    },
    "achievements": [
      {
        "name": "First Call Resolution",
        "xp": 100,
        "description": "Resolved issue without transfer"
      }
    ]
  }
}
```

### 6. Get Call Recording

Retrieve the audio recording and transcript of a completed call.

**Endpoint:** `GET /session/:sessionId/recording`

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "call_def456",
    "recording": {
      "audioUrl": "https://cdn.hirexp.com/recordings/call_def456.webm",
      "format": "webm",
      "duration": 485,
      "fileSize": 2457600,
      "createdAt": "2025-10-14T15:30:00Z",
      "expiresAt": "2025-11-14T15:30:00Z"
    },
    "transcript": {
      "url": "https://api.hirexp.com/transcripts/call_def456.json",
      "messages": [
        {
          "speaker": "agent",
          "text": "Thank you for calling TechSupport Inc, my name is...",
          "timestamp": 0,
          "duration": 3.5
        },
        {
          "speaker": "customer",
          "text": "Yeah, I have a problem with my bill!",
          "timestamp": 3.5,
          "duration": 2.1,
          "emotion": "angry"
        }
      ],
      "summary": "Customer called about billing dispute, issue resolved with credit",
      "keywords": ["billing", "credit", "dispute", "resolved"]
    }
  }
}
```

## WebSocket Events

### Connection Flow

```javascript
// Client connection
const ws = new WebSocket('wss://api.hirexp.com/ws/mock-call');

ws.on('open', () => {
  // Authenticate
  ws.send(JSON.stringify({
    type: 'auth',
    token: sessionToken
  }));
});

// Join call session
ws.send(JSON.stringify({
  type: 'join',
  sessionId: 'call_def456'
}));
```

### Event Types

#### Outgoing Events (Client → Server)

```typescript
// Start speaking
{
  type: 'audio:start',
  sessionId: string
}

// Audio chunk
{
  type: 'audio:data',
  sessionId: string,
  data: ArrayBuffer,
  timestamp: number
}

// Stop speaking
{
  type: 'audio:end',
  sessionId: string
}

// Agent action
{
  type: 'action',
  sessionId: string,
  action: 'hold' | 'mute' | 'transfer',
  data?: any
}

// Send note
{
  type: 'note',
  sessionId: string,
  content: string,
  timestamp: number
}
```

#### Incoming Events (Server → Client)

```typescript
// Call state update
{
  type: 'state:update',
  sessionId: string,
  state: {
    customerMood: number,
    satisfactionLevel: number,
    callDuration: number,
    status: string
  }
}

// Customer audio
{
  type: 'audio:customer',
  sessionId: string,
  data: ArrayBuffer,
  emotion: 'neutral' | 'happy' | 'angry' | 'frustrated'
}

// Customer action
{
  type: 'customer:action',
  sessionId: string,
  action: 'interrupt' | 'hangup' | 'ask_supervisor',
  message?: string
}

// Real-time feedback
{
  type: 'feedback',
  sessionId: string,
  feedback: {
    type: 'positive' | 'negative' | 'tip',
    message: string,
    severity: 'info' | 'warning' | 'critical'
  }
}

// Transcription
{
  type: 'transcript',
  sessionId: string,
  speaker: 'agent' | 'customer',
  text: string,
  timestamp: number
}

// Call ended
{
  type: 'call:ended',
  sessionId: string,
  reason: string,
  evaluation: object
}
```

### Error Events

```typescript
{
  type: 'error',
  code: 'AUDIO_FAILURE' | 'CONNECTION_LOST' | 'SESSION_EXPIRED',
  message: string,
  recoverable: boolean
}
```

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/scenarios` | 30 | 1 minute |
| `/start` | 3 | 1 hour |
| `/session/*/status` | 20 | 1 minute |
| `/session/*/end` | 5 | 1 hour |
| WebSocket messages | 100 | 1 minute |

## Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| `SCENARIO_NOT_FOUND` | 404 | Scenario doesn't exist |
| `SESSION_NOT_FOUND` | 404 | Call session not found |
| `ALREADY_IN_CALL` | 409 | User already in active call |
| `AUDIO_INIT_FAILED` | 500 | Failed to initialize audio |
| `AI_SERVICE_ERROR` | 503 | AI service unavailable |
| `RECORDING_FAILED` | 500 | Failed to record call |
| `EVALUATION_FAILED` | 500 | Failed to evaluate performance |
| `WEBSOCKET_ERROR` | 500 | WebSocket connection error |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

## SDK Examples

### JavaScript/TypeScript

```typescript
import { MockCallClient } from '@hirexp/mock-call-sdk';

const client = new MockCallClient({
  apiKey: process.env.HIREXP_API_KEY,
  websocketUrl: 'wss://api.hirexp.com/ws/mock-call'
});

// Get scenarios
const scenarios = await client.getScenarios({
  category: 'complaint',
  difficulty: 'intermediate'
});

// Start call
const session = await client.startCall(scenarios[0].id);

// Connect WebSocket
await client.connect(session.sessionId);

// Handle events
client.on('customer:speaking', (audio) => {
  // Play customer audio
});

client.on('feedback', (feedback) => {
  // Show real-time feedback
});

// Send audio
await client.streamAudio(audioBlob);

// End call
const evaluation = await client.endCall(session.sessionId);
```

### WebRTC Setup

```javascript
// Initialize peer connection
const pc = new RTCPeerConnection({
  iceServers: session.iceServers
});

// Get user media
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
});

// Add track
stream.getTracks().forEach(track => {
  pc.addTrack(track, stream);
});

// Handle ICE candidates
pc.onicecandidate = (event) => {
  if (event.candidate) {
    ws.send(JSON.stringify({
      type: 'ice-candidate',
      candidate: event.candidate
    }));
  }
};
```

---

*API Version: 1.0.0*
*Last Updated: October 2025*
*Next Review: November 2025*