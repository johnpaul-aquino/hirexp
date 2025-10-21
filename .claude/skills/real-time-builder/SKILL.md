---
name: Real-time Builder
description: Implement WebSocket/Socket.io connections for HireXp real-time AI conversations and mock calls
---

# Real-time Builder

Build real-time communication features for HireXp using Socket.io.

## Context

Per `technical-decisions.md`:
- Socket.io for AI Chit Chat (text/voice messages)
- WebSocket for real-time streaming
- Redis for pub/sub if needed

## Socket.io Server Setup

### Server Configuration

```typescript
// server/socket-server.ts
import { Server } from "socket.io";
import { createServer } from "http";
import { parse } from "url";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL,
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-session", (sessionId: string) => {
      socket.join(sessionId);
      console.log(`Socket ${socket.id} joined session ${sessionId}`);
    });

    socket.on("send-message", async (data) => {
      const { sessionId, message } = data;

      // Broadcast to session room
      io.to(sessionId).emit("new-message", {
        id: crypto.randomUUID(),
        content: message,
        role: "user",
        timestamp: new Date()
      });

      // Process with AI (async)
      processAIResponse(sessionId, message).then((response) => {
        io.to(sessionId).emit("new-message", {
          id: crypto.randomUUID(),
          content: response,
          role: "assistant",
          timestamp: new Date()
        });
      });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
```

## Client Hook

```typescript
// hooks/use-socket.ts
'use client';
import { useEffect, useState } from 'use';
import { io, Socket } from 'socket.io-client';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return { socket, isConnected };
}
```

## Chat Component with Real-time

```typescript
// components/real-time-chat.tsx
'use client';
import { useSocket } from '@/hooks/use-socket';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export function RealTimeChat({ sessionId }: { sessionId: string }) {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!socket) return;

    // Join session room
    socket.emit('join-session', sessionId);

    // Listen for new messages
    socket.on('new-message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('new-message');
    };
  }, [socket, sessionId]);

  const sendMessage = () => {
    if (!socket || !input.trim()) return;

    socket.emit('send-message', {
      sessionId,
      message: input
    });

    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          disabled={!isConnected}
        />
        <Button onClick={sendMessage} disabled={!isConnected}>
          Send
        </Button>
      </div>

      {!isConnected && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
          Connecting...
        </div>
      )}
    </div>
  );
}
```

## Streaming AI Responses

```typescript
// server/ai-streaming.ts
import { OpenAI } from "openai";

export async function streamAIResponse(
  socket: Socket,
  sessionId: string,
  message: string
) {
  const openai = new OpenAI();

  const stream = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [{ role: "user", content: message }],
    stream: true
  });

  let fullResponse = '';
  const messageId = crypto.randomUUID();

  // Emit start event
  socket.to(sessionId).emit('ai-response-start', { messageId });

  // Stream chunks
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    fullResponse += content;

    socket.to(sessionId).emit('ai-response-chunk', {
      messageId,
      chunk: content
    });
  }

  // Emit complete event
  socket.to(sessionId).emit('ai-response-complete', {
    messageId,
    fullResponse
  });
}
```

## Client Streaming Handler

```typescript
// hooks/use-streaming-response.ts
'use client';
import { useSocket } from './use-socket';
import { useEffect, useState } from 'react';

export function useStreamingResponse() {
  const { socket } = useSocket();
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.on('ai-response-start', () => {
      setIsStreaming(true);
      setStreamingMessage('');
    });

    socket.on('ai-response-chunk', ({ chunk }) => {
      setStreamingMessage((prev) => prev + chunk);
    });

    socket.on('ai-response-complete', ({ fullResponse }) => {
      setIsStreaming(false);
      setStreamingMessage('');
      // Add to messages
    });

    return () => {
      socket.off('ai-response-start');
      socket.off('ai-response-chunk');
      socket.off('ai-response-complete');
    };
  }, [socket]);

  return { streamingMessage, isStreaming };
}
```

## Environment Variables

```.env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

## Checklist

- [ ] Socket.io server configured
- [ ] CORS properly set up
- [ ] Room-based messaging (sessions)
- [ ] Connection state handling
- [ ] Reconnection logic
- [ ] Error handling
- [ ] Streaming support
- [ ] Client hooks implemented
- [ ] UI components for real-time

## Your Task

Ask:
1. Real-time feature type?
2. Streaming needed?
3. Room/namespace strategy?
4. Authentication?

Then implement the real-time system.
