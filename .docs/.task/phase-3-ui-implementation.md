# Phase 3: UI/UX Implementation (Week 5-6)

## Overview
Build comprehensive user interfaces for AI Chit Chat and AI Mock Call features, including real-time interactions, audio visualization, progress tracking, and evaluation displays.

## Prerequisites
- [x] Phase 1 & 2 completed successfully
- [ ] WebSocket connections established
- [ ] Audio recording permissions granted
- [ ] UI component library ready (shadcn/ui)
- [ ] State management solution chosen

## Tasks

### 1. State Management Setup (Day 1)

#### Zustand Store Configuration
```typescript
// stores/chat-store.ts
import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"

interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  audioUrl?: string
  timestamp: Date
  isLoading?: boolean
}

interface ChatSession {
  id: string
  topic: string
  difficulty: string
  messages: ChatMessage[]
  status: "active" | "completed" | "abandoned"
  startedAt: Date
  endedAt?: Date
}

interface ChatStore {
  // State
  currentSession: ChatSession | null
  sessions: ChatSession[]
  isRecording: boolean
  isProcessing: boolean
  audioEnabled: boolean

  // Actions
  startSession: (topic: string, difficulty: string) => Promise<void>
  endSession: () => Promise<void>
  sendMessage: (content: string, audioBlob?: Blob) => Promise<void>
  addMessage: (message: ChatMessage) => void
  setRecording: (isRecording: boolean) => void
  setProcessing: (isProcessing: boolean) => void
  toggleAudio: () => void
  loadSessions: () => Promise<void>
}

export const useChatStore = create<ChatStore>()(
  devtools(
    persist(
      (set, get) => ({
        currentSession: null,
        sessions: [],
        isRecording: false,
        isProcessing: false,
        audioEnabled: true,

        startSession: async (topic, difficulty) => {
          try {
            const response = await fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ topic, difficulty })
            })

            const session = await response.json()

            set({
              currentSession: {
                ...session,
                messages: []
              }
            })
          } catch (error) {
            console.error("Failed to start session:", error)
          }
        },

        endSession: async () => {
          const { currentSession } = get()
          if (!currentSession) return

          try {
            await fetch(`/api/chat/${currentSession.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "completed" })
            })

            set(state => ({
              currentSession: null,
              sessions: [...state.sessions, {
                ...state.currentSession!,
                status: "completed",
                endedAt: new Date()
              }]
            }))
          } catch (error) {
            console.error("Failed to end session:", error)
          }
        },

        sendMessage: async (content, audioBlob) => {
          const { currentSession } = get()
          if (!currentSession) return

          // Add user message optimistically
          const userMessage: ChatMessage = {
            id: `temp-${Date.now()}`,
            role: "user",
            content,
            timestamp: new Date()
          }

          set(state => ({
            currentSession: {
              ...state.currentSession!,
              messages: [...state.currentSession!.messages, userMessage]
            }
          }))

          // Add loading assistant message
          const loadingMessage: ChatMessage = {
            id: `loading-${Date.now()}`,
            role: "assistant",
            content: "",
            timestamp: new Date(),
            isLoading: true
          }

          set(state => ({
            currentSession: {
              ...state.currentSession!,
              messages: [...state.currentSession!.messages, loadingMessage]
            },
            isProcessing: true
          }))

          try {
            const formData = new FormData()
            if (audioBlob) {
              formData.append("audio", audioBlob)
            } else {
              formData.append("text", content)
            }

            const response = await fetch(
              `/api/chat/${currentSession.id}/messages`,
              {
                method: "POST",
                body: formData
              }
            )

            const data = await response.json()

            // Replace loading message with actual response
            set(state => ({
              currentSession: {
                ...state.currentSession!,
                messages: state.currentSession!.messages
                  .filter(m => !m.isLoading)
                  .concat([{
                    id: data.message.id,
                    role: "assistant",
                    content: data.message.content,
                    audioUrl: data.audioUrl,
                    timestamp: new Date(data.message.timestamp)
                  }])
              },
              isProcessing: false
            }))
          } catch (error) {
            console.error("Failed to send message:", error)
            set({ isProcessing: false })
          }
        },

        addMessage: (message) => {
          set(state => ({
            currentSession: state.currentSession ? {
              ...state.currentSession,
              messages: [...state.currentSession.messages, message]
            } : null
          }))
        },

        setRecording: (isRecording) => set({ isRecording }),
        setProcessing: (isProcessing) => set({ isProcessing }),
        toggleAudio: () => set(state => ({ audioEnabled: !state.audioEnabled })),

        loadSessions: async () => {
          try {
            const response = await fetch("/api/chat")
            const sessions = await response.json()
            set({ sessions })
          } catch (error) {
            console.error("Failed to load sessions:", error)
          }
        }
      }),
      {
        name: "chat-store",
        partialize: (state) => ({ sessions: state.sessions })
      }
    )
  )
)
```

#### Call Store
```typescript
// stores/call-store.ts
import { create } from "zustand"
import { devtools } from "zustand/middleware"

