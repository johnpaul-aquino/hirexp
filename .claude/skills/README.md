# HireXp Claude Code Skills

This directory contains specialized skills for building HireXp's AI-powered English training platform. These skills are designed to accelerate development by providing expert guidance on architecture, patterns, and best practices specific to this project.

## 🎯 What Are Skills?

Skills are **model-invoked** assistants that Claude automatically uses based on your requests. You don't need to manually call them—Claude detects when a skill is relevant and applies it.

Each skill provides:
- Domain expertise for specific features
- Code patterns from project documentation
- Implementation guidelines
- Best practices and checklists
- TypeScript examples

## 📚 Available Skills

### 🤖 ai-api-integrator
**Purpose**: Integrate OpenAI GPT-4, Whisper, and OpenAI TTS using direct API calls

**Use when:**
- Implementing AI conversation features
- Setting up GPT-4 chat completions
- Adding speech-to-text with Whisper
- Implementing text-to-speech
- Building context management

**Key features:**
- Direct API approach (NO RAG per project decision)
- Session-based context management
- Cost tracking ($0.26 per 30-min session)
- Streaming responses
- Token optimization

**Example:**
```
"Implement the AI Chit Chat conversation endpoint with streaming responses"
```

---

### 🔄 real-time-builder
**Purpose**: Build WebSocket/Socket.io real-time communication

**Use when:**
- Adding real-time messaging to AI Chat
- Implementing live conversation features
- Building collaborative features
- Adding real-time notifications
- Streaming AI responses

**Key features:**
- Socket.io server configuration
- Client hooks (useSocket)
- Room-based messaging
- Streaming support
- Connection state handling

**Example:**
```
"Add real-time messaging to the AI Chit Chat feature"
```

---

### 🎙️ audio-system-builder
**Purpose**: Implement audio recording, Cloudinary storage, and playback

**Use when:**
- Adding voice recording to training modules
- Implementing audio playback
- Uploading audio to Cloudinary
- Building voice-based features
- Creating audio player UI

**Key features:**
- Web Audio API recording
- MediaRecorder configuration
- Cloudinary upload/storage
- Audio player component
- 16kHz sample rate (Whisper optimal)

**Example:**
```
"Create voice recorder component with Cloudinary upload"
```

---

### 🛣️ api-route-builder
**Purpose**: Create Next.js 15 API routes with validation and error handling

**Use when:**
- Creating new API endpoints
- Adding request validation
- Implementing authentication
- Setting up rate limiting
- Building streaming endpoints

**Key features:**
- Zod validation schemas
- TypeScript types for params
- Error handling patterns
- Rate limiting with Upstash
- Edge runtime support
- Consistent response format

**Example:**
```
"Create an API route for starting a new training session"
```

---

### 🗄️ zustand-store-builder
**Purpose**: Create Zustand stores for state management

**Use when:**
- Adding client-side state
- Managing chat/conversation state
- Implementing audio recording state
- Building session management
- Creating evaluation state

**Key features:**
- Hooks pattern
- TypeScript interfaces
- Persist middleware
- Devtools integration
- Async action patterns

**Example:**
```
"Create a Zustand store for managing chat messages and streaming state"
```

---

### 🗃️ prisma-schema-builder
**Purpose**: Design Prisma schemas for PostgreSQL database

**Use when:**
- Creating database models
- Setting up relations
- Adding indexes
- Designing data structures
- Building migrations

**Key features:**
- User & authentication models
- Session & message models
- Audio storage references
- Evaluation schemas
- Progress tracking
- Proper indexes and relations

**Example:**
```
"Create Prisma models for AI conversation sessions and evaluations"
```

---

### 📊 evaluation-builder
**Purpose**: Build AI-powered evaluation systems

**Use when:**
- Adding scoring systems
- Implementing feedback generation
- Creating evaluation UI
- Tracking progress
- Generating improvement suggestions

**Key features:**
- GPT-4 for evaluation
- Grammar, fluency, vocabulary scoring
- Feedback generation
- Strengths & improvements identification
- Progress tracking
- Evaluation UI components

**Example:**
```
"Implement evaluation system for AI Chit Chat sessions"
```

---

### 🧠 context-manager-builder
**Purpose**: Build session-based context management (NO RAG)

**Use when:**
- Managing conversation context
- Implementing session caching
- Handling message history
- Optimizing token usage
- Building user profile context

**Key features:**
- Redis-based caching
- Sliding window (last 10-20 messages)
- Token limit enforcement
- Session TTL management
- Database fallback
- **NO RAG or embeddings** per project architecture

**Example:**
```
"Create context manager for AI conversation sessions"
```

---

### 🐳 docker-builder
**Purpose**: Create Docker configurations for containerized deployment

