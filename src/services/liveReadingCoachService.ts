/**
 * BDMIND - LiveReadingCoachService
 * Canlı Sesli Okuma Koçu Orkestratörü (EduMind Dual-Engine v2.1)
 * 
 * Liderler: Selin Arslan (AI Mimarisi) & Bora Demir (Sistem Mimarı) & Elif Yıldız (Pedagoji) & Dr. Canan Kaya (Psikometri)
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

/** Türkçe metin normalizasyonu */
function normalizeTr(s: string): string {
  return s
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/[.,!?:;"'()\-]/g, '');
}

/** İki Türkçe kelime arasındaki Levenshtein düzenleme mesafesi */
function getLevenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // silme
          dp[i][j - 1] + 1,     // ekleme
          dp[i - 1][j - 1] + 1  // değiştirme
        );
      }
    }
  }
  return dp[m][n];
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
  private cachedTurkishVoice: SpeechSynthesisVoice | null = null;

  // Koçun kendi sesi konuşurken mikrofondan duyulup kelime atlamasını önleyen eko kilidi
  private isCoachSpeaking = false;
  private coachSpeakingReleaseTimer: ReturnType<typeof setTimeout> | null = null;

  // Web Speech API tanıma nesnesi (Motor A)
  private recognition: any = null;
  private isRecognitionRunning = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  private callbacks: CoachCallbacks = {};

  constructor(callbacks: CoachCallbacks = {}) {
    this.callbacks = callbacks;
    this.audioEngine = new AudioCaptureEngine({
      onVolumeChange: (rms) => {
        this.callbacks.onVolumeChange?.(rms);
      },
      onSilenceDetected: (durationMs) => {
        if (durationMs > this.patienceThresholdMs && this.isSessionActive && !this.isCoachSpeaking) {
          this.triggerScaffoldingHint();
        }
      },
      onError: (err) => {
        this.callbacks.onError?.(err);
      },
    });

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.speechSynth = window.speechSynthesis;
      this.loadTurkishVoices();
      if (this.speechSynth.onvoiceschanged !== undefined) {
        this.speechSynth.onvoiceschanged = () => this.loadTurkishVoices();
      }
    }

    this.initSpeechRecognition();
  }

  private loadTurkishVoices(): void {
    if (!this.speechSynth) return;
    try {
      const voices = this.speechSynth.getVoices();
      const tr = voices.find((v) => v.lang.toLowerCase().startsWith('tr'));
      if (tr) {
        this.cachedTurkishVoice = tr;
      }
    } catch {
      // Sessizce devam et
    }
  }

  public setCallbacks(callbacks: CoachCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public setPatienceThreshold(seconds: number): void {
    this.patienceThresholdMs = Math.max(1000, seconds * 1000);
  }

  private initSpeechRecognition(): void {
    if (typeof window === 'undefined') return;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      this.recognition = new SpeechRec();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'tr-TR';
      this.recognition.maxAlternatives = 3;

      this.recognition.onstart = () => {
        this.isRecognitionRunning = true;
      };

      this.recognition.onresult = (event: any) => {
        // Koç kendi sesini konuşurken veya oturum kapalıyken mikrofon dinleme girdisini yoksay
        if (!this.isSessionActive || !this.currentPassage || this.isCoachSpeaking) return;

        const results = event.results;
        const lastResult = results[results.length - 1];
        if (!lastResult) return;

        // En yüksek güvenilirlikli transkript
        const transcript = lastResult[0]?.transcript?.trim().toLocaleLowerCase('tr-TR') || '';
        if (transcript) {
          this.processSpokenTranscript(transcript);
        }
      };

      this.recognition.onerror = (event: any) => {
        const errorType = event?.error;
        if (errorType === 'not-allowed') {
          this.callbacks.onError?.(new Error('Mikrofon erişim izni verilmedi. Lütfen tarayıcı ayarlarından mikrofona izin verin.'));
          return;
        }
        // no-speech, network, aborted gibi geçici durumlarda yeniden başlat
        if (this.isSessionActive) {
          this.restartRecognitionWithDebounce();
        }
      };

      this.recognition.onend = () => {
        this.isRecognitionRunning = false;
        // Chromium seans sırasında sessizlikte durduğunda otomatik yeniden bağlan
        if (this.isSessionActive) {
          this.restartRecognitionWithDebounce();
        }
      };
    }
  }

  private restartRecognitionWithDebounce(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      if (!this.isSessionActive || !this.recognition) return;
      try {
        this.recognition.start();
      } catch {
        // Zaten çalışıyorsa veya başlatılamadıysa zararsızca devam et
      }
    }, 250);
  }

  /**
   * Çocuğun mikrofondan söylediği kelimeleri ekrandaki hedef kelimeyle akıllıca eşleştirir.
   * Teker teker veya akıcı çoklu kelimeleri destekler.
   */
  public processSpokenTranscript(transcript: string): void {
    if (!this.currentPassage || !this.isSessionActive || this.isCoachSpeaking) return;

    const words = this.currentPassage.words;
    if (this.currentWordIndex >= words.length) return;

    const targetWord = words[this.currentWordIndex];
    const cleanTarget = normalizeTr(targetWord);

    const spokenTokens = transcript
      .split(/\s+/)
      .map((t) => normalizeTr(t))
      .filter((t) => t.length > 0);

    if (spokenTokens.length === 0) return;

    // 1. Token içinde tam hedef kelime veya fonetik toleranslı eşleşme ara
    let matchedIndex = -1;
    for (let i = 0; i < spokenTokens.length; i++) {
      const token = spokenTokens[i];
      if (token === cleanTarget) {
        matchedIndex = i;
        break;
      }
      // 4 harften uzun kelimelerde Levenshtein mesafesi <= 1 toleransı
      if (cleanTarget.length >= 4 && token.length >= 4 && getLevenshteinDistance(cleanTarget, token) <= 1) {
        matchedIndex = i;
        break;
      }
    }

    if (matchedIndex !== -1) {
      // Doğru Okundu! İlerlet
      this.advanceWord();

      // Akıcı okuyucularda sonraki kelime de aynı nefeste söylenmiş mi kontrol et
      if (matchedIndex + 1 < spokenTokens.length && this.currentWordIndex < words.length) {
        const nextTarget = normalizeTr(words[this.currentWordIndex]);
        const nextToken = spokenTokens[matchedIndex + 1];
        if (nextToken === nextTarget || (nextTarget.length >= 4 && getLevenshteinDistance(nextTarget, nextToken) <= 1)) {
          this.advanceWord();
        }
      }
      return;
    }

    // 2. Eşleşme yoksa fonolojik hata analizi yap (çocuğun son söylediği kelime baz alınır)
    const lastSpoken = spokenTokens[spokenTokens.length - 1];
    if (lastSpoken && lastSpoken.length >= 2) {
      const errorAnalysis = PhonologicalScoringEngine.classifyReadingError(cleanTarget, lastSpoken);
      if (errorAnalysis.code === 'SUCCESS_SELF') {
        this.selfCorrections++;
        this.advanceWord();
      } else {
        // Hata kaydı ekle (aynı kelimeye çok sık hata yazmamak için debounce/filtre)
        const alreadyRecorded = this.errors.some(
          (e) => e.wordIndex === this.currentWordIndex && e.spokenWord === lastSpoken
        );
        if (!alreadyRecorded) {
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

    // Her 5-6 kelimede bir çocuğu bunaltmadan hafif pozitif pekiştireç
    if (this.currentWordIndex % 6 === 0 && this.currentWordIndex < this.currentPassage.words.length) {
      this.callbacks.onMascotStateChange?.('celebrating');
      this.callbacks.onCoachMessage?.('Harika bir birleştirme! Böyle devam et.');
      setTimeout(() => {
        if (this.isSessionActive) {
          this.callbacks.onMascotStateChange?.('listening');
        }
      }, 1000);
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
    if (!this.currentPassage || !this.isSessionActive || this.isCoachSpeaking) return;
    if (this.currentWordIndex >= this.currentPassage.words.length) return;

    this.hesitationCount++;
    this.totalHesitationMs += this.patienceThresholdMs;

    const currentWord = this.currentPassage.words[this.currentWordIndex];
    const syllables = this.currentPassage.syllabifiedWords[this.currentWordIndex] || [currentWord];
    const firstSyllable = syllables[0] || currentWord.slice(0, 2);

    // 1. Kademe: Ekranda ilk heceyi yumuşakça parlat
    this.callbacks.onSyllableHighlighted?.(firstSyllable);
    this.callbacks.onMascotStateChange?.('hinting');
    this.callbacks.onCoachMessage?.(`Hadi birlikte bakalım: "${firstSyllable}-..."`);

    // Sesli fısıldama
    this.speakVoiceHint(`Hadi birlikte bakalım: ${firstSyllable}`);
  }

  /**
   * Tarayıcı Türkçe TTS ile şefkatli sesli koç fısıldaması / model olma.
   * Eko kilidi uygulayarak koçun kendi sesini duymasını engeller.
   */
  public speakVoiceHint(text: string): void {
    if (!this.speechSynth) return;

    try {
      this.speechSynth.cancel();
      if (this.coachSpeakingReleaseTimer) clearTimeout(this.coachSpeakingReleaseTimer);

      this.isCoachSpeaking = true;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      utterance.rate = 0.88; // Disleksik çocuk için tane tane ve sakin tempo
      utterance.pitch = 1.12; // Sıcak, dostça ve sevecen ton

      if (this.cachedTurkishVoice) {
        utterance.voice = this.cachedTurkishVoice;
      }

      this.callbacks.onMascotStateChange?.('speaking');

      const releaseCoachSpeaking = () => {
        // Yankı kesici gecikme tamponu (350ms)
        this.coachSpeakingReleaseTimer = setTimeout(() => {
          this.isCoachSpeaking = false;
          if (this.isSessionActive) {
            this.callbacks.onMascotStateChange?.('listening');
          }
        }, 350);
      };

      utterance.onend = releaseCoachSpeaking;
      utterance.onerror = releaseCoachSpeaking;

      this.speechSynth.speak(utterance);
    } catch {
      this.isCoachSpeaking = false;
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
    this.isCoachSpeaking = false;

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

    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);

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
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.coachSpeakingReleaseTimer) clearTimeout(this.coachSpeakingReleaseTimer);
    this.isCoachSpeaking = false;

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