interface CallStore {
  // State
  isCallActive: boolean
  isMuted: boolean
  scenario: string | null
  difficulty: string | null
  callDuration: number
  transcript: Array<{ speaker: string; text: string; timestamp: Date }>
  metrics: {
    volume: number
    networkQuality: "poor" | "fair" | "good" | "excellent"
    latency: number
  }

  // WebRTC
  peerConnection: RTCPeerConnection | null
  localStream: MediaStream | null
  remoteStream: MediaStream | null

  // Actions
  startCall: (scenario: string, difficulty: string) => Promise<void>
  endCall: () => Promise<void>
  toggleMute: () => void
  updateMetrics: (metrics: Partial<CallStore["metrics"]>) => void
  addTranscript: (entry: { speaker: string; text: string }) => void
}

export const useCallStore = create<CallStore>()(
  devtools((set, get) => ({
    isCallActive: false,
    isMuted: false,
    scenario: null,
    difficulty: null,
    callDuration: 0,
    transcript: [],
    metrics: {
      volume: 0,
      networkQuality: "good",
      latency: 0
    },
    peerConnection: null,
    localStream: null,
    remoteStream: null,

    startCall: async (scenario, difficulty) => {
      // Implementation in WebRTC component
      set({
        isCallActive: true,
        scenario,
        difficulty,
        callDuration: 0,
        transcript: []
      })
    },

    endCall: async () => {
      const { peerConnection, localStream } = get()

      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }

      if (peerConnection) {
        peerConnection.close()
      }

      set({
        isCallActive: false,
        peerConnection: null,
        localStream: null,
        remoteStream: null,
        scenario: null,
        difficulty: null
      })
    },

    toggleMute: () => {
      const { localStream, isMuted } = get()
      if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0]
        if (audioTrack) {
          audioTrack.enabled = isMuted
          set({ isMuted: !isMuted })
        }
      }
    },

    updateMetrics: (metrics) => {
      set(state => ({
        metrics: { ...state.metrics, ...metrics }
      }))
    },

    addTranscript: (entry) => {
      set(state => ({
        transcript: [...state.transcript, {
          ...entry,
          timestamp: new Date()
        }]
      }))
    }
  }))
)
```

### 2. AI Chit Chat UI Components (Day 2-3)

#### Chat Interface Component
```typescript
// components/ai-chat/chat-interface.tsx
"use client"

import { useState, useRef, useEffect } from "react"
import { useChatStore } from "@/stores/chat-store"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageList } from "./message-list"
import { AudioControls } from "./audio-controls"
import { TopicSelector } from "./topic-selector"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Mic, MicOff, Volume2, VolumeX } from "lucide-react"

