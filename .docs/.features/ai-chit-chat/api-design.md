# AI Chit Chat - API Design

## API Overview

The AI Chit Chat API provides RESTful endpoints for managing conversational English practice sessions. All endpoints are prefixed with `/api/ai/chit-chat/` and require authentication.

## Authentication

All API requests require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

## Base URL

```
Production: https://api.hirexp.com/api/ai/chit-chat
Development: http://localhost:3000/api/ai/chit-chat
```

## Endpoints

### 1. Start Conversation

Initialize a new chat session with the AI assistant.

**Endpoint:** `POST /start`

**Request Body:**
```json
{
  "userId": "string",
  "preferences": {
    "topic": "general" | "business" | "travel" | "technology" | "custom",
    "customTopic": "string",
    "difficulty": "beginner" | "intermediate" | "advanced",
    "sessionDuration": 15 | 30 | 45 | 60,
    "inputMethod": "text" | "voice" | "both",
    "correctionStyle": "immediate" | "end-of-message" | "summary"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversationId": "conv_abc123",
    "sessionToken": "sess_xyz789",
    "expiresAt": "2025-10-14T15:30:00Z",
    "welcomeMessage": {
      "content": "Hello! I'm excited to practice English with you today. What would you like to talk about?",
      "audioUrl": "https://cdn.hirexp.com/audio/welcome_abc123.mp3"
    },
    "settings": {
      "voiceEnabled": true,
      "autoPlayAudio": false,
      "showTranscripts": true,
      "feedbackLevel": "balanced"
    }
  }
}
```

