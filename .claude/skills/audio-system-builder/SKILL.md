---
name: Audio System Builder
description: Implement Web Audio API recording, Cloudinary storage, and playback for HireXp voice features
---

# Audio System Builder

Build audio recording/playback systems for HireXp voice training.

## Context

Per `.docs/.features/audio-system/`:
- Web Audio API for recording
- Cloudinary for storage
- Whisper API for transcription
- OpenAI TTS for playback

## Recording Implementation

### Audio Recorder Hook

```typescript
// hooks/use-audio-recorder.ts
'use client';
import { useState, useRef, useCallback } from 'react';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000 // Optimal for Whisper
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(duration);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const clearRecording = useCallback(() => {
    setAudioBlob(null);
    setDuration(0);
    audioChunksRef.current = [];
  }, []);

  return {
    isRecording,
    audioBlob,
    duration,
    startRecording,
    stopRecording,
    clearRecording
  };
}
```

## Cloud Storage (Cloudinary)

### Upload Service

```typescript
// lib/audio/cloudinary-service.ts
export class CloudinaryAudioService {
  private cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  private uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

  async uploadAudio(
    audioBlob: Blob,
    userId: string,
    sessionId: string
  ): Promise<{ url: string; publicId: string }> {
    const formData = new FormData();
    formData.append('file', audioBlob);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('folder', `hirexp/audio/${userId}/${sessionId}`);
    formData.append('resource_type', 'video'); // Cloudinary uses 'video' for audio

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload audio');
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id
    };
  }

  async deleteAudio(publicId: string): Promise<void> {
    await fetch('/api/audio/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId })
    });
  }
}
```

### API Route for Deletion

```typescript
// app/api/audio/delete/route.ts
import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request: NextRequest) {
  try {
    const { publicId } = await request.json();
    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

## Audio Playback

### Audio Player Component

```typescript
// components/audio-player.tsx
'use client';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  onEnded?: () => void;
}

export function AudioPlayer({ src, onEnded }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const restart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    setIsPlaying(true);
  };

  return (
    <div className="flex items-center gap-4">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => {
          setIsPlaying(false);
          onEnded?.();
        }}
      />

      <Button onClick={togglePlay} size="icon" variant="outline">
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>

      <Button onClick={restart} size="icon" variant="ghost">
        <RotateCcw className="h-4 w-4" />
      </Button>

      <div className="flex-1">
        <div className="text-sm text-muted-foreground">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

## Complete Recording Flow

```typescript
// components/voice-recorder.tsx
'use client';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { CloudinaryAudioService } from '@/lib/audio/cloudinary-service';
import { Button } from '@/components/ui/button';
import { Mic, Square, Upload } from 'lucide-react';
import { useState } from 'react';

export function VoiceRecorder({ sessionId, userId, onUploadComplete }: Props) {
  const { isRecording, audioBlob, duration, startRecording, stopRecording, clearRecording } = useAudioRecorder();
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!audioBlob) return;

    setIsUploading(true);
    try {
      const service = new CloudinaryAudioService();
      const result = await service.uploadAudio(audioBlob, userId, sessionId);

      // Save to database
      await fetch('/api/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          cloudinaryUrl: result.url,
          publicId: result.publicId,
          duration
        })
      });

      onUploadComplete?.(result.url);
      clearRecording();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {!isRecording && !audioBlob && (
          <Button onClick={startRecording}>
            <Mic className="mr-2 h-4 w-4" />
            Start Recording
          </Button>
        )}

        {isRecording && (
          <Button onClick={stopRecording} variant="destructive">
            <Square className="mr-2 h-4 w-4" />
            Stop Recording
          </Button>
        )}

        {audioBlob && (
          <>
            <audio src={URL.createObjectURL(audioBlob)} controls />
            <Button onClick={handleUpload} disabled={isUploading}>
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
            <Button onClick={clearRecording} variant="outline">
              Clear
            </Button>
          </>
        )}
      </div>

      {isRecording && (
        <div className="text-sm text-muted-foreground">
          Recording: {duration}s
        </div>
      )}
    </div>
  );
}
```

## Environment Variables

```.env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Checklist

- [ ] MediaRecorder with proper config
- [ ] Echo cancellation enabled
- [ ] 16kHz sample rate (Whisper optimal)
- [ ] Cloudinary upload implemented
- [ ] Proper file naming/organization
- [ ] Audio playback component
- [ ] Progress indicators
- [ ] Error handling
- [ ] Browser permission handling

## Your Task

Ask:
1. Recording or playback?
2. Upload to Cloudinary?
3. Transcription needed?
4. UI components?

Then implement the audio system.
