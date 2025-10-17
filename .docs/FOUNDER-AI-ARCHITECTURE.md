# HireXp AI Cost Analysis
## AI Chit-Chat & Mock Call Financial Planning

**Document Type**: Executive Brief
**Prepared For**: Founders & Key Stakeholders
**Date**: October 2025
**Focus**: AI Conversation Costs & Revenue Model

---

## Executive Summary

### Overview

HireXp's platform offers two distinct AI-powered session types:
1. **AI Chit-Chat** – 30-minute conversational English practice sessions
2. **AI Mock Call** – 30-minute customer service scenario simulations

Each user completes both session types, making the total AI cost per user effectively double the single-session cost.

### Cost per Session

For each 30-minute session (either Chit-Chat or Mock Call):

- OpenAI GPT-4o Mini: $0.011
- Whisper Speech-to-Text: $0.18
- OpenAI TTS (Text-to-Speech): $0.0675
- **Total: $0.26 per session**

### Key Financial Metrics (with 2 Sessions per User)

| Metric                            | Value                                              |
|------------------------------------|----------------------------------------------------|
| **Sessions per User/Week**         | 10 (5 Chit-Chat + 5 Mock Call)                     |
| **Number of Users**                | 80                                                 |
| **Cost per Session**               | $0.26                                              |
| **Cost per User/Week**             | $2.60 (10 sessions × $0.26)                        |
| **Total Weekly Cost**              | $208.00 (80 users × 10 sessions × $0.26)           |
| **Total Monthly Cost (4 weeks)**   | $832.00                                            |
| **Annual Cost (80 users)**         | $9,984.00                                          |

*All costs assume each user completes both session types (Chit-Chat and Mock Call) at equal volume. All financials are doubled compared to running a single session type only.*


### Bottom Line

With proper pricing strategy ($9.99+ monthly subscription), HireXp achieves sustainable unit economics while delivering high-value AI-powered training to job seekers.

---

## AI Features Overview

### 1. AI Chit-Chat

**Purpose**: Conversational English practice for call center readiness

**How It Works**:
- User engages in a 30-minute voice conversation with AI
- AI adapts to user's English level (beginner/intermediate/advanced)
- Real-time feedback on grammar, vocabulary, and fluency
- Natural conversation flow with follow-up questions
- Performance evaluation at session end

**AI Services Used**:
- **OpenAI GPT-4o Mini**: Conversation intelligence and response generation
- **Whisper API**: Converts user's speech to text (30 minutes of audio)
- **OpenAI TTS**: Converts AI responses to natural voice (about 30 voice responses)

**Cost per Session**: $0.26
- GPT-4o Mini: $0.011 (~4,500 tokens for 60-75 message exchanges)
- Whisper: $0.18 (30 minutes × $0.006/min)
- OpenAI TTS: $0.0675 (4,500 characters × $0.015/1K)

### 2. AI Mock Call

**Purpose**: Customer service scenario simulation for job readiness

**How It Works**:
- User receives customer profile and scenario (billing issue, service complaint, etc.)
- AI plays role of frustrated customer with realistic behavior
- User must resolve issue professionally using call center skills
- Performance evaluated on communication, problem-solving, professionalism
- Full call transcript and feedback provided

**AI Services Used**:
- **OpenAI GPT-4o Mini**: Customer personality simulation and scenario management
- **Whisper API**: Real-time speech-to-text for user responses
- **OpenAI TTS**: Natural customer voice with emotional tone

**Cost per Session**: $0.26
- Same cost structure as AI Chit-Chat
- 30-minute simulation with similar interaction patterns

### Why These Features Matter

**For Job Seekers**:
- Practice without judgment or pressure
- Unlimited attempts to improve
- Consistent, high-quality training
- Immediate feedback on performance
- Certificate of completion for employers

**For Companies**:
- Candidates arrive pre-trained
- 70% reduction in onboarding costs
- Verified skills through AI assessment
- Faster time-to-productivity
- Lower turnover from better-prepared hires