**Error Responses:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "You have exceeded the maximum number of conversations per hour",
    "retryAfter": 1800
  }
}
```

### 2. Send Message

Send a text or voice message to the AI assistant.

**Endpoint:** `POST /message`

**Request Body:**
```json
{
  "conversationId": "conv_abc123",
  "message": {
    "type": "text" | "voice",
    "content": "string", // Text content or base64 audio
    "audioFormat": "webm" | "mp3" | "wav", // If type is voice
    "duration": 5000 // Duration in milliseconds for voice
  },
  "context": {
    "previousMessageId": "msg_def456",
    "isCorrection": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messageId": "msg_ghi789",
    "userMessage": {
      "id": "msg_def456",
      "content": "I goes to the store yesterday",
      "transcription": "I goes to the store yesterday", // If voice input
      "timestamp": "2025-10-14T14:20:00Z"
    },
    "aiResponse": {
      "id": "msg_ghi789",
      "content": "That sounds interesting! Just a small note - we say 'I went to the store' for past tense. What did you buy at the store?",
      "audioUrl": "https://cdn.hirexp.com/audio/response_ghi789.mp3",
      "timestamp": "2025-10-14T14:20:02Z"
    },
    "feedback": {
      "hasErrors": true,
      "corrections": [
        {
          "type": "grammar",
          "original": "I goes",
          "corrected": "I went",
          "explanation": "Use 'went' for past tense of 'go' with 'I'",
          "severity": "medium"
        }
      ],
      "suggestions": [
        {
          "type": "vocabulary",
          "suggestion": "Consider using 'visited' or 'stopped by' for variety",
          "examples": ["I visited the store", "I stopped by the store"]
        }
      ],
      "positives": [
        "Good use of time marker 'yesterday'",
        "Clear sentence structure"
      ]
    },
    "metrics": {
      "processingTime": 1250,
      "confidenceScore": 0.95,
      "tokensUsed": 45
    }
  }
}
```

### 3. Get Voice Transcription

Convert voice audio to text using Whisper API.

**Endpoint:** `POST /voice/transcribe`

**Request Body (multipart/form-data):**
```
audio: <audio file>
format: "webm" | "mp3" | "wav"
language: "en-US" | "en-GB" | "en-AU"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transcription": "Hello, how are you doing today?",
    "confidence": 0.98,
    "language": "en-US",
    "alternatives": [
      {
        "text": "Hello, how're you doing today?",
        "confidence": 0.95
      }
    ],
    "duration": 2500,
    "words": [
      {
        "word": "Hello",
        "start": 0,
        "end": 400,
        "confidence": 0.99
      }
    ]
  }
}
```

### 4. Generate Voice Response

Convert text to speech using ElevenLabs.

**Endpoint:** `POST /voice/synthesize`

**Request Body:**
```json
{
  "text": "That's a great question! Let me think about that.",
  "voice": {
    "id": "rachel",
    "settings": {
      "stability": 0.75,
      "similarity": 0.75,
      "speed": 1.0
    }
  },
  "outputFormat": "mp3"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "audioUrl": "https://cdn.hirexp.com/audio/synth_jkl012.mp3",
    "duration": 3200,
    "format": "mp3",
    "size": 51200
  }
}
```

### 5. Get Conversation History

Retrieve messages from a conversation.

**Endpoint:** `GET /history/:conversationId`

**Query Parameters:**
```
limit: number (default: 50, max: 100)
offset: number (default: 0)
includeAudio: boolean (default: false)
includeFeedback: boolean (default: true)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversationId": "conv_abc123",
    "messages": [
      {
        "id": "msg_001",
        "role": "assistant",
        "content": "Hello! How can I help you practice English today?",
        "timestamp": "2025-10-14T14:00:00Z",
        "audioUrl": "https://cdn.hirexp.com/audio/msg_001.mp3"
      },
      {
        "id": "msg_002",
        "role": "user",
        "content": "I want to practice talking about my job",
        "timestamp": "2025-10-14T14:00:15Z",
        "feedback": {
          "score": 95,
          "notes": "Excellent sentence structure!"
        }
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

### 6. Get Session Evaluation

Retrieve comprehensive evaluation for a completed conversation.

**Endpoint:** `GET /evaluate/:conversationId`

**Response:**
```json
{
  "success": true,
  "data": {
    "conversationId": "conv_abc123",
    "evaluation": {
      "overallScore": 82,
      "metrics": {
        "grammar": {
          "score": 78,
          "details": {
            "correctSentences": 35,
            "totalSentences": 45,
            "commonErrors": [
              {
                "type": "verb-tense",
                "frequency": 3,
                "examples": ["I goes", "She don't", "They was"]
              }
            ]
          }
        },
        "fluency": {
          "score": 85,
          "details": {
            "averageResponseTime": 3.2,
            "hesitationCount": 5,
            "fillerWords": ["um", "uh"],
            "wordsPerMinute": 120
          }
        },
        "vocabulary": {
          "score": 80,
          "details": {
            "uniqueWords": 245,
            "advancedWords": 15,
            "repetitiveWords": ["good", "nice", "very"],
            "newWordsLearned": 8
          }
        },
        "pronunciation": {
          "score": 88,
          "details": {
            "clarity": 0.9,
            "accent": "intermediate",
            "problematicSounds": ["th", "r"]
          }
        },
        "comprehension": {
          "score": 90,
          "details": {
            "relevantResponses": 42,
            "totalResponses": 45,
            "misunderstandings": 3
          }
        }
      },
      "feedback": {
        "strengths": [
          "Excellent comprehension of questions",
          "Good use of everyday vocabulary",
          "Clear pronunciation overall"
        ],
        "improvements": [
          "Work on past tense verb forms",
          "Reduce filler words for better fluency",
          "Practice 'th' sounds"
        ],
        "recommendations": [
          "Review irregular past tense verbs",
          "Practice speaking without pausing",
          "Try tongue twisters for 'th' sounds"
        ]
      },
      "progress": {
        "comparedToLast": {
          "overall": "+5",
          "grammar": "+3",
          "fluency": "+7"
        },
        "trend": "improving",
        "nextLevel": {
          "current": "intermediate",
          "next": "upper-intermediate",
          "requirements": "Achieve 85+ overall score in 3 consecutive sessions"
        }
      },
      "certificate": {
        "earned": false,
        "type": null,
        "nextMilestone": "Complete 10 sessions with 80+ score"
      }
    },
    "summary": {
      "duration": 1800,
      "messageCount": 45,
      "topicsDiscussed": ["work", "hobbies", "travel plans"],
      "date": "2025-10-14T14:30:00Z"
    }
  }
}
```

### 7. End Conversation

Properly close a conversation session and trigger evaluation.

**Endpoint:** `POST /end`

**Request Body:**
```json
{
  "conversationId": "conv_abc123",
  "feedback": {
    "rating": 5,
    "comments": "Very helpful session!",
    "wouldRecommend": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversationId": "conv_abc123",
    "status": "completed",
    "evaluationId": "eval_mno345",
    "summary": {
      "duration": 1800,
      "messagesExchanged": 45,
      "overallScore": 82,
      "experiencePoints": 150
    },
    "nextSteps": {
      "reviewUrl": "/dashboard/trainee/review/conv_abc123",
      "suggestedTopic": "Business presentations",
      "scheduledReminder": "2025-10-16T14:00:00Z"
    }
  }
}
```

## Error Handling

### Standard Error Response

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional error context
    },
    "timestamp": "2025-10-14T14:30:00Z"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing authentication token |
| `FORBIDDEN` | 403 | User lacks permission for this action |
| `NOT_FOUND` | 404 | Conversation or message not found |
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `AI_SERVICE_ERROR` | 503 | OpenAI/ElevenLabs service unavailable |
| `AUDIO_PROCESSING_ERROR` | 500 | Failed to process audio |
| `CONVERSATION_EXPIRED` | 410 | Conversation session has expired |
| `INSUFFICIENT_CREDITS` | 402 | User has no remaining credits |
| `SERVER_ERROR` | 500 | Internal server error |

## Rate Limiting

### Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/start` | 5 | 1 hour |
| `/message` | 30 | 1 minute |
| `/voice/*` | 10 | 1 minute |
| `/evaluate` | 10 | 1 hour |

### Rate Limit Headers

```http
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 1697294400
```

## Webhooks

### Conversation Events

Webhooks can be configured to receive real-time events:

```json
{
  "event": "conversation.completed",
  "data": {
    "conversationId": "conv_abc123",
    "userId": "user_xyz",
    "duration": 1800,
    "score": 82
  },
  "timestamp": "2025-10-14T14:30:00Z"
}
```

### Available Events

- `conversation.started`
- `conversation.completed`
- `conversation.evaluated`
- `milestone.achieved`
- `error.critical`

## SDK Examples

### JavaScript/TypeScript

```typescript
import { ChitChatClient } from '@hirexp/chit-chat-sdk';

const client = new ChitChatClient({
  apiKey: process.env.HIREXP_API_KEY,
  baseUrl: 'https://api.hirexp.com'
});

// Start conversation
const conversation = await client.startConversation({
  topic: 'business',
  difficulty: 'intermediate'
});

// Send message
const response = await client.sendMessage(conversation.id, {
  type: 'text',
  content: 'I would like to discuss marketing strategies'
});

// Get evaluation
const evaluation = await client.getEvaluation(conversation.id);
```

### cURL Examples

```bash
# Start conversation
curl -X POST https://api.hirexp.com/api/ai/chit-chat/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_123","preferences":{"difficulty":"intermediate"}}'

# Send message
curl -X POST https://api.hirexp.com/api/ai/chit-chat/message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"conv_abc123","message":{"type":"text","content":"Hello!"}}'
```

## Best Practices

1. **Session Management**: Always properly end conversations to trigger evaluation
2. **Error Handling**: Implement exponential backoff for retries
3. **Audio Quality**: Use 16kHz sampling rate for optimal speech recognition
4. **Token Optimization**: Keep messages concise to reduce token usage
5. **Caching**: Cache conversation history locally for better UX
6. **Security**: Never expose API keys in client-side code

---

*API Version: 1.0.0*
*Last Updated: October 2025*
*Next Review: November 2025*