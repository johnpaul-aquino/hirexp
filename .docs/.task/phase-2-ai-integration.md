# Phase 2: AI Integration (Week 3-4)

## Overview
Implement core AI functionalities including OpenAI integration, LangChain conversation orchestration, ElevenLabs voice synthesis, and real-time audio processing.

## Prerequisites
- [x] Phase 1 completed successfully
- [ ] OpenAI API key with GPT-4 access
- [ ] ElevenLabs API key with voice cloning access
- [ ] LangChain environment configured
- [ ] WebSocket server operational

## Tasks

### 1. OpenAI Integration (Day 1-2)

#### OpenAI Client Setup
```typescript
// lib/ai/openai.ts
import OpenAI from "openai"
import { encoding_for_model } from "tiktoken"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

export class OpenAIService {
  private tokenEncoder = encoding_for_model("gpt-4")

  async createCompletion(
    messages: OpenAI.Chat.ChatCompletionMessageParam[],
    options?: {
      model?: string
      temperature?: number
      maxTokens?: number
      stream?: boolean
    }
  ) {
    const {
      model = "gpt-4-turbo-preview",
      temperature = 0.7,
      maxTokens = 1000,
      stream = false
    } = options || {}

    return openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream
    })
  }

  async generateSystemPrompt(context: {
    module: string
    difficulty: string
    topic?: string
    userLevel?: string
  }): Promise<string> {
    const { module, difficulty, topic, userLevel } = context

    if (module === "chit-chat") {
      return this.generateChitChatPrompt(difficulty, topic, userLevel)
    } else if (module === "mock-call") {
      return this.generateMockCallPrompt(difficulty, topic)
    }

    throw new Error(`Unknown module: ${module}`)
  }

  private generateChitChatPrompt(
    difficulty: string,
    topic?: string,
    userLevel?: string
  ): string {
    return `You are an AI English conversation partner helping someone practice English.

    Context:
    - Difficulty Level: ${difficulty}
    - Topic: ${topic || 'General conversation'}
    - User English Level: ${userLevel || 'Intermediate'}

    Guidelines:
    1. Speak naturally but adjust complexity based on difficulty level
    2. Gently correct major grammar mistakes
    3. Encourage the user to express themselves
    4. Ask follow-up questions to keep conversation flowing
    5. Provide vocabulary suggestions when appropriate
    6. Be supportive and patient

    For ${difficulty} level:
    ${this.getDifficultyGuidelines(difficulty)}

    Remember to maintain a friendly, encouraging tone while helping the user improve their English.`
  }

  private generateMockCallPrompt(difficulty: string, scenario?: string): string {
    return `You are playing the role of a customer in a call center simulation.

    Scenario: ${scenario || 'General customer inquiry'}
    Difficulty: ${difficulty}

    Your behavior should include:
    ${this.getCallCenterBehavior(difficulty)}

    Guidelines:
    1. Stay in character throughout the call
    2. Present realistic customer service challenges
    3. Respond naturally to the agent's solutions
    4. Escalate or de-escalate based on agent's performance
    5. End the call appropriately when issue is resolved

    Remember: You are evaluating the trainee's ability to handle real call center situations.`
  }

  private getDifficultyGuidelines(difficulty: string): string {
    const guidelines = {
      beginner: `
        - Use simple vocabulary and short sentences
        - Speak slowly and clearly
        - Avoid idioms and complex grammar
        - Repeat or rephrase if needed
        - Focus on basic conversational topics`,
      intermediate: `
        - Use moderate vocabulary and varied sentence structures
        - Include common idioms and phrasal verbs
        - Normal speaking pace
        - Introduce more abstract topics
        - Challenge with follow-up questions`,
      advanced: `
        - Use sophisticated vocabulary and complex grammar
        - Natural speaking pace with colloquialisms
        - Discuss abstract and nuanced topics
        - Use cultural references and idioms freely
        - Challenge with debates and complex reasoning`
    }
    return guidelines[difficulty as keyof typeof guidelines] || guidelines.intermediate
  }

  private getCallCenterBehavior(difficulty: string): string {
    const behaviors = {
      beginner: `
        - Friendly and patient customer
        - Simple, straightforward issue
        - Clear in expressing needs
        - Cooperative and understanding`,
      intermediate: `
        - Moderately frustrated customer
        - Multiple related issues
        - Some confusion about products/services
        - Requires clear explanations`,
      advanced: `
        - Angry or highly frustrated customer
        - Complex technical issues
        - May be uncooperative initially
        - Demands supervisor escalation
        - Multiple complaints and concerns`
    }
    return behaviors[difficulty as keyof typeof behaviors] || behaviors.intermediate
  }

  countTokens(text: string): number {
    return this.tokenEncoder.encode(text).length
  }
}

