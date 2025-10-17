# Audio Recording - Technical Specifications

## Overview

The audio recording system captures high-quality voice input from users during AI Chit Chat and Mock Call sessions. This document covers client-side recording, processing, and optimization strategies.

## Web Audio API Implementation

### Basic Recording Setup

```typescript
// lib/audio/recorder.ts
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;

  constructor(private config: AudioConfig = defaultConfig) {
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return permission.state === 'granted';
    } catch (error) {
      console.warn('Permissions API not supported, requesting directly');
      return true; // Try to proceed
    }
  }

  async initializeRecording(): Promise<void> {
    try {
      // Request microphone access with optimal settings
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: this.config.sampleRate || 16000,
          channelCount: 1,
          sampleSize: 16
        }
      });

      // Set up audio analysis for visualizations
      this.setupAudioAnalysis();

      // Initialize MediaRecorder with optimal codec
      this.setupMediaRecorder();

    } catch (error) {
      throw new AudioPermissionError('Microphone access denied');
    }
  }

  private setupMediaRecorder() {
    const mimeType = this.selectOptimalMimeType();

    this.mediaRecorder = new MediaRecorder(this.audioStream!, {
      mimeType,
      audioBitsPerSecond: 128000
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      this.processRecording();
    };
  }

  private selectOptimalMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/ogg;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/wav'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'audio/webm'; // Default fallback
  }
}
```

### Audio Quality Configuration

```typescript
interface AudioConfig {
  // Recording parameters
  sampleRate: 8000 | 16000 | 22050 | 44100 | 48000;
  bitDepth: 8 | 16 | 24 | 32;
  channels: 1 | 2;

  // Processing parameters
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;

  // Quality settings
  quality: 'low' | 'medium' | 'high' | 'maximum';

  // Buffer settings
  bufferSize: 256 | 512 | 1024 | 2048 | 4096;
  latency: 'interactive' | 'balanced' | 'playback';
}

const qualityPresets: Record<string, AudioConfig> = {
  voice_low: {
    sampleRate: 8000,
    bitDepth: 16,
    channels: 1,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    quality: 'low',
    bufferSize: 2048,
    latency: 'balanced'
  },

  voice_standard: {
    sampleRate: 16000,
    bitDepth: 16,
    channels: 1,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    quality: 'medium',
    bufferSize: 1024,
    latency: 'interactive'
  },

  voice_high: {
    sampleRate: 48000,
    bitDepth: 24,
    channels: 1,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    quality: 'high',
    bufferSize: 512,
    latency: 'interactive'
  }
};
```

## Audio Processing Pipeline

### Real-time Audio Analysis

```typescript
class AudioAnalyzer {
  private analyser: AnalyserNode;
  private dataArray: Uint8Array;
  private animationId: number | null = null;

  constructor(audioContext: AudioContext, source: MediaStreamAudioSourceNode) {
    this.analyser = audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;

    source.connect(this.analyser);

    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);
  }

  getVolumeLevel(): number {
    this.analyser.getByteFrequencyData(this.dataArray);

    const sum = this.dataArray.reduce((acc, val) => acc + val, 0);
    const average = sum / this.dataArray.length;

    return average / 255; // Normalize to 0-1
  }

  getWaveformData(): Uint8Array {
    this.analyser.getByteTimeDomainData(this.dataArray);
    return this.dataArray;
  }

  detectSpeech(): boolean {
    const volume = this.getVolumeLevel();
    const threshold = 0.1; // Adjust based on environment

    return volume > threshold;
  }

  getFrequencySpectrum(): Float32Array {
    const dataArray = new Float32Array(this.analyser.frequencyBinCount);
    this.analyser.getFloatFrequencyData(dataArray);
    return dataArray;
  }

  startVisualization(callback: (data: VisualizationData) => void) {
    const draw = () => {
      const data = {
        volume: this.getVolumeLevel(),
        waveform: this.getWaveformData(),
        spectrum: this.getFrequencySpectrum(),
        isSpeaking: this.detectSpeech()
      };

      callback(data);
      this.animationId = requestAnimationFrame(draw);
    };

    draw();
  }

  stopVisualization() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}
```

### Voice Activity Detection (VAD)