export function ChatInterface() {
  const {
    currentSession,
    isRecording,
    isProcessing,
    audioEnabled,
    sendMessage,
    toggleAudio
  } = useChatStore()

  const [inputText, setInputText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSendMessage = async () => {
    if (!inputText.trim() || isProcessing) return

    await sendMessage(inputText)
    setInputText("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!currentSession) {
    return <TopicSelector />
  }

  return (
    <Card className="w-full max-w-4xl mx-auto h-[80vh] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{currentSession.topic}</h2>
          <p className="text-sm text-muted-foreground">
            Difficulty: {currentSession.difficulty}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleAudio}
            className="relative"
          >
            {audioEnabled ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </Button>
          <Button variant="outline" size="sm">
            End Session
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <MessageList messages={currentSession.messages} />
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <AudioControls />
          <Input
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isProcessing || isRecording}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isProcessing}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Status Indicators */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 text-sm text-muted-foreground flex items-center"
            >
              <div className="mr-2 h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
              AI is thinking...
            </motion.div>
          )}
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 text-sm text-red-500 flex items-center"
            >
              <div className="mr-2 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
              Recording...
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  )
}
```

#### Message List Component
```typescript
// components/ai-chat/message-list.tsx
"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { User, Bot, Volume2, Check } from "lucide-react"
import { AudioPlayer } from "./audio-player"

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  audioUrl?: string
  timestamp: Date
  isLoading?: boolean
}

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            "flex",
            message.role === "user" ? "justify-end" : "justify-start"
          )}
        >
          <div
            className={cn(
              "flex max-w-[70%] space-x-2",
              message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
            )}
          >
            <Avatar className="h-8 w-8 mt-1">
              <AvatarFallback>
                {message.role === "user" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </AvatarFallback>
            </Avatar>

            <div>
              <div
                className={cn(
                  "rounded-lg px-3 py-2",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {message.isLoading ? (
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-200" />
                  </div>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
              </div>

              {message.audioUrl && (
                <AudioPlayer
                  url={message.audioUrl}
                  className="mt-1"
                />
              )}

              <p className="text-xs text-muted-foreground mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
```

#### Audio Controls Component
```typescript
// components/ai-chat/audio-controls.tsx
"use client"

import { useState, useRef, useEffect } from "react"
import { useChatStore } from "@/stores/chat-store"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Square, Pause, Play } from "lucide-react"
import RecordRTC from "recordrtc"
import WaveSurfer from "wavesurfer.js"

export function AudioControls() {
  const { isRecording, setRecording, sendMessage } = useChatStore()
  const [isPaused, setIsPaused] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const recorderRef = useRef<RecordRTC | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number>()

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Set up audio analysis
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      analyserRef.current.fftSize = 256

      // Start recording
      recorderRef.current = new RecordRTC(stream, {
        type: "audio",
        mimeType: "audio/webm",
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1,
        desiredSampRate: 16000
      })

      recorderRef.current.startRecording()
      setRecording(true)

      // Start visualizing audio level
      visualizeAudio()
    } catch (error) {
      console.error("Failed to start recording:", error)
    }
  }

  const stopRecording = () => {
    if (!recorderRef.current) return

    recorderRef.current.stopRecording(async () => {
      const blob = recorderRef.current!.getBlob()
      await sendMessage("", blob)

      // Clean up
      recorderRef.current = null
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      setRecording(false)
      setAudioLevel(0)
    })
  }

  const pauseRecording = () => {
    if (!recorderRef.current) return

    if (isPaused) {
      recorderRef.current.resumeRecording()
      visualizeAudio()
    } else {
      recorderRef.current.pauseRecording()
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
    setIsPaused(!isPaused)
  }

  const visualizeAudio = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)

    // Calculate average volume
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length
    setAudioLevel(average / 255)

    animationRef.current = requestAnimationFrame(visualizeAudio)
  }

  return (
    <div className="flex items-center space-x-2">
      <AnimatePresence mode="wait">
        {!isRecording ? (
          <motion.div
            key="start"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Button
              onClick={startRecording}
              size="icon"
              variant="default"
              className="rounded-full"
            >
              <Mic className="h-4 w-4" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="controls"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="flex items-center space-x-2"
          >
            <Button
              onClick={pauseRecording}
              size="icon"
              variant="outline"
              className="rounded-full"
            >
              {isPaused ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </Button>
            <Button
              onClick={stopRecording}
              size="icon"
              variant="destructive"
              className="rounded-full"
            >
              <Square className="h-4 w-4" />
            </Button>

            {/* Audio Level Indicator */}
            <motion.div
              className="h-8 w-1 bg-muted rounded-full overflow-hidden"
              animate={{
                backgroundColor: isRecording && !isPaused ? "#ef4444" : "#6b7280"
              }}
            >
              <motion.div
                className="w-full bg-red-500"
                animate={{
                  height: `${audioLevel * 100}%`
                }}
                transition={{ duration: 0.1 }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

### 3. AI Mock Call UI Components (Day 4-5)

#### Call Interface Component
```typescript
// components/ai-call/call-interface.tsx
"use client"

import { useEffect, useState } from "react"
import { useCallStore } from "@/stores/call-store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Phone, PhoneOff, Mic, MicOff } from "lucide-react"
import { CallTimer } from "./call-timer"
import { CallTranscript } from "./call-transcript"
import { CallMetrics } from "./call-metrics"
import { ScenarioSelector } from "./scenario-selector"
import { WebRTCManager } from "./webrtc-manager"

export function CallInterface() {
  const {
    isCallActive,
    isMuted,
    scenario,
    toggleMute,
    endCall
  } = useCallStore()

  const [isConnecting, setIsConnecting] = useState(false)

  if (!isCallActive) {
    return <ScenarioSelector />
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Main Call Area */}
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center h-full min-h-[500px]">
          {/* Call Status */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative mb-8"
          >
            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="h-12 w-12 text-primary" />
            </div>

            {/* Pulse Animation */}
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/20"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
            />
          </motion.div>

          {/* Scenario Info */}
          <h2 className="text-2xl font-bold mb-2">{scenario}</h2>
          <CallTimer />

          {/* Call Controls */}
          <div className="flex items-center space-x-4 mt-8">
            <Button
              onClick={toggleMute}
              size="lg"
              variant={isMuted ? "destructive" : "secondary"}
              className="rounded-full"
            >
              {isMuted ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>

            <Button
              onClick={endCall}
              size="lg"
              variant="destructive"
              className="rounded-full px-8"
            >
              <PhoneOff className="h-5 w-5 mr-2" />
              End Call
            </Button>
          </div>

          {/* Call Metrics */}
          <CallMetrics className="mt-8" />
        </div>
      </Card>

      {/* Transcript & Info */}
      <div className="space-y-6">
        <CallTranscript />
        <WebRTCManager />
      </div>
    </div>
  )
}
```

#### Call Timer Component
```typescript
// components/ai-call/call-timer.tsx
"use client"

import { useEffect, useState } from "react"
import { useCallStore } from "@/stores/call-store"

export function CallTimer() {
  const { isCallActive } = useCallStore()
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!isCallActive) {
      setSeconds(0)
      return
    }

    const interval = setInterval(() => {
      setSeconds(s => s + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isCallActive])

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`
  }

  return (
    <div className="text-4xl font-mono text-muted-foreground">
      {formatTime(seconds)}
    </div>
  )
}
```

### 4. Audio Visualization (Day 6-7)

#### Audio Visualizer Component
```typescript
// components/audio/visualizer.tsx
"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface AudioVisualizerProps {
  stream: MediaStream | null
  className?: string
}

export function AudioVisualizer({ stream, className }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  useEffect(() => {
    if (!stream || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")!

    // Set up audio analysis
    audioContextRef.current = new AudioContext()
    analyserRef.current = audioContextRef.current.createAnalyser()
    const source = audioContextRef.current.createMediaStreamSource(stream)
    source.connect(analyserRef.current)

    analyserRef.current.fftSize = 256
    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw)

      analyserRef.current!.getByteFrequencyData(dataArray)

      // Clear canvas
      ctx.fillStyle = "rgb(15, 23, 42)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw frequency bars
      const barWidth = (canvas.width / bufferLength) * 2.5
      let barHeight
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height * 0.7

        // Create gradient
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0)
        gradient.addColorStop(0, "rgb(59, 130, 246)")
        gradient.addColorStop(0.5, "rgb(147, 51, 234)")
        gradient.addColorStop(1, "rgb(236, 72, 153)")

        ctx.fillStyle = gradient
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)

        x += barWidth + 1
      }
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [stream])

  return (
    <motion.canvas
      ref={canvasRef}
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    />
  )
}
```

#### Waveform Display
```typescript
// components/audio/waveform.tsx
"use client"

import { useEffect, useRef } from "react"
import WaveSurfer from "wavesurfer.js"

interface WaveformProps {
  audioUrl: string
  onReady?: () => void
  className?: string
}

export function Waveform({ audioUrl, onReady, className }: WaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    wavesurferRef.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "rgb(147, 51, 234)",
      progressColor: "rgb(59, 130, 246)",
      cursorColor: "rgb(236, 72, 153)",
      barWidth: 2,
      barRadius: 3,
      cursorWidth: 1,
      height: 60,
      barGap: 3,
      responsive: true,
      normalize: true,
      backend: "WebAudio"
    })

    wavesurferRef.current.load(audioUrl)

    wavesurferRef.current.on("ready", () => {
      onReady?.()
    })

    return () => {
      wavesurferRef.current?.destroy()
    }
  }, [audioUrl, onReady])

  return <div ref={containerRef} className={className} />
}
```

### 5. Progress & Evaluation UI (Day 8-9)

#### Evaluation Results Component
```typescript
// components/evaluation/evaluation-results.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Trophy
} from "lucide-react"
import { RadarChart, LineChart } from "@/components/charts"

