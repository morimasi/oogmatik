/**
 * BDMIND - LiveReadingCoachService
 * Canlı Sesli Okuma Koçu Orkestratörü (EduMind Dual-Engine)
 * 
 * Liderler: Selin Arslan (AI Mimarisi) & Bora Demir (Sistem Mimarı) & Elif Yıldız (Pedagoji)
 */

import { AudioCaptureEngine } from './audio/AudioCaptureEngine';
import { PhonologicalScoringEngine, PhonologicalErrorItem, ReadingSessionMetrics } from './phonological/phonologicalScoringEngine';
import { ReadingPassage } from '../components/LiveReadingStudio/sampleStories';
import { MascotState } from '../components/LiveReadingStudio/EduMascot';

export interface CoachCallbacks {
  onWordAdvanced?: (newIndex: number) => void;
  onSyllableHighlighted?: (syllable: string | null) => void;
  onMascotStateChange?: (state: MascotState) => void;
  onCoachMessage?: (message: string) => void;
  onVolumeChange?: (rms: number) => void;
  onSessionComplete?: (metrics: ReadingSessionMetrics) => void;
  onError?: (error: Error) => void;
}

export class LiveReadingCoachService {
  private audioEngine: AudioCaptureEngine;
  private currentPassage: ReadingPassage | null = null;
  private currentWordIndex = 0;
  private isSessionActive = false;
  private sessionStartTime = 0;
  private hesitationCount = 0;
  private totalHesitationMs = 0;
  private selfCorrections = 0;
  private errors: PhonologicalErrorItem[] = [];

  private patienceThresholdMs = 3000; // Varsayılan 3.0 saniye grace window
  private graceTimer: ReturnType<typeof setTimeout> | null = null;
  private speechSynth: SpeechSynthesis | null = null;

  // Web Speech API tanıma nesnesi (Motor A)
  private recognition: any = null;

  private callbacks: CoachCallbacks = {};

  constructor(callbacks: CoachCallbacks = {}) {
    this.callbacks = callbacks;
    this.audioEngine = new AudioCaptureEngine({
      onVolumeChange: (rms) => {
        this.callbacks.onVolumeChange?.(rms);
      },
      onSilenceDetected: (durationMs) => {
        if (durationMs > this.patienceThresholdMs && this.isSessionActive) {
          this.triggerScaffoldingHint();
        }
      },
      onError: (err) => {
        this.callbacks.onError?.(err);
      },
    });

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.speechSynth = window.speechSynthesis;
    }