**Use when:**
- Setting up development environment
- Creating production builds
- Deploying to cloud platforms
- Configuring database containers
- Building CI/CD pipelines
- Setting up docker-compose

**Key features:**
- Multi-stage Dockerfile builds
- Docker Compose for dev and prod
- PostgreSQL and Redis containers
- Health checks and monitoring
- Next.js standalone output
- GitHub Actions integration

**Example:**
```
"Create Docker configuration for local development with PostgreSQL"
```

---

### 🧪 tdd-writer
**Purpose**: Write comprehensive tests using TDD with Vitest, Supertest, React Testing Library, and Playwright

**Use when:**
- Writing tests before implementation (TDD)
- Testing React components
- Testing API routes
- Creating E2E browser tests
- Setting up test coverage
- Building test automation

**Key features:**
- Vitest for fast unit testing
- React Testing Library for components
- Supertest for API route testing
- Playwright for E2E tests
- Coverage reporting (80%+ threshold)
- CI/CD test integration
- Page Object Model patterns

**Example:**
```
"Write tests for the AI Chat component using TDD approach"
```

---

## 🏗️ Project Architecture Overview

### Tech Stack
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **PostgreSQL** with Prisma ORM
- **Zustand** for state management
- **Socket.io** for real-time
- **Cloudinary** for media storage
- **Upstash Redis** for caching

### AI Services
- **OpenAI GPT-4o Mini**: $0.011 per session
- **Whisper API**: $0.18 per 30-min session
- **OpenAI TTS**: $0.0675 per session
- **Total**: ~$0.26 per 30-minute session

### Key Decisions
- ✅ **Direct API approach** (NO RAG for MVP)
- ✅ **Session-based context** with Redis
- ✅ **Cost optimization** (~$150-350/month saved vs RAG)
- ✅ **Faster implementation** (2-3 weeks faster)

## 🚀 How to Use Skills

Skills are **automatically invoked** by Claude based on your request context. You don't need to call them explicitly.

### Natural Usage

Just describe what you need:
```
"I need to add AI conversation functionality to the trainee dashboard"
→ Claude will use: ai-api-integrator, real-time-builder, zustand-store-builder
```

```
"Create the evaluation system for scoring conversations"
→ Claude will use: evaluation-builder, prisma-schema-builder, api-route-builder
```

```
"Add voice recording to the chat interface"
→ Claude will use: audio-system-builder, api-route-builder
```

### Explicit Request (Optional)

You can also explicitly request a skill:
```
"Use the ai-api-integrator skill to implement GPT-4 chat"
```

## 📖 Documentation References

Skills are built from:
- `CLAUDE.md` - Project overview and conventions
- `DASHBOARDS.md` - Dashboard specifications
- `course-overview.md` - Training program structure
- `.docs/.features/` - Feature specifications
- `.docs/.task/` - Implementation phases
- `.docs/FOUNDER-AI-ARCHITECTURE.md` - Cost analysis
- `.docs/.task/technical-decisions.md` - Architecture decisions

## 🎯 Development Workflow

### Phase-Based Development

**Phase 1**: Foundation
```
1. Set up authentication system
2. Create database schemas
3. Implement base UI components
```

**Phase 2**: AI Chit Chat
```
1. "Implement AI Chit Chat conversation endpoint"
   → Uses: ai-api-integrator, api-route-builder
2. "Add real-time messaging to chat"
   → Uses: real-time-builder
3. "Create evaluation system for chat sessions"
   → Uses: evaluation-builder
```

**Phase 3**: AI Mock Call
```
1. "Implement voice recording for mock calls"
   → Uses: audio-system-builder
2. "Add Whisper transcription to voice input"
   → Uses: ai-api-integrator
3. "Build mock call scenario system"
   → Uses: prisma-schema-builder, api-route-builder
```

**Phase 4**: Testing & Optimization
```
1. Monitor costs and optimize token usage
2. Implement caching strategies
3. Add progress tracking
```

## 💡 Skill Workflow Examples

### Example 1: Building AI Chat Feature

**Request**: "I need to implement the AI Chit Chat feature end-to-end"

**Skills Used**:
1. **prisma-schema-builder** → Create Session, Message models
2. **api-route-builder** → Create `/api/ai/chat/message` endpoint
3. **ai-api-integrator** → Integrate GPT-4 and context management
4. **context-manager-builder** → Set up Redis caching
5. **zustand-store-builder** → Create chat state store
6. **real-time-builder** → Add Socket.io for real-time messaging

**Result**: Complete AI Chat implementation with database, API, real-time, and state management.

---

### Example 2: Adding Voice Features

**Request**: "Add voice recording and transcription to the chat"

