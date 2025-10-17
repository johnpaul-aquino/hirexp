# Phase 1: Foundation Setup (Week 1-2)

## Overview
Establish the core infrastructure, authentication, database schema, and basic UI framework for AI Chit Chat and AI Mock Call features.

## Prerequisites
- [x] Next.js 15 application running
- [x] PostgreSQL database configured
- [x] Basic landing page and dashboard structure
- [ ] API keys for OpenAI, ElevenLabs, and Cloudinary

## Tasks

### 1. Environment Setup (Day 1-2)

#### API Keys and Services
```bash
# .env.local additions
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_URL=cloudinary://...
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```

#### Package Installation
```bash
# Core AI and Audio packages
npm install openai@latest
npm install langchain @langchain/openai @langchain/community
npm install @prisma/client prisma
npm install next-auth @auth/prisma-adapter
npm install cloudinary
npm install socket.io socket.io-client
npm install wavesurfer.js recordrtc
npm install zod @tanstack/react-query
```

#### Development Dependencies
```bash
npm install -D @types/node @types/recordrtc
npm install -D eslint-config-next
```

### 2. Database Schema (Day 2-3)

#### Prisma Setup
```bash
npx prisma init
```

#### Schema Definition
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User and Authentication
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  name              String?
  password          String
  role              UserRole  @default(TRAINEE)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  profile           UserProfile?
  sessions          Session[]
  chats             ChatSession[]
  calls             CallSession[]
  progress          UserProgress?
  evaluations       Evaluation[]
}

enum UserRole {
  TRAINEE
  INSTRUCTOR
  COMPANY
  ADMIN
}

// AI Chit Chat Models
model ChatSession {
  id                String    @id @default(cuid())
  userId            String
  topic             String
  difficulty        String
  status            SessionStatus @default(ACTIVE)
  startedAt         DateTime  @default(now())
  endedAt           DateTime?

  user              User      @relation(fields: [userId], references: [id])
  messages          ChatMessage[]
  evaluation        Evaluation?
}

model ChatMessage {
  id                String    @id @default(cuid())
  sessionId         String
  role              MessageRole
  content           String    @db.Text
  audioUrl          String?
  timestamp         DateTime  @default(now())

  session           ChatSession @relation(fields: [sessionId], references: [id])
}

// AI Mock Call Models
model CallSession {
  id                String    @id @default(cuid())
  userId            String
  scenario          String
  difficulty        String
  status            SessionStatus @default(ACTIVE)
  startedAt         DateTime  @default(now())
  endedAt           DateTime?
  duration          Int?
  recordingUrl      String?

  user              User      @relation(fields: [userId], references: [id])
  transcript        CallTranscript[]
  evaluation        Evaluation?
}

model CallTranscript {
  id                String    @id @default(cuid())
  sessionId         String
  speaker           String
  text              String    @db.Text
  timestamp         DateTime  @default(now())

  session           CallSession @relation(fields: [sessionId], references: [id])
}

// Evaluation Models
model Evaluation {
  id                String    @id @default(cuid())
  userId            String
  sessionType       SessionType
  sessionId         String    @unique
  scores            Json      // Detailed scoring metrics
  feedback          Json      // AI-generated feedback
  createdAt         DateTime  @default(now())

  user              User      @relation(fields: [userId], references: [id])
  chatSession       ChatSession? @relation(fields: [sessionId], references: [id])
  callSession       CallSession? @relation(fields: [sessionId], references: [id])
}

enum SessionStatus {
  ACTIVE
  COMPLETED
  ABANDONED
}

enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
}

enum SessionType {
  CHAT
  CALL
}
```

#### Database Migration
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 3. Authentication System (Day 3-4)

#### NextAuth Configuration
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !await bcrypt.compare(credentials.password, user.password)) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  }
})

export { handler as GET, handler as POST }
```

#### Auth Middleware
```typescript
// middleware.ts
import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login",
    error: "/error",
  }
})

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/chat/:path*",
    "/api/call/:path*"
  ]
}
```

### 4. API Route Structure (Day 4-5)

