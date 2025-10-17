# Technical Decisions & Rationale

## Overview

This document outlines the key technical decisions made for implementing AI Mock Call and AI Chit Chat features, along with detailed rationales for each choice. These decisions balance performance, cost, scalability, and development velocity for an MVP launch.

## Core Technology Stack Decisions

### 1. Next.js 15 with App Router

**Decision**: Use Next.js 15 with App Router as the primary framework

**Rationale**:
- **Server Components**: Reduces client-side JavaScript bundle size by 30-40%
- **Built-in API Routes**: Eliminates need for separate backend service
- **Streaming SSR**: Improves perceived performance for AI responses
- **Edge Runtime**: Enables global distribution of API endpoints
- **TypeScript First**: Type safety across full stack

**Alternatives Considered**:
- **Remix**: Good DX but less ecosystem support
- **SvelteKit**: Smaller bundle but smaller talent pool
- **Separate Backend**: More complex deployment and maintenance

**Trade-offs**:
- ✅ Unified codebase reduces complexity
- ✅ Excellent developer experience
- ❌ Vendor lock-in to Vercel ecosystem
- ❌ Learning curve for App Router patterns

### 2. PostgreSQL with Prisma ORM

**Decision**: PostgreSQL as primary database with Prisma ORM

**Rationale**:
- **ACID Compliance**: Critical for financial and user data integrity
- **JSON Support**: Flexible schema for AI evaluation data
- **Full-Text Search**: Built-in search capabilities for transcripts
- **Row-Level Security**: Fine-grained access control
- **Prisma Benefits**: Type-safe queries, migrations, great DX

**Alternatives Considered**:
- **MongoDB**: Better for unstructured data but lacks ACID
- **DynamoDB**: Good for scale but complex for relational data
- **Supabase**: Includes auth but less flexibility

**Trade-offs**:
- ✅ Proven reliability and performance
- ✅ Rich ecosystem and tooling
- ❌ Requires more operational expertise
- ❌ Horizontal scaling complexity

### 3. Real-time Communication Architecture

**Decision**: Hybrid approach with Socket.io for chat and WebRTC for calls

**Rationale**:
- **Socket.io for Chat**: Reliable, battle-tested, automatic fallbacks
- **WebRTC for Calls**: Ultra-low latency (<100ms) for voice
- **Separation of Concerns**: Different requirements for each feature

**Alternatives Considered**:
- **Pure WebRTC**: Too complex for simple chat
- **Pure WebSocket**: Missing WebRTC benefits for audio
- **LiveKit**: Good but expensive for MVP

**Trade-offs**:
- ✅ Optimal performance for each use case
- ✅ Graceful degradation
- ❌ Two systems to maintain
- ❌ Additional complexity

## AI & ML Decisions

### 4. OpenAI GPT-4 for Conversation Engine

**Decision**: GPT-4 Turbo as primary language model

**Rationale**:
- **Quality**: Best-in-class conversation quality
- **Context Window**: 128k tokens allows full conversation history
- **Function Calling**: Structured outputs for evaluation
- **Speed**: Turbo variant balances quality and latency
- **Ecosystem**: Extensive tooling and community

**Cost Analysis**:
```
Input: $0.01/1K tokens
Output: $0.03/1K tokens
Average conversation: ~2K tokens
Cost per conversation: ~$0.08
```

**Alternatives Considered**:
- **Claude 3**: Comparable quality but less tooling
- **Gemini Pro**: Cheaper but inconsistent quality
- **Llama 2**: Self-hosted complexity not worth it for MVP
- **GPT-3.5**: 60% cost saving but noticeably worse quality

**Trade-offs**:
- ✅ Best conversation quality
- ✅ Reliable API with 99.9% uptime
- ❌ Higher cost per conversation
- ❌ Vendor dependency

### 5. LangChain for AI Orchestration (Lightweight - No RAG)

**Decision**: Use LangChain for basic conversation management WITHOUT RAG or embeddings

**Rationale**:
- **Memory Management**: Built-in conversation memory patterns
- **Prompt Templates**: Reusable, testable prompts
- **Streaming Support**: Native support for streaming responses
- **Observability**: Built-in tracing and debugging
- **Simplicity**: Minimal abstraction layer, direct API calls

