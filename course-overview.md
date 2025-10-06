# English Training Platform - Course Overview

## Platform Vision
An AI-powered English training platform that combines interactive learning, real-time feedback, and practical simulations to help users improve their English communication skills for professional environments.

---

## User Journey Map

```mermaid
graph TB
    Start([User Enrollment]) --> Dashboard[Dashboard/Home]
    Dashboard --> Journey{Choose Module}

    Journey --> Assessment[English Assessments]
    Journey --> Chat[AI Chat-Chat]
    Journey --> Interview[AI Interview]
    Journey --> Typing[Typing Test]
    Journey --> MockCall[AI Mock Call]

    Assessment --> AssessmentComplete[Complete Assessment]
    Chat --> ChatComplete[Complete Chat Session]
    Interview --> InterviewComplete[Complete Interview]
    Typing --> TypingComplete[Complete Typing Test]
    MockCall --> MockCallComplete[Complete Mock Call]

    AssessmentComplete --> Progress[Update Progress]
    ChatComplete --> Progress
    InterviewComplete --> Progress
    TypingComplete --> Progress
    MockCallComplete --> Progress

    Progress --> Certificate{All Modules<br/>Complete?}
    Certificate -->|No| Dashboard
    Certificate -->|Yes| Final[Certificate/Completion]

    style Start fill:#e1f5ff
    style Dashboard fill:#fff3e0
    style Assessment fill:#f3e5f5
    style Chat fill:#e8f5e9
    style Interview fill:#fff9c4
    style Typing fill:#fce4ec
    style MockCall fill:#e0f2f1
    style Final fill:#c8e6c9
```

---

## Course Modules Overview

```mermaid
mindmap
  root((English Training<br/>Platform))
    English Assessments
      Reading Comprehension
      Multiple Choice Questions
      Grammar Lessons
      Figures of Speech
      Score Feedback
    AI Chat-Chat
      Text Chat Interface
      Voice Input Support
      Real-time AI Responses
      Instant Feedback
      Conversation History
    AI Interview
      Simulated Interview
      Q&A Session
      AI Interviewer Role
      Performance Rating
      Full Transcript
    Typing Test
      Paragraph Challenge
      Speed Measurement
      Accuracy Tracking
      WPM Calculator
      Real-time Feedback
    AI Mock Call
      Customer Scenario
      Profile Information
      Bill/Usage Details
      Live Call Simulation
      Performance Evaluation
```

---

## Module Progression Flow

```mermaid
flowchart LR
    subgraph Foundation
        A1[English<br/>Assessments]
    end

    subgraph Communication
        A2[AI Chat-Chat]
        A3[AI Interview]
    end

    subgraph Skills
        A4[Typing Test]
        A5[AI Mock Call]
    end

    A1 -->|Build Foundation| A2
    A2 -->|Practice Conversation| A3
    A1 -->|Develop Skills| A4
    A3 -->|Apply Learning| A5
    A4 -->|Support| A5

    style A1 fill:#f3e5f5
    style A2 fill:#e8f5e9
    style A3 fill:#fff9c4
    style A4 fill:#fce4ec
    style A5 fill:#e0f2f1
```

---

## Detailed Module Breakdown

### 1. English Assessments
**Purpose:** Evaluate and improve fundamental English skills

**Components:**
- Reading passages with comprehension questions
- Multiple-choice assessments
- Grammar and syntax lessons
- Figures of speech training
- Immediate score feedback and recommendations

**User Flow:**
```mermaid
stateDiagram-v2
    [*] --> SelectAssessment
    SelectAssessment --> ReadingPassage
    ReadingPassage --> Questions
    Questions --> SubmitAnswers
    SubmitAnswers --> ScoreCalculation
    ScoreCalculation --> ViewFeedback
    ViewFeedback --> Recommendations
    Recommendations --> [*]
```

---

### 2. AI Chat-Chat
**Purpose:** Practice conversational English with AI assistance