export const openAIService = new OpenAIService()
```

#### Whisper Integration for Speech-to-Text
```typescript
// lib/ai/whisper.ts
import OpenAI from "openai"
import FormData from "form-data"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

export class WhisperService {
  async transcribeAudio(
    audioBuffer: Buffer,
    options?: {
      language?: string
      prompt?: string
      temperature?: number
    }
  ): Promise<{
    text: string
    duration?: number
    language?: string
  }> {
    const formData = new FormData()
    formData.append("file", audioBuffer, {
      filename: "audio.webm",
      contentType: "audio/webm"
    })
    formData.append("model", "whisper-1")

    if (options?.language) {
      formData.append("language", options.language)
    }
    if (options?.prompt) {
      formData.append("prompt", options.prompt)
    }
    if (options?.temperature) {
      formData.append("temperature", options.temperature.toString())
    }

    const response = await openai.audio.transcriptions.create({
      file: audioBuffer as any,
      model: "whisper-1",
      language: options?.language || "en",
      prompt: options?.prompt
    })

    return {
      text: response.text,
      language: "en"
    }
  }

  async detectLanguage(audioBuffer: Buffer): Promise<string> {
    // Use Whisper to detect language
    const response = await this.transcribeAudio(audioBuffer)
    // Additional logic to detect language from response
    return "en"
  }
}

export const whisperService = new WhisperService()
```

### 2. LangChain Implementation (Day 3-4)

#### LangChain Configuration
```typescript
// lib/ai/langchain/config.ts
import { ChatOpenAI } from "@langchain/openai"
import { BufferMemory, ConversationSummaryMemory } from "langchain/memory"
import { ConversationChain } from "langchain/chains"
import { PromptTemplate } from "@langchain/core/prompts"

export class ConversationManager {
  private chains: Map<string, ConversationChain> = new Map()
  private memories: Map<string, BufferMemory> = new Map()

  async createConversation(
    sessionId: string,
    config: {
      systemPrompt: string
      difficulty: string
      temperature?: number
    }
  ): Promise<ConversationChain> {
    const model = new ChatOpenAI({
      modelName: "gpt-4-turbo-preview",
      temperature: config.temperature || 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY
    })

    const memory = new BufferMemory({
      returnMessages: true,
      memoryKey: "chat_history",
      inputKey: "input",
      outputKey: "output"
    })

    const prompt = PromptTemplate.fromTemplate(`
      ${config.systemPrompt}

      Current conversation:
      {chat_history}

      Human: {input}
      AI Assistant:
    `)

    const chain = new ConversationChain({
      llm: model,
      memory,
      prompt,
      verbose: process.env.NODE_ENV === "development"
    })

    this.chains.set(sessionId, chain)
    this.memories.set(sessionId, memory)

    return chain
  }

  async sendMessage(
    sessionId: string,
    message: string
  ): Promise<{
    response: string
    memory?: any
  }> {
    const chain = this.chains.get(sessionId)
    if (!chain) {
      throw new Error(`No conversation found for session: ${sessionId}`)
    }

    const result = await chain.call({ input: message })
    const memory = await this.memories.get(sessionId)?.loadMemoryVariables({})

    return {
      response: result.output,
      memory
    }
  }

