import { describe, it, expect } from 'vitest';
import { generateOfflineAd } from '../src/services/adOfflineEngine';
import { auditAdContent } from '../src/services/adComplianceAuditor';
import { getSvgIllustration } from '../src/services/adSvgIllustrations';
import { exportAd, generateABVariation, generateBatch } from '../src/services/adGeneratorService';
import { DEFAULT_SETTINGS, BrandKit, AdStudioSettings } from '../src/types/adStudio';

const mockBrandKit: BrandKit = {
  id: 'test_brand',
  name: 'bdmind Test',
  logo: '',
  primaryColor: '#4F46E5',
  secondaryColor: '#0D9488',
  font: 'Lexend',
  slogan: 'Her çocuk kendi hızında öğrenir',
  website: 'https://bdmind.com',
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('AdStudio Ultra-Premium Reklam Motoru Duman Testleri', () => {
  it('generateOfflineAd farklı hedefler için kusursuz ve zengin reklam üretmeli', () => {
    const targets = ['math_studio', 'reading_studio', 'screening_assessment', 'sari_kitap', 'all_modules'] as const;

    for (const target of targets) {
      const settings: AdStudioSettings = {
        ...DEFAULT_SETTINGS,
        target,
        duration: 30,
      };

      const result = generateOfflineAd(settings, mockBrandKit);

      expect(result.id).toBeDefined();
      expect(result.title).toBeDefined();
      expect(result.title.length).toBeGreaterThan(5);
      expect(result.target).toBe(target);

      // Kural #0: pedagogicalNote ZORUNLU
      expect(result.pedagogicalNote).toBeDefined();
      expect(result.pedagogicalNote!.length).toBeGreaterThan(15);
      expect(result.pedagogicalNote).toContain('Pedagojik Not');

      // Sahneler ve SVG kontrolleri
      expect(result.scenes.length).toBeGreaterThanOrEqual(3);
      for (const scene of result.scenes) {
        expect(scene.sceneNo).toBeGreaterThan(0);
        expect(scene.duration).toBeGreaterThan(0);
        expect(scene.visualDesc).toBeDefined();
        expect(scene.voiceover).toBeDefined();
        expect(scene.sceneVisual).toBeDefined();
        expect(scene.sceneVisual!.startsWith('<svg')).toBe(true);
      }

      // Skor kontrolü
      expect(result.score).toBeDefined();
      expect(result.score!.overall).toBeGreaterThanOrEqual(60);
      expect(result.score!.complianceScore).toBeGreaterThanOrEqual(80);

      // Zengin format verileri kontrolü
      expect(result.brochureData).toBeDefined();
      expect(result.brochureData!.length).toBeGreaterThanOrEqual(2);
      expect(result.webData).toBeDefined();
      expect(result.webData!.heroTitle).toBeDefined();
      expect(result.googleData).toBeDefined();
      expect(result.googleData!.headlines.length).toBeGreaterThan(3);
      expect(result.pitchData).toBeDefined();
      expect(result.pitchData!.length).toBeGreaterThanOrEqual(3);
      expect(result.socialVariations).toBeDefined();
      expect(result.socialVariations!.instagram.caption).toBeDefined();
    }
  });

  it('auditAdContent tanı koyucu dili tespit edip etik uyarısı vermeli', () => {
    const problematicText = 'Bu disleksili çocuk için bir tedavi yöntemidir ve hastalığı iyileştirir.';
    const score = auditAdContent(problematicText, 'Disleksili Çocuk Tedavisi', 'Hemen Başvur');

    expect(score.diagnosticTermsDetected.length).toBeGreaterThan(0);
    expect(score.ethicsStatus).toBe('needs_review');
    expect(score.complianceScore).toBeLessThan(70);
    expect(score.suggestions.some(s => s.includes('[Etik Düzeltme]'))).toBe(true);
  });

  it('auditAdContent pedagojik ve etik metne yüksek onay puanı vermeli', () => {
    const cleanText = 'Disleksi desteği alan çocuklar için nöro-bilişsel stratejiler ve görsel çalışma kağıtları.';
    const score = auditAdContent(cleanText, 'Her Çocuk Kendi Hızında Başarır', 'Ücretsiz İnceleyin');

    expect(score.diagnosticTermsDetected.length).toBe(0);
    expect(score.ethicsStatus).toBe('approved');
    expect(score.complianceScore).toBeGreaterThanOrEqual(90);
    expect(score.overall).toBeGreaterThanOrEqual(80);
  });

  it('getSvgIllustration tüm temalar için geçerli ve temiz SVG markup üretmeli', () => {
    const themes = [
      'student_success',
      'neuro_diversity',
      'math_lab',
      'reading_story',
      'teacher_time',
      'parent_trust',
      'school_admin',
      'default_brand',
    ] as const;

    for (const theme of themes) {
      const svg = getSvgIllustration(theme, '#4F46E5', '#0D9488');
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg.endsWith('</svg>')).toBe(true);
      expect(svg).toContain('viewBox');
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    }
  });

  it('exportAd MD, JSON ve HTML formatlarında tam ve hatasız çıktı üretmeli', () => {
    const ad = generateOfflineAd(DEFAULT_SETTINGS, mockBrandKit);

    // JSON export
    const jsonStr = exportAd(ad, 'json');
    expect(() => JSON.parse(jsonStr)).not.toThrow();
    const parsed = JSON.parse(jsonStr);
    expect(parsed.id).toBe(ad.id);
    expect(parsed.title).toBe(ad.title);

    // Markdown export
    const mdStr = exportAd(ad, 'md');
    expect(mdStr).toContain(`# ${ad.title}`);
    expect(mdStr).toContain('Pedagojik Not');
    expect(mdStr).toContain('Storyboard');
    expect(mdStr).toContain('Sosyal Medya');

    // HTML export
    const htmlStr = exportAd(ad, 'html');
    expect(htmlStr).toContain('<!DOCTYPE html>');
    expect(htmlStr).toContain(ad.title);
    expect(htmlStr).toContain('Storyboard');
    expect(htmlStr).toContain('Lexend');
  });

  it('generateABVariation iki farklı varyasyon üretebilmeli', async () => {
    const varA = await generateABVariation(DEFAULT_SETTINGS, mockBrandKit, 'a');
    const varB = await generateABVariation(DEFAULT_SETTINGS, mockBrandKit, 'b');

    expect(varA).toBeDefined();
    expect(varB).toBeDefined();
    expect(varA.title).toBeDefined();
    expect(varB.title).toBeDefined();
  });

  it('generateBatch birden fazla hedef için asenkron toplu üretim yapabilmeli', async () => {
    let progressCalls = 0;
    const outputs = await generateBatch(
      ['math_studio', 'reading_studio'],
      DEFAULT_SETTINGS,
      mockBrandKit,
      (current, total) => {
        expect(total).toBe(2);
        progressCalls++;
      }
    );

    expect(outputs.length).toBe(2);
    expect(progressCalls).toBe(2);
  });
});