#### Base API Structure
```
app/api/
├── auth/
│   └── [...nextauth]/
│       └── route.ts
├── chat/
│   ├── route.ts              # Create/list sessions
│   ├── [sessionId]/
│   │   ├── route.ts          # Get/update session
│   │   └── messages/
│   │       └── route.ts      # Send messages
├── call/
│   ├── route.ts              # Create/list sessions
│   ├── [sessionId]/
│   │   ├── route.ts          # Get/update session
│   │   └── audio/
│   │       └── route.ts      # Upload audio
├── evaluation/
│   └── [sessionId]/
│       └── route.ts          # Get evaluation
└── upload/
    └── route.ts              # Cloudinary upload handler
```

#### Sample API Route
```typescript
// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createChatSchema = z.object({
  topic: z.string(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"])
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { topic, difficulty } = createChatSchema.parse(body)

    const chatSession = await prisma.chatSession.create({
      data: {
        userId: session.user.id,
        topic,
        difficulty
      }
    })

    return NextResponse.json(chatSession)
  } catch (error) {
    console.error("Create chat error:", error)
    return NextResponse.json(
      { error: "Failed to create chat session" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const chats = await prisma.chatSession.findMany({
      where: { userId: session.user.id },
      orderBy: { startedAt: "desc" },
      take: 10
    })

    return NextResponse.json(chats)
  } catch (error) {
    console.error("Get chats error:", error)
    return NextResponse.json(
      { error: "Failed to fetch chat sessions" },
      { status: 500 }
    )
  }
}
```

### 5. WebSocket Server Setup (Day 5-6)

#### Socket.io Server
```typescript
// server/socket.ts
import { Server } from "socket.io"
import { createServer } from "http"
import { parse } from "url"
import next from "next"

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  })

  const io = new Server(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL,
      credentials: true
    }
  })

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id)

    socket.on("join_session", ({ sessionId, userId }) => {
      socket.join(`session:${sessionId}`)
      socket.join(`user:${userId}`)
    })

    socket.on("audio_chunk", async ({ sessionId, chunk }) => {
      // Process audio chunk
      io.to(`session:${sessionId}`).emit("audio_processed", {
        chunk,
        timestamp: Date.now()
      })
    })

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id)
    })
  })

  server.listen(3001, () => {
    console.log("> WebSocket server running on http://localhost:3001")
  })
})
```

### 6. Cloudinary Configuration (Day 6-7)

#### Cloudinary Client Setup
```typescript
// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

export async function uploadToCloudinary(
  file: Buffer,
  folder: string,
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'video' // audio uses 'video'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: resourceType,
        eager: resourceType === 'video' ? [
          { format: 'mp3', audio_codec: 'mp3' },
          { format: 'wav' }
        ] : undefined,
        eager_async: true,
        transformation: resourceType === 'image' ? [
          { width: 500, height: 500, crop: 'fill', gravity: 'face' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ] : undefined
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result!.secure_url)
      }
    )

    const stream = Readable.from(file)
    stream.pipe(uploadStream)
  })
}

export async function getCloudinaryUrl(publicId: string, options?: any): Promise<string> {
  return cloudinary.url(publicId, {
    secure: true,
    ...options
  })
}
```

#### Cloudinary Upload Presets
```javascript
// Configure upload presets in Cloudinary console or via API
const audioPreset = {
  name: "hirexp_audio",
  folder: "hirexp/audio",
  allowed_formats: ["webm", "mp3", "wav", "m4a"],
  audio_codec: "auto",
  transformation: [{
    quality: "auto:good",
    audio_frequency: 44100
  }]
}

const imagePreset = {
  name: "hirexp_avatars",
  folder: "hirexp/avatars",
  allowed_formats: ["jpg", "png", "webp"],
  transformation: [{
    width: 500,
    height: 500,
    crop: "fill",
    gravity: "face"
  }]
}
```

### 7. Base UI Components (Day 7-8)

#### Module Card Component
```typescript
// components/modules/module-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface ModuleCardProps {
  title: string
  description: string
  icon: React.ReactNode
  progress?: number
  onStart: () => void
}

export function ModuleCard({
  title,
  description,
  icon,
  progress = 0,
  onStart
}: ModuleCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            {icon}
          </div>
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        {progress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}
        <Button
          onClick={onStart}
          className="w-full"
          variant={progress > 0 ? "outline" : "default"}
        >
          {progress > 0 ? "Continue" : "Start"}
        </Button>
      </CardContent>
    </Card>
  )
}
```

