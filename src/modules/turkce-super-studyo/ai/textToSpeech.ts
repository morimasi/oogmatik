/**
 * Text-to-Speech (TTS) Service
 * Primary: ElevenLabs or Azure TTS via API.
 * Fallback: Web Speech API (Browser native).
 *
 * Performance & Cost rule:
 * All TTS requests are checked against a CDN cache (Supabase Storage) first
 * to avoid regenerating the same voice file multiple times.
 */

export interface TTSOptions {
  text: string;
  voiceId?: string; // Optional voice preset (e.g., 'calm-female', 'energetic-male')
  speed?: number; // Adjust speed for dyslexia: e.g., 0.8 is slower
}

export class TextToSpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  /**
   * Browser-native Fallback Implementation
   */
  speakNative(options: TTSOptions, onStart?: () => void, onEnd?: () => void) {
    if (!this.synth) {
      console.warn('Speech synthesis not supported');
      return;
    }

    if (this.synth.speaking) {
      this.synth.cancel(); // Stop current speech
    }

    this.currentUtterance = new SpeechSynthesisUtterance(options.text);
    this.currentUtterance.lang = 'tr-TR';
    this.currentUtterance.rate = options.speed || 0.85; // Slower by default for dyslexia

    // Attempt to pick a good Turkish voice
    const voices = this.synth.getVoices();
    const trVoice = voices.find((v) => v.lang === 'tr-TR');
    if (trVoice) {
      this.currentUtterance.voice = trVoice;
    }

    if (onStart) this.currentUtterance.onstart = onStart;
    if (onEnd) this.currentUtterance.onend = onEnd;
    this.currentUtterance.onerror = (e) => {
      console.error('SpeechSynthesis error:', e);
      if (onEnd) onEnd();
    };

    this.synth.speak(this.currentUtterance);
  }

  stopNative() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
  }

  /**
   * Mock Cloud TTS Implementation (e.g., ElevenLabs / Azure)
   * This would normally return a URL to the CDN-cached audio file.
   */
  async getCloudAudioUrl(options: TTSOptions): Promise<string> {
    console.log(
      `[TTS Service] Ses dosyası aranıyor (Cache Check)... Text: "${options.text.substring(0, 20)}..."`
    );
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return a mock placeholder audio URL
        console.log("[TTS Service] Ses üretildi ve CDN'e eklendi.");
        resolve('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
      }, 1500);
    });
  }
}

export const ttsService = new TextToSpeechService();
