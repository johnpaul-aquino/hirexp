---
name: Context Manager Builder
description: Build session-based context management for AI conversations without RAG (per HireXp architecture)
---

# Context Manager Builder

Create session-based context managers for HireXp's direct API approach (NO RAG).

## Context

Per `.docs/.features/ai-architecture.md` and `technical-decisions.md`:
- **NO RAG or vector embeddings** for MVP
- Session-based context with Redis cache
- Sliding window (last 10-20 messages)
- Token limit management
- User profile context

## Context Manager Implementation

```typescript
// lib/ai/context-manager.ts
import { Redis } from "@upstash/redis";
import type { ConversationContext, Message } from "@/types/ai";

export class ContextManager {
  private redis: Redis;
  private maxMessages = 20;
  private maxTokens = 2000;
  private sessionTTL = 1800; // 30 minutes

  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  // Create new session context
  async createContext(params: {
    sessionId: string;
    userId: string;
    conversationType: "chat" | "interview" | "mock-call";
    userProfile: {
      level: "beginner" | "intermediate" | "advanced";
      strengths: string[];
      improvements: string[];
      nativeLanguage?: string;
    };
  }): Promise<ConversationContext> {
    const context: ConversationContext = {
      sessionId: params.sessionId,
      userId: params.userId,
      conversationType: params.conversationType,
      userProfile: params.userProfile,
      messageHistory: [],
      metadata: {
        startedAt: new Date(),
        lastActivityAt: new Date(),
        messageCount: 0,
        tokensUsed: 0
      }
    };

    await this.saveContext(context);
    return context;
  }

  // Get context from cache or database
  async getContext(sessionId: string): Promise<ConversationContext | null> {
    const cached = await this.redis.get<ConversationContext>(`session:${sessionId}`);

    if (cached) {
      return cached;
    }

    // Fallback to database if not in cache
    return await this.loadFromDatabase(sessionId);
  }

  // Update context with new message
  async updateContext(
    sessionId: string,
    newMessage: Message
  ): Promise<void> {
    const context = await this.getContext(sessionId);
    if (!context) throw new Error("Session not found");

    // Add message
    context.messageHistory.push(newMessage);

    // Trim if exceeds limit (sliding window)
    if (context.messageHistory.length > this.maxMessages) {
      context.messageHistory = context.messageHistory.slice(-this.maxMessages);
    }

    // Update metadata
    context.metadata.lastActivityAt = new Date();
    context.metadata.messageCount++;

    // Estimate tokens (rough: 1 token ≈ 4 characters)
    const messageTokens = Math.ceil(newMessage.content.length / 4);
    context.metadata.tokensUsed += messageTokens;

    await this.saveContext(context);
  }

  // Build prompt from context
  async buildPromptContext(sessionId: string): Promise<string> {
    const context = await this.getContext(sessionId);
    if (!context) throw new Error("Session not found");

    const recentMessages = context.messageHistory.slice(-10);
    const history = recentMessages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');

    return `
User Profile:
- Level: ${context.userProfile.level}
- Strengths: ${context.userProfile.strengths.join(', ')}
- Focus Areas: ${context.userProfile.improvements.join(', ')}
${context.userProfile.nativeLanguage ? `- Native Language: ${context.userProfile.nativeLanguage}` : ''}