    this.initSpeechRecognition();
  }

  public setCallbacks(callbacks: CoachCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public setPatienceThreshold(seconds: number): void {
    this.patienceThresholdMs = seconds * 1000;
  }

  private initSpeechRecognition(): void {
    if (typeof window === 'undefined') return;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      this.recognition = new SpeechRec();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'tr-TR';

      this.recognition.onresult = (event: any) => {
        if (!this.isSessionActive || !this.currentPassage) return;

        const results = event.results;
        const lastResult = results[results.length - 1];
        if (!lastResult) return;

        const transcript = lastResult[0]?.transcript?.trim().toLocaleLowerCase('tr-TR') || '';
        this.processSpokenTranscript(transcript);
      };

      this.recognition.onerror = () => {
        // Sessizce yut, AudioCaptureEngine ve fallback konuşma devam eder
      };
    }
  }

  /**
   * Çocuğun mikrofondan söylediği metni ekrandaki hedef kelimeyle eşleştirir
   */
  public processSpokenTranscript(transcript: string): void {
    if (!this.currentPassage || !this.isSessionActive) return;

    const words = this.currentPassage.words;
    if (this.currentWordIndex >= words.length) return;

    const targetWord = words[this.currentWordIndex];
    const cleanTarget = targetWord.toLocaleLowerCase('tr-TR').replace(/[.,!?:;"]/g, '');

    // Çocuğun son söylediği kelime veya kelimeler içinde hedef var mı?
    const spokenTokens = transcript.split(/\s+/).filter(Boolean);
    const lastSpoken = spokenTokens[spokenTokens.length - 1] || '';

    if (lastSpoken === cleanTarget || transcript.includes(cleanTarget)) {
      // Doğru Okundu!
      this.advanceWord();
    } else if (lastSpoken.length >= 2) {
      // Olası hata analizi
      const errorAnalysis = PhonologicalScoringEngine.classifyReadingError(cleanTarget, lastSpoken);
      if (errorAnalysis.code === 'SUCCESS_SELF') {
        this.selfCorrections++;
        this.advanceWord();
      } else {
        this.errors.push({
          id: `err-${Date.now()}`,
          wordIndex: this.currentWordIndex,
          targetWord,
          spokenWord: lastSpoken,
          errorCode: errorAnalysis.code,
          explanation: errorAnalysis.explanation,
          timestampMs: Date.now() - this.sessionStartTime,
        });
      }
    }
  }

  /**
   * Bir kelime başarıyla geçildiğinde ilerlet
   */
  public advanceWord(): void {
    if (!this.currentPassage) return;

    this.clearGraceTimer();
    this.currentWordIndex++;
    this.callbacks.onWordAdvanced?.(this.currentWordIndex);
    this.callbacks.onSyllableHighlighted?.(null);

    // Rastgele hafif olumlu geri bildirim
    if (this.currentWordIndex % 5 === 0 && this.currentWordIndex < this.currentPassage.words.length) {
      this.callbacks.onMascotStateChange?.('celebrating');
      this.callbacks.onCoachMessage?.('Harika bir birleştirme! Böyle devam et.');
      setTimeout(() => {
        if (this.isSessionActive) {
          this.callbacks.onMascotStateChange?.('listening');
        }
      }, 1200);
    } else {
      this.callbacks.onMascotStateChange?.('listening');
    }

    // Metin bitti mi?
    if (this.currentWordIndex >= this.currentPassage.words.length) {
      this.completeSession();
    } else {
      this.startGraceTimer();
    }
  }

  /**
   * Çocuk duraksadığında devreye giren 3 Kademeli İskele (Scaffolding)
   */
  private triggerScaffoldingHint(): void {
    if (!this.currentPassage || !this.isSessionActive) return;
    if (this.currentWordIndex >= this.currentPassage.words.length) return;

    this.hesitationCount++;
    this.totalHesitationMs += this.patienceThresholdMs;

    const currentWord = this.currentPassage.words[this.currentWordIndex];
    const syllables = this.currentPassage.syllabifiedWords[this.currentWordIndex] || [currentWord];
    const firstSyllable = syllables[0] || currentWord.slice(0, 2);

    // 1. Kademe: Ekranda ilk heceyi parlat
    this.callbacks.onSyllableHighlighted?.(firstSyllable);
    this.callbacks.onMascotStateChange?.('hinting');
    this.callbacks.onCoachMessage?.(`Hadi birlikte bakalım: "${firstSyllable}-..."`);

    // Sesli fısıldama
    this.speakVoiceHint(`Hadi birlikte bakalım: ${firstSyllable}`);
  }

  /**
   * Tarayıcı TTS ile dostça Türkçe fısıldama / model olma
   */
  public speakVoiceHint(text: string): void {
    if (!this.speechSynth) return;

    try {
      this.speechSynth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      utterance.rate = 0.85; // Disleksik çocuk için tane tane ve sakin
      utterance.pitch = 1.15; // Dost canlısı sıcak çocukça perde

      this.callbacks.onMascotStateChange?.('speaking');

      utterance.onend = () => {
        if (this.isSessionActive) {
          this.callbacks.onMascotStateChange?.('listening');
        }
      };

      this.speechSynth.speak(utterance);
    } catch {
      // TTS hatası durumunda sessizce devam et
    }
  }

  private startGraceTimer(): void {
    this.clearGraceTimer();
    this.graceTimer = setTimeout(() => {
      this.triggerScaffoldingHint();
    }, this.patienceThresholdMs);
  }

  private clearGraceTimer(): void {
    if (this.graceTimer) {
      clearTimeout(this.graceTimer);
      this.graceTimer = null;
    }
  }

  /**
   * Seansı Başlat
   */
  public async startSession(passage: ReadingPassage): Promise<void> {
    this.currentPassage = passage;
    this.currentWordIndex = 0;
    this.hesitationCount = 0;
    this.totalHesitationMs = 0;
    this.selfCorrections = 0;
    this.errors = [];
    this.sessionStartTime = Date.now();
    this.isSessionActive = true;

    try {
      await this.audioEngine.start();
      try {
        this.recognition?.start();
      } catch {
        // Zaten başlamışsa devam et
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Mikrofon erişim hatası');
      this.callbacks.onError?.(error);
    }

    this.callbacks.onMascotStateChange?.('listening');
    this.callbacks.onCoachMessage?.(`Hoş geldin! "${passage.title}" metnini birlikte keyifle okuyalım.`);
    this.speakVoiceHint(`Hoş geldin! Hazırsan ilk kelimeden başlayabilirsin.`);

    this.startGraceTimer();
  }

  /**
   * Seansı Tamamla ve Karneni Çıkar
   */
  public completeSession(): ReadingSessionMetrics | null {
    if (!this.currentPassage) return null;

    this.isSessionActive = false;
    this.clearGraceTimer();
    this.audioEngine.stop();

    try {
      this.recognition?.stop();
    } catch {
      // Yoksay
    }

    const durationSeconds = Math.max(5, Math.round((Date.now() - this.sessionStartTime) / 1000));
    const metrics = PhonologicalScoringEngine.calculateSessionMetrics({
      durationSeconds,
      totalWordsTarget: this.currentPassage.words.length,
      totalWordsRead: this.currentWordIndex,
      errors: this.errors,
      selfCorrections: this.selfCorrections,
      hesitationCount: this.hesitationCount,
      totalHesitationMs: this.totalHesitationMs,
      gradeLevel: this.currentPassage.difficultyRating + 1,
    });

    this.callbacks.onMascotStateChange?.('celebrating');
    this.callbacks.onCoachMessage?.(`Tebrikler! Okumayı harika bir şekilde tamamladın. Dakikada ${metrics.wcpm} kelime okudun!`);
    this.speakVoiceHint(`Tebrikler! Okumayı harika bir şekilde tamamladın.`);

    this.callbacks.onSessionComplete?.(metrics);
    return metrics;
  }

  /**
   * Seansı Durdur
   */
  public stopSession(): void {
    this.isSessionActive = false;
    this.clearGraceTimer();
    this.audioEngine.stop();
    try {
      this.recognition?.stop();
    } catch {
      // Yoksay
    }
    if (this.speechSynth) {
      this.speechSynth.cancel();
    }
  }

  public getCurrentWordIndex(): number {
    return this.currentWordIndex;
  }

  public setWordIndex(index: number): void {
    if (!this.currentPassage) return;
    this.currentWordIndex = Math.max(0, Math.min(index, this.currentPassage.words.length - 1));
    this.callbacks.onWordAdvanced?.(this.currentWordIndex);
    this.callbacks.onSyllableHighlighted?.(null);
    this.startGraceTimer();
  }

  public getIsActive(): boolean {
    return this.isSessionActive;
  }
}
