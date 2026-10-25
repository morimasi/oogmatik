import { describe, it, expect } from 'vitest';
import { PhonologicalScoringEngine } from '../src/services/phonological/phonologicalScoringEngine';
import { SAMPLE_READING_PASSAGES, parseCustomTextToPassage, syllabifyTurkishWord } from '../src/components/LiveReadingStudio/sampleStories';

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
    // 60 saniyede 40 kelime okunmuş, 2 hata, 2 kendini düzeltme
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
          timestampMs: 12000
        },
        {
          id: '2',
          wordIndex: 12,
          targetWord: 'araba',
          spokenWord: 'arba',
          errorCode: 'ERR_OMISSION',
          explanation: 'atlama',
          timestampMs: 25000
        }
      ],
      selfCorrections: 2,
      hesitationCount: 3,
      totalHesitationMs: 7500,
      gradeLevel: 2
    });

    // Doğru kelime: 40 - 2 = 38
    // 60 saniyede 38 kelime => WCPM = 38
    expect(metrics.wcpm).toBe(38);
    expect(metrics.accuracyPercentage).toBe(95); // (38 / 40) * 100 = 95
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
});
