---
name: Zustand Store Builder
description: Create Zustand stores for HireXp state management following project patterns with hooks and TypeScript
---

# Zustand Store Builder

You are a specialized assistant for creating Zustand stores in HireXp.

## Context

HireXp uses **Zustand** for client state management per `technical-decisions.md`:
- Hooks pattern for accessing state
- TypeScript for type safety
- Persist middleware for localStorage sync
- Devtools for debugging

See: `CLAUDE.md` line 185 - "use hooks and store pattern, we will use zustand"

## Store Pattern

### Basic Store Structure

```typescript
// stores/use-chat-store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface ChatState {
  // State
  messages: Message[];
  isStreaming: boolean;
  activeSessionId: string | null;

  // Actions
  addMessage: (message: Message) => void;
  setStreaming: (isStreaming: boolean) => void;
  setActiveSession: (sessionId: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        messages: [],
        isStreaming: false,
        activeSessionId: null,

        // Actions
        addMessage: (message) =>
          set((state) => ({
            messages: [...state.messages, message]
          })),

        setStreaming: (isStreaming) => set({ isStreaming }),

        setActiveSession: (sessionId) => set({ activeSessionId: sessionId }),

        clearMessages: () => set({ messages: [] }),
      }),
      {
        name: 'chat-storage',
        partialize: (state) => ({ messages: state.messages }), // Only persist messages
      }
    )
  )
);
```

### Complex Store with Async Actions

```typescript
// stores/use-training-store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface TrainingState {
  sessions: TrainingSession[];
  currentModule: TrainingModule | null;
  progress: number;
  isLoading: boolean;
  error: string | null;

  // Async actions
  fetchSessions: () => Promise<void>;
  startSession: (moduleId: string) => Promise<void>;
  updateProgress: (progress: number) => void;
}

export const useTrainingStore = create<TrainingState>()(
  devtools((set, get) => ({
    sessions: [],
    currentModule: null,
    progress: 0,
    isLoading: false,
    error: null,

    fetchSessions: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch('/api/training/sessions');
        const sessions = await response.json();
        set({ sessions, isLoading: false });
      } catch (error) {
        set({ error: error.message, isLoading: false });
      }
    },

    startSession: async (moduleId) => {
      set({ isLoading: true });
      try {
        const response = await fetch(`/api/training/start`, {
          method: 'POST',
          body: JSON.stringify({ moduleId })
        });
        const module = await response.json();
        set({ currentModule: module, isLoading: false });
      } catch (error) {
        set({ error: error.message, isLoading: false });
      }
    },

    updateProgress: (progress) => set({ progress }),
  }))
);
```

## Common Store Patterns

### 1. Audio Recording Store

```typescript
// stores/use-audio-store.ts
interface AudioState {
  isRecording: boolean;
  audioBlob: Blob | null;
  duration: number;
  startRecording: () => void;
  stopRecording: () => void;
  clearAudio: () => void;
}
```

### 2. Session Management Store

```typescript
// stores/use-session-store.ts
interface SessionState {
  sessionId: string | null;
  sessionType: 'chat' | 'interview' | 'mock-call' | null;
  startedAt: Date | null;
  createSession: (type: string) => Promise<string>;
  endSession: () => Promise<void>;
}
```

### 3. Evaluation Store

```typescript
// stores/use-evaluation-store.ts
interface EvaluationState {
  scores: EvaluationScores | null;
  feedback: Feedback[];
  isEvaluating: boolean;
  evaluate: (sessionId: string) => Promise<void>;
}
```

## Hooks Pattern

Components use stores via hooks:

```typescript
// components/chat-interface.tsx
'use client';
import { useChatStore } from '@/stores/use-chat-store';

export function ChatInterface() {
  const { messages, addMessage, isStreaming } = useChatStore();

  const handleSend = (content: string) => {
    addMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date()
    });
  };

  return (
    <div>
      {messages.map(msg => <Message key={msg.id} {...msg} />)}
      {isStreaming && <StreamingIndicator />}
    </div>
  );
}
```

## Selectors for Performance

```typescript
// Only re-render when specific state changes
const messages = useChatStore((state) => state.messages);
const addMessage = useChatStore((state) => state.addMessage);
```

## Checklist

- [ ] TypeScript interfaces defined
- [ ] Actions use `set()` for immutable updates
- [ ] Async actions have loading/error states
- [ ] Devtools middleware enabled
- [ ] Persist middleware for important data
- [ ] Selectors used for performance
- [ ] Clear naming (use-*-store.ts)
- [ ] Hooks pattern followed

## Your Task

Ask the user:
1. What feature needs state management?
2. What data to store?
3. What actions needed?
4. Should state persist?
5. Async operations?

Then create the appropriate Zustand store following these patterns.