  async endConversation(sessionId: string): Promise<void> {
    this.chains.delete(sessionId)
    this.memories.delete(sessionId)
  }

  async saveConversation(sessionId: string): Promise<any> {
    const memory = this.memories.get(sessionId)
    if (!memory) return null

    return memory.loadMemoryVariables({})
  }
}

export const conversationManager = new ConversationManager()
```

#### LangChain Tools and Agents
```typescript
// lib/ai/langchain/tools.ts
import { DynamicTool, DynamicStructuredTool } from "@langchain/core/tools"
import { z } from "zod"

// Grammar correction tool
export const grammarCorrectionTool = new DynamicTool({
  name: "grammar_correction",
  description: "Correct grammar mistakes in user's input",
  func: async (input: string) => {
    // Implement grammar correction logic
    const corrections = await analyzeGrammar(input)
    return JSON.stringify(corrections)
  }
})

// Vocabulary suggestion tool
export const vocabularyTool = new DynamicStructuredTool({
  name: "vocabulary_suggestions",
  description: "Provide vocabulary alternatives and explanations",
  schema: z.object({
    word: z.string().describe("The word to provide alternatives for"),
    context: z.string().describe("The context in which the word is used")
  }),
  func: async ({ word, context }) => {
    // Implement vocabulary suggestion logic
    const suggestions = await getVocabularySuggestions(word, context)
    return JSON.stringify(suggestions)
  }
})

// Pronunciation feedback tool
export const pronunciationTool = new DynamicTool({
  name: "pronunciation_feedback",
  description: "Analyze pronunciation from audio transcription",
  func: async (transcription: string) => {
    // Implement pronunciation analysis
    const feedback = await analyzePronunciation(transcription)
    return JSON.stringify(feedback)
  }
})

async function analyzeGrammar(text: string) {
  // Implementation placeholder
  return { corrections: [], score: 0 }
}

async function getVocabularySuggestions(word: string, context: string) {
  // Implementation placeholder
  return { suggestions: [], definitions: [] }
}

async function analyzePronunciation(transcription: string) {
  // Implementation placeholder
  return { feedback: "", score: 0 }
}
```

#### LangChain Evaluation Chain
```typescript
// lib/ai/langchain/evaluation.ts
import { ChatOpenAI } from "@langchain/openai"
import { PromptTemplate } from "@langchain/core/prompts"
import { LLMChain } from "langchain/chains"
import { z } from "zod"
import { StructuredOutputParser } from "langchain/output_parsers"

const evaluationSchema = z.object({
  grammar: z.object({
    score: z.number().min(0).max(100),
    feedback: z.string(),
    corrections: z.array(z.object({
      original: z.string(),
      corrected: z.string(),
      explanation: z.string()
    }))
  }),
  vocabulary: z.object({
    score: z.number().min(0).max(100),
    feedback: z.string(),
    level: z.enum(["beginner", "intermediate", "advanced"]),
    suggestions: z.array(z.string())
  }),
  fluency: z.object({
    score: z.number().min(0).max(100),
    feedback: z.string(),
    pace: z.enum(["too_slow", "appropriate", "too_fast"]),
    hesitations: z.number()
  }),
  pronunciation: z.object({
    score: z.number().min(0).max(100),
    feedback: z.string(),
    problematicWords: z.array(z.string())
  }),
  comprehension: z.object({
    score: z.number().min(0).max(100),
    feedback: z.string(),
    understood: z.boolean(),
    responseRelevance: z.enum(["off_topic", "partially_relevant", "fully_relevant"])
  }),
  overallScore: z.number().min(0).max(100),
  overallFeedback: z.string(),
  recommendations: z.array(z.string())
})

export class EvaluationChain {
  private model: ChatOpenAI
  private parser: StructuredOutputParser<z.infer<typeof evaluationSchema>>