```typescript
class VoiceActivityDetector {
  private silenceThreshold: number = 0.05;
  private silenceDuration: number = 1500; // ms
  private speechMinDuration: number = 200; // ms

  private isSpeaking: boolean = false;
  private silenceStart: number = 0;
  private speechStart: number = 0;

  private callbacks: {
    onSpeechStart?: () => void;
    onSpeechEnd?: () => void;
    onSilence?: (duration: number) => void;
  } = {};

  constructor(private analyser: AnalyserNode) {
    this.startDetection();
  }

  private startDetection() {
    const detect = () => {
      const volume = this.getCurrentVolume();
      const now = Date.now();

      if (volume > this.silenceThreshold) {
        if (!this.isSpeaking) {
          this.speechStart = now;

          // Debounce speech start
          if (now - this.silenceStart > this.speechMinDuration) {
            this.isSpeaking = true;
            this.callbacks.onSpeechStart?.();
          }
        }
        this.silenceStart = 0;
      } else {
        if (this.isSpeaking) {
          if (this.silenceStart === 0) {
            this.silenceStart = now;
          } else if (now - this.silenceStart > this.silenceDuration) {
            this.isSpeaking = false;
            this.callbacks.onSpeechEnd?.();
            this.callbacks.onSilence?.(now - this.silenceStart);
          }
        }
      }

      requestAnimationFrame(detect);
    };

    detect();
  }

  private getCurrentVolume(): number {
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    const sum = dataArray.reduce((acc, val) => acc + val, 0);
    return sum / dataArray.length / 255;
  }

  onSpeechStart(callback: () => void) {
    this.callbacks.onSpeechStart = callback;
  }

  onSpeechEnd(callback: () => void) {
    this.callbacks.onSpeechEnd = callback;
  }
}
```

## Recording Modes

### Continuous Recording

```typescript
class ContinuousRecorder extends AudioRecorder {
  private chunkDuration: number = 5000; // 5 seconds
  private chunkTimer: NodeJS.Timeout | null = null;

  startContinuousRecording() {
    this.startRecording();

    // Start chunking timer
    this.chunkTimer = setInterval(() => {
      this.saveChunk();
    }, this.chunkDuration);
  }

  private async saveChunk() {
    if (this.mediaRecorder?.state === 'recording') {
      // Request data without stopping
      this.mediaRecorder.requestData();

      // Process accumulated chunks
      if (this.audioChunks.length > 0) {
        const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
        await this.uploadChunk(blob);
        this.audioChunks = [];
      }
    }
  }

  private async uploadChunk(blob: Blob) {
    const formData = new FormData();
    formData.append('audio', blob);
    formData.append('sessionId', this.sessionId);
    formData.append('chunkIndex', this.chunkIndex.toString());

    await fetch('/api/audio/upload-chunk', {
      method: 'POST',
      body: formData
    });

    this.chunkIndex++;
  }
}
```

### Push-to-Talk Recording

```typescript
class PushToTalkRecorder extends AudioRecorder {
  private isButtonPressed: boolean = false;
  private autoStopTimer: NodeJS.Timeout | null = null;
  private maxDuration: number = 60000; // 1 minute max

  bindToButton(button: HTMLButtonElement) {
    // Mouse events
    button.addEventListener('mousedown', () => this.startPTT());
    button.addEventListener('mouseup', () => this.stopPTT());
    button.addEventListener('mouseleave', () => this.stopPTT());

    // Touch events for mobile
    button.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.startPTT();
    });
    button.addEventListener('touchend', () => this.stopPTT());

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !this.isButtonPressed) {
        e.preventDefault();
        this.startPTT();
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.stopPTT();
      }
    });
  }

  private startPTT() {
    if (this.isButtonPressed) return;

    this.isButtonPressed = true;
    this.startRecording();

    // Auto-stop after max duration
    this.autoStopTimer = setTimeout(() => {
      this.stopPTT();
    }, this.maxDuration);
  }

  private stopPTT() {
    if (!this.isButtonPressed) return;

    this.isButtonPressed = false;
    this.stopRecording();

    if (this.autoStopTimer) {
      clearTimeout(this.autoStopTimer);
      this.autoStopTimer = null;
    }
  }
}
```

### Auto-pause Recording

```typescript
class AutoPauseRecorder extends AudioRecorder {
  private vad: VoiceActivityDetector;
  private pauseThreshold: number = 2000; // 2 seconds of silence
  private isPaused: boolean = false;

  constructor(config: AudioConfig) {
    super(config);
    this.setupVAD();
  }

  private setupVAD() {
    this.vad = new VoiceActivityDetector(this.analyser!);

    this.vad.onSpeechStart(() => {
      if (this.isPaused) {
        this.resume();
      }
    });

    this.vad.onSilence((duration) => {
      if (duration > this.pauseThreshold && !this.isPaused) {
        this.pause();
      }
    });
  }

  private pause() {
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.pause();
      this.isPaused = true;
      this.onPause?.();
    }
  }

  private resume() {
    if (this.mediaRecorder?.state === 'paused') {
      this.mediaRecorder.resume();
      this.isPaused = false;
      this.onResume?.();
    }
  }
}
```

## Audio Compression

### Client-side Compression

