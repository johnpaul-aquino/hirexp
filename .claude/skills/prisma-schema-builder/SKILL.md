---
name: Prisma Schema Builder
description: Create Prisma schemas for HireXp PostgreSQL database with proper relations, indexes, and types
---

# Prisma Schema Builder

You are a specialist for building Prisma schemas in HireXp.

## Context

HireXp uses **PostgreSQL with Prisma ORM** per `technical-decisions.md`.

Key features needed:
- User authentication (trainees & companies)
- AI conversation sessions
- Audio storage references
- Evaluation results
- Progress tracking

## Core Models

### User & Authentication

```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String
  role          UserRole @default(TRAINEE)
  profile       Profile?
  sessions      Session[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([email])
  @@map("users")
}

enum UserRole {
  TRAINEE
  COMPANY
  ADMIN
}

model Profile {
  id              String  @id @default(uuid())
  userId          String  @unique
  user            User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  firstName       String
  lastName        String
  level           Level   @default(BEGINNER)
  nativeLanguage  String?
  phoneNumber     String?
  avatarUrl       String?

  @@map("profiles")
}

enum Level {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}
```

### Conversation Sessions

```prisma
model Session {
  id              String        @id @default(uuid())
  userId          String
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  type            SessionType
  status          SessionStatus @default(IN_PROGRESS)
  startedAt       DateTime      @default(now())
  endedAt         DateTime?
  duration        Int?          // in seconds
  messages        Message[]
  evaluation      Evaluation?
  audioRecordings AudioRecording[]

  @@index([userId, startedAt])
  @@map("sessions")
}

enum SessionType {
  AI_CHIT_CHAT
  AI_MOCK_CALL
  AI_INTERVIEW
}

enum SessionStatus {
  IN_PROGRESS
  COMPLETED
  ABANDONED
}
```

### Messages

```prisma
model Message {
  id          String       @id @default(uuid())
  sessionId   String
  session     Session      @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  role        MessageRole
  content     String       @db.Text
  audioUrl    String?
  tokensUsed  Int?
  createdAt   DateTime     @default(now())

  @@index([sessionId, createdAt])
  @@map("messages")
}

enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
}
```

### Audio Storage

```prisma
model AudioRecording {
  id          String   @id @default(uuid())
  sessionId   String
  session     Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  cloudinaryUrl String
  publicId    String
  duration    Int      // in seconds
  fileSize    Int      // in bytes
  format      String   // mp3, webm, etc.
  createdAt   DateTime @default(now())

  @@index([sessionId])
  @@map("audio_recordings")
}
```

### Evaluations

```prisma
model Evaluation {
  id                  String   @id @default(uuid())
  sessionId           String   @unique
  session             Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  grammarScore        Int      // 0-100
  fluencyScore        Int      // 0-100
  vocabularyScore     Int      // 0-100
  pronunciationScore  Int?     // 0-100
  overallScore        Int      // 0-100
  feedback            Json     // Detailed feedback object
  strengths           String[] // Array of strengths
  improvements        String[] // Areas to improve
  createdAt           DateTime @default(now())

  @@map("evaluations")
}
```

### Progress Tracking

```prisma
model Progress {
  id              String   @id @default(uuid())
  userId          String
  moduleType      String   // "AI_CHIT_CHAT", "AI_MOCK_CALL", etc.
  sessionsCompleted Int    @default(0)
  totalTime       Int      @default(0) // total minutes
  averageScore    Float?
  lastSessionAt   DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([userId, moduleType])
  @@index([userId])
  @@map("progress")
}
```

## Migrations

```bash
# Create migration
npx prisma migrate dev --name add_sessions_table

# Generate client
npx prisma generate

# Reset database (dev only)
npx prisma migrate reset

# Push schema without migration
npx prisma db push
```

## Usage in Code

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Example query
export async function createSession(userId: string, type: SessionType) {
  return await prisma.session.create({
    data: {
      userId,
      type,
      status: 'IN_PROGRESS'
    }
  });
}

export async function getUserSessions(userId: string) {
  return await prisma.session.findMany({
    where: { userId },
    include: {
      evaluation: true,
      messages: {
        orderBy: { createdAt: 'asc' }
      }
    },
    orderBy: { startedAt: 'desc' }
  });
}
```

## Checklist

- [ ] Models have proper relations
- [ ] Indexes on frequently queried fields
- [ ] Cascade deletes configured
- [ ] Enums for fixed values
- [ ] Timestamps (createdAt, updatedAt)
- [ ] UUIDs for IDs
- [ ] Json type for flexible data
- [ ] @@map for snake_case tables
- [ ] Unique constraints where needed

## Your Task

Ask:
1. What data to store?
2. Relations to other models?
3. Query patterns?
4. Indexes needed?

Then create the appropriate Prisma models.