  constructor() {
    this.model = new ChatOpenAI({
      modelName: "gpt-4-turbo-preview",
      temperature: 0.3,
      openAIApiKey: process.env.OPENAI_API_KEY
    })

    this.parser = StructuredOutputParser.fromZodSchema(evaluationSchema)
  }

  async evaluateConversation(
    transcript: Array<{ role: string; content: string }>,
    metadata: {
      difficulty: string
      topic: string
      duration: number
    }
  ): Promise<z.infer<typeof evaluationSchema>> {
    const formatInstructions = this.parser.getFormatInstructions()

    const prompt = PromptTemplate.fromTemplate(`
      You are an expert English language evaluator. Analyze the following conversation transcript
      and provide detailed evaluation scores and feedback.

      Conversation Metadata:
      - Difficulty: {difficulty}
      - Topic: {topic}
      - Duration: {duration} seconds

      Transcript:
      {transcript}

      Evaluate the user's performance across these dimensions:
      1. Grammar - Correctness of grammar usage
      2. Vocabulary - Range and appropriateness of vocabulary
      3. Fluency - Smoothness and pace of speech
      4. Pronunciation - Clarity and accuracy (based on transcription quality)
      5. Comprehension - Understanding and response relevance

      {format_instructions}

      Provide constructive feedback and specific recommendations for improvement.
    `)

    const chain = new LLMChain({
      llm: this.model,
      prompt
    })

    const response = await chain.call({
      difficulty: metadata.difficulty,
      topic: metadata.topic,
      duration: metadata.duration,
      transcript: JSON.stringify(transcript, null, 2),
      format_instructions: formatInstructions
    })

    return this.parser.parse(response.text)
  }
}

export const evaluationChain = new EvaluationChain()
```

### 3. ElevenLabs Voice Integration (Day 5-6)

#### ElevenLabs Service
```typescript
// lib/ai/elevenlabs.ts
import axios from "axios"

interface Voice {
  voice_id: string
  name: string
  category: string
  labels: Record<string, string>
}

export class ElevenLabsService {
  private apiKey: string
  private baseUrl = "https://api.elevenlabs.io/v1"
  private defaultVoiceId = "21m00Tcm4TlvDq8ikWAM" // Rachel voice

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY!
  }

  async listVoices(): Promise<Voice[]> {
    const response = await axios.get(`${this.baseUrl}/voices`, {
      headers: {
        "xi-api-key": this.apiKey
      }
    })
    return response.data.voices
  }

  async textToSpeech(
    text: string,
    options?: {
      voiceId?: string
      modelId?: string
      voiceSettings?: {
        stability?: number
        similarity_boost?: number
        style?: number
        use_speaker_boost?: boolean
      }
    }
  ): Promise<Buffer> {
    const voiceId = options?.voiceId || this.defaultVoiceId
    const modelId = options?.modelId || "eleven_monolingual_v1"

    const response = await axios.post(
      `${this.baseUrl}/text-to-speech/${voiceId}`,
      {
        text,
        model_id: modelId,
        voice_settings: options?.voiceSettings || {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true
        }
      },
      {
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": this.apiKey
        },
        responseType: "arraybuffer"
      }
    )

    return Buffer.from(response.data)
  }

  async textToSpeechStream(
    text: string,
    options?: {
      voiceId?: string
      optimizeStreamingLatency?: number
    }
  ): Promise<ReadableStream> {
    const voiceId = options?.voiceId || this.defaultVoiceId

    const response = await fetch(
      `${this.baseUrl}/text-to-speech/${voiceId}/stream`,
      {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": this.apiKey
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
          optimize_streaming_latency: options?.optimizeStreamingLatency || 2
        })
      }
    )

    if (!response.body) {
      throw new Error("No response body")
    }

    return response.body
  }

  async getVoiceSettings(voiceId: string) {
    const response = await axios.get(
      `${this.baseUrl}/voices/${voiceId}/settings`,
      {
        headers: {
          "xi-api-key": this.apiKey
        }
      }
    )
    return response.data
  }

  async cloneVoice(
    name: string,
    files: Buffer[],
    description?: string
  ): Promise<string> {
    const formData = new FormData()
    formData.append("name", name)
    if (description) {
      formData.append("description", description)
    }

    files.forEach((file, index) => {
      formData.append("files", new Blob([file]), `sample${index}.mp3`)
    })

    const response = await axios.post(
      `${this.baseUrl}/voices/add`,
      formData,
      {
        headers: {
          "xi-api-key": this.apiKey,
          "Content-Type": "multipart/form-data"
        }
      }
    )

    return response.data.voice_id
  }
}