**Features:**
- Interactive chatbox interface
- Voice input via microphone button
- AI-powered responses using ChatGPT
- Instant feedback on grammar, vocabulary, and fluency
- Conversation history tracking

**User Experience:**
```mermaid
sequenceDiagram
    participant User
    participant Platform
    participant AI

    User->>Platform: Open Chat Interface
    Platform->>User: Display Chatbox
    User->>Platform: Type or Speak Message
    Platform->>AI: Send Message
    AI->>Platform: Generate Response + Feedback
    Platform->>User: Display Response
    Platform->>User: Show Instant Feedback
    User->>Platform: Continue Conversation
```

---

### 3. AI Interview
**Purpose:** Simulate job interview scenarios with AI interviewer

**Features:**
- Realistic interview questions
- AI acts as professional interviewer
- Voice-based Q&A interaction
- Full transcript recording
- Performance rating and analysis

**Interview Flow:**
```mermaid
graph TD
    Start[Start Interview] --> Intro[AI Interviewer Introduction]
    Intro --> Q1[Question 1]
    Q1 --> A1[User Answers]
    A1 --> Q2[Question 2]
    Q2 --> A2[User Answers]
    A2 --> Q3[Question 3]
    Q3 --> A3[User Answers]
    A3 --> More{More Questions?}
    More -->|Yes| Next[Next Question]
    Next --> Answer[User Answers]
    Answer --> More
    More -->|No| End[Interview Complete]
    End --> Transcript[View Transcript]
    Transcript --> Rating[Performance Rating]
    Rating --> Feedback[Detailed Feedback]

    style Start fill:#c8e6c9
    style End fill:#ffccbc
    style Rating fill:#fff9c4
```

---

### 4. Typing Test
**Purpose:** Assess and improve typing speed and accuracy

**Features:**
- Paragraph typing challenge
- Real-time WPM (Words Per Minute) tracking
- Accuracy percentage calculation
- Error highlighting
- Performance history

**Test Flow:**
```mermaid
stateDiagram-v2
    [*] --> Ready
    Ready --> StartTest: Click Start
    StartTest --> Typing
    Typing --> Calculating: Test Complete
    Calculating --> Results
    Results --> ShowWPM
    Results --> ShowAccuracy
    Results --> ShowErrors
    ShowWPM --> [*]
    ShowAccuracy --> [*]
    ShowErrors --> [*]
```

---

### 5. AI Mock Call (Customer Service Simulation)
**Purpose:** Practice real-world customer service scenarios

**Features:**
- Realistic customer profile (Name, Contact, Address)
- Bill/usage scenario details
- Live voice call simulation with AI customer
- Real-time conversation with AI responses
- Performance evaluation and feedback

**Mock Call Workflow:**
```mermaid
flowchart TD
    Start([Start Mock Call]) --> Profile[View Customer Profile]
    Profile --> Details[Review Bill/Usage Details]
    Details --> Scenario[Read Scenario Context]
    Scenario --> Ready{Ready?}
    Ready -->|Yes| StartCall[Click 'Start Call']
    Ready -->|No| Details

    StartCall --> CallActive[Call Active]
    CallActive --> Listen[Listen to Customer]
    Listen --> Respond[Speak Response]
    Respond --> AIProcessing[AI Processes Response]
    AIProcessing --> AIReply[AI Customer Replies]
    AIReply --> Continue{Issue Resolved?}

    Continue -->|No| Listen
    Continue -->|Yes| EndCall[End Call]

    EndCall --> Transcript[View Call Transcript]
    Transcript --> Evaluation[Performance Evaluation]
    Evaluation --> Feedback[Detailed Feedback]
    Feedback --> End([Complete])

    style Start fill:#c8e6c9
    style CallActive fill:#ffeb3b
    style EndCall fill:#ffccbc
    style Evaluation fill:#b39ddb
```

---

## Progress Tracking