---

## System Architecture

### AI Conversation Flow

```
┌──────────────────┐
│   Trainee User   │
│  (Web Browser)   │
└────────┬─────────┘
         │
         │ 1. Voice Input (microphone)
         ▼
┌──────────────────┐
│  Next.js Server  │
│ (Digital Ocean)  │
└────────┬─────────┘
         │
         │ 2. Audio → Whisper API
         ▼
┌──────────────────┐
│  Whisper STT     │ Cost: $0.24/session
│  (OpenAI)        │ (40 minutes × $0.006/min)
└────────┬─────────┘
         │
         │ 3. Text transcription
         ▼
┌──────────────────┐
│ GPT-4o Mini API  │ Cost: $0.015/session
│  (OpenAI)        │ (~6,000 tokens)
└────────┬─────────┘
         │
         │ 4. AI response text
         ▼
┌──────────────────┐
│   OpenAI TTS     │ Cost: $0.09/session
│  (Voice Engine)  │ (6,000 characters)
└────────┬─────────┘
         │
         │ 5. Voice output
         ▼
┌──────────────────┐
│   Audio Playback │
│   (User hears)   │
└──────────────────┘

Total Cost: $0.345 per 40-min session
Total Latency: ~500-800ms per exchange
```

### Infrastructure Components & Costs

**Digital Ocean (Server & Database)**: Affordable cloud provider hosting all backend services and persistent data.
- **Droplet** (App Server): $12/month (Basic - 2GB RAM, 1 vCPU)  
  _Virtual server for running the Next.js app and APIs._
- **Managed PostgreSQL**: $15/month (Basic - 1GB RAM, 1 vCPU, 10GB storage)  
  _Primary database for storing user data, scenarios, analytics, etc._
- **Managed Redis**: $15/month (Basic - 1GB RAM, 25 connections)  
  _In-memory cache and queue for real-time session data, rate limiting, etc._
- **Subtotal**: $42/month

**Cloudinary (Audio Storage)**: Media platform for storing voice/audio files for playback and analysis.
- **Free Tier**: 25 GB storage, 25 GB bandwidth  
  _Suitable for low initial usage and rapid prototyping._
- **Paid Plan** (if needed): $99/month (100 GB storage, 100 GB bandwidth)  
  _Upgrade for scaling storage and bandwidth as user base grows._
- **Initial**: $0/month (using free tier)

**AI Services** (Usage-Based): On-demand advanced AI services for conversation and voice generation.
- **OpenAI**: GPT-4o Mini + Whisper + TTS (charged per session)
  _Handles speech-to-text, generates conversation responses, and converts AI responses into realistic speech audio for playback._

**Total Monthly Infrastructure Cost**:
```
AI Models                $832/month - Estimated
Digital Ocean:           $42/month
Cloudinary (free tier):  $0/month
────────────────────────────────
Total Fixed Costs:       $874/month


**Cost Breakdown by Scale**:

| Monthly Users | Sessions | AI Costs | Infrastructure | Total Monthly Cost |
|---------------|----------|----------|----------------|-------------------|
| 100 | 100 | $26 | $42 | $68 |
| **300** | **300** | **$78** | **$42** | **$120** |
| 500 | 500 | $130 | $42 | $172 |
| 1,000 | 1,000 | $260 | $42 | $302 |
| 5,000 | 5,000 | $1,300 | $42 | $1,342 |
| 10,000 | 10,000 | $2,600 | $42 | $2,642 |

**Initial Launch Target: 300 sessions/month**
- **AI Costs**: $78/month ($0.26 × 300)
- **Infrastructure**: $42/month (Digital Ocean + Cloudinary free)
- **Total Monthly Operating Cost**: $120/month

*Note: At higher scales, will need to upgrade Digital Ocean droplet ($24-48/month) and may need Cloudinary paid plan ($99/month)*

---

## Financial Impact

### Important Note: 40-Minute Conversation Model

HireXp trainees will engage in **40-minute AI-powered conversations** per session. This significantly impacts the cost structure compared to typical short-form chatbots.

### Per Conversation Cost Breakdown (40 minutes)

**AI Services Cost:**
```
OpenAI GPT-4 API:
├─ 40 minutes ≈ 80-100 message exchanges
├─ ~6,000 tokens per conversation
├─ Input tokens (4,000):    $0.04
└─ Output tokens (2,000):   $0.06
                          -------
                           $0.10