export const elevenLabsService = new ElevenLabsService()
```

### 4. Real-time Audio Streaming (Day 7-8)

#### WebRTC Audio Streaming
```typescript
// lib/audio/webrtc-stream.ts
import { EventEmitter } from "events"

export class WebRTCAudioStream extends EventEmitter {
  private peerConnection: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null
  private audioContext: AudioContext | null = null
  private processor: ScriptProcessorNode | null = null

  async initialize(configuration?: RTCConfiguration): Promise<void> {
    this.peerConnection = new RTCPeerConnection(
      configuration || {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" }
        ]
      }
    )

    this.audioContext = new AudioContext()

    // Set up event handlers
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.emit("icecandidate", event.candidate)
      }
    }

    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0]
      this.emit("remotestream", this.remoteStream)
    }
  }

  async startLocalStream(): Promise<MediaStream> {
    this.localStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 16000
      }
    })

    // Add audio processing
    const source = this.audioContext!.createMediaStreamSource(this.localStream)
    this.processor = this.audioContext!.createScriptProcessor(4096, 1, 1)

    source.connect(this.processor)
    this.processor.connect(this.audioContext!.destination)

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0)
      this.emit("audiodata", inputData)
    }

    // Add tracks to peer connection
    this.localStream.getTracks().forEach(track => {
      this.peerConnection!.addTrack(track, this.localStream!)
    })

    return this.localStream
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    const offer = await this.peerConnection!.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: false
    })

    await this.peerConnection!.setLocalDescription(offer)
    return offer
  }

  async createAnswer(): Promise<RTCSessionDescriptionInit> {
    const answer = await this.peerConnection!.createAnswer()
    await this.peerConnection!.setLocalDescription(answer)
    return answer
  }

  async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
    await this.peerConnection!.setRemoteDescription(description)
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    await this.peerConnection!.addIceCandidate(candidate)
  }

  stopStream(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
    }

    if (this.processor) {
      this.processor.disconnect()
    }

    if (this.peerConnection) {
      this.peerConnection.close()
    }

    this.emit("streamended")
  }

  getStats(): Promise<RTCStatsReport> {
    return this.peerConnection!.getStats()
  }
}
```

#### Audio Processing Pipeline
```typescript
// lib/audio/processing.ts
export class AudioProcessor {
  private audioContext: AudioContext
  private analyser: AnalyserNode
  private gainNode: GainNode
  private compressor: DynamicsCompressorNode
  private filter: BiquadFilterNode

  constructor() {
    this.audioContext = new AudioContext()

    // Create audio nodes
    this.analyser = this.audioContext.createAnalyser()
    this.gainNode = this.audioContext.createGain()
    this.compressor = this.audioContext.createDynamicsCompressor()
    this.filter = this.audioContext.createBiquadFilter()

    // Configure nodes
    this.analyser.fftSize = 2048
    this.filter.type = "highpass"
    this.filter.frequency.value = 100

    this.compressor.threshold.value = -50
    this.compressor.knee.value = 40
    this.compressor.ratio.value = 12
    this.compressor.attack.value = 0
    this.compressor.release.value = 0.25

    // Connect nodes
    this.filter.connect(this.compressor)
    this.compressor.connect(this.gainNode)
    this.gainNode.connect(this.analyser)
  }