interface EvaluationData {
  overallScore: number
  grammar: {
    score: number
    feedback: string
    corrections: Array<{
      original: string
      corrected: string
      explanation: string
    }>
  }
  vocabulary: {
    score: number
    feedback: string
    level: string
    suggestions: string[]
  }
  fluency: {
    score: number
    feedback: string
    pace: string
    hesitations: number
  }
  pronunciation: {
    score: number
    feedback: string
    problematicWords: string[]
  }
  comprehension: {
    score: number
    feedback: string
    understood: boolean
    responseRelevance: string
  }
  recommendations: string[]
}

export function EvaluationResults({ data }: { data: EvaluationData }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-500" />
    if (score >= 60) return <AlertCircle className="h-5 w-5 text-yellow-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Overall Performance</span>
              <Trophy className="h-5 w-5 text-yellow-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <motion.div
                  className={`text-6xl font-bold ${getScoreColor(
                    data.overallScore
                  )}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  {data.overallScore}%
                </motion.div>
              </div>
            </div>
            <Progress value={data.overallScore} className="h-3" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Scores */}
      <Tabs defaultValue="scores" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scores">Scores</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="corrections">Corrections</TabsTrigger>
        </TabsList>

        <TabsContent value="scores" className="space-y-4">
          {/* Score Cards */}
          {[
            { name: "Grammar", data: data.grammar },
            { name: "Vocabulary", data: data.vocabulary },
            { name: "Fluency", data: data.fluency },
            { name: "Pronunciation", data: data.pronunciation },
            { name: "Comprehension", data: data.comprehension }
          ].map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getScoreIcon(item.data.score)}
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className={`text-2xl font-bold ${getScoreColor(item.data.score)}`}>
                      {item.data.score}%
                    </span>
                  </div>
                  <Progress value={item.data.score} className="h-2" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          {/* Feedback Cards */}
          {Object.entries(data).map(([key, value]) => {
            if (typeof value === "object" && "feedback" in value) {
              return (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="capitalize">{key}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {value.feedback}
                    </p>
                  </CardContent>
                </Card>
              )
            }
            return null
          })}

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="corrections" className="space-y-4">
          {/* Grammar Corrections */}
          {data.grammar.corrections.map((correction, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Badge variant="destructive" className="mt-0.5">
                      Error
                    </Badge>
                    <span className="text-sm line-through">
                      {correction.original}
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Badge variant="default" className="mt-0.5">
                      Correct
                    </Badge>
                    <span className="text-sm font-medium">
                      {correction.corrected}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-14">
                    {correction.explanation}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

### 6. Mobile Responsive Design (Day 10)

#### Responsive Layout Wrapper
```typescript
// components/layout/responsive-wrapper.tsx
"use client"

import { useMediaQuery } from "@/hooks/use-media-query"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Drawer, DrawerContent } from "@/components/ui/drawer"

interface ResponsiveWrapperProps {
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ResponsiveWrapper({
  children,
  open,
  onOpenChange
}: ResponsiveWrapperProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          {children}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[80vh]">{children}</DrawerContent>
    </Drawer>
  )
}
```

## Testing & Optimization

### UI Component Tests
```typescript
// __tests__/components/chat.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { ChatInterface } from "@/components/ai-chat/chat-interface"
import { useChatStore } from "@/stores/chat-store"

jest.mock("@/stores/chat-store")

describe("ChatInterface", () => {
  it("renders topic selector when no session", () => {
    (useChatStore as jest.Mock).mockReturnValue({
      currentSession: null
    })

    render(<ChatInterface />)
    expect(screen.getByText(/Select a topic/i)).toBeInTheDocument()
  })

  it("sends message on enter key", async () => {
    const sendMessage = jest.fn()
    (useChatStore as jest.Mock).mockReturnValue({
      currentSession: { messages: [] },
      sendMessage,
      isProcessing: false
    })

    render(<ChatInterface />)
    const input = screen.getByPlaceholderText(/Type your message/i)

    fireEvent.change(input, { target: { value: "Hello" } })
    fireEvent.keyPress(input, { key: "Enter" })

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalledWith("Hello")
    })
  })
})
```

## Deliverables Checklist

- [ ] State management implemented (Zustand)
- [ ] Chat interface fully functional
- [ ] Call interface operational
- [ ] Audio recording/playback working
- [ ] Real-time visualizations active
- [ ] Evaluation results displayed
- [ ] Progress tracking visible
- [ ] Mobile responsive design
- [ ] Accessibility features included
- [ ] Component tests passing

## Success Criteria

1. Users can start and conduct AI conversations
2. Audio recording works seamlessly
3. Real-time feedback is visible
4. Call interface simulates real scenarios
5. Evaluation results are clear and actionable
6. Progress is tracked and visualized
7. Mobile experience is optimal
8. Performance metrics meet targets (<100ms interaction delay)

## Next Phase

Phase 4 will focus on testing, optimization, and deployment:
- End-to-end testing
- Performance optimization
- Security hardening
- Production deployment