**Alternatives Considered**:
- **Direct OpenAI SDK**: Less abstraction but more boilerplate
- **Semantic Kernel**: Good but C#/.NET focused
- **Custom Solution**: Too time-consuming for MVP
- **Full RAG Implementation**: Rejected for MVP (see Decision #22)

**Trade-offs**:
- ✅ Accelerates development
- ✅ Production-ready patterns
- ✅ Simple architecture without vector databases
- ❌ Additional abstraction layer (minimal)
- ❌ Potential performance overhead (5-10%)

### 6. Whisper for Speech-to-Text

**Decision**: OpenAI Whisper API for transcription

**Rationale**:
- **Accuracy**: 95%+ accuracy for English
- **Simplicity**: No model hosting required
- **Languages**: Supports 50+ languages for future expansion
- **Cost**: $0.006/minute is acceptable for MVP

**Alternatives Considered**:
- **Google Speech-to-Text**: Similar quality, more complex pricing
- **Cloud Speech-to-Text**: Good but requires more setup
- **Self-hosted Whisper**: Infrastructure complexity

**Trade-offs**:
- ✅ High accuracy out-of-box
- ✅ No infrastructure management
- ❌ Latency (1-2 seconds)
- ❌ File size limits (25MB)

### 7. ElevenLabs for Text-to-Speech

**Decision**: ElevenLabs for voice synthesis

**Rationale**:
- **Quality**: Most natural-sounding voices
- **Latency**: Streaming reduces perceived latency
- **Voice Variety**: Multiple accents and styles
- **API Stability**: Reliable service with good SLA

**Cost Analysis**:
```
Pricing: $0.18/1K characters
Average response: 200 characters
Cost per response: ~$0.036
Monthly budget: ~$500 for 14K responses
```

**Alternatives Considered**:
- **Amazon Polly**: Cheaper but robotic
- **Google Cloud TTS**: Good but less natural
- **Azure Speech**: Complex pricing model
- **Browser TTS**: Free but poor quality

**Trade-offs**:
- ✅ Best voice quality available
- ✅ Good developer experience
- ❌ Highest cost option
- ❌ Rate limits on lower tiers

## Audio Processing Decisions

### 8. Web Audio API for Client-Side Processing

**Decision**: Web Audio API for recording and visualization

**Rationale**:
- **Native Browser Support**: No plugins required
- **Real-time Processing**: Low-latency audio manipulation
- **Visualization**: Built-in FFT for waveforms
- **Compression**: Client-side compression reduces bandwidth

**Implementation Details**:
- Sample rate: 16kHz (optimal for speech)
- Channels: Mono (reduces file size by 50%)
- Format: WebM with Opus codec
- Chunk size: 4096 samples

**Alternatives Considered**:
- **MediaRecorder API**: Simpler but less control
- **RecordRTC**: Good library but adds dependency
- **Native Apps**: Better quality but distribution complexity

**Trade-offs**:
- ✅ Zero additional dependencies
- ✅ Full control over audio pipeline
- ❌ Browser compatibility issues
- ❌ Complex implementation

### 9. Cloudinary for Audio & Media Storage

**Decision**: Cloudinary for all media storage (audio, images, avatars)

**Rationale**:
- **Simplicity**: Single solution for all media needs
- **Built-in CDN**: Global edge network included
- **Auto-optimization**: Automatic format conversion and quality optimization
- **Real-time transformations**: On-the-fly audio/image processing
- **Developer experience**: Simple SDK and URL-based API

**Storage Strategy**:
```
Structure:
- Audio: /hirexp/audio/{type}/{userId}/{sessionId}/{timestamp}
- Avatars: /hirexp/avatars/{userId}/{timestamp}
- Lifecycle: Auto-cleanup rules via Cloudinary admin API
- Formats: Auto-convert webm to mp3/wav as needed
```

**Alternatives Considered**:
- **AWS S3 + CloudFront**: More complex setup and management
- **Database BLOB**: Poor performance at scale
- **Vercel Blob**: Limited storage and bandwidth

**Trade-offs**:
- ✅ Single service for all media
- ✅ Built-in CDN and transformations
- ✅ Simpler implementation
- ❌ Higher cost at scale (but acceptable for MVP)
- ❌ Vendor lock-in

## State Management & Data Flow

### 10. Zustand for Client State

**Decision**: Zustand for global state management

**Rationale**:
- **Simplicity**: 2KB, minimal boilerplate
- **TypeScript**: Excellent TS support
- **Performance**: No context re-rendering issues
- **DevTools**: Good debugging experience
- **Persistence**: Built-in localStorage sync

**Alternatives Considered**:
- **Redux Toolkit**: Overkill for our needs
- **Valtio**: Good but less community
- **Jotai**: Atomic but complex for team
- **Context API**: Performance issues at scale

**Trade-offs**:
- ✅ Simple mental model
- ✅ Great performance
- ❌ Less ecosystem than Redux
- ❌ No time-travel debugging

### 11. React Query for Server State

**Decision**: TanStack Query for API data fetching

**Rationale**:
- **Caching**: Intelligent cache management
- **Background Refetch**: Keeps data fresh
- **Optimistic Updates**: Better UX for mutations
- **Error Handling**: Consistent error patterns
- **DevTools**: Excellent debugging

**Alternatives Considered**:
- **SWR**: Simpler but fewer features
- **Apollo Client**: GraphQL-focused
- **RTK Query**: Tied to Redux

**Trade-offs**:
- ✅ Powerful caching strategies
- ✅ Reduces network requests by 40%
- ❌ Learning curve for advanced patterns
- ❌ Bundle size (13KB)

## Performance Optimizations

### 12. Edge Functions for API Routes

**Decision**: Deploy latency-sensitive APIs to edge

**Rationale**:
- **Global Distribution**: <50ms latency worldwide
- **Automatic Scaling**: No cold starts
- **Cost**: Pay per request, not per server

**Edge Routes**:
- `/api/chat/[id]/messages` - Message sending
- `/api/evaluation` - Real-time scoring
- `/api/auth` - Authentication

**Trade-offs**:
- ✅ Ultra-low latency
- ✅ Automatic global distribution
- ❌ Limited runtime (1MB)
- ❌ No native Node.js APIs

### 13. Progressive Web App (PWA)

**Decision**: Implement PWA features for mobile

**Rationale**:
- **Offline Support**: Service worker caching
- **Install Prompt**: App-like experience
- **Push Notifications**: Re-engagement
- **Performance**: Faster subsequent loads

**Implementation**:
- Workbox for service worker
- Cache-first strategy for assets
- Network-first for API calls
- Background sync for offline messages

**Trade-offs**:
- ✅ Near-native mobile experience
- ✅ No app store requirements
- ❌ iOS limitations
- ❌ Service worker complexity

## Security Decisions

### 14. JWT with Refresh Tokens

**Decision**: JWT for authentication with refresh token rotation

**Rationale**:
- **Stateless**: Scales horizontally
- **Short-lived**: 15-minute access tokens
- **Refresh Rotation**: Prevents token replay
- **Revocation**: Blacklist for emergency revocation

**Token Strategy**:
```
Access Token: 15 minutes (memory only)
Refresh Token: 7 days (httpOnly cookie)
Rotation: New refresh token on each use
```

**Alternatives Considered**:
- **Sessions**: Requires sticky sessions
- **OAuth Only**: Complex for MVP
- **Magic Links**: Poor UX for frequent use

**Trade-offs**:
- ✅ Scalable authentication
- ✅ Good security posture
- ❌ Token management complexity
- ❌ Refresh token storage requirements

### 15. Rate Limiting Strategy

**Decision**: Tiered rate limiting with Upstash Redis

**Rationale**:
- **DDoS Protection**: Prevents abuse
- **Cost Control**: Limits API costs
- **Fair Usage**: Ensures quality for all users
- **Flexibility**: Different limits per endpoint

**Limits**:
```
Global: 100 requests/minute
Chat Messages: 30/minute
Audio Upload: 10/minute
Evaluation: 20/minute
```

**Trade-offs**:
- ✅ Protects against abuse
- ✅ Predictable costs
- ❌ May impact power users
- ❌ Additional Redis dependency

## Development & Deployment

### 16. Monorepo Structure

**Decision**: Single repository for all code

**Rationale**:
- **Simplicity**: One repo to manage
- **Atomic Changes**: Frontend/backend sync
- **Shared Types**: TypeScript across stack
- **Easier Onboarding**: Everything in one place

**Structure**:
```
/app          - Next.js pages
/components   - React components
/lib          - Shared utilities
/server       - WebSocket server
/prisma       - Database schema
```

**Alternatives Considered**:
- **Microservices**: Overkill for team size
- **Separate Repos**: Coordination overhead
- **Nx Monorepo**: Too complex for MVP

**Trade-offs**:
- ✅ Simplified deployment
- ✅ Easy refactoring
- ❌ Large repository size
- ❌ Can't scale teams independently

### 17. GitHub Actions for CI/CD

**Decision**: GitHub Actions for automation

**Rationale**:
- **Integration**: Native GitHub integration
- **Free Tier**: 2000 minutes/month
- **Matrix Testing**: Parallel test execution
- **Marketplace**: Extensive action library

**Pipeline**:
1. Lint & Format
2. Unit Tests
3. Integration Tests
4. Build
5. Deploy to Staging
6. E2E Tests
7. Deploy to Production

**Trade-offs**:
- ✅ Zero additional cost
- ✅ Good GitHub integration
- ❌ Vendor lock-in
- ❌ YAML complexity

### 18. Vercel for Hosting

**Decision**: Vercel for application hosting

**Rationale**:
- **Next.js Optimization**: Best performance
- **Global CDN**: Automatic edge distribution
- **Preview Deployments**: PR previews
- **Analytics**: Built-in Web Vitals
- **Serverless**: Automatic scaling

**Alternatives Considered**:
- **AWS Amplify**: More complex
- **Netlify**: Less Next.js optimization
- **Self-hosted**: Operational overhead
- **Cloudflare Pages**: Missing features

**Trade-offs**:
- ✅ Zero-config deployment
- ✅ Excellent Next.js support
- ❌ Vendor lock-in
- ❌ Higher cost at scale

## Testing Strategy

### 19. Testing Pyramid Approach

**Decision**: 70/20/10 distribution of unit/integration/E2E tests

**Rationale**:
- **Fast Feedback**: Unit tests run in <10 seconds
- **Confidence**: Integration tests catch issues
- **Critical Paths**: E2E for user journeys
- **Maintainable**: Reduces flaky tests

**Tools**:
- Unit: Jest + React Testing Library
- Integration: Supertest
- E2E: Playwright
- Load: k6

**Trade-offs**:
- ✅ Fast test execution
- ✅ High confidence
- ❌ E2E tests are slow
- ❌ Complex test setup

## Monitoring & Observability

### 20. Observability Stack

**Decision**: Vercel Analytics + Sentry + Logtail

**Rationale**:
- **Vercel Analytics**: Web Vitals, no setup
- **Sentry**: Error tracking with context
- **Logtail**: Structured logging, good search
- **Integration**: All work well together

**Metrics Tracked**:
- Performance: Core Web Vitals
- Errors: With stack traces
- User: Behavior analytics
- Business: Conversion funnel
- Technical: API latency, costs

**Trade-offs**:
- ✅ Comprehensive visibility
- ✅ Quick issue detection
- ❌ Multiple services to manage
- ❌ Combined cost ~$200/month

## Cost Optimization

### 21. Tiered Architecture for Cost

**Decision**: Different quality/cost tiers based on usage

**Rationale**:
- **Free Tier**: Limited but functional
- **Paid Tiers**: Better quality and features
- **Cost Predictability**: Capped usage per tier

**Tiers**:
```
Free:
- GPT-3.5 for conversations
- Browser TTS for voice
- 10 sessions/month

Premium:
- GPT-4 for conversations
- ElevenLabs voices
- Unlimited sessions
```

**Trade-offs**:
- ✅ Sustainable unit economics
- ✅ Path to profitability
- ❌ Complex billing logic
- ❌ Quality differences

## AI Architecture Decision: No RAG for MVP

### 22. Direct API Calls vs. RAG Implementation

**Decision**: Use direct OpenAI API calls WITHOUT RAG (Retrieval-Augmented Generation) for MVP

**Rationale**:
- **Simplicity**: No vector database infrastructure required
- **Cost**: Eliminates Pinecone/Weaviate/Qdrant costs (~$70-200/month)
- **Development Speed**: 2-3 weeks faster implementation
- **Maintenance**: Fewer moving parts to manage and debug
- **Performance**: Lower latency without retrieval step (saves 100-300ms)
- **Use Case Fit**: Training conversations don't require external knowledge base

**When RAG Would Be Needed**:
- Company-specific training materials (custom scripts, policies)
- Large knowledge bases (thousands of documents)
- Dynamic content updates (frequent policy changes)
- Multi-tenant customization (different content per company)

**Current Approach**:
```typescript
// Simple session-based context management
interface ConversationContext {
  sessionId: string
  userId: string
  messageHistory: Message[] // Last N messages
  userProfile: {
    level: 'beginner' | 'intermediate' | 'advanced'
    strengths: string[]
    improvements: string[]
  }
}

// Direct API call with context
const response = await openai.chat.completions.create({
  model: "gpt-4-turbo-preview",
  messages: [
    { role: "system", content: systemPrompt },
    ...messageHistory,
    { role: "user", content: userMessage }
  ]
});
```

**Alternatives Considered**:
- **Pinecone + OpenAI Embeddings**: $70/month + complexity
- **Weaviate Self-hosted**: Infrastructure management overhead
- **Qdrant Cloud**: Good but unnecessary for MVP
- **Supabase Vector**: Adds dependency

**Trade-offs**:
- ✅ Faster implementation (2-3 weeks saved)
- ✅ Lower monthly costs (~$150 saved)
- ✅ Simpler debugging and monitoring
- ✅ Better response times
- ❌ Can't leverage external knowledge bases
- ❌ Limited to model's training data
- ❌ May need migration later for advanced features

**Migration Path** (if needed in future):
1. **Phase 1** (Month 6-8): Evaluate need based on user feedback
2. **Phase 2** (Month 9-10): Implement embeddings for training materials
3. **Phase 3** (Month 11-12): Add company-specific knowledge bases
4. **Phase 4** (Month 13+): Full RAG implementation with retrieval

**Cost Analysis**:
```
Direct API Approach:
- OpenAI API: ~$0.08/conversation
- Storage: PostgreSQL only
- Infrastructure: Next.js + Postgres
- Total: ~$500/month at 5K conversations

RAG Approach:
- OpenAI API: ~$0.08/conversation
- Embeddings: ~$0.01/conversation
- Vector DB: $70-200/month
- Storage: PostgreSQL + Vector DB
- Infrastructure: Next.js + Postgres + Vector DB
- Total: ~$650-850/month at 5K conversations

Savings: $150-350/month for MVP
```

**Decision Date**: October 2025
**Next Review**: April 2026 (after 6 months of user data)

## Future Considerations

### Scaling Preparation

**6-Month Horizon**:
- Database read replicas
- Kubernetes deployment
- Multi-region deployment
- Caching layer (Redis)
- **Evaluate RAG necessity** based on user needs

**12-Month Horizon**:
- Microservices migration
- Custom ML models
- Native mobile apps
- Real-time collaboration
- **RAG implementation** (if needed)

### Technical Debt Acknowledgment

**Accepted Debt for MVP**:
- Monolithic architecture
- Limited error recovery
- Basic monitoring only
- Manual deployment steps
- Limited test coverage (70%)
- **No RAG implementation** (will add if needed)

**Debt Payment Plan**:
- Month 1-2: Improve test coverage
- Month 3-4: Add error recovery
- Month 5-6: Enhance monitoring
- Month 7+: Consider architecture split
- Month 6-8: Evaluate RAG necessity

## Decision Review Process

**Quarterly Reviews**:
- Cost analysis
- Performance metrics
- User feedback
- Technical debt assessment
- Technology updates

**Decision Criteria**:
1. User impact
2. Development velocity
3. Operational complexity
4. Cost implications
5. Team expertise

## Conclusion

These technical decisions prioritize:
1. **Time to Market**: Using proven technologies
2. **User Experience**: Choosing quality over cost where it matters
3. **Developer Experience**: Tools that increase productivity
4. **Scalability Path**: Decisions that don't limit future growth
5. **Cost Control**: Sustainable economics from day one

The stack chosen allows us to launch an MVP in 8 weeks with a team of 5-7 developers, while maintaining the flexibility to scale and evolve based on user feedback and business requirements.