  processStream(stream: MediaStream): MediaStream {
    const source = this.audioContext.createMediaStreamSource(stream)
    const destination = this.audioContext.createMediaStreamDestination()

    source.connect(this.filter)
    this.analyser.connect(destination)

    return destination.stream
  }

  getVolumeLevel(): number {
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount)
    this.analyser.getByteFrequencyData(dataArray)

    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i]
    }

    return sum / dataArray.length / 255 // Normalize to 0-1
  }

  setGain(value: number): void {
    this.gainNode.gain.value = Math.max(0, Math.min(2, value))
  }

  enableNoiseSuppression(enable: boolean): void {
    this.filter.frequency.value = enable ? 100 : 0
  }

  getAudioMetrics(): {
    volume: number
    frequency: number
    waveform: Uint8Array
  } {
    const frequencyData = new Uint8Array(this.analyser.frequencyBinCount)
    const waveformData = new Uint8Array(this.analyser.fftSize)

    this.analyser.getByteFrequencyData(frequencyData)
    this.analyser.getByteTimeDomainData(waveformData)

    // Find dominant frequency
    let maxIndex = 0
    let maxValue = 0
    for (let i = 0; i < frequencyData.length; i++) {
      if (frequencyData[i] > maxValue) {
        maxValue = frequencyData[i]
        maxIndex = i
      }
    }

    const nyquist = this.audioContext.sampleRate / 2
    const frequency = (maxIndex / frequencyData.length) * nyquist

    return {
      volume: this.getVolumeLevel(),
      frequency,
      waveform: waveformData
    }
  }
}
```

### 5. AI Conversation API Routes (Day 9-10)

#### Chat Session API
```typescript
// app/api/chat/[sessionId]/messages/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { conversationManager } from "@/lib/ai/langchain/config"
import { whisperService } from "@/lib/ai/whisper"
import { elevenLabsService } from "@/lib/ai/elevenlabs"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const audioBlob = formData.get("audio") as Blob | null
    const textMessage = formData.get("text") as string | null

    // Get chat session
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: params.sessionId },
      include: { messages: { orderBy: { timestamp: "asc" } } }
    })

    if (!chatSession || chatSession.userId !== session.user.id) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    let userMessage = textMessage

    // Process audio if provided
    if (audioBlob && !textMessage) {
      const audioBuffer = Buffer.from(await audioBlob.arrayBuffer())

      // Upload original audio to Cloudinary
      const audioUrl = await uploadToCloudinary(
        audioBuffer,
        `hirexp/audio/chit-chat/${params.sessionId}`,
        `${Date.now()}-user`,
        "video" // audio uses 'video' resource type in Cloudinary
      )

      // Transcribe audio
      const transcription = await whisperService.transcribeAudio(audioBuffer)
      userMessage = transcription.text

      // Save user message with audio
      await prisma.chatMessage.create({
        data: {
          sessionId: params.sessionId,
          role: "USER",
          content: userMessage,
          audioUrl
        }
      })
    } else {
      // Save text-only message
      await prisma.chatMessage.create({
        data: {
          sessionId: params.sessionId,
          role: "USER",
          content: userMessage!
        }
      })
    }

    // Get AI response
    const { response } = await conversationManager.sendMessage(
      params.sessionId,
      userMessage!
    )

    // Generate audio response
    const audioBuffer = await elevenLabsService.textToSpeech(response)
    const responseAudioUrl = await uploadToCloudinary(
      audioBuffer,
      `hirexp/audio/chit-chat/${params.sessionId}`,
      `${Date.now()}-assistant`,
      "video" // audio uses 'video' resource type in Cloudinary
    )

    // Save AI response
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        sessionId: params.sessionId,
        role: "ASSISTANT",
        content: response,
        audioUrl: responseAudioUrl
      }
    })

    // Return response
    return NextResponse.json({
      message: assistantMessage,
      audioUrl: responseAudioUrl,
      transcription: userMessage
    })
  } catch (error) {
    console.error("Chat message error:", error)
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    )
  }
}
```

#### Mock Call API
```typescript
// app/api/call/[sessionId]/stream/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { WebSocketServer } from "ws"