#### Audio Recorder Component
```typescript
// components/audio/recorder.tsx
"use client"

import { useState, useRef } from "react"
import RecordRTC from "recordrtc"
import { Button } from "@/components/ui/button"
import { Mic, Square, Play, Pause } from "lucide-react"

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void
}

export function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const recorderRef = useRef<RecordRTC | null>(null)

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    recorderRef.current = new RecordRTC(stream, {
      type: 'audio',
      mimeType: 'audio/webm',
      recorderType: RecordRTC.StereoAudioRecorder,
      numberOfAudioChannels: 1,
      desiredSampRate: 16000
    })

    recorderRef.current.startRecording()
    setIsRecording(true)
  }

  const stopRecording = () => {
    if (!recorderRef.current) return

    recorderRef.current.stopRecording(() => {
      const blob = recorderRef.current!.getBlob()
      onRecordingComplete(blob)
      recorderRef.current = null
      setIsRecording(false)
    })
  }

  const pauseRecording = () => {
    if (!recorderRef.current) return

    if (isPaused) {
      recorderRef.current.resumeRecording()
      setIsPaused(false)
    } else {
      recorderRef.current.pauseRecording()
      setIsPaused(true)
    }
  }

  return (
    <div className="flex items-center space-x-4">
      {!isRecording ? (
        <Button onClick={startRecording} size="lg" className="rounded-full">
          <Mic className="mr-2" />
          Start Recording
        </Button>
      ) : (
        <>
          <Button
            onClick={pauseRecording}
            size="lg"
            variant="outline"
            className="rounded-full"
          >
            {isPaused ? <Play /> : <Pause />}
          </Button>
          <Button
            onClick={stopRecording}
            size="lg"
            variant="destructive"
            className="rounded-full"
          >
            <Square className="mr-2" />
            Stop
          </Button>
        </>
      )}
    </div>
  )
}
```

### 8. Testing Setup (Day 8-9)

#### Unit Test Configuration
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D @types/jest jest-environment-jsdom
```

#### Jest Configuration
```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

module.exports = createJestConfig(customJestConfig)
```

#### Sample Test
```typescript
// __tests__/api/chat.test.ts
import { POST } from '@/app/api/chat/route'
import { NextRequest } from 'next/server'

jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}))

describe('/api/chat', () => {
  it('creates a new chat session', async () => {
    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        topic: 'General Conversation',
        difficulty: 'beginner'
      })
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('id')
    expect(data.topic).toBe('General Conversation')
  })
})
```

### 9. Documentation (Day 9-10)

#### API Documentation
```markdown
# API Documentation

## Authentication

All API endpoints require authentication via NextAuth session.

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

## Endpoints

### Chat Sessions

#### Create Chat Session
POST /api/chat
```json
{
  "topic": "Business English",
  "difficulty": "intermediate"
}
```

#### Get Chat Sessions
GET /api/chat

#### Send Message
POST /api/chat/[sessionId]/messages
```json
{
  "content": "Hello, how are you?",
  "audioBlob": "base64_encoded_audio" // optional
}
```

### Mock Call Sessions

#### Create Call Session
POST /api/call
```json
{
  "scenario": "Customer Support",
  "difficulty": "beginner"
}
```

#### Upload Audio
POST /api/call/[sessionId]/audio
```
FormData:
- audio: File
- timestamp: number
```
```

### 10. Deployment Preparation (Day 10)

#### Environment Variables Validation
```typescript
// lib/env.ts
import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  OPENAI_API_KEY: z.string().startsWith('sk-'),
  ELEVENLABS_API_KEY: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  CLOUDINARY_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url()
})

export const env = envSchema.parse(process.env)
```

## Deliverables Checklist

- [ ] Environment variables configured
- [ ] Database schema created and migrated
- [ ] Authentication system functional
- [ ] Basic API routes operational
- [ ] WebSocket server running
- [ ] Cloudinary account configured
- [ ] Base UI components ready
- [ ] Unit tests passing
- [ ] Documentation complete
- [ ] Local development environment fully functional

## Success Criteria

1. User can register and log in
2. Database stores user sessions
3. API routes respond correctly
4. WebSocket connection establishes
5. Audio files upload to Cloudinary
6. UI components render properly
7. Tests pass with >80% coverage

## Next Phase

Phase 2 will focus on implementing the core AI features:
- OpenAI integration
- LangChain conversation flows
- ElevenLabs voice synthesis
- Real-time audio streaming