**Skills Used**:
1. **audio-system-builder** → Web Audio API recording
2. **api-route-builder** → Create `/api/audio/upload` endpoint
3. **ai-api-integrator** → Integrate Whisper for transcription

**Result**: Voice recording with Cloudinary storage and Whisper transcription.

---

### Example 3: Building Evaluation System

**Request**: "Create the evaluation system for scoring training sessions"

**Skills Used**:
1. **prisma-schema-builder** → Create Evaluation model
2. **evaluation-builder** → GPT-4 evaluation service
3. **api-route-builder** → Create `/api/evaluation` endpoint
4. **zustand-store-builder** → Evaluation state management

**Result**: Complete evaluation system with scoring, feedback, and progress tracking.

---

### Example 4: Setting Up Development Environment

**Request**: "Set up Docker for local development with database and Redis"

**Skills Used**:
1. **docker-builder** → Create Dockerfile and docker-compose.yml
2. **prisma-schema-builder** → Configure database connection
3. **api-route-builder** → Create health check endpoint

**Result**: Fully containerized development environment with hot reload, PostgreSQL, and Redis.

---

### Example 5: Test-Driven Development Workflow

**Request**: "Build the voice recorder component using TDD with full test coverage"

**Skills Used**:
1. **tdd-writer** → Write failing tests for voice recorder hook
2. **audio-system-builder** → Implement recording functionality
3. **tdd-writer** → Write component tests with React Testing Library
4. **tdd-writer** → Create E2E tests with Playwright

**Result**: Fully tested voice recorder with 80%+ coverage, unit tests, integration tests, and E2E tests.

---

## 🔧 Customizing Skills

### Adding New Skills

Create a new skill directory:
```bash
mkdir -p .claude/skills/my-skill-name
```

Create `SKILL.md` with YAML frontmatter:
```markdown
---
name: My Skill Name
description: Brief description of what this skill does and when to use it
---

# My Skill Name

Detailed instructions for Claude...
```

### Important Guidelines

- **Name**: Short, descriptive name
- **Description**: Clear description for model-invocation
- **YAML frontmatter**: Required at top of SKILL.md
- **Directory name**: Use kebab-case (e.g., `my-skill-name`)
- **File name**: Must be exactly `SKILL.md` (case-sensitive)

## 📊 Cost Monitoring

Skills help implement cost-effective solutions:

**Per Session Costs** (30 minutes):
- GPT-4o Mini: $0.011
- Whisper STT: $0.18
- OpenAI TTS: $0.0675
- **Total**: $0.26

**Monthly at 5K sessions**:
- AI Services: ~$1,300
- Infrastructure: ~$42
- **Total**: ~$1,342/month

**Savings vs RAG**:
- No vector database: -$70-200/month
- No embedding generation: -$50/month
- **Total saved**: $150-350/month (13-22% reduction)

## 🎓 Best Practices

### 1. Follow Project Patterns
Skills ensure you follow HireXp's established patterns:
- Direct API calls (no RAG)
- Zustand for state
- Next.js 15 App Router
- Zod for validation

### 2. Cost Optimization
- Monitor token usage
- Use GPT-4o Mini for cost savings
- Implement caching with Redis
- Track per-session costs

### 3. Type Safety
- Use TypeScript throughout
- Define clear interfaces
- Leverage Prisma types
- Validate with Zod

### 4. Error Handling
- Try/catch in API routes
- Consistent error responses
- Rate limiting
- Input sanitization

## 🛠️ Troubleshooting

**Skill not being invoked?**
- Make sure your request clearly describes the task
- Check that SKILL.md has proper YAML frontmatter
- Verify the skill description matches your use case

**Need multiple skills?**
- Describe the complete feature you want to build
- Claude will automatically use multiple skills in sequence

**Want to see what skills were used?**
- Ask Claude: "What skills did you use for this implementation?"

## 📞 Support

For questions about:
- **Architecture**: See `.docs/.task/technical-decisions.md`
- **Features**: See `.docs/.features/`
- **Phases**: See `.docs/.task/phase-*.md`
- **Costs**: See `.docs/FOUNDER-AI-ARCHITECTURE.md`

## 🚀 Quick Start

1. **Start Development**:
   ```bash
   npm run dev
   ```

2. **Ask Claude**:
   ```
   "Implement the AI Chit Chat feature according to the documentation"
   ```

3. **Claude Will**:
   - Analyze the task
   - Use relevant skills
   - Provide complete implementation
   - Follow project patterns
   - Include best practices

4. **Review and Iterate**:
   - Claude provides the code
   - Test the implementation
   - Ask for modifications if needed

---

**Happy coding!** 🎉

*Built with Claude Code for HireXp*
*Version: 1.0.0*
*Last Updated: December 2024*
