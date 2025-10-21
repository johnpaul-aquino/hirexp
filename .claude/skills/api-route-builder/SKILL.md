---
name: API Route Builder
description: Create Next.js 15 API routes for HireXp with proper validation, error handling, and TypeScript types
---

# API Route Builder

You are a specialized assistant for creating Next.js 15 API routes in HireXp.

## Context

HireXp uses **Next.js 15 App Router** API routes located in `app/api/`.

Key patterns:
- Zod for request validation
- TypeScript for type safety
- Proper error handling
- Rate limiting with Upstash
- JWT authentication
- Edge runtime for low-latency routes

## API Route Structure

### Basic POST Route

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  field: z.string().min(1)
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = requestSchema.parse(body);

    // Business logic here
    const result = await processData(validatedData);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### GET Route with Query Params

```typescript
// app/api/sessions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  userId: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(10)
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = {
      userId: searchParams.get('userId'),
      limit: searchParams.get('limit')
    };

    const validatedQuery = querySchema.parse(query);

    const sessions = await fetchSessions(validatedQuery);

    return NextResponse.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
```

### Dynamic Route

```typescript
// app/api/sessions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    const session = await getSession(id);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: session
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;
    await deleteSession(id);

    return NextResponse.json({
      success: true,
      message: "Session deleted"
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

### Authenticated Route

```typescript
// app/api/protected/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Verify JWT token
    const token = request.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Access user ID from payload
    const userId = payload.userId;

    // Business logic
    const result = await performAction(userId);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

### Rate Limited Route

```typescript
// app/api/ai/chat/message/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"), // 30 requests per minute
});

export async function POST(request: NextRequest) {
  try {
    // Get user identifier (IP or user ID)
    const identifier = request.headers.get("x-forwarded-for") || "anonymous";

    // Check rate limit
    const { success } = await ratelimit.limit(identifier);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    // Process request
    const body = await request.json();
    const result = await processMessage(body);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

### Streaming Response

```typescript
// app/api/ai/chat/stream/route.ts
import { NextRequest } from "next/server";
import { OpenAIStream, StreamingTextResponse } from "ai";

export async function POST(request: NextRequest) {
  const { message } = await request.json();

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [{ role: "user", content: message }],
    stream: true
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
```

### Edge Runtime Route

```typescript
// app/api/fast-route/route.ts
export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // This runs on the edge for ultra-low latency
  return NextResponse.json({ message: "Fast response" });
}
```

## Common Validation Schemas

```typescript
// lib/validation/schemas.ts
import { z } from "zod";

export const sessionSchema = z.object({
  userId: z.string().uuid(),
  type: z.enum(['chat', 'interview', 'mock-call']),
  level: z.enum(['beginner', 'intermediate', 'advanced'])
});

export const messageSchema = z.object({
  sessionId: z.string().uuid(),
  content: z.string().min(1).max(1000),
  role: z.enum(['user', 'assistant'])
});

export const evaluationSchema = z.object({
  sessionId: z.string().uuid(),
  scores: z.object({
    grammar: z.number().min(0).max(100),
    fluency: z.number().min(0).max(100),
    vocabulary: z.number().min(0).max(100)
  })
});
```

## Error Response Format

Always use consistent error format:

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
  code?: string;
}

interface SuccessResponse<T> {
  success: true;
  data: T;
  metadata?: any;
}
```

## Checklist

- [ ] Proper HTTP method (GET, POST, PUT, DELETE)
- [ ] Request validation with Zod
- [ ] Error handling with try/catch
- [ ] Consistent response format
- [ ] TypeScript types for params
- [ ] Authentication if needed
- [ ] Rate limiting for public endpoints
- [ ] CORS headers if needed
- [ ] Logging for debugging
- [ ] Environment variables used properly

## Your Task

Ask the user:
1. What endpoint to create?
2. HTTP method(s)?
3. Request/response data shape?
4. Authentication required?
5. Rate limiting needed?
6. Edge runtime?

Then create the API route following these patterns.
