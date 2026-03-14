/**
 * KVKK / COPPA Strict Rule:
 * Ephemeral Audio Processing is implemented here.
 * Audio is NEVER recorded to persistent storage on servers.
 * It is either processed completely client-side via Web Speech API,
 * or streamed directly to the AI service (e.g., Whisper API) and deleted from RAM immediately.
 */

export interface SpeechRecognitionResult {
  text: string;
  isFinal: boolean;
  error?: string;
}

export class SpeechToTextService {
  private recognition: any = null;
  private isListening: boolean = false;

  constructor() {
    // Check for browser support
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'tr-TR';
      } else {
        console.warn('Web Speech API is not supported in this browser. Fallback to API needed.');
      }
    }
  }

  startListening(onResult: (result: SpeechRecognitionResult) => void) {
    if (!this.recognition) {
      onResult({ text: '', isFinal: false, error: 'Tarayıcınız ses tanımayı desteklemiyor.' });
      return;
    }

    if (this.isListening) return;

    this.recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      onResult({
        text: finalTranscript || interimTranscript,
        isFinal: !!finalTranscript,
      });
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      onResult({ text: '', isFinal: false, error: event.error });
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (e) {
      console.error('Could not start speech recognition', e);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Mock API for a real Whisper API Call
   * Takes a base64 or Blob of audio, sends it to API, and returns text.
   */
  async transcribeAudioBlob(audioBlob: Blob): Promise<string> {
    console.log("[SpeechToText] Whisper API'ye Ephemeral ses akışı gönderiliyor...");
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("API'den dönen çözümlenmiş metin.");
      }, 2000);
    });
  }
}

export const sttService = new SpeechToTextService();
