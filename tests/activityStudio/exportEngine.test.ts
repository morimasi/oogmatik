import { describe, it, expect } from 'vitest';
import {
  exportStudioOutput,
  sanitizeForKVKK,
  sanitizeDiagnosticLanguage,
  buildSafePDFMetadata,
  exportToJSON,
} from '@/components/ActivityStudio/preview/ExportEngine';

describe('activity studio export engine — KVKK & klinik sanitizasyon', () => {
  describe('sanitizeForKVKK', () => {
    it('TC kimlik numarasını maskeler', () => {
      expect(sanitizeForKVKK('TC: 12345678901')).toContain('[TC-MASKED]');
    });

    it('email adresini maskeler', () => {
      expect(sanitizeForKVKK('test@example.com gönderildi')).toContain('[EMAIL-MASKED]');
    });

    it('normal metni bozmaz', () => {
      expect(sanitizeForKVKK('Matematik etkinliği')).toBe('Matematik etkinliği');
    });
  });

  describe('sanitizeDiagnosticLanguage', () => {
    it('"disleksisi var" → "disleksi desteğine ihtiyacı var" dönüştürür', () => {
      const result = sanitizeDiagnosticLanguage('Öğrencinin disleksisi var.');
      expect(result).toContain('disleksi desteğine ihtiyacı var');
      expect(result).not.toContain('disleksisi var');
    });

    it('"disleksik" → "disleksi desteğine ihtiyacı olan" dönüştürür', () => {
      const result = sanitizeDiagnosticLanguage('Disleksik çocuklar için');
      expect(result).toContain('disleksi desteğine ihtiyacı olan');
    });

    it('temiz metne dokunmaz', () => {
      const text = 'Öğrenci bu etkinliği tamamladı.';
      expect(sanitizeDiagnosticLanguage(text)).toBe(text);
    });
  });

  describe('buildSafePDFMetadata', () => {
    it('generatedDate ve pageCount ekler', () => {
      const meta = buildSafePDFMetadata({
        difficultyLevel: 'Orta',
        ageGroup: '8-10',
        targetSkills: ['okuma', 'anlama'],
      });
      expect(meta.generatedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(meta.pageCount).toBe(1);
      expect(meta.difficultyLevel).toBe('Orta');
      expect(meta.ageGroup).toBe('8-10');
    });

    it('learningProfile içermez (KVKK Madde 6)', () => {
      const meta = buildSafePDFMetadata({
        difficultyLevel: 'Kolay',
        ageGroup: '5-7',
        targetSkills: [],
      });
      expect(meta).not.toHaveProperty('learningProfile');
      expect(meta).not.toHaveProperty('studentName');
    });

    it('targetSkills 100 karakter ile kısaltır', () => {
      const longSkill = 'a'.repeat(150);
      const meta = buildSafePDFMetadata({
        difficultyLevel: 'Zor',
        ageGroup: '11-13',
        targetSkills: [longSkill],
      });
      expect(meta.targetSkills[0].length).toBe(100);
    });
  });

  describe('exportToJSON — KVKK payload sanitizasyonu', () => {
    it('learningProfile ve studentName\'i payload\'dan çıkarır', () => {
      const blob = exportToJSON(
        'a1',
        { topic: 'Hece', learningProfile: 'dyslexia', studentName: 'Ayşe' },
        buildSafePDFMetadata({ difficultyLevel: 'Kolay', ageGroup: '8-10', targetSkills: [] })
      );
      return blob.text().then((text) => {
        const parsed = JSON.parse(text) as { payload: Record<string, unknown> };
        expect(parsed.payload).not.toHaveProperty('learningProfile');
        expect(parsed.payload).not.toHaveProperty('studentName');
        expect(parsed.payload.topic).toBe('Hece');
      });
    });

    it('json mime type döner', () => {
      const meta = buildSafePDFMetadata({ difficultyLevel: 'Orta', ageGroup: '8-10', targetSkills: [] });
      const blob = exportToJSON('a1', {}, meta);
      expect(blob.type).toBe('application/json');
    });
  });

  describe('exportStudioOutput — geriye uyumlu basit API', () => {
    it('eski ExportRequest formatında json üretir', async () => {
      const blob = await exportStudioOutput({
        activityId: 'a1',
        format: 'json',
        payload: { x: 1 },
      });
      expect(blob.type).toBe('application/json');
      expect(blob.size).toBeGreaterThan(5);
    });
  });
});