```mermaid
graph LR
    subgraph User Progress
        P1[Module Completion %]
        P2[Overall Score]
        P3[Strengths Identified]
        P4[Areas for Improvement]
        P5[Time Spent]
    end

    P1 --> Dashboard
    P2 --> Dashboard
    P3 --> Dashboard
    P4 --> Dashboard
    P5 --> Dashboard

    Dashboard --> Recommendations[Personalized<br/>Recommendations]

    style Dashboard fill:#fff3e0
    style Recommendations fill:#c8e6c9
```

---

## User Interaction Patterns

```mermaid
graph TB
    subgraph Input Methods
        I1[Text Input]
        I2[Voice Input - Mic]
        I3[Click/Tap Actions]
    end

    subgraph AI Processing
        AI1[ChatGPT Analysis]
        AI2[Speech Recognition]
        AI3[Response Generation]
    end

    subgraph Output Feedback
        O1[Text Responses]
        O2[Voice Responses - ElevenLabs]
        O3[Scores & Ratings]
        O4[Visual Feedback]
    end

    I1 --> AI1
    I2 --> AI2
    I3 --> AI1

    AI1 --> AI3
    AI2 --> AI3

    AI3 --> O1
    AI3 --> O2
    AI3 --> O3
    AI3 --> O4

    style AI3 fill:#e1f5ff
```

---

## Success Metrics

Each module tracks specific success indicators:

| Module | Success Metrics |
|--------|----------------|
| **English Assessments** | Score percentage, Improvement rate, Topics mastered |
| **AI Chat-Chat** | Conversation quality, Grammar accuracy, Vocabulary usage |
| **AI Interview** | Overall rating, Answer quality, Confidence score |
| **Typing Test** | WPM score, Accuracy percentage, Consistency |
| **AI Mock Call** | Issue resolution, Communication clarity, Professionalism score |

---

## Module Access Strategy

```mermaid
graph TD
    New[New User] --> Assess[Complete Initial Assessment]
    Assess --> Score{Assessment<br/>Score}

    Score -->|Beginner| L1[Level 1 Access]
    Score -->|Intermediate| L2[Level 2 Access]
    Score -->|Advanced| L3[Level 3 Access]

    L1 --> Basic[Unlock: Assessments + Chat]
    L2 --> Inter[Unlock: All Except Mock Call]
    L3 --> Full[Unlock: All Modules]

    Basic --> Progress1[Complete Modules]
    Inter --> Progress2[Complete Modules]
    Full --> Progress3[Complete Modules]

    Progress1 --> Unlock[Unlock Next Level]
    Progress2 --> Unlock

    style New fill:#e1f5ff
    style Unlock fill:#c8e6c9
```

---

## Completion Certificate Flow

```mermaid
flowchart LR
    Start([User Journey]) --> M1{Module 1<br/>Complete?}
    M1 -->|Yes| M2{Module 2<br/>Complete?}
    M1 -->|No| M1
    M2 -->|Yes| M3{Module 3<br/>Complete?}
    M2 -->|No| M2
    M3 -->|Yes| M4{Module 4<br/>Complete?}
    M3 -->|No| M3
    M4 -->|Yes| M5{Module 5<br/>Complete?}
    M4 -->|No| M4
    M5 -->|Yes| Cert[Generate Certificate]
    M5 -->|No| M5

    Cert --> Final[Platform Completion]

    style Cert fill:#ffd54f
    style Final fill:#66bb6a
```

---

## Summary

This English training platform provides a comprehensive, AI-powered learning experience that combines:

- **Assessment & Feedback** - Continuous evaluation and personalized guidance
- **Interactive Learning** - Engaging AI conversations and simulations
- **Practical Application** - Real-world scenarios and skill development
- **Progress Tracking** - Clear metrics and achievement milestones
- **Voice Integration** - Natural speech interaction throughout modules

The modular design allows users to progress at their own pace while ensuring all essential communication skills are developed for professional success.