```typescript
class AudioCompressor {
  private audioContext: AudioContext;
  private compressor: DynamicsCompressorNode;

  constructor() {
    this.audioContext = new AudioContext();
    this.setupCompressor();
  }

  private setupCompressor() {
    this.compressor = this.audioContext.createDynamicsCompressor();

    // Configure compression parameters
    this.compressor.threshold.setValueAtTime(-24, this.audioContext.currentTime);
    this.compressor.knee.setValueAtTime(30, this.audioContext.currentTime);
    this.compressor.ratio.setValueAtTime(12, this.audioContext.currentTime);
    this.compressor.attack.setValueAtTime(0.003, this.audioContext.currentTime);
    this.compressor.release.setValueAtTime(0.25, this.audioContext.currentTime);
  }

  async compressAudio(audioBlob: Blob): Promise<Blob> {
    // Convert blob to audio buffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    // Create offline context for rendering
    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );

    // Create source and compressor in offline context
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;

    const offlineCompressor = offlineContext.createDynamicsCompressor();
    offlineCompressor.threshold.value = this.compressor.threshold.value;
    offlineCompressor.knee.value = this.compressor.knee.value;
    offlineCompressor.ratio.value = this.compressor.ratio.value;
    offlineCompressor.attack.value = this.compressor.attack.value;
    offlineCompressor.release.value = this.compressor.release.value;

    // Connect and render
    source.connect(offlineCompressor);
    offlineCompressor.connect(offlineContext.destination);
    source.start();

    const renderedBuffer = await offlineContext.startRendering();

    // Convert back to blob
    return this.bufferToBlob(renderedBuffer);
  }

  private bufferToBlob(audioBuffer: AudioBuffer): Blob {
    const length = audioBuffer.length * audioBuffer.numberOfChannels * 2;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);

    let offset = 0;
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const sample = audioBuffer.getChannelData(channel)[i];
        const int16 = Math.max(-32768, Math.min(32767, sample * 32768));
        view.setInt16(offset, int16, true);
        offset += 2;
      }
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }
}
```

### Codec Selection

```typescript
const codecSelection = {
  optimal: {
    primary: 'audio/webm;codecs=opus',
    bitrate: 128000,
    quality: 0.9,
    complexity: 10
  },

  balanced: {
    primary: 'audio/ogg;codecs=opus',
    bitrate: 96000,
    quality: 0.7,
    complexity: 5
  },

  compatibility: {
    primary: 'audio/mp4;codecs=mp4a.40.2',
    bitrate: 128000,
    quality: 0.8,
    complexity: 5
  },

  fallback: {
    primary: 'audio/wav',
    bitrate: 705600, // 44.1kHz * 16bit
    quality: 1.0,
    complexity: 0
  }
};
```

## Error Handling

### Common Recording Errors

```typescript
enum RecordingError {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NO_MICROPHONE = 'NO_MICROPHONE',
  BROWSER_NOT_SUPPORTED = 'BROWSER_NOT_SUPPORTED',
  RECORDING_FAILED = 'RECORDING_FAILED',
  PROCESSING_FAILED = 'PROCESSING_FAILED'
}

class RecordingErrorHandler {
  handle(error: Error): RecordingResponse {
    if (error.name === 'NotAllowedError') {
      return {
        error: RecordingError.PERMISSION_DENIED,
        message: 'Microphone permission denied',
        recovery: 'Please allow microphone access in browser settings'
      };
    }

    if (error.name === 'NotFoundError') {
      return {
        error: RecordingError.NO_MICROPHONE,
        message: 'No microphone detected',
        recovery: 'Please connect a microphone and try again'
      };
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return {
        error: RecordingError.BROWSER_NOT_SUPPORTED,
        message: 'Browser does not support audio recording',
        recovery: 'Please use Chrome, Firefox, or Edge'
      };
    }

    return {
      error: RecordingError.RECORDING_FAILED,
      message: 'Recording failed',
      recovery: 'Please refresh and try again'
    };
  }
}
```

## Browser Compatibility

### Feature Detection

```typescript
class BrowserCompatibility {
  static checkAudioSupport(): CompatibilityReport {
    const report: CompatibilityReport = {
      getUserMedia: false,
      mediaRecorder: false,
      webAudio: false,
      opus: false,
      webm: false,
      supported: false
    };

    // Check getUserMedia
    report.getUserMedia = !!(navigator.mediaDevices?.getUserMedia);

    // Check MediaRecorder
    report.mediaRecorder = typeof MediaRecorder !== 'undefined';

    // Check Web Audio API
    report.webAudio = typeof AudioContext !== 'undefined' ||
                     typeof webkitAudioContext !== 'undefined';

    // Check codec support
    if (report.mediaRecorder) {
      report.opus = MediaRecorder.isTypeSupported('audio/webm;codecs=opus');
      report.webm = MediaRecorder.isTypeSupported('audio/webm');
    }

    // Overall support
    report.supported = report.getUserMedia && report.mediaRecorder && report.webAudio;

    return report;
  }

  static getRecommendedSettings(): AudioConfig {
    const compatibility = this.checkAudioSupport();

    if (compatibility.opus) {
      return qualityPresets.voice_high;
    } else if (compatibility.webm) {
      return qualityPresets.voice_standard;
    } else {
      return qualityPresets.voice_low;
    }
  }
}
```

---

*Document Version: 1.0*
*Last Updated: October 2025*
*Next Review: November 2025*