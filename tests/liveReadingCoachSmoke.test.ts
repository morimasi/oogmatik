import { describe, it, expect } from 'vitest';
import { PhonologicalScoringEngine } from '../src/services/phonological/phonologicalScoringEngine';
import { SAMPLE_READING_PASSAGES, parseCustomTextToPassage, syllabifyTurkishWord } from '../src/components/LiveReadingStudio/sampleStories';
import { AIReadingStoryService } from '../src/services/aiReadingStoryService';
import { LiveReadingCoachService, getLevenshteinDistance, normalizeTr } from '../src/services/liveReadingCoachService';

describe('LiveReadingCoach - Fonolojik Ölçme ve Değerlendirme Testleri', () => {
  it('Ayna harf karışıklığını (b/d) doğru tespit etmeli', () => {
    const result = PhonologicalScoringEngine.classifyReadingError('balık', 'dalık');
    expect(result.code).toBe('ERR_MIRROR');
    expect(result.explanation).toContain('Ayna harf');
  });

  it('Harf veya hece atlamayı (ERR_OMISSION) tespit etmeli', () => {
    const result = PhonologicalScoringEngine.classifyReadingError('araba', 'arba');
    expect(result.code).toBe('ERR_OMISSION');
  });

  it('Harf yerdeğişimini / anagramı (ERR_TRANSP) tespit etmeli', () => {
    const result = PhonologicalScoringEngine.classifyReadingError('ev', 've');
    expect(result.code).toBe('ERR_TRANSP');
  });

  it('İlk harften uydurmayı (ERR_GUESS) tespit etmeli', () => {
    const result = PhonologicalScoringEngine.classifyReadingError('okul', 'orman');
    expect(result.code).toBe('ERR_GUESS');
  });

  it('Morfolojik ek uydurmayı (ERR_MORPH) tespit etmeli', () => {
    const result = PhonologicalScoringEngine.classifyReadingError('evde', 'evden');
    expect(result.code).toBe('ERR_MORPH');
  });

  it('Birebir doğru okumayı tespit etmeli', () => {
    const result = PhonologicalScoringEngine.classifyReadingError('kitap', 'kitap');
    expect(result.code).toBe('SUCCESS_SELF');
  });

  it('Türkçe fonetik heceleme motoru (syllabifyTurkishWord) kelimeleri TDK kurallarıyla hecelemeli', () => {
    expect(syllabifyTurkishWord('araba').join('-')).toBe('a-ra-ba');
    expect(syllabifyTurkishWord('balık').join('-')).toBe('ba-lık');
    expect(syllabifyTurkishWord('öğrenci').join('-')).toBe('öğ-ren-ci');
    expect(syllabifyTurkishWord('türkçe').join('-')).toBe('türk-çe');
    expect(syllabifyTurkishWord('altında').join('-')).toBe('al-tın-da');
    expect(syllabifyTurkishWord('çiçekleri').join('-')).toBe('çi-çek-le-ri');
  });

  it('WCPM ve seans metriklerini doğru matematiksel formülle hesaplamalı', () => {
    const metrics = PhonologicalScoringEngine.calculateSessionMetrics({
      durationSeconds: 60,
      totalWordsTarget: 50,
      totalWordsRead: 40,
      errors: [
        {
          id: '1',
          wordIndex: 5,
          targetWord: 'balık',
          spokenWord: 'dalık',
          errorCode: 'ERR_MIRROR',
          explanation: 'b/d',
          timestampMs: 12000,
        },
        {
          id: '2',
          wordIndex: 12,
          targetWord: 'araba',
          spokenWord: 'arba',
          errorCode: 'ERR_OMISSION',
          explanation: 'atlama',
          timestampMs: 25000,
        },
      ],
      selfCorrections: 2,
      hesitationCount: 3,
      totalHesitationMs: 7500,
      gradeLevel: 2,
    });

    expect(metrics.wcpm).toBe(38);
    expect(metrics.accuracyPercentage).toBe(95);
    expect(metrics.selfCorrectionCount).toBe(2);
    expect(metrics.errorBreakdown.ERR_MIRROR).toBe(1);
    expect(metrics.errorBreakdown.ERR_OMISSION).toBe(1);
    expect(metrics.prosodyScore).toBeGreaterThan(0);
    expect(metrics.pedagogicalSummary).toBeDefined();
    expect(metrics.recommendations.length).toBeGreaterThan(0);
  });

  it('Örnek metin kütüphanesi zenginleştirilmiş (6 hikaye) ve anlama sorularına sahip olmalı', () => {
    expect(SAMPLE_READING_PASSAGES.length).toBe(6);
    const firstStory = SAMPLE_READING_PASSAGES[0];
    expect(firstStory.words.length).toBeGreaterThan(10);
    expect(firstStory.syllabifiedWords.length).toBe(firstStory.words.length);
    expect(firstStory.comprehensionQuestions).toBeDefined();
    expect(firstStory.comprehensionQuestions?.length).toBeGreaterThanOrEqual(1);
  });

  it('Öğretmenin girdiği özel metin dinamik hecelenerek ReadingPassage nesnesine dönüştürülmeli', () => {
    const custom = parseCustomTextToPassage('Piknik Günü', 'Güneş açtı ve çocuklar parka koştu.');
    expect(custom.title).toBe('Piknik Günü');
    expect(custom.words.length).toBe(6);
    expect(custom.words[0]).toBe('Güneş');
    expect(custom.syllabifiedWords[0].join('-')).toBe('Gü-neş');
  });

  it('AI Reading Story servisi kişiselleştirilmiş hikaye ve anlama soruları üretmeli', async () => {
    const aiStory = await AIReadingStoryService.generateCustomStory({
      ageGroup: '7-9',
      gradeLevel: '2',
      phonologicalFocus: 'mirror_letters',
      length: 'kisa',
      theme: 'Uzay ve Yıldızlar',
      customTopic: 'Ay yolculuğu',
      mascotTone: 'baykus',
    });

    expect(aiStory).toBeDefined();
    expect(aiStory.title).toBeDefined();
    expect(aiStory.words.length).toBeGreaterThan(5);
    expect(aiStory.syllabifiedWords.length).toBe(aiStory.words.length);
    expect(aiStory.comprehensionQuestions).toBeDefined();
  });

  it('Levenshtein mesafesi ve Türkçe normalizasyonu fonolojik toleransı doğru hesaplamalı', () => {
    expect(normalizeTr('Kitap,')).toBe('kitap');
    expect(normalizeTr('İNCİ!')).toBe('inci');
    expect(getLevenshteinDistance('balık', 'dalık')).toBe(1);
    expect(getLevenshteinDistance('kitap', 'kitap')).toBe(0);
    expect(getLevenshteinDistance('koştu', 'koşdu')).toBe(1);
    expect(getLevenshteinDistance('ev', 'orman')).toBe(5);
  });

  it('LiveReadingCoachService tüm anlık ayar metodlarına sahip olmalı', () => {
    const coach = new LiveReadingCoachService();
    expect(() => coach.setPatienceThreshold(4.0)).not.toThrow();
    expect(() => coach.setVoiceSpeed(0.95)).not.toThrow();
    expect(() => coach.setVoicePitch(1.2)).not.toThrow();
    expect(() => coach.setPhonologicalTolerance('lenient')).not.toThrow();
    expect(() => coach.setScaffoldingLevel('kelime')).not.toThrow();
    expect(() => coach.setAutoAdvanceOnSilence(true)).not.toThrow();
    expect(() => coach.setCelebrationFrequency('frequent')).not.toThrow();
    expect(() => coach.setIsVoiceActive(false)).not.toThrow();
  });
});
