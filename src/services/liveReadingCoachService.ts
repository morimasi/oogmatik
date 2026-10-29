/**
 * BDMIND - LiveReadingCoachService
 * Canlı Sesli Okuma Koçu Orkestratörü (EduMind Dual-Engine v2.2)
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
export function normalizeTr(s: string): string {
  return s
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/[.,!?:;"'()\-]/g, '');
}

/** İki Türkçe kelime arasındaki Levenshtein düzenleme mesafesi */
export function getLevenshteinDistance(a: string, b: string): number {
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

  // Dinamik ve Gerçek Zamanlı Ayarlar
  private patienceThresholdMs = 3000;
  private voiceSpeed = 0.88; // 0.75 - 1.15
  private voicePitch = 1.12; // 0.9 - 1.3
  private phonologicalTolerance: 'strict' | 'balanced' | 'lenient' = 'balanced';
  private scaffoldingLevel: 'hece' | 'kelime' | 'cumle' = 'hece';
  private autoAdvanceOnSilence = false;
  private celebrationFrequency: 'frequent' | 'normal' | 'minimal' = 'normal';
  private isVoiceActive = true;

  // Aynı kelimede ardışık duraksama sayısı (auto-advance için)
  private currentWordHesitationStreak = 0;

  private graceTimer: ReturnType<typeof setTimeout> | null = null;
  private speechSynth: SpeechSynthesis | null = null;
  private cachedTurkishVoice: SpeechSynthesisVoice | null = null;

  // Eko engelleme kilidi
  private isCoachSpeaking = false;
  private coachSpeakingReleaseTimer: ReturnType<typeof setTimeout> | null = null;

  // Web Speech API nesnesi
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

  // --- ANINDA ETKİ EDEN AYAR SETTERLARI ---
  public setPatienceThreshold(seconds: number): void {
    this.patienceThresholdMs = Math.max(1000, seconds * 1000);
  }

  public setVoiceSpeed(speed: number): void {
    this.voiceSpeed = Math.max(0.6, Math.min(1.4, speed));
  }

  public setVoicePitch(pitch: number): void {
    this.voicePitch = Math.max(0.7, Math.min(1.5, pitch));
  }

  public setPhonologicalTolerance(tol: 'strict' | 'balanced' | 'lenient'): void {
    this.phonologicalTolerance = tol;
  }

  public setScaffoldingLevel(level: 'hece' | 'kelime' | 'cumle'): void {
    this.scaffoldingLevel = level;
  }

  public setAutoAdvanceOnSilence(enable: boolean): void {
    this.autoAdvanceOnSilence = enable;
  }

  public setCelebrationFrequency(freq: 'frequent' | 'normal' | 'minimal'): void {
    this.celebrationFrequency = freq;
  }

  public setIsVoiceActive(active: boolean): void {
    this.isVoiceActive = active;
    if (!active && this.speechSynth) {
      this.speechSynth.cancel();
      this.isCoachSpeaking = false;
    }
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
        if (!this.isSessionActive || !this.currentPassage || this.isCoachSpeaking) return;

        const results = event.results;
        const lastResult = results[results.length - 1];
        if (!lastResult) return;

        const transcript = lastResult[0]?.transcript?.trim().toLocaleLowerCase('tr-TR') || '';
        if (transcript) {
          this.processSpokenTranscript(transcript);
        }
      };

      this.recognition.onerror = (event: any) => {
        const errorType = event?.error;
        if (errorType === 'not-allowed') {
          this.callbacks.onError?.(new Error('Mikrofon izni verilmedi. Lütfen tarayıcınızdan mikrofona izin verin.'));
          return;
        }
        if (this.isSessionActive) {
          this.restartRecognitionWithDebounce();
        }
      };

      this.recognition.onend = () => {
        this.isRecognitionRunning = false;
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
        // Zaten çalışıyorsa geç
      }
    }, 250);
  }

  /**
   * Çocuğun söylediği kelimeyi tolerans ayarına göre hedef kelimeyle eşleştirir
   */
  private checkWordMatch(target: string, spoken: string): boolean {
    if (target === spoken) return true;

    if (this.phonologicalTolerance === 'strict') {
      return false;
    }

    const dist = getLevenshteinDistance(target, spoken);

    if (this.phonologicalTolerance === 'balanced') {
      // 4 harften uzun kelimelerde 1 harf toleransı
      return target.length >= 4 && spoken.length >= 4 && dist <= 1;
    }

    if (this.phonologicalTolerance === 'lenient') {
      // Çekingen veya ağır disleksili öğrenciler için yüksek hoşgörü
      if (target.length >= 3 && dist <= 1) return true;
      if (target.length >= 6 && dist <= 2) return true;
    }

    return false;
  }

  /**
   * Çocuğun mikrofondan söylediği kelimeleri ekrandaki hedef kelimeyle akıllıca eşleştirir.
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

    // 1. Eşleşme Kontrolü
    let matchedIndex = -1;
    for (let i = 0; i < spokenTokens.length; i++) {
      if (this.checkWordMatch(cleanTarget, spokenTokens[i])) {
        matchedIndex = i;
        break;
      }
    }

    if (matchedIndex !== -1) {
      // Doğru Okundu!
      this.currentWordHesitationStreak = 0;
      this.advanceWord();

      // Akıcı okuyucularda ardışık kelime kontrolü
      if (matchedIndex + 1 < spokenTokens.length && this.currentWordIndex < words.length) {
        const nextTarget = normalizeTr(words[this.currentWordIndex]);
        const nextToken = spokenTokens[matchedIndex + 1];
        if (this.checkWordMatch(nextTarget, nextToken)) {
          this.advanceWord();
        }
      }
      return;
    }

    // 2. Eşleşme yoksa fonolojik hata analizi yap
    const lastSpoken = spokenTokens[spokenTokens.length - 1];
    if (lastSpoken && lastSpoken.length >= 2) {
      const errorAnalysis = PhonologicalScoringEngine.classifyReadingError(cleanTarget, lastSpoken);
      if (errorAnalysis.code === 'SUCCESS_SELF') {
        this.selfCorrections++;
        this.currentWordHesitationStreak = 0;
        this.advanceWord();
      } else {
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
    this.currentWordHesitationStreak = 0;
    this.currentWordIndex++;
    this.callbacks.onWordAdvanced?.(this.currentWordIndex);
    this.callbacks.onSyllableHighlighted?.(null);

    // Kutlama Sıklığı Ayarı
    let shouldCelebrate = false;
    if (this.currentWordIndex < this.currentPassage.words.length) {
      if (this.celebrationFrequency === 'frequent' && this.currentWordIndex % 3 === 0) {
        shouldCelebrate = true;
      } else if (this.celebrationFrequency === 'normal' && this.currentWordIndex % 6 === 0) {
        shouldCelebrate = true;
      } else if (this.celebrationFrequency === 'minimal') {
        const prevWord = this.currentPassage.words[this.currentWordIndex - 1] || '';
        shouldCelebrate = /[.!?]$/.test(prevWord);
      }
    }

    if (shouldCelebrate) {
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
   * Çocuk duraksadığında seçilen iskele seviyesine göre devreye girer
   */
  private triggerScaffoldingHint(): void {
    if (!this.currentPassage || !this.isSessionActive || this.isCoachSpeaking) return;
    if (this.currentWordIndex >= this.currentPassage.words.length) return;

    this.hesitationCount++;
    this.totalHesitationMs += this.patienceThresholdMs;
    this.currentWordHesitationStreak++;

    const currentWord = this.currentPassage.words[this.currentWordIndex];
    const cleanWord = normalizeTr(currentWord);
    const syllables = this.currentPassage.syllabifiedWords[this.currentWordIndex] || [currentWord];
    const firstSyllable = syllables[0] || cleanWord.slice(0, 2);

    // Otomatik İlerleme (Auto-Advance) Modu: Öğrenci 2 kez ardışık takıldıysa koç kelimeyi okur ve ilerler
    if (this.autoAdvanceOnSilence && this.currentWordHesitationStreak >= 2) {
      this.callbacks.onMascotStateChange?.('speaking');
      this.callbacks.onCoachMessage?.(`Bu kelimeyi ben okuyayım: "${currentWord}". Şimdi sıradakine geçelim!`);
      this.speakVoiceHint(`Bu kelime: ${currentWord}. Şimdi sıradakine geçelim.`);
      setTimeout(() => {
        if (this.isSessionActive) {
          this.advanceWord();
        }
      }, 1600);
      return;
    }

    // İskele Seviyesine Göre Destek
    if (this.scaffoldingLevel === 'hece') {
      // 1. Kademe: İlk hece vurgusu
      this.callbacks.onSyllableHighlighted?.(firstSyllable);
      this.callbacks.onMascotStateChange?.('hinting');
      this.callbacks.onCoachMessage?.(`Hadi birlikte bakalım: "${firstSyllable}-..."`);
      this.speakVoiceHint(`Hadi birlikte bakalım: ${firstSyllable}`);
    } else if (this.scaffoldingLevel === 'kelime') {
      // 2. Kademe: Tüm kelimeyi hecelere ayırarak okuma
      const syllabledStr = syllables.join(' - ');
      this.callbacks.onSyllableHighlighted?.(syllables.join(''));
      this.callbacks.onMascotStateChange?.('speaking');
      this.callbacks.onCoachMessage?.(`Kelimeyi heceleyelim: ${syllabledStr}`);
      this.speakVoiceHint(`Heceleri birleştirelim: ${syllables.join(', ')}`);
    } else {
      // 3. Kademe: Cümle akışı modelleme
      this.callbacks.onSyllableHighlighted?.(firstSyllable);
      this.callbacks.onMascotStateChange?.('speaking');
      this.callbacks.onCoachMessage?.(`Şimdi bu kelimeye odaklan: "${cleanWord}"`);
      this.speakVoiceHint(`Sıradaki kelimemiz: ${cleanWord}`);
    }
  }

  /**
   * Tarayıcı Türkçe TTS ile sesli koç fısıldaması / model olma.
   */
  public speakVoiceHint(text: string): void {
    if (!this.speechSynth || !this.isVoiceActive) return;

    try {
      this.speechSynth.cancel();
      if (this.coachSpeakingReleaseTimer) clearTimeout(this.coachSpeakingReleaseTimer);

      this.isCoachSpeaking = true;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      utterance.rate = this.voiceSpeed;
      utterance.pitch = this.voicePitch;

      if (this.cachedTurkishVoice) {
        utterance.voice = this.cachedTurkishVoice;
      }

      this.callbacks.onMascotStateChange?.('speaking');

      const releaseCoachSpeaking = () => {
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
    this.currentWordHesitationStreak = 0;
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
    this.currentWordHesitationStreak = 0;
    this.callbacks.onWordAdvanced?.(this.currentWordIndex);
    this.callbacks.onSyllableHighlighted?.(null);
    this.startGraceTimer();
  }

  public getIsActive(): boolean {
    return this.isSessionActive;
  }
}