Recent Conversation:
${history}
    `.trim();
  }

  // Build messages array for OpenAI
  buildMessagesArray(
    context: ConversationContext,
    systemPrompt: string
  ): Array<{ role: "system" | "user" | "assistant"; content: string }> {
    // Get last N messages that fit in token limit
    const messages = this.optimizeForTokenLimit(context.messageHistory);

    return [
      { role: "system", content: systemPrompt },
      ...messages.map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content
      }))
    ];
  }

  // Optimize messages to fit token limit
  private optimizeForTokenLimit(messages: Message[]): Message[] {
    let totalTokens = 0;
    const optimized: Message[] = [];

    // Iterate from newest to oldest
    for (let i = messages.length - 1; i >= 0; i--) {
      const messageTokens = Math.ceil(messages[i].content.length / 4);

      if (totalTokens + messageTokens > this.maxTokens) {
        break;
      }

      optimized.unshift(messages[i]);
      totalTokens += messageTokens;
    }

    return optimized;
  }

  // Save context to Redis
  private async saveContext(context: ConversationContext): Promise<void> {
    await this.redis.setex(
      `session:${context.sessionId}`,
      this.sessionTTL,
      JSON.stringify(context)
    );
  }

  // Load from database (fallback)
  private async loadFromDatabase(sessionId: string): Promise<ConversationContext | null> {
    const { prisma } = await import('@/lib/db');

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: this.maxMessages
        },
        user: {
          include: { profile: true }
        }
      }
    });

    if (!session) return null;

    const context: ConversationContext = {
      sessionId: session.id,
      userId: session.userId,
      conversationType: session.type.toLowerCase() as any,
      userProfile: {
        level: session.user.profile?.level.toLowerCase() as any || 'beginner',
        strengths: [], // Load from profile or previous evaluations
        improvements: [],
        nativeLanguage: session.user.profile?.nativeLanguage || undefined
      },
      messageHistory: session.messages.map(m => ({
        id: m.id,
        role: m.role.toLowerCase() as "user" | "assistant",
        content: m.content,
        timestamp: m.createdAt
      })),
      metadata: {
        startedAt: session.startedAt,
        lastActivityAt: new Date(),
        messageCount: session.messages.length,
        tokensUsed: 0
      }
    };

    // Cache it
    await this.saveContext(context);

    return context;
  }

  // Clear expired sessions
  async clearExpiredSessions(): Promise<void> {
    // Redis handles TTL automatically
    // This is for manual cleanup if needed
  }
}
```

## TypeScript Types

```typescript
// types/ai.ts
export interface ConversationContext {
  sessionId: string;
  userId: string;
  conversationType: 'chat' | 'interview' | 'mock-call';

  userProfile: {
    level: 'beginner' | 'intermediate' | 'advanced';
    strengths: string[];
    improvements: string[];
    nativeLanguage?: string;
  };

  messageHistory: Message[];

  metadata: {
    startedAt: Date;
    lastActivityAt: Date;
    messageCount: number;
    tokensUsed: number;
  };
}

export interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}
```

## Usage in API Routes

```typescript
// app/api/ai/chat/message/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ContextManager } from "@/lib/ai/context-manager";
import { OpenAIService } from "@/lib/ai/openai-service";
import { PromptBuilder } from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, message } = await request.json();

    const contextManager = new ContextManager();
    const context = await contextManager.getContext(sessionId);

    if (!context) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Build system prompt based on context
    const systemPrompt = PromptBuilder.buildChitChatPrompt(
      context.userProfile.level
    );

    // Build messages array
    const messages = contextManager.buildMessagesArray(context, systemPrompt);

    // Send to OpenAI
    const openai = new OpenAIService();
    const response = await openai.sendMessageWithMessages(messages, message);

    // Update context
    await contextManager.updateContext(sessionId, {
      role: "user",
      content: message,
      timestamp: new Date()
    });

    await contextManager.updateContext(sessionId, {
      role: "assistant",
      content: response,
      timestamp: new Date()
    });

    return NextResponse.json({
      success: true,
      response,
      metadata: {
        messageCount: context.metadata.messageCount + 2,
        tokensUsed: context.metadata.tokensUsed
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

## Environment Variables

```.env
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

## Key Benefits (No RAG)

✅ **Simplicity** - No vector database needed
✅ **Lower Cost** - Save $150-350/month
✅ **Faster** - No retrieval step (100-300ms saved)
✅ **Easier to Debug** - Direct flow
✅ **Sufficient for MVP** - Training doesn't need external knowledge

## Checklist

- [ ] Redis-based session cache
- [ ] Sliding window (last 10-20 messages)
- [ ] Token limit enforcement
- [ ] User profile context
- [ ] Database fallback
- [ ] TTL for sessions (30 min)
- [ ] Metadata tracking
- [ ] Context optimization
- [ ] TypeScript types
- [ ] NO RAG or embeddings

## Your Task

Ask:
1. Session TTL duration?
2. Max message history?
3. Token limit?
4. User profile fields?

Then implement the context manager.
