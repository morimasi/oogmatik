/**
 * BDMIND - AudioCaptureEngine
 * Disleksi ve DEHB'li öğrenciler için 16kHz 16-bit Mono PCM ses yakalama motoru.
 * Web Audio API AudioWorklet kullanır; desteklenmeyen ortamlarda ScriptProcessor fallback sağlar.
 * 
 * Mimari Lider: Bora Demir & Kaan Arslan
 */

export interface AudioCaptureCallbacks {
  onAudioChunk?: (pcm16Chunk: ArrayBuffer) => void;
  onVolumeChange?: (rms: number, decibels: number) => void;
  onSilenceDetected?: (durationMs: number) => void;
  onError?: (error: Error) => void;
}

export class AudioCaptureEngine {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private scriptProcessorNode: ScriptProcessorNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private isRunning = false;
  private silenceTimer: number | null = null;
  private silenceStart: number | null = null;
  private animFrameId: number | null = null;

  private callbacks: AudioCaptureCallbacks = {};

  constructor(callbacks: AudioCaptureCallbacks = {}) {
    this.callbacks = callbacks;
  }

  public setCallbacks(callbacks: AudioCaptureCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public async start(): Promise<void> {
    if (this.isRunning) return;

    try {
      // 1. 16kHz AudioContext oluştur
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx({ sampleRate: 16000 });

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // 2. Çocuk dostu mikrofon akışı (Echo cancel + Noise suppression)
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000,
        },
        video: false,
      });

      const sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);

      // 3. Analyser Node (Waveform ve RMS hesabı için)
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 512;
      this.analyserNode.smoothingTimeConstant = 0.4;
      sourceNode.connect(this.analyserNode);

      // 4. AudioWorklet desteği dene
      let workletLoaded = false;
      if (this.audioContext.audioWorklet) {
        try {
          const workletCode = `
            class PCMCaptureProcessor extends AudioWorkletProcessor {
              process(inputs, outputs, parameters) {
                const input = inputs[0];
                if (input && input[0]) {
                  const channelData = input[0];
                  const pcm16 = new Int16Array(channelData.length);
                  for (let i = 0; i < channelData.length; i++) {
                    const s = Math.max(-1, Math.min(1, channelData[i]));
                    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                  }
                  this.port.postMessage(pcm16.buffer, [pcm16.buffer]);
                }
                return true;
              }
            }
            registerProcessor('pcm-capture-processor', PCMCaptureProcessor);
          `;
          const blob = new Blob([workletCode], { type: 'application/javascript' });
          const workletUrl = URL.createObjectURL(blob);
          await this.audioContext.audioWorklet.addModule(workletUrl);
          URL.revokeObjectURL(workletUrl);

          this.workletNode = new AudioWorkletNode(this.audioContext, 'pcm-capture-processor');
          this.workletNode.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
            if (this.callbacks.onAudioChunk) {
              this.callbacks.onAudioChunk(event.data);
            }
          };

          sourceNode.connect(this.workletNode);
          workletLoaded = true;
        } catch {
          workletLoaded = false;
        }
      }

      // Fallback: ScriptProcessorNode
      if (!workletLoaded) {
        this.scriptProcessorNode = this.audioContext.createScriptProcessor(4096, 1, 1);
        this.scriptProcessorNode.onaudioprocess = (e: AudioProcessingEvent) => {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcm16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          if (this.callbacks.onAudioChunk) {
            this.callbacks.onAudioChunk(pcm16.buffer);
          }
        };
        sourceNode.connect(this.scriptProcessorNode);
        this.scriptProcessorNode.connect(this.audioContext.destination);
      }

      this.isRunning = true;
      this.startVolumeMonitoring();
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Mikrofon başlatılamadı');
      this.callbacks.onError?.(error);
      this.stop();
      throw error;
    }
  }

  private startVolumeMonitoring(): void {
    if (!this.analyserNode) return;

    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);

    const checkVolume = () => {
      if (!this.isRunning || !this.analyserNode) return;

      this.analyserNode.getByteTimeDomainData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const floatVal = (dataArray[i] - 128) / 128;
        sum += floatVal * floatVal;
      }
      const rms = Math.sqrt(sum / dataArray.length);
      const decibels = rms > 0.0001 ? 20 * Math.log10(rms) : -80;

      this.callbacks.onVolumeChange?.(rms, decibels);

      // Sessizlik ve Duraksama Tespiti (Grace Window için)
      const silenceThreshold = 0.015;
      if (rms < silenceThreshold) {
        if (!this.silenceStart) {
          this.silenceStart = Date.now();
        } else {
          const silenceDuration = Date.now() - this.silenceStart;
          this.callbacks.onSilenceDetected?.(silenceDuration);
        }
      } else {
        this.silenceStart = null;
      }

      this.animFrameId = requestAnimationFrame(checkVolume);
    };

    this.animFrameId = requestAnimationFrame(checkVolume);
  }

  public stop(): void {
    this.isRunning = false;

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    this.workletNode?.disconnect();
    this.scriptProcessorNode?.disconnect();
    this.analyserNode?.disconnect();

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      void this.audioContext.close();
      this.audioContext = null;
    }

    this.silenceStart = null;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }
}