// This would typically be a separate WebSocket server
export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Upgrade to WebSocket
  const { socket, response } = upgradeWebSocket(req)

  socket.addEventListener("message", async (event) => {
    const data = JSON.parse(event.data)

    switch (data.type) {
      case "audio_chunk":
        await handleAudioChunk(data.chunk, params.sessionId, socket)
        break
      case "end_call":
        await handleEndCall(params.sessionId, socket)
        break
    }
  })

  return response
}

async function handleAudioChunk(
  chunk: string,
  sessionId: string,
  socket: WebSocket
) {
  try {
    // Convert base64 to buffer
    const audioBuffer = Buffer.from(chunk, "base64")

    // Transcribe audio
    const transcription = await whisperService.transcribeAudio(audioBuffer)

    // Get AI response
    const { response } = await conversationManager.sendMessage(
      sessionId,
      transcription.text
    )

    // Generate audio response
    const responseAudio = await elevenLabsService.textToSpeechStream(response)

    // Stream audio back
    const reader = responseAudio.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      socket.send(JSON.stringify({
        type: "audio_response",
        chunk: Buffer.from(value).toString("base64")
      }))
    }

    // Send transcription
    socket.send(JSON.stringify({
      type: "transcription",
      text: transcription.text,
      response: response
    }))
  } catch (error) {
    console.error("Audio processing error:", error)
    socket.send(JSON.stringify({
      type: "error",
      message: "Failed to process audio"
    }))
  }
}

async function handleEndCall(sessionId: string, socket: WebSocket) {
  // Save call session
  await prisma.callSession.update({
    where: { id: sessionId },
    data: {
      status: "COMPLETED",
      endedAt: new Date()
    }
  })

  // Generate evaluation
  const evaluation = await evaluateCallSession(sessionId)

  socket.send(JSON.stringify({
    type: "call_ended",
    evaluation
  }))

  socket.close()
}

function upgradeWebSocket(req: NextRequest) {
  // This is a simplified example - actual implementation would use
  // a proper WebSocket server like Socket.io
  const socket = new WebSocket("ws://localhost:3001")
  const response = new NextResponse(null, { status: 101 })

  return { socket, response }
}
```

### 6. Evaluation System Integration (Day 11-12)

#### Evaluation Service
```typescript
// lib/ai/evaluation/service.ts
import { evaluationChain } from "@/lib/ai/langchain/evaluation"
import { prisma } from "@/lib/prisma"