Whisper Speech-to-Text:
├─ 40 minutes of audio processing
└─ $0.006 per minute × 40
                          -------
                           $0.24

OpenAI TTS (Text-to-Speech):
├─ ~40 AI voice responses
├─ ~150 characters per response
├─ Total: 6,000 characters
└─ $0.015 per 1K characters
                          -------
                           $0.09

TOTAL PER CONVERSATION:    $0.43
```

**Cost Driver Analysis:**
- Whisper STT: $0.24 (56% of cost) ← Largest expense
- OpenAI GPT-4: $0.10 (23% of cost)
- OpenAI TTS: $0.09 (21% of cost)

### Monthly Cost Scenarios (AI Services Only)

**Note:** Infrastructure costs (Digital Ocean server, database, Redis) are handled separately and are not included in these projections.

| Conversations/Month | Monthly AI Cost | Cost per User* |
|---------------------|-----------------|----------------|
| 100 | $43 | $0.43 |
| 500 | $215 | $0.43 |
| 1,000 | $430 | $0.43 |
| 2,500 | $1,075 | $0.43 |
| 5,000 | $2,150 | $0.43 |
| 10,000 | $4,300 | $0.43 |
| 25,000 | $10,750 | $0.43 |
| 50,000 | $21,500 | $0.43 |

*Assuming 1 conversation per user per month

---

## Action Plan

### Phase 1: MVP Development (Weeks 1-6)

**Engineering Priorities**:
1. **AI Chit-Chat Implementation**
   - OpenAI GPT-4 integration with conversation management
   - Whisper API for speech-to-text
   - OpenAI TTS integration for natural voice responses
   - Session management and progress tracking

2. **AI Mock Call Implementation**
   - Scenario database and selection system
   - Customer persona simulation (GPT-4)
   - Real-time call transcript generation
   - Performance evaluation system

3. **Infrastructure Setup (Digital Ocean)**
   - Next.js application deployment
   - PostgreSQL database configuration
   - Redis caching layer
   - Monitoring and logging

**Product Priorities**:
- Define success criteria for each training module
- Create 10+ test scenarios per feature
- Develop prompt engineering guidelines
- Build user onboarding flow

**Operations Priorities**:
- Set up cost monitoring dashboard
- Configure API rate limits and alerts
- Establish backup and recovery procedures
- Create incident response playbook

---

## Conclusion

### Financial Summary

**AI Cost per 40-Minute Session**: $0.43
- OpenAI GPT-4o Mini: $0.10 (23%)
- Whisper STT: $0.24 (56%)
- OpenAI TTS: $0.09 (21%)

**Complete Cost Structure at Scale** (5,000 conversations/month):

**Using GPT-4o Mini + OpenAI TTS** (Recommended):
```
AI Costs:
├─ GPT-4o Mini (5K sessions):    $500
├─ Whisper STT (5K sessions):    $1,200
└─ OpenAI TTS (5K sessions):     $450
                                -------
Subtotal AI:                     $2,150

Infrastructure:
├─ Digital Ocean Droplet:        $12
├─ PostgreSQL Database:          $15
├─ Redis Cache:                  $15
└─ Cloudinary (free tier):       $0
                                -------
Subtotal Infrastructure:         $42

TOTAL MONTHLY COST:              $2,192
Cost per session:                $0.44
```