export class EvaluationService {
  async evaluateChatSession(sessionId: string) {
    // Get session with messages
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { timestamp: "asc" }
        }
      }
    })

    if (!session) {
      throw new Error("Session not found")
    }

    // Prepare transcript
    const transcript = session.messages.map(msg => ({
      role: msg.role.toLowerCase(),
      content: msg.content
    }))

    // Calculate duration
    const duration = session.endedAt
      ? Math.floor((session.endedAt.getTime() - session.startedAt.getTime()) / 1000)
      : 0

    // Run evaluation
    const evaluation = await evaluationChain.evaluateConversation(
      transcript,
      {
        difficulty: session.difficulty,
        topic: session.topic,
        duration
      }
    )

    // Save evaluation
    const saved = await prisma.evaluation.create({
      data: {
        userId: session.userId,
        sessionType: "CHAT",
        sessionId: session.id,
        scores: evaluation,
        feedback: {
          grammar: evaluation.grammar.feedback,
          vocabulary: evaluation.vocabulary.feedback,
          fluency: evaluation.fluency.feedback,
          pronunciation: evaluation.pronunciation.feedback,
          comprehension: evaluation.comprehension.feedback,
          overall: evaluation.overallFeedback,
          recommendations: evaluation.recommendations
        }
      }
    })

    return saved
  }

  async evaluateCallSession(sessionId: string) {
    // Similar to chat evaluation but with call-specific metrics
    const session = await prisma.callSession.findUnique({
      where: { id: sessionId },
      include: {
        transcript: {
          orderBy: { timestamp: "asc" }
        }
      }
    })

    if (!session) {
      throw new Error("Session not found")
    }

    // Additional call center metrics
    const callMetrics = await this.calculateCallMetrics(session)

    // Prepare transcript
    const transcript = session.transcript.map(t => ({
      role: t.speaker === "USER" ? "agent" : "customer",
      content: t.text
    }))

    // Run evaluation
    const evaluation = await evaluationChain.evaluateConversation(
      transcript,
      {
        difficulty: session.difficulty,
        topic: session.scenario,
        duration: session.duration || 0
      }
    )

    // Merge with call metrics
    const fullEvaluation = {
      ...evaluation,
      callMetrics
    }

    // Save evaluation
    const saved = await prisma.evaluation.create({
      data: {
        userId: session.userId,
        sessionType: "CALL",
        sessionId: session.id,
        scores: fullEvaluation,
        feedback: {
          ...evaluation,
          callMetrics
        }
      }
    })

    return saved
  }

  private async calculateCallMetrics(session: any) {
    // Calculate call center specific metrics
    return {
      handleTime: session.duration,
      resolutionRate: this.calculateResolution(session),
      customerSatisfaction: this.estimateSatisfaction(session),
      firstCallResolution: true,
      escalationNeeded: false
    }
  }

  private calculateResolution(session: any): number {
    // Implementation placeholder
    return 85
  }

  private estimateSatisfaction(session: any): number {
    // Implementation placeholder
    return 4.2
  }
}

export const evaluationService = new EvaluationService()
```

## Testing & Validation

### Integration Tests
```typescript
// __tests__/ai/integration.test.ts
import { conversationManager } from "@/lib/ai/langchain/config"
import { whisperService } from "@/lib/ai/whisper"
import { elevenLabsService } from "@/lib/ai/elevenlabs"

describe("AI Integration", () => {
  it("creates and manages conversation", async () => {
    const sessionId = "test-session"
    const conversation = await conversationManager.createConversation(
      sessionId,
      {
        systemPrompt: "Test prompt",
        difficulty: "beginner"
      }
    )

    expect(conversation).toBeDefined()

    const response = await conversationManager.sendMessage(
      sessionId,
      "Hello, how are you?"
    )

    expect(response.response).toBeTruthy()
    expect(response.response.length).toBeGreaterThan(0)
  })

  it("transcribes audio correctly", async () => {
    const audioBuffer = Buffer.from("test-audio-data")
    const result = await whisperService.transcribeAudio(audioBuffer)

    expect(result.text).toBeDefined()
  })

  it("generates speech from text", async () => {
    const text = "Hello, this is a test."
    const audioBuffer = await elevenLabsService.textToSpeech(text)

    expect(audioBuffer).toBeInstanceOf(Buffer)
    expect(audioBuffer.length).toBeGreaterThan(0)
  })
})
```

## Deliverables Checklist

- [ ] OpenAI client configured and tested
- [ ] Whisper STT integration working
- [ ] LangChain conversation flows implemented
- [ ] ElevenLabs TTS integration complete
- [ ] WebRTC audio streaming functional
- [ ] Audio processing pipeline operational
- [ ] AI conversation APIs working
- [ ] Evaluation system integrated
- [ ] Real-time streaming tested
- [ ] Integration tests passing

## Success Criteria

1. AI responds contextually to user input
2. Audio transcription accuracy >95%
3. Voice synthesis sounds natural
4. Real-time streaming latency <500ms
5. Evaluation scores generated accurately
6. Conversation memory persists correctly
7. Error handling robust

## Next Phase

Phase 3 will focus on UI/UX implementation:
- React components for chat and call interfaces
- Real-time audio visualization
- Progress tracking dashboards
- Evaluation result displays